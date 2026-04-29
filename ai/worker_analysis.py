import asyncio
import json
import uuid
import datetime
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
import redis.asyncio as redis
from core.config import settings
from services.analysis.schemas import AnalyzeRequest
from services.analysis.pipeline import AnalysisPipelineService
from services.analysis.kafka_schemas import EventEnvelope, AnalysisRequestedPayload, AnalysisFailedPayload

# Initialize Redis and Pipeline Service
redis_client = redis.from_url(settings.redis_url, decode_responses=True)
analysis_service = AnalysisPipelineService()

async def process_message(producer: AIOKafkaProducer, msg_value: str, envelope_dict: dict = None):
    try:
        data = json.loads(msg_value)
        envelope = EventEnvelope(**data)
        
        if envelope.eventType != settings.topic_analysis_requested:
            print(f"Skipping unknown event type: {envelope.eventType}")
            return

        payload = AnalysisRequestedPayload(**envelope.payload)
        job_id = payload.jobId
        artifact_key = payload.transcriptArtifactKey
        
        # Idempotency check: check if eventId is already processed
        processed_key = f"processed_event:{envelope.eventId}"
        if await redis_client.exists(processed_key):
            print(f"Event {envelope.eventId} already processed. Skipping.")
            return

        print(f"Processing job {job_id} with artifact {artifact_key}")
        
        # Load transcript from Redis
        transcript_json = await redis_client.get(artifact_key)
        if not transcript_json:
            raise ValueError(f"Transcript artifact not found in Redis for key: {artifact_key}")
            
        transcript_data = json.loads(transcript_json)
        
        # Build AnalyzeRequest from transcript_data
        analyze_request = AnalyzeRequest(
            video_id=transcript_data.get("video_id", "unknown"),
            title=transcript_data.get("title"),
            author=transcript_data.get("author", "Unknown Channel"),
            channel_id=transcript_data.get("channel_id"),
            language=transcript_data.get("language", "ko"),
            content=transcript_data.get("content", ""),
            segments=transcript_data.get("segments", []),
            status=transcript_data.get("status", "SUCCESS"),
            is_whisper=transcript_data.get("is_whisper", False),
            processing_time=transcript_data.get("processing_time")
        )
        
        # Run Pipeline
        print(f"Starting AnalysisPipelineService for Job {job_id}")
        response = await analysis_service.run(analyze_request)
        
        # Publish completed
        completed_payload = response.data.model_dump()
        completed_payload["jobId"] = job_id
        
        completed_envelope = EventEnvelope(
            eventId=str(uuid.uuid4()),
            eventType=settings.topic_analysis_completed,
            eventVersion=1,
            occurredAt=datetime.datetime.utcnow().isoformat() + "Z",
            traceId=envelope.traceId,
            aggregateId=job_id,
            payload=completed_payload
        )
        
        await producer.send_and_wait(
            settings.topic_analysis_completed,
            completed_envelope.model_dump_json().encode("utf-8")
        )
        print(f"Job {job_id} completed and published to {settings.topic_analysis_completed}.")
        
        # Mark event as processed (expire in 24 hours)
        await redis_client.set(processed_key, "1", ex=86400)
        
    except Exception as e:
        print(f"Error processing message: {e}")
        # Publish failed event
        try:
            if 'job_id' in locals() or 'envelope' in locals():
                failed_job_id = job_id if 'job_id' in locals() else envelope.aggregateId
                failed_payload = AnalysisFailedPayload(
                    jobId=failed_job_id,
                    message=str(e)
                )
                failed_envelope = EventEnvelope(
                    eventId=str(uuid.uuid4()),
                    eventType=settings.topic_analysis_failed,
                    eventVersion=1,
                    occurredAt=datetime.datetime.utcnow().isoformat() + "Z",
                    traceId=envelope.traceId if 'envelope' in locals() else None,
                    aggregateId=failed_job_id,
                    payload=failed_payload.model_dump()
                )
                await producer.send_and_wait(
                    settings.topic_analysis_failed,
                    failed_envelope.model_dump_json().encode("utf-8")
                )
                print(f"Published failure event for job {failed_job_id}")
        except Exception as pub_e:
            print(f"Failed to publish error event: {pub_e}")

async def consume():
    consumer = AIOKafkaConsumer(
        settings.topic_analysis_requested,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id=settings.kafka_group_id,
        auto_offset_reset=settings.kafka_auto_offset_reset,
        enable_auto_commit=False  # manual commit pattern
    )
    
    producer = AIOKafkaProducer(
        bootstrap_servers=settings.kafka_bootstrap_servers
    )
    
    await consumer.start()
    await producer.start()
    print(f"Kafka Worker started. Listening on topic: {settings.topic_analysis_requested}")
    
    try:
        async for msg in consumer:
            print(f"Received message: {msg.topic}:{msg.partition}:{msg.offset}")
            await process_message(producer, msg.value.decode("utf-8"))
            # Commit offset after processing to prevent poison pill loops unless DLQ is implemented
            await consumer.commit()
    finally:
        await consumer.stop()
        await producer.stop()
        await redis_client.aclose()

if __name__ == "__main__":
    asyncio.run(consume())

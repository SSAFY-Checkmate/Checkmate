import asyncio
import hashlib
import json
import os
import time
import uuid
import logging
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from dotenv import load_dotenv
from redis import asyncio as aioredis

from services.youtube_service import extract_video_id, fetch_and_clean_transcript

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("TranscriptWorker")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def make_envelope(*, event_type: str, aggregate_id: str, payload: dict, trace_id: str | None) -> dict:
    return {
        "eventId": str(uuid.uuid4()),
        "eventType": event_type,
        "eventVersion": 1,
        "occurredAt": utc_now_iso(),
        "traceId": trace_id,
        "aggregateId": aggregate_id,
        "payload": payload,
    }


async def main() -> None:
    load_dotenv()

    bootstrap = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    group_id = os.getenv("KAFKA_GROUP_ID", "parser-transcript-worker")

    topic_requested = os.getenv("TOPIC_TRANSCRIPT_REQUESTED", "transcript.requested")
    topic_processing = os.getenv("TOPIC_TRANSCRIPT_PROCESSING", "transcript.processing")
    topic_completed = os.getenv("TOPIC_TRANSCRIPT_COMPLETED", "transcript.completed")
    topic_failed = os.getenv("TOPIC_TRANSCRIPT_FAILED", "transcript.failed")

    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_db = int(os.getenv("REDIS_DB", "0"))
        redis_url = f"redis://{redis_host}:{redis_port}/{redis_db}"

    ttl_seconds = int(os.getenv("TRANSCRIPT_TTL_SECONDS", "86400"))

    redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)

    consumer = AIOKafkaConsumer(
        topic_requested,
        bootstrap_servers=bootstrap,
        group_id=group_id,
        enable_auto_commit=False,
        auto_offset_reset=os.getenv("KAFKA_AUTO_OFFSET_RESET", "earliest"),
        value_deserializer=lambda v: v.decode("utf-8"),
    )
    producer = AIOKafkaProducer(
        bootstrap_servers=bootstrap,
        value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode("utf-8"),
    )

    await consumer.start()
    await producer.start()
    
    logger.info(f"Transcript Worker started. Listening to '{topic_requested}'")

    try:
        async for msg in consumer:
            try:
                envelope = json.loads(msg.value)
                payload = envelope.get("payload") or {}
                job_id = payload.get("jobId") or envelope.get("aggregateId")
                youtube_url = payload.get("youtubeUrl")
                trace_id = envelope.get("traceId")

                if not job_id or not youtube_url:
                    raise ValueError("Missing jobId or youtubeUrl in message payload")
                
                logger.info(f"Received request for JobID: {job_id}, URL: {youtube_url}")

                await producer.send_and_wait(
                    topic_processing,
                    make_envelope(
                        event_type="transcript.processing",
                        aggregate_id=job_id,
                        payload={"jobId": job_id},
                        trace_id=trace_id,
                    ),
                )

                start = time.time()
                video_id = extract_video_id(youtube_url)
                result = await asyncio.to_thread(fetch_and_clean_transcript, video_id)
                result["processing_time"] = round(time.time() - start, 2)
                result["job_id"] = job_id
                result["source_url"] = youtube_url

                artifact_key = f"transcript:{job_id}"
                value_json = json.dumps(result, ensure_ascii=False)
                value_hash = hashlib.sha256(value_json.encode("utf-8")).hexdigest()

                await redis.setex(artifact_key, ttl_seconds, value_json)

                await producer.send_and_wait(
                    topic_completed,
                    make_envelope(
                        event_type="transcript.completed",
                        aggregate_id=job_id,
                        payload={
                            "jobId": job_id,
                            "artifactKey": artifact_key,
                            "ttlSeconds": ttl_seconds,
                            "hash": value_hash,
                        },
                        trace_id=trace_id,
                    ),
                )

                await consumer.commit()
                logger.info(f"Successfully processed JobID: {job_id} (Time: {result['processing_time']}s)")

            except Exception as e:
                logger.error(f"Failed to process message. Error: {e}", exc_info=True)
                # Best-effort failure event; even if it fails, we still commit to avoid poison-pill loops.
                try:
                    env = json.loads(msg.value)
                    trace_id = env.get("traceId")
                    payload = env.get("payload") or {}
                    job_id = payload.get("jobId") or env.get("aggregateId") or "unknown"
                except Exception:
                    trace_id = None
                    job_id = "unknown"

                try:
                    await producer.send_and_wait(
                        topic_failed,
                        make_envelope(
                            event_type="transcript.failed",
                            aggregate_id=job_id,
                            payload={
                                "jobId": job_id,
                                "errorCode": "TRANSCRIPT_FAILED",
                                "message": str(e),
                            },
                            trace_id=trace_id,
                        ),
                    )
                finally:
                    await consumer.commit()
                    logger.info(f"Committed offset for failed JobID: {job_id} to prevent poison-pill")
    finally:
        await consumer.stop()
        await producer.stop()
        await redis.aclose()
        logger.info("Transcript Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())


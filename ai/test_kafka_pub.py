import asyncio
import json
import uuid
import datetime
from aiokafka import AIOKafkaProducer
import redis.asyncio as redis

# 테스트용 더미 데이터 설정
KAFKA_BOOTSTRAP = "localhost:9092"
TOPIC = "analysis.requested"
REDIS_URL = "redis://localhost:6379/0"

async def test_publish():
    # 1. Redis에 더미 자막 아티팩트 저장
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    job_id = f"test_job_{uuid.uuid4().hex[:8]}"
    artifact_key = f"transcript:{job_id}"
    
    dummy_transcript = {
        "video_id": "dQw4w9WgXcQ",
        "title": "테스트용 다이어트 약 영상",
        "author": "건강 전도사",
        "channel_id": "UC_TEST1234",
        "language": "ko",
        "content": "안녕하세요 오늘은 제가 약을 가져왔습니다. 이 약을 먹으면 무조건 하루 만에 10kg이 빠집니다. 대박이죠?",
        "segments": [
            {"start_time": 0.0, "text": "안녕하세요 오늘은 제가 약을 가져왔습니다."},
            {"start_time": 5.0, "text": "이 약을 먹으면 무조건 하루 만에 10kg이 빠집니다. 대박이죠?"}
        ],
        "status": "SUCCESS"
    }
    
    await redis_client.set(artifact_key, json.dumps(dummy_transcript), ex=3600)
    print(f"[1] Redis에 자막 저장 완료 (Key: {artifact_key})")
    
    # 2. Kafka에 analysis.requested 이벤트 발행
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP)
    await producer.start()
    
    try:
        envelope = {
            "eventId": str(uuid.uuid4()),
            "eventType": "analysis.requested",
            "eventVersion": 1,
            "occurredAt": datetime.datetime.utcnow().isoformat() + "Z",
            "traceId": "trace-test-123",
            "aggregateId": job_id,
            "payload": {
                "jobId": job_id,
                "youtubeUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
                "transcriptArtifactKey": artifact_key
            }
        }
        
        await producer.send_and_wait(
            TOPIC,
            json.dumps(envelope).encode("utf-8")
        )
        print(f"[2] Kafka 토픽 '{TOPIC}'에 테스트 메시지 전송 완료 (Job ID: {job_id})")
        
    finally:
        await producer.stop()
        await redis_client.aclose()

if __name__ == "__main__":
    asyncio.run(test_publish())

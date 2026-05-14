import asyncio
import hashlib
import json
import os
import time
import uuid
import logging
import math
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from aiokafka.errors import CommitFailedError
from dotenv import load_dotenv
from redis import asyncio as aioredis

from services.youtube_service import extract_video_id, fetch_and_clean_transcript
from services.image_extractor import extract_frame_base64, extract_frame_base64_ocr
from services.visual_engine import ocr_image_base64

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


def _is_empty_transcript(result: dict) -> bool:
    content = (result.get("content") or "").strip()
    segments = result.get("segments") or []
    return (not content) and (not segments)


def _slice_transcript_result(result: dict, start_seconds: float, end_seconds: float) -> dict:
    segments = result.get("segments") or []
    sliced_segments = []
    for s in segments:
        try:
            st = float(s.get("start_time"))
        except Exception:
            continue
        if st >= start_seconds and st < end_seconds:
            sliced_segments.append(s)

    sliced_content = " ".join([(s.get("text") or "").strip() for s in sliced_segments]).strip()

    out = dict(result)
    out["segments"] = sliced_segments
    out["content"] = sliced_content
    return out


def _pick_nearest_segment(segments: list, at_seconds: float) -> dict | None:
    best = None
    best_dist = float("inf")
    for s in segments or []:
        try:
            st = float(s.get("start_time"))
        except Exception:
            continue
        dist = abs(st - at_seconds)
        if dist < best_dist:
            best = s
            best_dist = dist
    return best


def _unique_preserve_order(items: list[str]) -> list[str]:
    seen = set()
    out: list[str] = []
    for s in items or []:
        s = (s or "").strip()
        if not s:
            continue
        if s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


def _apply_time_slicing_with_fallback(result: dict, payload: dict, youtube_url: str) -> dict:
    mode = payload.get("requestMode") or payload.get("request_mode") or "FULL"
    mode = str(mode).upper()

    if mode == "RANGE":
        start = payload.get("startSeconds")
        end = payload.get("endSeconds")
        if start is None or end is None:
            raise ValueError("RANGE mode requires startSeconds and endSeconds")
        start_s = float(start)
        end_s = float(end)
        if math.isnan(start_s) or math.isnan(end_s) or start_s < 0 or end_s < 0 or end_s < start_s:
            raise ValueError(f"Invalid range seconds. startSeconds={start_s}, endSeconds={end_s}")
        sliced = _slice_transcript_result(result, start_s, end_s)
        try:
            logger.info(
                "RANGE extracted. url=%s startSeconds=%s endSeconds=%s segCount=%s contentChars=%s preview='%s'",
                youtube_url,
                start_s,
                end_s,
                len(sliced.get("segments") or []),
                len((sliced.get("content") or "")),
                ((sliced.get("content") or "").replace("\n", " ")[:300]),
            )
        except Exception:
            pass
        return sliced

    if mode == "AT":
        at = payload.get("atSeconds")
        if at is None:
            raise ValueError("AT mode requires atSeconds")
        at_s = float(at)
        if math.isnan(at_s) or at_s < 0:
            raise ValueError(f"Invalid atSeconds={at_s}")

        # Point semantics:
        # 1) pick the single nearest transcript segment to atSeconds
        # 2) extract the frame at atSeconds and OCR it
        segments = result.get("segments") or []
        seg = _pick_nearest_segment(segments, at_s)
        if seg is None:
            raise ValueError(f"No transcript segments available for AT mode. atSeconds={at_s}")

        seg_text = (seg.get("text") or "").strip()

        ocr_texts: list[str] = []
        try:
            # Extract and OCR multiple adjacent frames to reduce misses due to overlay timing.
            for t in (at_s - 1.0, at_s, at_s + 1.0):
                if t < 0:
                    continue
                logger.info("AT OCR: extracting frame. url=%s t=%s (base atSeconds=%s)", youtube_url, t, at_s)
                # Use OCR-optimized frame extraction to keep payload size under gateway limits.
                frame = extract_frame_base64_ocr(youtube_url, str(t))
                image_b64 = frame.get("image_base64")
                if not image_b64:
                    logger.warning("AT OCR: frame extracted but image_base64 missing/empty. t=%s", t)
                    continue
                logger.info("AT OCR: frame extracted. t=%s base64Chars=%s", t, len(image_b64))
                texts = ocr_image_base64(image_b64)
                if texts:
                    logger.info("AT OCR: texts extracted. t=%s items=%s", t, len(texts))
                ocr_texts.extend(texts or [])
            ocr_texts = _unique_preserve_order(ocr_texts)
        except Exception as e:
            # OCR is best-effort; do not fail the whole job due to OCR issues.
            logger.warning("AT OCR failed. url=%s atSeconds=%s err=%s", youtube_url, at_s, e, exc_info=True)

        # Log extracted text for debugging/verification (truncate to keep logs reasonable).
        seg_preview = seg_text[:300].replace("\n", " ") if seg_text else ""
        ocr_preview = " | ".join(ocr_texts)[:300].replace("\n", " ") if ocr_texts else ""
        logger.info(
            "AT extracted. url=%s atSeconds=%s segStart=%s segTextChars=%s ocrItems=%s segText='%s' ocrText='%s'",
            youtube_url,
            at_s,
            seg.get("start_time"),
            len(seg_text),
            len(ocr_texts),
            seg_preview,
            ocr_preview,
        )

        combined_parts = []
        if seg_text:
            combined_parts.append(seg_text)
        if ocr_texts:
            combined_parts.append(" ".join(ocr_texts))
        combined_content = "\n".join([p for p in combined_parts if p]).strip()

        out = dict(result)
        out["segments"] = [seg]
        out["content"] = combined_content
        out["_request"] = {"mode": "AT", "atSeconds": at_s}
        if ocr_texts:
            out["_request"]["ocrCount"] = len(ocr_texts)
        return out

    # FULL (or unknown): no slicing
    try:
        logger.info(
            "FULL extracted. url=%s segCount=%s contentChars=%s preview='%s'",
            youtube_url,
            len((result.get("segments") or [])),
            len((result.get("content") or "")),
            ((result.get("content") or "").replace("\n", " ")[:300]),
        )
    except Exception:
        pass
    return result


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
        # OCR/LLM calls can take a long time; prevent group rebalances due to slow poll loop.
        max_poll_interval_ms=int(os.getenv("KAFKA_MAX_POLL_INTERVAL_MS", str(30 * 60 * 1000))),  # 30 min
        max_poll_records=int(os.getenv("KAFKA_MAX_POLL_RECORDS", "1")),
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
                # Apply optional slicing based on request payload (RANGE / AT).
                # IMPORTANT: slicing may include heavy sync IO (frame extract / OCR HTTP),
                # so run it in a thread to avoid blocking the event loop and missing heartbeats.
                result = await asyncio.to_thread(_apply_time_slicing_with_fallback, result, payload, youtube_url)
                result["processing_time"] = round(time.time() - start, 2)
                result["job_id"] = job_id
                result["source_url"] = youtube_url

                # Debug log: the transcript JSON artifact we will store to Redis and pass downstream to AI worker.
                try:
                    preview = dict(result)
                    content = preview.get("content") or ""
                    if isinstance(content, str) and len(content) > 1200:
                        preview["content"] = content[:1200] + f"... (truncated, chars={len(content)})"
                    segs = preview.get("segments") or []
                    if isinstance(segs, list) and len(segs) > 5:
                        preview["segments"] = segs[:5] + [{"_truncated": True, "total": len(segs)}]
                    logger.info("Transcript artifact preview jobId=%s json=%s", job_id, json.dumps(preview, ensure_ascii=False))
                except Exception as e:
                    logger.warning("Failed to log transcript artifact preview. jobId=%s err=%s", job_id, e)

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

                try:
                    await consumer.commit()
                except CommitFailedError as e:
                    # If processing took too long, the group may have rebalanced.
                    # Don't crash the worker; it will re-join and continue consuming.
                    logger.warning("Offset commit failed (will continue): %s", e)
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
                    try:
                        await consumer.commit()
                    except CommitFailedError as e:
                        logger.warning("Offset commit failed after error (will continue): %s", e)
                    logger.info(f"Committed offset for failed JobID: {job_id} to prevent poison-pill")
    finally:
        await consumer.stop()
        await producer.stop()
        await redis.aclose()
        logger.info("Transcript Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())


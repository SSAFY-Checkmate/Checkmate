# AI Contract: Redis Transcript Artifact (FULL / RANGE / AT)

This document is for the AI team. It describes what JSON is stored in Redis by the parser transcript worker, and what the AI worker will read.

## Overview

1. BE publishes `transcript.requested` (Kafka).
2. Parser `worker_transcript.py` consumes it and stores the transcript artifact to Redis:
   - Key: `transcript:{jobId}`
   - Value: JSON string (see schemas below)
3. BE consumes `transcript.completed`, then publishes `analysis.requested` with `transcriptArtifactKey`.
4. AI worker loads the artifact JSON from Redis and runs analysis.

## Common Fields (all modes)

```json
{
  "video_id": "VIDEO_ID",
  "title": "optional",
  "author": "optional",
  "channel_id": "optional",
  "language": "ko|en|...",
  "content": "string",
  "segments": [
    { "start_time": 123.45, "text": "..." }
  ],
  "is_whisper": false,
  "status": "SUCCESS",
  "processing_time": 3.95,
  "job_id": "JOB_ID",
  "source_url": "https://www.youtube.com/watch?v=VIDEO_ID",

  "_request": { "...": "mode-specific metadata (optional)" }
}
```

Notes:
- `content` is what the AI pipeline should analyze.
- `segments` may be large for FULL/RANGE; for AT it is exactly 1 segment.

## FULL mode

- `requestMode = FULL` in `transcript.requested`
- Worker stores the full transcript.
- `_request` is usually absent.

## RANGE mode

- `requestMode = RANGE`
- Worker slices the transcript by `[startSeconds, endSeconds)` using `segments[].start_time`.

Example `_request` (currently not required by AI, for observability only):
```json
{
  "mode": "RANGE",
  "startSeconds": 30.0,
  "endSeconds": 70.0
}
```

## AT mode (point semantics)

- `requestMode = AT`
- Worker behavior:
1. Pick the single nearest transcript segment to `atSeconds`
2. Extract 3 frames around the time: `atSeconds-1`, `atSeconds`, `atSeconds+1`
3. OCR each frame (best-effort), filter out refusal/meta messages
4. Set:
   - `segments = [nearest_segment]`
   - `content = segment_text + "\\n" + ocr_text_joined`

Example `_request`:
```json
{
  "mode": "AT",
  "atSeconds": 1604.0,
  "ocrCount": 12
}
```

## Failure Modes

If transcript extraction fails, parser publishes `transcript.failed` and no artifact is stored.
AI should expect missing Redis keys and handle it as a failed job.


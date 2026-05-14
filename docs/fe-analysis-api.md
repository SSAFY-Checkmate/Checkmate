# FE API Guide: Analysis (FULL / RANGE / AT)

This document is for the Frontend team. It explains how to call the BE analysis APIs for:
- FULL: whole video
- RANGE: time range
- AT: a specific time point (nearest transcript segment + OCR around that time)

## Base Notes

- All time values are numeric seconds (int/float).
- Async endpoints return `jobId` + `status` first. Poll with `GET /analysis/{jobId}`.
- Sync endpoints return the final `AnalysisJobGetResponse` immediately.

## 1) FULL

### Async
- `POST /analysis`

Body:
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### Sync
- `POST /analysis/sync`

Body:
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

## 2) RANGE (time range)

### Async (Kafka pipeline)
- `POST /analysis/range`

Body:
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "startSeconds": 30,
  "endSeconds": 70
}
```

Rules:
- `startSeconds >= 0`
- `endSeconds >= startSeconds`

### Sync (HTTP pipeline)
- `POST /analysis/range/sync`

Body is the same as async.

## 3) AT (time point)

### Async (Kafka pipeline)
- `POST /analysis/at`

Body:
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "atSeconds": 120
}
```

Semantics (AT):
- The system selects the single nearest transcript segment to `atSeconds`.
- It also extracts frames at `atSeconds-1`, `atSeconds`, `atSeconds+1` and runs OCR (best-effort).
- The transcript `content` used for analysis becomes:
  - `segment_text + "\n" + ocr_text`

### Sync (HTTP pipeline)
- `POST /analysis/at/sync`

Body is the same as async.

## 4) Polling

- `GET /analysis/{jobId}`

Behavior:
- While running: returns current `status`
- On success: returns `result`
- On failure: returns `error` (code/message)


# Frontend Async Analysis Flow (Kafka Mode)

이 문서는 `app.pipeline.mode=kafka` 환경에서 프론트가 **해야 하는 작업만** 정리한다.

Base Path: `/analysis`

## 1) 비동기 분석 요청 (job 생성)

Request:

`POST /analysis`

```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

Response (202):

```json
{
  "status": 202,
  "message": "요청이 확인되었습니다",
  "data": {
    "jobId": "8d6f8f63-6f55-4b85-9f9f-3f8c5b2f1a1f",
    "status": "REQUESTED"
  }
}
```

프론트 처리:
- `data.jobId` 저장
- 이후 상태 조회는 `jobId`로만 진행

## 2) 상태 폴링 (완료/실패까지)

Request:

`GET /analysis/{jobId}`

Response (예: 진행 중):

```json
{
  "status": 200,
  "message": "요청이 성공했습니다.",
  "data": {
    "jobId": "8d6f8f63-6f55-4b85-9f9f-3f8c5b2f1a1f",
    "status": "AI_PROCESSING",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "result": null,
    "error": null
  }
}
```

Response (예: 완료):

```json
{
  "status": 200,
  "message": "요청이 성공했습니다.",
  "data": {
    "jobId": "8d6f8f63-6f55-4b85-9f9f-3f8c5b2f1a1f",
    "status": "COMPLETED",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "result": {
      "jobId": "8d6f8f63-6f55-4b85-9f9f-3f8c5b2f1a1f",
      "videoId": "nk6XYRBQYHs",
      "videoTitle": "영상 제목",
      "channelId": "UCxxxx",
      "channelName": "채널명",
      "trustGrade": "UNKNOWN",
      "confidenceScore": 50,
      "summary": "요약...",
      "violations": [],
      "elapsedMs": 22041
    },
    "error": null
  }
}
```

Response (예: 실패):

```json
{
  "status": 200,
  "message": "요청이 성공했습니다.",
  "data": {
    "jobId": "8d6f8f63-6f55-4b85-9f9f-3f8c5b2f1a1f",
    "status": "FAILED",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "result": null,
    "error": {
      "code": "ANALYSIS_FAILED",
      "message": "..."
    }
  }
}
```

프론트 처리 규칙(권장):
- polling interval: 1~2초
- 종료 조건:
  - `data.status == "COMPLETED"`: 결과 화면으로 전환 (아래 3)로 진행)
  - `data.status == "FAILED"`: 에러 화면/토스트 처리 (`data.error` 표시)
- 타임아웃: 2~5분 내에 완료 안되면 “처리 지연” 상태로 분리(사용자 재시도/나가기 허용)

### Status 값

BE에서 사용하는 값(문서/코드 기준):
- `REQUESTED`
- `TRANSCRIPT_PROCESSING`
- `AI_PROCESSING`
- `COMPLETED`
- `FAILED`

## 3) 완료 후 결과 조회 (화면용 DTO)

프론트가 화면에 바로 쓰기 좋은 응답이 필요하면 아래 API 사용:

Request:

`GET /analysis/{jobId}/result`

Response (200):

```json
{
  "status": 200,
  "message": "요청이 성공했습니다.",
  "data": {
    "videoId": "nk6XYRBQYHs",
    "videoTitle": "영상 제목",
    "channelName": "채널명",
    "trustGrade": "UNKNOWN",
    "confidenceScore": 50,
    "summary": "요약...",
    "violations": [
      {
        "startTime": 23,
        "violationSentence": "문장...",
        "reason": "사유..."
      }
    ]
  }
}
```

프론트 처리:
- 2)에서 `COMPLETED` 확인 후, 이 API로 최종 화면 데이터 로드
- 만약 `GET /analysis/{jobId}`의 `data.result`를 그대로 쓰는 UI면 3) 호출은 생략 가능

## 4) 추가 조회 (필요할 때만)

### 최근 jobId 확인(중복 요청 방지 UX 등에 사용)

`GET /analysis/check?youtubeUrl=...`

### URL 기준 최신 job 조회

`GET /analysis/latest?youtubeUrl=...`

## 5) 주의사항

- `app.pipeline.mode=kafka`에서는 `POST /analysis/sync`가 실패(400)하도록 되어 있으므로, 프론트는 async + polling 플로우만 사용한다.
- `GET /analysis/{jobId}`의 `data.result`는 `analysis_job.result_json`을 JSON으로 파싱한 값이다. 따라서 워커가 `analysis.completed` 이벤트의 `payload`를 어떤 형태로 보내는지에 따라 스키마가 바뀔 수 있다.
  - 현재 권장(final payload) 형태: `jobId/videoId/videoTitle/channelId/channelName/trustGrade/confidenceScore/summary/violations/elapsedMs`


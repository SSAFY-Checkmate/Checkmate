# FastAPI 기반 유튜브 텍스트 파싱 및 분석 모듈

# ⚙️ ISSUE
- **Spring Boot 메인 서버 연동 및 STT 처리 안정화**: 현재 자막 추출 및 Whisper STT 변환 핵심 로직은 구현되어 있으나, 영상 길이가 길어 STT 처리 시간이 길어질 경우 HTTP 통신 타임아웃이 발생할 우려가 있습니다. 또한 운영 환경 배포를 위한 인프라 패키징이 필요합니다.

# 📄 To-Do
- [ ] 긴 영상 STT 변환 시 Timeout 방지를 위한 비동기 큐(예: Celery, Redis) 또는 WebHook 방식 도입 검토
- [ ] 배포 및 환경 일치화를 위한 Dockerfile / docker-compose 작성 (FFmpeg 및 Whisper 의존성 포함)
- [ ] Spring Boot 메인 서버와 API 연동 테스트 및 예외 상황(404, 500 등) 에러 코드 세분화
- [ ] 파이프라인(추출 -> 전처리 -> 변환) 로깅 시스템 도입 및 모니터링 환경 구성

## 1. 개요
Spring Boot 측의 요청을 받아 유튜브 영상의 자막을 추출하고 전처리를 거쳐 AI 분석에 적합한 순수 텍스트 단위로 반환해주는 데이터 처리 워커(Worker)입니다.

---

## 2. 주요 기능 및 데이터 파이프라인

### 1) 자막 고속 추출 (Fast Track)
- `youtube-transcript-api`를 활용해 영상 고유 자막을 검색합니다.
- 언어 우선순위 적용: **한국어 수동(`ko`) → 한국어 자동번역(`ko-auto`) → 영어(`en`)**
- 타임스탬프 정보는 날리고, 무거운 API 키 인증 없이 순수 텍스트(Full Text) 기반으로 병합합니다.

### 2) 메타데이터 자동 추출
- 별도의 Google API Key 없이 YouTube 공식 `oEmbed` API를 활용합니다.
- 영상의 제목(`title`) 및 채널명(`author`)을 자막과 함께 동기화하여 가져옵니다.

### 3) 텍스트 정제 (Text Preprocessing)
- AI 모델(Gemini 등)이 핵심 문맥을 잘 파악하도록 노이즈를 제거합니다.
- 제거 대상: 
  - 대괄호/소괄호 형식의 메타데이터 (`[음악]`, `(박수)` 등)
  - 불필요한 감탄사 및 불용어 (`어`, `음`, `아이고` 등)
  - 연속된 자음/모음 (`ㅋㅋㅋ`, `ㅎㅎㅎ` 등)
  - 과도한 띄어쓰기 압축

### 4) 無자막 영상 우회 파이프라인 (STT Fallback)
- **에러 핸들링**: 자막이 비활성화되었거나 애초에 업로드되지 않은 쇼츠/영상은 기존 방식에서 에러(404)를 냅니다.
- **오디오 분석 연동**: 이 경우 에러를 내뱉는 대신, 내부적으로 `yt-dlp`를 가동하여 오디오 파일 다운로드 파이프라인으로 전환합니다.
- **AI 음성 인식**: 다운받은 `m4a` 오디오를 로컬 `OpenAI Whisper (Base)` 모델에 던져 텍스트로 추출해냅니다.
- **서버 용량 보호**: 다운로드 받은 오디오 파일은 파이썬 `tempfile` 폴더에 임시로만 존재하며, 변환 완료 즉시 디스크에서 자동 삭제됩니다.

---

## 3. 핵심 기술 스택
- **FastAPI / Uvicorn**: API 엔드포인트 구축
- **youtube-transcript-api**: 1차 자막 파싱
- **yt-dlp**: 백업용 오디오 추출 도구
- **openai-whisper**: AI 오디오 변환 (STT) 엔진
- **FFmpeg**: 서버 측 오디오 디코딩 엔진

---

## 4. API 명세

### Endpoint
`POST /v1/extract-transcript`

### Request (입력)
다양한 유튜브 링크 헝태(`youtube.com`, `youtu.be`, `shorts/..`) 및 순수 11자리 ID를 모두 자동 판별합니다.
```json
{
  "url": "https://www.youtube.com/watch?v=0k1AFi8SD2k" 
}
```

### Response (출력)
```json
{
  "video_id": "0k1AFi8SD2k",
  "title": "영상 제목",
  "author": "채널명",
  "language": "stt-auto",      // 일반 자막일 경우 ko, ko-auto, en 표기
  "content": "아 진짜 대박이다...",
  "status": "SUCCESS"
}
```

---

## 5. 서버 실행 방법
**의존성 설치:**
```bash
# 콘다 및 pip를 통한 의존성 설치
conda install -c conda-forge ffmpeg -y
pip install -r requirements.txt
```

**서버 실행:**
```bash
uvicorn main:app --reload
```
실행 후 `http://127.0.0.1:8000/docs` 에 접속하여 브라우저에서 편리하게 Swagger UI로 테스트하실 수 있습니다.

# 외부 서비스 연동 정리

본 문서는 프로젝트에서 사용하는 “외부 서비스(가입/키 발급/설정 방법이 필요한 항목)”를 정리합니다. **실제 키/토큰 값은 문서에 기록하지 않고**, 필요한 항목/발급 위치/설정 키 이름만 제공합니다.

리포지토리 기준 연동 지점:
- Backend: `be/` (Google OAuth2)
- Parser: `parser/` (SSAFY GMS: Whisper/STT fallback + LLM 보조)
- AI: `ai/` (OpenAI API(GMS base url), LangSmith, Naver Search, Qdrant, 공공데이터 API 등)

---

## 1) Google 소셜 로그인 (OAuth2)

사용 서비스:
- Google OAuth2

사용 위치:
- `be/src/main/resources/application.yml`
- `be/src/main/resources/application-prod.yml`

필요 설정(환경변수):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OAUTH2_SUCCESS_REDIRECT_URI`

비고:
- 운영 redirect는 실제 서비스 도메인/프론트 라우팅에 맞춰야 합니다.
- 로컬 기본 redirect는 `http://localhost:5173/oauth2/redirect` 로 설정되어 있습니다.

---

## 2) SSAFY GMS (OpenAI 호환 API) - Parser/AI 공용

용도:
- Parser: 자막이 없거나 차단된 경우 STT(Whisper) fallback 및 분석 보조
- AI: LLM/Embedding 호출(OpenAI SDK 호환)

사용 위치:
- Parser: `parser/.env`, `parser/worker_transcript.py` (간접적으로 사용)
- AI: `ai/.env`, `ai/.env.example`, `ai/docker-compose.prod.yml`, `ai/Jenkinsfile`

필요 설정(환경변수):
- Parser:
  - `GMS_KEY`
  - `GMS_MODEL` (예: `gpt-4o-mini`)
- AI(OpenAI SDK 호환):
  - `OPENAI_API_KEY`
  - `OPENAI_BASE_URL` (예: `https://gms.ssafy.io/gmsapi/api.openai.com/v1`)
  - `LLM_MODEL` (예: `gpt-4o-mini`)
  - `EMBEDDING_MODEL` (예: `text-embedding-3-small`)

운영 설정 권장:
- Jenkins Credentials로 `OPENAI_API_KEY`/`GMS_KEY` 등을 관리
- 저장소에 실제 키가 남지 않도록 `.env`는 템플릿만 유지(`.env.example`)

---

## 3) LangSmith (LangChain Observability)

용도:
- LLM 호출 트레이싱/관측

사용 위치:
- `ai/.env.example`
- `ai/docker-compose.prod.yml`
- `ai/Jenkinsfile`

필요 설정(환경변수):
- `LANGCHAIN_API_KEY`
- `LANGCHAIN_TRACING_V2` (예: `true`)
- `LANGCHAIN_PROJECT` (예: `a405-ai` 또는 `Checkmate`)
- `LANGCHAIN_ENDPOINT` (기본: `https://api.smith.langchain.com`)

---

## 4) Naver Search API

용도:
- AI 서비스에서 웹 검색(근거/보조정보) 기능 사용 시

사용 위치:
- `ai/.env.example`
- `ai/docker-compose.prod.yml`
- `ai/Jenkinsfile`

필요 설정(환경변수):
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

---

## 5) Qdrant (Vector DB)

용도:
- AI RAG/임베딩 저장 및 검색

사용 위치:
- `ai/.env.example`
- `ai/docker-compose.prod.yml`
- `ai/deploy-ai-bluegreen.sh` (환경변수로 전달)

필요 설정:
- `QDRANT_URL`
- (운영) Qdrant 컨테이너/인스턴스는 별도 compose 또는 운영 인프라로 준비 필요

---

## 6) Proxy 서비스 (Residential Proxy / Decodo 등)

용도:
- YouTube 자막/메타데이터 접근 시 IP 차단 회피(Parser)

사용 위치:
- `parser/deploy-parser-bluegreen.sh`
- `parser/Jenkinsfile` (`DECODO_PROXY_URL` Credentials)
- `parser/.env` (로컬 테스트용)

필요 설정(환경변수):
- `USE_RESIDENTIAL_PROXY` (예: `true`)
- `PROXY_URL` (예: `DECODO_PROXY_URL` 값을 전달)

비고:
- 운영에서는 worker/API 컨테이너 모두에 동일 proxy 설정을 주입합니다(Jenkinsfile 기준).

---

## 7) 공공데이터/식약처 API (AI 쪽 템플릿 기준)

용도:
- AI에서 특정 도메인 데이터 조회/검증에 사용 가능(현재 `.env.example`에 키 템플릿 존재)

사용 위치:
- `ai/.env.example`

필요 설정(환경변수):
- `DATA_GO_KR_API_KEY`
- `FOODSAFETYKOREA_API_KEY`

비고:
- 실제 코드에서 사용 중인지 여부는 `ai/` 내부 라우터/서비스 구현에 따라 달라질 수 있습니다.

---

## 8) 코드 컴파일/빌드 관련 외부 서비스

현 저장소 기준:
- 빌드/배포는 Jenkins + Docker로 수행합니다.

관련 파일:
- `be/Jenkinsfile`, `fe/Jenkinsfile`, `parser/Jenkinsfile`, `ai/Jenkinsfile`

---

## 9) 외부 서비스 설정 주입 위치(요약)

Jenkins Credentials로 관리 권장(운영):
- Backend: DB/JWT/Google OAuth2
- Parser: `GMS_KEY`, `DECODO_PROXY_URL`
- AI: `OPENAI_API_KEY`, `LANGCHAIN_API_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`

로컬 개발:
- `parser/.env`, `ai/.env` 를 사용하되 실제 키는 개인/팀 규칙에 따라 별도 전달


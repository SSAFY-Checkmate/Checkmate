# 포팅 매뉴얼 (Build/Deploy)

본 문서는 GitLab 소스 클론 이후 **로컬 빌드/실행**, **Docker 빌드**, **배포(Blue-Green + Nginx Reverse Proxy + Jenkins)** 를 재현할 수 있도록, 리포지토리 기준으로 필요한 제품/버전/설정/환경변수/특이사항을 정리한 문서입니다.

대상 리포지토리 구조:
- `be/`: Spring Boot 백엔드
- `fe/`: Vite + React 프론트엔드
- `parser/`: FastAPI(자막 추출/정제) + (옵션) Kafka worker
- `ai/`: FastAPI(LLM/RAG/Claim) + (별도) worker(docker compose)
- `docs/`: 운영/아키텍처 보조 문서

---

## 1) 사용 제품/버전 (빌드/런타임/서버)

### 1.1 Backend (be)
- Language/Runtime: Java 17
  - `be/build.gradle`: `java.toolchain.languageVersion = 17`
- Build tool: Gradle Wrapper 8.14.4
  - `be/gradle/wrapper/gradle-wrapper.properties`
- Framework: Spring Boot 3.5.13
  - `be/build.gradle`: `org.springframework.boot` `3.5.13`
- Container build:
  - Builder: `gradle:8-jdk17`
  - Runtime: `eclipse-temurin:17-jre-alpine`
  - `be/Dockerfile`
- 주요 인프라 의존:
  - Redis 7 (`redis:7`)
  - Kafka/Zookeeper (Confluent) 7.6.0 (`confluentinc/cp-kafka:7.6.0`, `confluentinc/cp-zookeeper:7.6.0`)
  - MySQL: 외부/별도 운영 (JDBC URL/계정은 환경변수로 주입)

### 1.2 Frontend (fe)
- Node.js: 20.x (`node:20-alpine`)
- Package manager: pnpm (Corepack 사용)
  - `fe/Dockerfile`: `corepack enable`, `pnpm install --frozen-lockfile`
- Build: Vite 8.x (`vite`), TypeScript 6.x, React 19.x
  - `fe/package.json`
- Container runtime: `nginx:alpine` (정적 파일 서빙)
  - `fe/Dockerfile`

### 1.3 Parser (parser)
- Python: 3.11 (`python:3.11-slim`)
  - `parser/Dockerfile`
- Framework: FastAPI + Uvicorn
  - `parser/requirements.txt`, `parser/main.py`
- 컨테이너 포트: 8000 (서비스/헬스)

### 1.4 AI (ai)
- Python: 3.11 (`python:3.11-slim`)
  - `ai/Dockerfile`
- Framework: FastAPI + (LangChain/OpenAI/Qdrant/Redis/Kafka 연동)
  - `ai/requirements.txt`, `ai/main.py`
- 컨테이너 포트: 8000 (서비스/헬스)
- Worker: `ai/docker-compose.prod.yml`로 별도 실행(현재 repo 기준)

### 1.5 Web/WAS, 배포 서버 구성(운영)
- Reverse Proxy: Nginx (Ubuntu host에 설치되어 있다고 가정)
  - Blue-Green 스크립트가 `/etc/nginx/conf.d/*-upstream.conf` 파일을 갱신
- 배포 방식:
  - Docker 이미지 빌드(젠킨스 또는 수동)
  - Docker 컨테이너 Blue-Green 교체(Host에서 `deploy-*-bluegreen.sh` 실행)
- CI/CD: Jenkins Pipeline
  - `be/Jenkinsfile`, `fe/Jenkinsfile`, `parser/Jenkinsfile`, `ai/Jenkinsfile`

### 1.6 IDE (권장)
- Backend: IntelliJ IDEA (Gradle + Java 17)
- Frontend: VS Code 또는 IntelliJ IDEA (Node 20 + pnpm)
- Python: VS Code 또는 PyCharm (Python 3.11)

---

## 2) 로컬 빌드/실행

### 2.1 Backend 로컬 실행
1. (선행) 로컬 MySQL/Redis/Kafka 준비 (또는 Docker compose 사용)
2. 환경변수 설정(최소):
   - `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. 실행:
```bash
cd be
./gradlew clean test bootRun
```

기본 포트:
- `8080` (`be/src/main/resources/application.yml`)

헬스 체크:
- `GET http://localhost:8080/health`

### 2.2 Frontend 로컬 실행
```bash
cd fe
corepack enable
pnpm install
pnpm dev
```

기본 포트:
- `5173` (`fe/vite.config.ts`)

`VITE_API_URL`:
- 개발 시 `.env` 또는 쉘 환경변수로 주입하는 방식 권장(도커 빌드는 `--build-arg` 사용, 아래 3.2 참고)

### 2.3 Parser 로컬 실행
```bash
cd parser
python -m venv .venv
./.venv/Scripts/python -m pip install -r requirements.txt
./.venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

헬스 체크:
- `GET http://localhost:8000/health` (root_path는 `/parser`로 설정되어 있으나 로컬 uvicorn 직접 실행 시 그대로 호출 가능)

### 2.4 AI 로컬 실행
```bash
cd ai
python -m venv .venv
./.venv/Scripts/python -m pip install -r requirements.txt
./.venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

헬스 체크:
- `GET http://localhost:8000/health` (root_path는 `/ai`)

---

## 3) Docker 빌드/실행

### 3.1 공통 네트워크
운영 배포(젠킨스/호스트) 기준으로 `checkmate-net` 도커 네트워크를 사용합니다.

생성:
```bash
docker network inspect checkmate-net >/dev/null 2>&1 || docker network create checkmate-net
```

### 3.2 이미지 빌드

Backend:
```bash
cd be
docker build -t a405-backend:latest .
```

Frontend:
```bash
cd fe
docker build --build-arg VITE_API_URL=http://<host>/be -t a405-frontend:latest .
```

Parser:
```bash
cd parser
docker build -t a405-parser:latest .
```

AI:
```bash
cd ai
docker build -t a405-ai:latest .
```

### 3.3 (운영) Redis/Kafka/Zookeeper + Backend Publisher 기동
운영 기준 compose:
- `be/docker-compose.prod.yml`

```bash
docker compose -f be/docker-compose.prod.yml up -d
```

포함 서비스:
- `redis`, `zookeeper`, `kafka`
- `backend-publisher` (Outbox publisher 프로필)

---

## 4) 빌드/배포 환경변수 정리 (상세)

문서에는 “키 이름”만 정리합니다. 값(비밀번호/토큰/API Key)은 Jenkins Credentials 또는 서버 환경변수로 주입합니다.

### 4.1 Backend 필수/주요 환경변수
Spring profile:
- `SPRING_PROFILES_ACTIVE` (운영: `prod`, publisher 컨테이너는 `prod,publisher`)

DB (운영):
- `PROD_DB_URL`
- `PROD_DB_USERNAME`
- `PROD_DB_PASSWORD`

DB (로컬 기본 설정 파일):
- `be/src/main/resources/application.yml` 의 datasource url은 로컬 기본값(`jdbc:mysql://localhost:3306/checkmate...`)이며 계정/비번은 env로 받음

JWT:
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRATION_MILLIS` (optional, default 1800000)
- `JWT_REFRESH_TOKEN_EXPIRATION_MILLIS` (optional, default 1209600000)

Google OAuth2:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OAUTH2_SUCCESS_REDIRECT_URI` (로컬 default는 `http://localhost:5173/oauth2/redirect`)
- `OAUTH2_REDIRECTION_BASE_URI` (optional)

Redis:
- `REDIS_HOST` (default `localhost` 또는 운영 default `redis`)
- `REDIS_PORT` (default `6379`)

Kafka:
- `KAFKA_BOOTSTRAP_SERVERS` (default `localhost:9092` 또는 운영 default `kafka:9092`)
- `KAFKA_CONSUMER_GROUP_ID` (default `be`)
- `KAFKA_LISTENER_CONCURRENCY` (optional, default `1`)

Outbox Publisher:
- `OUTBOX_PUBLISHER_ENABLED` (default `false`, publisher 컨테이너에서는 `true`)
- `OUTBOX_PUBLISH_FIXED_DELAY_MS`, `OUTBOX_PUBLISH_BATCH_SIZE`, `OUTBOX_PUBLISH_MAX_ATTEMPTS`, `OUTBOX_PUBLISH_SEND_TIMEOUT_MS` (optional)

내부 서비스 연동(BE -> Parser/AI):
- `APP_SERVICES_PARSER_BASE_URL`
- `APP_SERVICES_AI_BASE_URL`

Topic override(optional):
- `TOPIC_TRANSCRIPT_*`, `TOPIC_ANALYSIS_*`
  - 기본값은 `be/src/main/resources/application.yml` 참고

### 4.2 Frontend 환경변수
- `VITE_API_URL`
  - Docker build 시 `--build-arg VITE_API_URL=...` 로 주입 (`fe/Dockerfile`)

### 4.3 Parser 환경변수(운영 배포/worker 포함)
Proxy(YouTube 차단 회피 목적):
- `USE_RESIDENTIAL_PROXY` (`true|false`)
- `PROXY_URL` (예: Decodo/Residential Proxy URL)

Kafka worker(젠킨스에서 worker 컨테이너 실행):
- `KAFKA_BOOTSTRAP_SERVERS` (운영: `kafka:9092`)
- `KAFKA_GROUP_ID` (예: `parser-transcript-worker`)
- `TOPIC_TRANSCRIPT_REQUESTED`, `TOPIC_TRANSCRIPT_COMPLETED`, `TOPIC_TRANSCRIPT_FAILED` (등)

Redis:
- `REDIS_HOST`, `REDIS_PORT`

LLM/STT fallback(SSAFY GMS):
- `GMS_KEY`
- `GMS_MODEL` (기본값: `gpt-4o-mini`, `parser/.env` 참고)

주의:
- `parser/.env` 파일에 키가 들어있을 수 있으므로, 운영에서는 Jenkins Credentials/서버 환경변수로 대체하고 저장소 커밋을 지양합니다.

### 4.4 AI 환경변수(운영 배포/API + worker)
LLM/OpenAI:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (Jenkinsfile 기준: `https://gms.ssafy.io/gmsapi/api.openai.com/v1`)
- `LLM_MODEL` (예: `gpt-4o-mini`)
- `EMBEDDING_MODEL` (예: `text-embedding-3-small`)

LangSmith(옵저버빌리티):
- `LANGCHAIN_API_KEY`
- `LANGCHAIN_TRACING_V2`
- `LANGCHAIN_PROJECT`
- `LANGCHAIN_ENDPOINT`

Search API:
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

Vector DB:
- `QDRANT_URL` (예: `http://qdrant:6333`)

Kafka/Redis:
- `KAFKA_BOOTSTRAP_SERVERS`
- `REDIS_HOST`, `REDIS_PORT` 또는 `REDIS_URL`

기타 플래그:
- `ENABLE_WEB_SEARCH`
- `LOG_LLM_CALLS`, `LOG_OUTPUT` (+ `LOG_FILE`)
- `SAMPLING_MAX_TOKENS_SELECTION`, `SAMPLING_MAX_TOKENS_DISAMBIGUATION`, `SAMPLING_MAX_TOKENS_DECOMPOSITION`, `SAMPLING_MAX_RETRIES`

---

## 5) 배포(Blue-Green) 특이사항

### 5.1 Blue-Green 스크립트 개요
각 서비스는 호스트(예: Ubuntu)에서 `deploy-*-bluegreen.sh` 를 실행하여 Blue/Green 컨테이너를 교체하고, Nginx upstream 설정을 갱신합니다.

스크립트(Repo):
- Backend: `be/deploy-backend-bluegreen.sh`
- Frontend: `fe/deploy-frontend-bluegreen.sh`
- Parser: `parser/deploy-parser-bluegreen.sh`
- AI: `ai/deploy-ai-bluegreen.sh`

스크립트가 사용하는 상태 파일(호스트):
- `/home/ubuntu/backend-active-color`
- `/home/ubuntu/frontend-active-color`
- `/home/ubuntu/parser-active-color`
- `/home/ubuntu/ai-active-color`

스크립트가 갱신하는 Nginx upstream 파일(호스트):
- `/etc/nginx/conf.d/backend-upstream.conf`
- `/etc/nginx/conf.d/frontend-upstream.conf`
- `/etc/nginx/conf.d/parser-upstream.conf`
- `/etc/nginx/conf.d/ai-upstream.conf`

공통 요구사항:
- `sudo nginx -t` 와 `sudo systemctl reload nginx` 가 성공해야 함
- 호스트에 `curl` 설치 필요(헬스 체크)
- `checkmate-net` 도커 네트워크가 존재해야 함(백엔드/AI/Parser는 네트워크에 붙음)

### 5.2 서비스별 포트(호스트 바인딩)
Frontend:
- Blue: `3000 -> container:80`
- Green: `3001 -> container:80`

Backend:
- Blue: `8080 -> container:8080`
- Green: `8082 -> container:8080`

Parser:
- Blue: `8089 -> container:8000`
- Green: `8091 -> container:8000`

AI:
- Blue: `8088 -> container:8000`
- Green: `8090 -> container:8000`

### 5.3 헬스 엔드포인트
Backend: `GET /health`
Parser: `GET /parser/health` (root_path 적용 시)
AI: `GET /ai/health` (root_path 적용 시)
Frontend: `/` (200 또는 304)

### 5.4 Jenkins 배포 플로우 요약(운영)
각 `*/Jenkinsfile` 기준으로 다음을 수행합니다(주로 `develop` 브랜치):
1. 변경 감지(해당 디렉토리 변경 없으면 배포 스킵)
2. Docker 이미지 빌드
3. 필요 컨테이너/compose up (redis/kafka/worker 등)
4. Blue-Green 스크립트를 호스트로 `scp` 복사
5. 호스트에서 스크립트 실행
6. 원격 헬스 체크

Backend Jenkins Credentials(예):
- `prod-db-url`, `prod-db-username`, `prod-db-password`
- `jwt-secret`
- `google-client-id`, `google-client-secret`
- `oauth2-success-redirect-uri`
- SSH: `host-ssh-key`

Parser Jenkins Credentials(예):
- `GMS_KEY`
- `DECODO_PROXY_URL`

AI Jenkins Credentials(예):
- `OPENAI_API_KEY`, `LANGCHAIN_API_KEY`
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- SSH: `host-ssh-key`

---

## 6) 주요 계정/프로퍼티 정의 파일 목록 (DB 접속정보 포함)

### 6.1 Backend
- `be/src/main/resources/application.yml` (기본값 + env 키 정의)
- `be/src/main/resources/application-local.yml`
- `be/src/main/resources/application-prod.yml` (운영 DB/Kafka/Redis/서비스 URL)
- `be/src/main/resources/application-publisher.yml` (Outbox publisher 프로필)
- `be/src/test/resources/application-test.yml` (테스트 H2/더미 OAuth2/JWT)
- `be/src/main/resources/logback-spring.xml` (로그 포맷/레벨)

### 6.2 Frontend
- `fe/package.json` (빌드 스크립트)
- `fe/vite.config.ts` (dev server 포트)
- Docker build arg: `fe/Dockerfile` 의 `ARG/ENV VITE_API_URL`

### 6.3 Parser
- `parser/.env` (로컬 샘플/개발용. 운영에는 secrets 미커밋 권장)
- `parser/requirements.txt`

### 6.4 AI
- `ai/.env` (로컬 개발용. 운영에는 secrets 미커밋 권장)
- `ai/.env.example` (필수 키 템플릿)
- `ai/docker-compose.prod.yml` (worker 환경변수)
- `ai/requirements.txt`

---

## 7) 배포 후 점검 체크리스트
1. `docker ps`에서 각 서비스 컨테이너가 Running인지 확인
2. Nginx upstream 파일이 기대 포트로 갱신되었는지 확인:
   - `/etc/nginx/conf.d/*-upstream.conf`
3. 외부 도메인 헬스 체크:
   - Backend: `https://k14a405.p.ssafy.io/be/health`
   - Parser: `https://k14a405.p.ssafy.io/parser/health`
   - AI: `https://k14a405.p.ssafy.io/ai/health`
   - Frontend: `https://k14a405.p.ssafy.io/`
4. Kafka/Redis 기동 확인(운영은 컨테이너로 상주)
5. (옵저버빌리티) Kibana 노출 설정이 필요한 경우 `docs/ops-kibana-nginx.md` 참고


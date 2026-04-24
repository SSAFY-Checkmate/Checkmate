FROM python:3.11-slim

WORKDIR /app

# Python 기본 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 시스템 패키지 설치
# - gcc: 일부 Python 패키지 빌드용
# - curl: 컨테이너 내부 헬스체크/디버깅용
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 의존성 먼저 복사해서 Docker layer cache 활용
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 애플리케이션 소스 복사
COPY . .

# FastAPI 컨테이너 내부 포트
EXPOSE 8000

# main.py 안에 app = FastAPI() 가 있다고 가정
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--http", "h11"]
#!/bin/bash
set -e

APP_NAME="a405-ai"
IMAGE_NAME="a405-ai:latest"
NETWORK_NAME="checkmate-net"
ACTIVE_FILE="/home/ubuntu/ai-active-color"
NGINX_UPSTREAM="/etc/nginx/conf.d/ai-upstream.conf"

BLUE_PORT=8088
GREEN_PORT=8090
CONTAINER_PORT=8000

if [ ! -f "$ACTIVE_FILE" ]; then
  echo "blue" | sudo tee "$ACTIVE_FILE" > /dev/null
fi

ACTIVE_COLOR=$(cat "$ACTIVE_FILE")

if [ "$ACTIVE_COLOR" = "blue" ]; then
  NEXT_COLOR="green"
  NEXT_PORT=$GREEN_PORT
  OLD_COLOR="blue"
else
  NEXT_COLOR="blue"
  NEXT_PORT=$BLUE_PORT
  OLD_COLOR="green"
fi

echo "Current active color: $ACTIVE_COLOR"
echo "Next color: $NEXT_COLOR"
echo "Next port: $NEXT_PORT"

echo "[CHECK] OPENAI_API_KEY exists?"
if [ -n "$OPENAI_API_KEY" ]; then
  echo "OPENAI_API_KEY exists"
else
  echo "OPENAI_API_KEY is empty"
fi

echo "[CHECK] OPENAI_BASE_URL=${OPENAI_BASE_URL}"
echo "[CHECK] EMBEDDING_MODEL=${EMBEDDING_MODEL}"
echo "[CHECK] LLM_MODEL=${LLM_MODEL}"

docker rm -f ${APP_NAME}-${NEXT_COLOR} || true

# 기존 단일 배포 방식에서 남은 legacy API 컨테이너 정리
if [ "$NEXT_PORT" = "8088" ]; then
  docker rm -f ${APP_NAME} || true
fi

docker run -d \
  --name ${APP_NAME}-${NEXT_COLOR} \
  --restart unless-stopped \
  --network ${NETWORK_NAME} \
  -p ${NEXT_PORT}:${CONTAINER_PORT} \
  -e USE_RESIDENTIAL_PROXY="${USE_RESIDENTIAL_PROXY}" \
  -e PROXY_URL="${PROXY_URL}" \
  -e QDRANT_URL="${QDRANT_URL}" \
  -e KAFKA_BOOTSTRAP_SERVERS="${KAFKA_BOOTSTRAP_SERVERS}" \
  -e REDIS_HOST="${REDIS_HOST}" \
  -e REDIS_PORT="${REDIS_PORT}" \
  -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
  -e OPENAI_BASE_URL="${OPENAI_BASE_URL}" \
  -e EMBEDDING_MODEL="${EMBEDDING_MODEL}" \
  -e LLM_MODEL="${LLM_MODEL}" \
  -e ENABLE_WEB_SEARCH="${ENABLE_WEB_SEARCH}" \
  -e LOG_LLM_CALLS="${LOG_LLM_CALLS}" \
  -e LOG_OUTPUT="${LOG_OUTPUT}" \
  -e SAMPLING_MAX_TOKENS_SELECTION="${SAMPLING_MAX_TOKENS_SELECTION}" \
  -e SAMPLING_MAX_TOKENS_DISAMBIGUATION="${SAMPLING_MAX_TOKENS_DISAMBIGUATION}" \
  -e SAMPLING_MAX_TOKENS_DECOMPOSITION="${SAMPLING_MAX_TOKENS_DECOMPOSITION}" \
  -e SAMPLING_MAX_RETRIES="${SAMPLING_MAX_RETRIES}" \
  ${IMAGE_NAME}

echo "Health check start..."

for i in {1..30}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${NEXT_PORT}/health || echo "000")
  echo "Health check attempt $i: $HTTP_CODE"

  if [ "$HTTP_CODE" = "200" ]; then
    echo "Health check success"
    break
  fi

  if [ "$i" -eq 30 ]; then
    echo "Health check failed"
    docker logs ${APP_NAME}-${NEXT_COLOR} --tail=150
    docker rm -f ${APP_NAME}-${NEXT_COLOR} || true
    exit 1
  fi

  sleep 3
done

echo "Switch Nginx upstream to ${NEXT_COLOR}"

sudo tee ${NGINX_UPSTREAM} > /dev/null <<EOF
upstream ai_app {
    server 127.0.0.1:${NEXT_PORT};
}
EOF

sudo nginx -t
sudo systemctl reload nginx

echo "$NEXT_COLOR" | sudo tee "$ACTIVE_FILE" > /dev/null

docker rm -f ${APP_NAME}-${OLD_COLOR} || true

echo "AI Blue-Green deployment completed. Active: ${NEXT_COLOR}"
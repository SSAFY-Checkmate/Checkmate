#!/bin/bash
set -e

APP_NAME="a405-backend"
IMAGE_NAME="a405-backend:latest"
NETWORK_NAME="checkmate-net"
ACTIVE_FILE="/home/ubuntu/backend-active-color"
NGINX_UPSTREAM="/etc/nginx/conf.d/backend-upstream.conf"

BLUE_PORT=8080
GREEN_PORT=8082
CONTAINER_PORT=8080

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

docker rm -f ${APP_NAME}-${NEXT_COLOR} || true

docker run -d \
  --name ${APP_NAME}-${NEXT_COLOR} \
  --restart unless-stopped \
  --network ${NETWORK_NAME} \
  -p ${NEXT_PORT}:${CONTAINER_PORT} \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e PROD_DB_URL="${PROD_DB_URL}" \
  -e PROD_DB_USERNAME="${PROD_DB_USERNAME}" \
  -e PROD_DB_PASSWORD="${PROD_DB_PASSWORD}" \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}" \
  -e GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}" \
  -e OAUTH2_SUCCESS_REDIRECT_URI="${OAUTH2_SUCCESS_REDIRECT_URI}" \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  -e KAFKA_CONSUMER_GROUP_ID=be \
  -e OUTBOX_PUBLISHER_ENABLED=false \
  -e APP_SERVICES_PARSER_BASE_URL=http://a405-parser:8000 \
  ${IMAGE_NAME}

echo "Health check start..."

for i in {1..20}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${NEXT_PORT}/health || echo "000")
  echo "Health check attempt $i: $HTTP_CODE"

  if [ "$HTTP_CODE" = "200" ]; then
    echo "Health check success"
    break
  fi

  if [ "$i" -eq 20 ]; then
    echo "Health check failed"
    docker logs ${APP_NAME}-${NEXT_COLOR} --tail=100
    docker rm -f ${APP_NAME}-${NEXT_COLOR} || true
    exit 1
  fi

  sleep 3
done

echo "Switch Nginx upstream to ${NEXT_COLOR}"

sudo tee ${NGINX_UPSTREAM} > /dev/null <<EOF
upstream backend_app {
    server 127.0.0.1:${NEXT_PORT};
}
EOF

sudo nginx -t
sudo systemctl reload nginx

echo "$NEXT_COLOR" | sudo tee "$ACTIVE_FILE" > /dev/null

docker rm -f ${APP_NAME}-${OLD_COLOR} || true

echo "Blue-Green deployment completed. Active: ${NEXT_COLOR}"
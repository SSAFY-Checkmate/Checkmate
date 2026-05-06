#!/bin/bash
set -e

APP_NAME="a405-frontend"
IMAGE_NAME="a405-frontend:latest"
ACTIVE_FILE="/home/ubuntu/frontend-active-color"
NGINX_UPSTREAM="/etc/nginx/conf.d/frontend-upstream.conf"

BLUE_PORT=3000
GREEN_PORT=3001
CONTAINER_PORT=80

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

# 기존 compose/단일 배포 방식에서 남은 legacy 컨테이너 정리
if [ "$NEXT_PORT" = "3000" ]; then
  docker rm -f ${APP_NAME} || true
fi

docker run -d \
  --name ${APP_NAME}-${NEXT_COLOR} \
  --restart unless-stopped \
  -p ${NEXT_PORT}:${CONTAINER_PORT} \
  ${IMAGE_NAME}

echo "Health check start..."

for i in {1..20}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${NEXT_PORT}/ || echo "000")
  echo "Health check attempt $i: $HTTP_CODE"

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
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
upstream frontend_app {
    server 127.0.0.1:${NEXT_PORT};
}
EOF

sudo nginx -t
sudo systemctl reload nginx

echo "$NEXT_COLOR" | sudo tee "$ACTIVE_FILE" > /dev/null

docker rm -f ${APP_NAME}-${OLD_COLOR} || true

echo "Frontend Blue-Green deployment completed. Active: ${NEXT_COLOR}"
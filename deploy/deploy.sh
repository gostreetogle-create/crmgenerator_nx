#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[[ -f .env ]] || cp .env.example .env
source .env
echo "[deploy] Обновляю код..."
git -C .. pull --ff-only
echo "[deploy] Подтягиваю образы (если есть в registry)..."
docker compose --env-file .env pull || true
echo "[deploy] Запускаю базу и backend для миграций..."
docker compose --env-file .env up -d postgres backend
echo "[deploy] Применяю Prisma миграции..."
docker compose --env-file .env run --rm backend npx prisma migrate deploy
echo "[deploy] Поднимаю все сервисы..."
docker compose --env-file .env up -d --build
echo "[deploy] Жду, пока backend станет healthy..."
for i in {1..30}; do
  if curl -fsS "http://localhost:${BACKEND_PORT:-3000}/health" >/dev/null; then
    break
  fi
  sleep 2
done
echo "[deploy] Проверяю health backend..."
if ! curl -fsS "http://localhost:${BACKEND_PORT:-3000}/health" >/dev/null; then
  echo "[deploy] Ошибка: backend не отвечает, последние логи:"
  docker compose --env-file .env logs backend --tail 40
  exit 1
fi
echo "[deploy] Готово: deploy выполнен успешно."

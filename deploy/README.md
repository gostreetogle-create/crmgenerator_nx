# Deploy на Ubuntu (через SSH, максимально просто)

Ниже минимальный сценарий: только `git + docker`, без установки Node/Nx/Prisma на сервер.

## Для новичка: что вводить (коротко)

### Каждый раз после изменений в GitHub

```bash
cd /opt/myapp/crmgenerator_nx/deploy
./deploy.sh
```

### Проверка, что всё хорошо

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -I http://localhost:8080
```

Если увидел:
- `backend` и `postgres` в `healthy`,
- `{"ok":true}` от `/health`,
- `HTTP 200` на `:8080`,

значит всё успешно.

### Если не работает (аварийно)

```bash
docker compose ps
docker compose logs backend --tail 80
docker compose logs web --tail 80
docker compose logs postgres --tail 80
```

Если нужно полный сброс:

```bash
docker compose down
docker compose down -v
./deploy.sh
```

`down -v` удаляет данные базы (используй только если нужен чистый старт).

## Первый раз (bootstrap)

```bash
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Перелогиньтесь по SSH после команды выше
git clone https://github.com/gostreetogle-create/crmgenerator_nx.git
cd crmgenerator_nx/deploy
cp .env.example .env
chmod +x deploy.sh
./deploy.sh
```

## Следующие обновления

```bash
cd ~/crmgenerator_nx/deploy
./deploy.sh
```

Скрипт сам делает:
- `git pull`
- `docker compose pull`
- запуск базы/бэкенда
- `prisma migrate deploy`
- `docker compose up -d --build`
- проверку health backend

## Где что открывать

- Frontend: `http://<SERVER_IP>:8080`
- Backend health: `http://<SERVER_IP>:3000/health`
- API через web reverse proxy: `http://<SERVER_IP>:8080/api/...`

## Важные замечания

- Обязательно поменяйте `POSTGRES_PASSWORD` в `.env`.
- Если хотите порты 80/443 — ставьте reverse proxy сверху (например nginx/caddy/traefik).
- Если `deploy.sh` упал — исправь причину и запусти снова, скрипт идемпотентный.

## Шпаргалка: быстрые команды

### 1) Базовая проверка после деплоя

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -I http://localhost:8080
```

Ожидание:
- `docker compose ps`: контейнеры `postgres`, `backend`, `web` в статусе `Up` (желательно `healthy`).
- `curl /health`: JSON вида `{"ok":true}`.
- `curl -I :8080`: `HTTP/1.1 200 OK` (или `304`).

### 2) Если деплой упал: быстрый разбор

```bash
docker compose ps
docker compose logs backend --tail 80
docker compose logs web --tail 80
docker compose logs postgres --tail 80
```

Чаще всего:
- ошибки TypeScript/Prisma в build backend;
- не поднялась БД;
- занят порт (`5433`, `3000`, `8080`).

### 3) Проверка, занят ли порт

```bash
sudo ss -ltnp | grep 5433 || true
sudo ss -ltnp | grep 3000 || true
sudo ss -ltnp | grep 8080 || true
```

Если команда ничего не выводит — порт свободен.

### 4) Полный сброс стека проекта (осторожно с `-v`)

```bash
docker compose down
docker compose down -v
```

`down -v` удаляет volume базы (`данные PostgreSQL`), использовать только если нужен чистый старт.

### 5) Чистый повторный запуск

```bash
cp -n .env.example .env
chmod +x deploy.sh
./deploy.sh
```

### 6) Обновление кода и повторный релиз

```bash
cd ~/crmgenerator_nx/deploy
./deploy.sh
```

### 7) Ручная проверка миграций (если нужно)

```bash
docker compose run --rm backend npx prisma migrate deploy
```

### 8) Ручной health-check API через web proxy

```bash
curl -fsS http://localhost:8080/api/health
```

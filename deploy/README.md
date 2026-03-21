# Deploy на Ubuntu (через SSH, максимально просто)

Ниже минимальный сценарий: только `git + docker`, без установки Node/Nx/Prisma на сервер.

## Первый раз (bootstrap)

```bash
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Перелогиньтесь по SSH после команды выше
git clone <URL_ВАШЕГО_REPO> crmgenerator_nx
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

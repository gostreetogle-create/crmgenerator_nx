# Deploy на Ubuntu (через SSH, понятный пошаговый сценарий)

Это инструкция для сервера Ubuntu.
Все команды ниже вводятся **на сервере по SSH**, в терминале.

## Навигатор: сценарии по категориям

### Категория: Ежедневная работа

- `Быстрый режим (15 секунд, только команды)` - запуск обновления и базовая проверка.
- `Сценарий 2: обычное обновление (после новых коммитов)` - стандартный рабочий цикл после изменений в GitHub.
- `Сценарий 5: ручные полезные команды` - точечные команды (миграции, проверка API, перезапуск backend).

### Категория: Первый запуск

- `Сценарий 1: первый запуск на новом сервере (bootstrap)` - установка Docker/Git, настройка `.env`, первый деплой.

### Категория: Диагностика и аварии

- `Сценарий 3: деплой упал, что делать` - быстрый разбор через статусы, логи и проверку портов.
- `Сценарий 4: полный сброс и чистый старт (осторожно)` - полный reset проекта, включая удаление volume БД.

### Категория: Надежность и продакшн-полировка

- `Сценарий 6: полировка продакшна (мини-пак из 5 пунктов)` - firewall, бэкап, restart policy, log rotation, cron health ping.

### Категория: Восстановление данных

- `Сценарий 7: восстановление БД из .sql бэкапа` - пошаговое восстановление PostgreSQL из резервной копии.

## Быстрый режим (15 секунд, только команды)

Ежедневное обновление:

```bash
cd /opt/myapp/crmgenerator_nx/deploy
./deploy.sh
```

Проверка:

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -I http://localhost:8080
```

Если ошибка:

```bash
docker compose logs backend --tail 120
docker compose logs web --tail 120
docker compose logs postgres --tail 120
```

Аварийный полный сброс (удалит БД):

```bash
docker compose down
docker compose down -v
./deploy.sh
```

---

## Сценарий 0: что тебе нужно запомнить

1. Ты работаешь в папке: `/opt/myapp/crmgenerator_nx/deploy`
2. Главная команда деплоя: `./deploy.sh`
3. Проверка после деплоя:
   - `docker compose ps`
   - `curl -fsS http://localhost:3000/health`
   - `curl -I http://localhost:8080`
4. Если проблема: смотри логи `backend`, `web`, `postgres`
5. `docker compose down -v` удаляет данные базы (использовать только осознанно)

---

## Сценарий 1: первый запуск на новом сервере (bootstrap)

### Шаг 1. Установить Docker и Git

```bash
sudo apt update
sudo apt install docker.io docker-compose git -y
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

После `usermod` нужно переподключиться по SSH (выйти и зайти снова).

### Шаг 2. Клонировать проект и перейти в deploy

```bash
mkdir -p /opt/myapp
cd /opt/myapp
git clone https://github.com/gostreetogle-create/crmgenerator_nx.git
cd /opt/myapp/crmgenerator_nx/deploy
```

### Шаг 3. Подготовить `.env`

```bash
cp .env.example .env
nano .env
```

Минимум измени `POSTGRES_PASSWORD` на свой пароль.

### Шаг 4. Запустить деплой

```bash
chmod +x deploy.sh
./deploy.sh
```

### Шаг 5. Проверить результат

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -I http://localhost:8080
```

Ожидаем:
- `postgres` и `backend` в `healthy`,
- `web` в `Up` (иногда сначала `health: starting`, это нормально),
- `{"ok":true}` на backend health,
- `HTTP/1.1 200 OK` (или `304`) на web.

---

## Сценарий 2: обычное обновление (после новых коммитов)

Когда в GitHub появились изменения, делай:

```bash
cd /opt/myapp/crmgenerator_nx/deploy
./deploy.sh
```

Потом проверка:

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -I http://localhost:8080
```

---

## Сценарий 3: деплой упал, что делать

### Шаг 1. Сначала посмотреть статусы и логи

```bash
cd /opt/myapp/crmgenerator_nx/deploy
docker compose ps
docker compose logs backend --tail 120
docker compose logs web --tail 120
docker compose logs postgres --tail 120
```

### Шаг 2. Частые причины

- `backend` не собрался (ошибки TypeScript/Prisma),
- `postgres` не поднялся,
- занят порт `5433`, `3000` или `8080`.

### Шаг 3. Проверка занятых портов

```bash
sudo ss -ltnp | grep 5433 || true
sudo ss -ltnp | grep 3000 || true
sudo ss -ltnp | grep 8080 || true
```

Если команда по порту ничего не вывела, порт свободен.

---

## Сценарий 4: полный сброс и чистый старт (осторожно)

Используй только если нужно начать с нуля.

```bash
cd /opt/myapp/crmgenerator_nx/deploy
docker compose down
docker compose down -v
./deploy.sh
```

`down -v` удаляет volume PostgreSQL, то есть удаляет данные БД.

---

## Сценарий 5: ручные полезные команды

### Ручной запуск миграций

```bash
cd /opt/myapp/crmgenerator_nx/deploy
docker compose run --rm backend npx prisma migrate deploy
```

### Проверка API через web proxy

```bash
curl -fsS http://localhost:8080/api/health
```

### Перезапустить только backend

```bash
cd /opt/myapp/crmgenerator_nx/deploy
docker compose restart backend
docker compose logs backend --tail 80
```

---

## Сценарий 6: полировка продакшна (мини-пак из 5 пунктов)

Все команды выполнять на сервере по SSH.

### 6.1 Firewall (UFW)

```bash
sudo apt install ufw -y
sudo ufw allow OpenSSH
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp
sudo ufw status
sudo ufw enable
```

Если не нужен прямой доступ к backend снаружи, не открывай `3000`, оставь только `8080`.

### 6.2 Бэкап PostgreSQL (ручной запуск)

```bash
cd /opt/myapp/crmgenerator_nx/deploy
mkdir -p ../backups
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > ../backups/backup_$(date +%F_%H-%M-%S).sql
ls -lh ../backups
```

### 6.3 Проверка restart policy

```bash
cd /opt/myapp/crmgenerator_nx/deploy
docker compose ps
docker inspect crmgenerator_backend --format '{{json .HostConfig.RestartPolicy}}'
docker inspect crmgenerator_postgres --format '{{json .HostConfig.RestartPolicy}}'
docker inspect crmgenerator_web --format '{{json .HostConfig.RestartPolicy}}'
```

Ожидаем policy типа `always` или `unless-stopped`.

### 6.4 Ротация Docker логов

```bash
sudo mkdir -p /etc/docker
printf '{\n  "log-driver": "json-file",\n  "log-opts": {\n    "max-size": "10m",\n    "max-file": "5"\n  }\n}\n' | sudo tee /etc/docker/daemon.json > /dev/null
sudo systemctl restart docker
cd /opt/myapp/crmgenerator_nx/deploy
docker compose up -d
```

### 6.5 Health ping по cron (каждые 5 минут)

```bash
mkdir -p /opt/myapp/ops
cat > /opt/myapp/ops/healthcheck.sh <<'EOF'
#!/usr/bin/env bash
set -e
curl -fsS http://localhost:3000/health >/dev/null
curl -fsS http://localhost:8080 >/dev/null
EOF
chmod +x /opt/myapp/ops/healthcheck.sh
```

Добавь в cron:

```bash
crontab -e
```

Строка для вставки:

```bash
*/5 * * * * /opt/myapp/ops/healthcheck.sh >> /opt/myapp/ops/healthcheck.log 2>&1
```

---

## Сценарий 7: восстановление БД из `.sql` бэкапа

### Когда использовать

- После случайного удаления данных;
- После `docker compose down -v`, если надо вернуть данные;
- При переносе рабочей БД из бэкапа.

### Шаг 1. Остановить backend (чтобы не писал в БД)

```bash
cd /opt/myapp/crmgenerator_nx/deploy
docker compose stop backend
```

### Шаг 2. Проверить, что файл бэкапа существует

```bash
ls -lh /opt/myapp/crmgenerator_nx/backups
```

Пример файла: `/opt/myapp/crmgenerator_nx/backups/backup_2026-03-21_16-30-00.sql`

### Шаг 3. Восстановить БД

```bash
cd /opt/myapp/crmgenerator_nx/deploy
cat /opt/myapp/crmgenerator_nx/backups/backup_2026-03-21_16-30-00.sql | docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

### Шаг 4. Поднять backend обратно

```bash
docker compose start backend
```

### Шаг 5. Проверить, что сервисы живы

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -I http://localhost:8080
```

Если `/health` вернул `{"ok":true}` и web отдает `HTTP 200`, восстановление прошло успешно.

---

## Где открывать проект

- Frontend: `http://<SERVER_IP>:8080`
- Backend health напрямую: `http://<SERVER_IP>:3000/health`
- API через web: `http://<SERVER_IP>:8080/api/...`

---

## Важные правила

- Всегда держи актуальный `.env`.
- Обязательно задай безопасный `POSTGRES_PASSWORD`.
- Если `deploy.sh` завершился ошибкой, исправь причину и запусти снова.
- Скрипт рассчитан на повторные запуски (идемпотентный сценарий).

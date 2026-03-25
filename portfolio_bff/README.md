# Portfolio BFF

Backend-for-Frontend service for the portfolio stack. This repo owns the API
for portfolio content and a dashboard read model for appointment events.

Full stack instructions live in the parent stack repo: `../README.md`.

## Role In The System

- Serves portfolio content to the frontend.
- Persists appointment events consumed from Kafka.
- Provides the data layer for a future dashboard UI.
- Includes a Next.js admin UI (in `admin-ui/`) backed by JSON admin endpoints.

## Dependencies

- Frontend: `../portfolio-frontend`
- Calendar API (publisher): `../portfolio-calendar`
- Notifications/Kafka: `../notifier_service`

## API Endpoints (JSON only)

- `GET /api/portfolio-content`
- `GET /api/projects`
- `GET /projects/{project}` (lookup by `id` or `slug`)

The API serves content from the database. Initial content can be seeded from
`content/data/portfolio-content.json`. If an ops repo exists at
`../ntakemori-deploy/portfolio-content.json` (or `../ntakemori-deployment/...`),
the seed command will use that file automatically.

## Local Development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
docker compose up -d mysql
export DB_HOST=127.0.0.1
python manage.py migrate
python manage.py seed_portfolio_content --reset
python manage.py runserver
```

Admin UI (Next.js): `http://localhost:3001`

Note: the Django admin route is disabled by default. Set `ENABLE_DJANGO_ADMIN=true`
if you need it locally.

Kafka consumer (separate process):
```bash
python manage.py consume_appointments
```

Note: the Docker consumer waits for migrations to be applied before starting,
so we avoid migration races when the BFF container is still booting.

## Docker Development

```bash
docker compose up --build
```

This starts MySQL, the BFF API, Kafka consumer, and the Next.js admin UI.
Default admin UI URL: `http://localhost:3001`
Port `3001` is reserved for the admin UI in this stack.

## Admin UI (Next.js)

Local dev:
```bash
cd admin-ui
npm install
npm run dev
```

If Docker previously wrote root-owned files in `admin-ui/`, run:
```bash
make admin-fix-perms
```

The admin UI expects the BFF to be running and defaults to
server-side `BFF_BASE_URL=http://localhost:8001` via Next rewrites
(`/api/* -> BFF`). This keeps client requests same-origin by default.

Docker env overrides:
- `PORTFOLIO_BFF_ADMIN_UI_PORT` (default `3001`)
- `PORTFOLIO_BFF_ADMIN_BFF_BASE_URL` (default `http://bff:8000`)
- Optional `NEXT_PUBLIC_BFF_BASE_URL` for direct client calls (normally keep empty)

## Environment Variables

Database (MySQL):

The BFF uses MySQL for all environments.

Required env vars:
- `DB_NAME` (default `portfolio_bff`)
- `DB_USER` (default `portfolio`)
- `DB_PASSWORD` (default `portfolio`)
- `DB_HOST` (default `127.0.0.1` for local, `mysql` in Docker)
- `DB_PORT` (default `3306`)
- `ALLOWED_HOSTS` (default `localhost,127.0.0.1,portfolio-bff,bff`)
- `ADMIN_UI_ORIGINS` (default `http://localhost:3001`)
- `CSRF_TRUSTED_ORIGINS` (default `http://localhost:3001,http://localhost:3101` in Docker compose)
- `ENABLE_DJANGO_ADMIN` (default `false`)

Docker MySQL uses:
- `DB_ROOT_PASSWORD` (default `portfolio`)

Kafka consumer:

The BFF includes a Kafka consumer that persists appointment events into the
database for the dashboard.

Manual run (dev):
```bash
python manage.py consume_appointments --from-beginning --max-messages 1
```

Docker:
```bash
docker compose up --build consumer
```

The consumer service expects the external Docker network
`notifier_service_default` (created by `notifier_service/docker-compose.yml`).

Consumer env vars:
- `KAFKA_BOOTSTRAP_SERVERS` (default `kafka:19092`)
- `KAFKA_TOPIC_APPOINTMENTS_CREATED` (default `appointments.created`)
- `KAFKA_CONSUMER_GROUP` (default `portfolio-bff`)
- `KAFKA_AUTO_OFFSET_RESET` (default `latest`)

## Seeded Dev Superuser

`python manage.py seed_portfolio_content` will also create a dev superuser when
the environment is not production. Production is detected via `BFF_ENV`,
`DJANGO_ENV`, `ENVIRONMENT`, or `APP_ENV` set to `prod`/`production`.

Defaults (override via env vars):
- `BFF_DEV_SUPERUSER_USERNAME` (default: `test@ex.com`)
- `BFF_DEV_SUPERUSER_EMAIL` (default: `admin@example.com`)
- `BFF_DEV_SUPERUSER_PASSWORD` (default: `Qweqwe123`)

## Ports

- BFF API: `8001` (host) -> `8000` (container)
- BFF Admin UI: `3001` (host) -> `3001` (container, reserved)

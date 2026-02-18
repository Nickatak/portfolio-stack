# Portfolio Stack

Parent orchestration repo for the portfolio ecosystem. This repo owns the
stack-level README/runbooks and wires the service repos together via submodules.

## Submodules

- `portfolio-frontend` (Next.js frontend)
- `portfolio-bff` (Django BFF + dashboard)
- `portfolio-calendar` (C# minimal API producer)
- `notifier_service` (Kafka broker + notifier worker runtime)

Initialize submodules after cloning:

```bash
git submodule update --init --recursive
```

## Quick Docker Dev

One command to run everything in Docker:
```bash
make dev-up
```

This spins up Kafka, MySQL, the BFF + consumer, calendar API, frontend, and
the notifier worker in one shot.
Port `3001` is reserved for the BFF admin UI.

Then open:
- `http://localhost:3000/` (frontend)
- `http://localhost:3001/` (BFF admin UI)
- `http://localhost:8001/` (BFF API)

Seed the BFF once (if you haven't already):
```bash
make dev-bff-seed
```
If you keep private content in an ops repo at `../ntakemori-deploy/portfolio-content.json`,
the seed command will use it automatically (no extra flags needed).

Stop everything:
```bash
make dev-down
```

## Quick Local Dev

Short path for a local dev session (Docker for infra, local for app processes).

1. Init submodules:
```bash
git submodule update --init --recursive
```

2. Start Kafka (Docker):
```bash
make dev-kafka-up
```

3. Start MySQL (Docker):
```bash
make dev-db-up
```

4. Start local app processes (separate terminals):
```bash
make local-calendar-up
```

```bash
make local-bff-up
```

```bash
make local-bff-seed
```
If you keep private content in an ops repo at `../ntakemori-deploy/portfolio-content.json`,
the seed command will use it automatically (no extra flags needed).

```bash
make local-bff-superuser
```

```bash
make local-bff-consumer-up
```

```bash
make local-frontend-up
```

```bash
make dev-admin-ui-up
```

5. Optional email worker (Docker):
```bash
make dev-notifier-up
```
If you don't have Mailgun/Twilio credentials yet, you can still start the worker
with the sample env file:
```bash
cd notifier_service && NOTIFIER_ENV_FILE=.env.example docker compose up -d worker
```
When you do create `notifier_service/.env`, set `NOTIFICATIONS_OWNER_EMAIL` to
the inbox that should receive appointment notifications.
To actually deliver emails, update all Mailgun settings in `notifier_service/.env`
(`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and `MAILGUN_FROM_EMAIL`).

## Makefile Commands

Each service exposes `up`, `down`, and `clean` with `dev-*` (docker) and/or
`local-*` (host) prefixes where appropriate. Seed commands exist only for the
BFF. Local commands only exist for app processes (frontend, BFF, calendar,
notifier worker). Infrastructure (Kafka, MySQL) is docker-only in this stack.

### Stack (Docker)

```bash
make dev-up
make dev-down
make dev-clean
```

### Frontend (portfolio-frontend)

```bash
make dev-frontend-up
make dev-frontend-down
make dev-frontend-clean

make local-frontend-up
make local-frontend-down
make local-frontend-clean
```

### BFF API (portfolio-bff)

```bash
make dev-bff-up
make dev-bff-down
make dev-bff-clean
make dev-bff-seed
make dev-bff-up-seed
make dev-bff-superuser

make local-bff-up
make local-bff-down
make local-bff-clean
make local-bff-seed
make local-bff-up-seed
make local-bff-superuser
```

### BFF Admin UI (portfolio-bff)

```bash
make dev-admin-ui-up
make dev-admin-ui-down
make dev-admin-ui-clean
```

Port reservation:
- `3001` is reserved for the BFF admin UI in this stack.

### BFF Kafka Consumer (portfolio-bff)

```bash
make dev-bff-consumer-up
make dev-bff-consumer-down
make dev-bff-consumer-clean

make local-bff-consumer-up
make local-bff-consumer-down
make local-bff-consumer-clean
```

### Bridge (Docker -> Local)

Swap a running docker service for its local process while keeping the rest of
the docker stack up:

```bash
make replace-bff
make replace-admin-ui
make replace-consumer
make replace-calendar
make replace-frontend
make replace-notifier
```

`replace-notifier` loads `notifier_service/.env` and forces
`KAFKA_BOOTSTRAP_SERVERS=localhost:9092` for the local worker.

### Calendar API (portfolio-calendar)

```bash
make dev-calendar-up
make dev-calendar-down
make dev-calendar-clean

make local-calendar-up
make local-calendar-down
make local-calendar-clean
```

### Kafka (notifier_service)

```bash
make dev-kafka-up
make dev-kafka-down
make dev-kafka-clean
```

### Database (MySQL for portfolio-bff)

```bash
make dev-db-up
make dev-db-down
make dev-db-clean
```

### Notifier Worker (notifier_service)

```bash
make dev-notifier-up
make dev-notifier-down
make dev-notifier-clean

make local-notifier-up
make local-notifier-down
make local-notifier-clean
```

## Ops Repo

Host-specific deployment lives in `ntakemori-deploy` and is intentionally
separate from this portable stack repo.

Expected local ports (for ops reference):
- Frontend: `3000`
- BFF Admin UI: `3001` (reserved)
- BFF API: `8001` (container listens on `8000`)
- Calendar API: `8002`
- Kafka (host): `9092` (internal: `19092`)
- MySQL: `3306`
- Notifier worker: no inbound port

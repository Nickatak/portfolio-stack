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
make docker-up
```

This spins up Kafka, MySQL, the BFF + consumer, calendar API, frontend, and
the notifier worker in one shot.
Port `3001` is reserved for the BFF admin UI.

Then open:
- `http://localhost:3100/` (frontend)
- `http://localhost:3001/` (BFF admin UI)
- `http://localhost:8001/` (BFF API)

Seed the BFF once (if you haven't already):
```bash
make docker-bff-seed
```
If you keep private content in an ops repo at `../ntakemori-deploy/portfolio-content.json`,
the seed command will use it automatically (no extra flags needed).

Stop everything:
```bash
make docker-down
```

## Quick Local Dev

Short path for a local dev session (Docker for infra, local for app processes).
All `local-*-up` commands auto-stop their Docker counterpart, so you can freely
mix and match.

1. Init submodules:
```bash
git submodule update --init --recursive
```

2. Start infrastructure (Docker):
```bash
make docker-kafka-up
make docker-db-up
```

3. Start local app processes (separate terminals):
```bash
make local-calendar-up
make local-bff-up
make local-bff-seed
make local-bff-superuser   # first time only
make local-bff-consumer-up
make local-frontend-up
make local-admin-ui-up
```
If you keep private content in an ops repo at `../ntakemori-deploy/portfolio-content.json`,
the seed command will use it automatically (no extra flags needed).

4. Optional email worker:
```bash
make local-notifier-up
```
Requires `notifier_service/.env` with Mailgun credentials (`MAILGUN_API_KEY`,
`MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`) and `NOTIFICATIONS_OWNER_EMAIL`.
Without credentials, use Docker with the sample env instead:
```bash
make docker-notifier-up
```

## Makefile Commands

Every service exposes `up`, `down`, and `clean` targets with `docker-*` and
`local-*` prefixes. Infrastructure (Kafka, MySQL) is docker-only.

`local-*-up` targets automatically stop the Docker counterpart first, so you
can switch from Docker to local without a separate step.

Run `make help` for the full command reference.

### Stack (Docker)

```bash
make docker-up
make docker-down
make docker-clean
```

### Frontend (portfolio-frontend)

```bash
make docker-frontend-{up,down,clean}
make local-frontend-{up,down,clean}
```

### BFF API (portfolio-bff)

```bash
make docker-bff-{up,down,clean}
make docker-bff-seed
make docker-bff-up-seed
make docker-bff-superuser

make local-bff-{up,down,clean}
make local-bff-seed
make local-bff-up-seed
make local-bff-superuser
```

### BFF Admin UI (portfolio-bff)

```bash
make docker-admin-ui-{up,down,clean}
make local-admin-ui-{up,down,clean}
```

Port reservation: `3001` is reserved for the BFF admin UI.

### BFF Kafka Consumer (portfolio-bff)

```bash
make docker-bff-consumer-{up,down,clean}
make local-bff-consumer-{up,down,clean}
```

### Calendar API (portfolio-calendar)

```bash
make docker-calendar-{up,down,clean}
make local-calendar-{up,down,clean}
```

### Infrastructure

```bash
make docker-kafka-{up,down,clean}
make docker-db-{up,down,clean}
```

### Notifier Worker (notifier_service)

```bash
make docker-notifier-{up,down,clean}
make local-notifier-{up,down,clean}
```

`local-notifier-up` loads `notifier_service/.env` automatically and sets
`KAFKA_BOOTSTRAP_SERVERS=localhost:9092`.

### Utilities

```bash
make status    # git status across all submodules
make nuke      # full teardown (requires NUKE=1)
```

## Ops Repo

Host-specific deployment lives in `ntakemori-deploy` and is intentionally
separate from this portable stack repo.

Expected local ports (for ops reference):
- Frontend: `3100`
- BFF Admin UI: `3001` (reserved)
- BFF API: `8001` (container listens on `8000`)
- Calendar API: `8002`
- Kafka (host): `9092` (internal: `19092`)
- MySQL: `3306`
- Notifier worker: no inbound port

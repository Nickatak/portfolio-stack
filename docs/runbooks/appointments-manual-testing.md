# Appointment Manual Testing Runbook

## Overview
This runbook covers end-to-end manual testing for appointment creation:

- Frontend posts to the calendar API.
- Calendar API publishes `appointments.created` to Kafka.
- Portfolio BFF consumer persists the event in `AppointmentEvent`.

## Prereqs
- Docker running.
- Ports available: `8001` (BFF), `8002` (calendar API), `9092` (Kafka), `3306` (MySQL).
- `notifier_service` compose network available (`notifier_service_default`).

Run the commands from the repo root.

## Start Services

1. Start Kafka + notifier worker:
```bash
make notifier-up
```

2. Start the BFF and its consumer:
```bash
cd portfolio-bff
docker compose up -d --build
```

Optional seed (for content endpoints):
```bash
docker compose exec -T bff python manage.py seed_portfolio_content --reset
```

3. Build and run the calendar API container on `8002`:
```bash
cd portfolio-calendar
docker build -t portfolio-calendar:local .
docker run -d --name portfolio-calendar \
  --network notifier_service_default \
  -p 8002:8002 \
  -e KAFKA_PRODUCER_ENABLED=true \
  -e KAFKA_BOOTSTRAP_SERVERS=kafka:19092 \
  -e KAFKA_TOPIC_APPOINTMENTS_CREATED=appointments.created \
  -e KAFKA_NOTIFY_EMAIL_DEFAULT=true \
  -e KAFKA_NOTIFY_SMS_DEFAULT=false \
  -e ALLOWED_ORIGINS=http://localhost:3100 \
  portfolio-calendar:local
```

You can also use the calendar repo's compose file (binds to `8002`):
```bash
cd portfolio-calendar
docker compose up --build
```

## Create an Appointment (API)
```bash
payload=$(python3 - <<'PY'
import json
from datetime import datetime, timedelta, timezone

now = datetime.now(timezone.utc)
start = (now + timedelta(hours=2)).replace(minute=0, second=0, microsecond=0)
end = start + timedelta(minutes=30)
payload = {
    "contact": {
        "firstName": "Integration",
        "lastName": "Test",
        "email": "integration@example.com",
        "phone": "+15555550101",
        "timezone": "UTC",
    },
    "appointment": {
        "topic": f"manual-test-{int(now.timestamp())}",
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
    },
}
print(json.dumps(payload))
PY
)

echo "$payload" > /tmp/appointment.json

curl -sS -X POST http://localhost:8002/api/appointments \
  -H 'Content-Type: application/json' \
  --data @/tmp/appointment.json
```

Expected response includes `published: true`.

## Verify Kafka Message
```bash
docker run --rm --network notifier_service_default apache/kafka:3.9.0 \
  /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server kafka:19092 \
  --topic appointments.created \
  --from-beginning \
  --max-messages 1 \
  --property print.value=true \
  --property print.timestamp=false \
  --property print.key=false
```

## Verify DB Persistence
```bash
cd portfolio-bff
docker compose exec -T bff python manage.py shell -c \
  "from content.models import AppointmentEvent; print(AppointmentEvent.objects.order_by('-id').first())"
```

## Stop Services
```bash
cd portfolio-bff
docker compose down

cd ..
make notifier-down

docker rm -f portfolio-calendar
```

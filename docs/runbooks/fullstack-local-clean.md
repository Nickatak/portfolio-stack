# Full Stack Local Clean Run

This is a clean, manual run-through from a fresh clone. It assumes Docker and
.NET SDK 8 are installed. Run the commands from the repo root.

1. Create the frontend env file:
```bash
cd portfolio-frontend
make env-init
```

2. Start Kafka:
```bash
cd notifier_service
docker compose up -d kafka kafka-init
```

3. Optional email worker:
```bash
cd notifier_service
docker compose up -d worker
```

4. Start the calendar API:
```bash
cd portfolio-calendar
export KAFKA_PRODUCER_ENABLED=true
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
dotnet run
```

5. Start MySQL:
```bash
cd portfolio-bff
make db-up
```

6. Install BFF deps and migrate:
```bash
cd portfolio-bff
make install
export DB_HOST=127.0.0.1
make migrate
```

7. Start the BFF server:
```bash
cd portfolio-bff
export DB_HOST=127.0.0.1
make dev
```

8. Start the BFF Kafka consumer (separate terminal):
```bash
cd portfolio-bff
export DB_HOST=127.0.0.1
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
python manage.py consume_appointments
```

9. Install frontend deps and start Next.js:
```bash
cd portfolio-frontend
make install
make dev
```

## Verification

1. Create an appointment:
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
        "phone": "202-555-0123",
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

2. Confirm it landed in the BFF database:
```bash
cd portfolio-bff
export DB_HOST=127.0.0.1
python manage.py shell -c \
  "from content.models import AppointmentEvent; print(AppointmentEvent.objects.order_by('-id').first())"
```

## Teardown

1. Stop services:
```bash
cd portfolio-bff
docker compose down

cd notifier_service
docker compose down
```

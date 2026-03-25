# portfolio-infra-messaging

Canonical messaging infrastructure for the portfolio ecosystem.

## Scope

- Local Kafka broker runtime (KRaft)
- Topic bootstrap (`appointments.created` + DLQ)
- Messaging infra settings for producer/consumer integration

## Files

- `docker-compose.yml`: Kafka broker + init services
- `.env.example`: topic variable defaults used by init flow

## Usage

```bash
docker compose -f docker-compose.yml up -d
```

To inspect topics:

```bash
docker exec portfolio-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
```

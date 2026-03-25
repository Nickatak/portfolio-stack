from __future__ import annotations

import json
from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from kafka import KafkaConsumer

from content.models import AppointmentEvent


def _trim_fractional_seconds(value: str) -> str:
    t_index = value.find("T")
    tz_index = max(value.rfind("+"), value.rfind("-"))
    if tz_index <= t_index:
        tz_index = -1

    tz = value[tz_index:] if tz_index != -1 else ""
    base = value[:tz_index] if tz_index != -1 else value

    if "." in base:
        main, frac = base.split(".", 1)
        frac = (frac + "000000")[:6]
        base = f"{main}.{frac}"

    return f"{base}{tz}"


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None

    cleaned = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(cleaned)
    except ValueError:
        parsed = datetime.fromisoformat(_trim_fractional_seconds(cleaned))

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed


class Command(BaseCommand):
    help = "Consume appointments.created events from Kafka and store them in the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--bootstrap-servers",
            default=None,
            help="Kafka bootstrap servers (default: env KAFKA_BOOTSTRAP_SERVERS).",
        )
        parser.add_argument(
            "--topic",
            default=None,
            help="Kafka topic (default: env KAFKA_TOPIC_APPOINTMENTS_CREATED).",
        )
        parser.add_argument(
            "--group-id",
            default=None,
            help="Kafka consumer group (default: env KAFKA_CONSUMER_GROUP).",
        )
        parser.add_argument(
            "--from-beginning",
            action="store_true",
            help="Consume from the earliest offset.",
        )
        parser.add_argument(
            "--max-messages",
            type=int,
            default=0,
            help="Exit after processing this many messages (0 = run forever).",
        )
        parser.add_argument(
            "--poll-timeout-ms",
            type=int,
            default=1000,
            help="Poll timeout in milliseconds.",
        )

    def handle(self, *args, **options):
        bootstrap_servers = options["bootstrap_servers"] or _get_env(
            "KAFKA_BOOTSTRAP_SERVERS", "kafka:19092"
        )
        topic = options["topic"] or _get_env("KAFKA_TOPIC_APPOINTMENTS_CREATED", "appointments.created")
        group_id = options["group_id"] or _get_env("KAFKA_CONSUMER_GROUP", "portfolio-bff")
        auto_offset_reset = "earliest" if options["from_beginning"] else _get_env(
            "KAFKA_AUTO_OFFSET_RESET", "latest"
        )
        max_messages = options["max_messages"]
        poll_timeout_ms = options["poll_timeout_ms"]

        consumer = KafkaConsumer(
            topic,
            bootstrap_servers=bootstrap_servers.split(","),
            group_id=group_id,
            auto_offset_reset=auto_offset_reset,
            enable_auto_commit=False,
        )

        processed = 0
        self.stdout.write(
            self.style.SUCCESS(
                f"Consuming {topic} on {bootstrap_servers} (group={group_id}, offset={auto_offset_reset})"
            )
        )

        try:
            while True:
                records = consumer.poll(timeout_ms=poll_timeout_ms, max_records=10)
                if not records:
                    if max_messages and processed >= max_messages:
                        break
                    continue

                for topic_partition, messages in records.items():
                    for message in messages:
                        if self._handle_message(message):
                            consumer.commit()
                            processed += 1
                            if max_messages and processed >= max_messages:
                                return
        finally:
            consumer.close()

    def _handle_message(self, message) -> bool:
        try:
            payload = json.loads(message.value.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            self.stderr.write(self.style.ERROR(f"Invalid message payload: {exc}"))
            return False

        event_id = payload.get("event_id")
        event_type = payload.get("event_type", "")
        occurred_at = parse_iso(payload.get("occurred_at"))
        notify = payload.get("notify", {}) or {}
        appointment = payload.get("appointment", {}) or {}

        appointment_id = appointment.get("appointment_id")
        start_time = parse_iso(appointment.get("start_time"))
        end_time = parse_iso(appointment.get("end_time"))

        if not event_id or not appointment_id or not occurred_at or not start_time or not end_time:
            self.stderr.write(
                self.style.ERROR("Missing required appointment fields; skipping message.")
            )
            return False

        AppointmentEvent.objects.update_or_create(
            event_id=event_id,
            defaults={
                "event_type": event_type,
                "occurred_at": occurred_at,
                "kafka_topic": message.topic or "",
                "kafka_partition": message.partition,
                "kafka_offset": message.offset,
                "appointment_id": appointment_id,
                "user_id": appointment.get("user_id", "") or "",
                "start_time": start_time,
                "end_time": end_time,
                "duration_minutes": int(appointment.get("duration_minutes") or 0),
                "email": appointment.get("email", "") or "",
                "phone_e164": appointment.get("phone_e164", "") or "",
                "notify_email": bool(notify.get("email")),
                "notify_sms": bool(notify.get("sms")),
                "payload": payload,
            },
        )

        self.stdout.write(self.style.SUCCESS(f"Stored event {event_id} (offset {message.offset})."))
        return True


def _get_env(key: str, default: str) -> str:
    import os

    value = os.getenv(key)
    return value.strip() if value else default

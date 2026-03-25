#!/usr/bin/env python3
"""Thin entry point for the Kafka email notification worker.

Installs kafka-notifications-lib from GitHub and runs the consumer loop.
All notification logic lives in the external package.
"""

from __future__ import annotations

import sys

from notifications.adapters.kafka_runtime import run_email_worker_forever

if __name__ == "__main__":
    sys.exit(run_email_worker_forever())

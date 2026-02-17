SHELL := /bin/bash

ROOT := $(CURDIR)
PORTFOLIO_FRONTEND := $(ROOT)/portfolio-frontend
BFF := $(ROOT)/portfolio-bff
CALENDAR := $(ROOT)/portfolio-calendar
NOTIFIER := $(ROOT)/notifier_service

.PHONY: help status frontend-install frontend-dev frontend-build frontend-test \
	demo-up demo-down demo-logs demo-build \
	bff-up bff-down bff-logs \
	calendar-up calendar-down calendar-logs \
	notifier-up notifier-down notifier-logs \
	fullstack-local fullstack-local-down \
	fullstack-docker fullstack-docker-down

help:
	@echo "Targets:"
	@echo "  status           Show git status for all repos"
	@echo "  frontend-install Install frontend deps"
	@echo "  frontend-dev     Run Next.js dev server"
	@echo "  frontend-build   Build Next.js app"
	@echo "  frontend-test    Run frontend tests"
	@echo "  demo-build       Build demo image (frontend)"
	@echo "  demo-up          Run demo stack (frontend)"
	@echo "  demo-down        Stop demo stack"
	@echo "  demo-logs        Tail demo stack logs"
	@echo "  bff-up           Start portfolio-bff (docker compose)"
	@echo "  bff-down         Stop portfolio-bff (docker compose)"
	@echo "  bff-logs         Tail portfolio-bff logs"
	@echo "  calendar-up      Start portfolio-calendar (docker compose)"
	@echo "  calendar-down    Stop portfolio-calendar (docker compose)"
	@echo "  calendar-logs    Tail portfolio-calendar logs"
	@echo "  notifier-up      Start notifier_service kafka + worker"
	@echo "  notifier-down    Stop notifier_service"
	@echo "  notifier-logs    Tail notifier_service logs"
	@echo "  fullstack-local  Run full stack locally in tmux (non-docker app processes)"
	@echo "  fullstack-local-down  Stop tmux session and local infra containers"
	@echo "  fullstack-docker Run full stack in Docker (detached)"
	@echo "  fullstack-docker-down Stop full stack Docker services"

status:
	@echo "--- portfolio-frontend" && git -C $(PORTFOLIO_FRONTEND) status -sb
	@echo "--- portfolio-bff" && git -C $(BFF) status -sb
	@echo "--- portfolio-calendar" && git -C $(CALENDAR) status -sb
	@echo "--- notifier_service" && git -C $(NOTIFIER) status -sb

frontend-install:
	@cd $(PORTFOLIO_FRONTEND) && make install

frontend-dev:
	@cd $(PORTFOLIO_FRONTEND) && make dev

frontend-build:
	@cd $(PORTFOLIO_FRONTEND) && make build

frontend-test:
	@cd $(PORTFOLIO_FRONTEND) && make test

demo-build:
	@cd $(PORTFOLIO_FRONTEND) && make demo-build

demo-up:
	@cd $(PORTFOLIO_FRONTEND) && make demo-up

demo-down:
	@cd $(PORTFOLIO_FRONTEND) && make demo-down

demo-logs:
	@cd $(PORTFOLIO_FRONTEND) && make demo-logs

bff-up:
	@cd $(BFF) && docker compose up --build

bff-down:
	@cd $(BFF) && docker compose down

bff-logs:
	@cd $(BFF) && docker compose logs -f

calendar-up:
	@cd $(CALENDAR) && docker compose up --build

calendar-down:
	@cd $(CALENDAR) && docker compose down

calendar-logs:
	@cd $(CALENDAR) && docker compose logs -f

notifier-up:
	@cd $(NOTIFIER) && docker compose up -d kafka kafka-init worker

notifier-down:
	@cd $(NOTIFIER) && docker compose down

notifier-logs:
	@cd $(NOTIFIER) && docker compose logs -f

fullstack-local:
	@if ! command -v tmux >/dev/null 2>&1; then \
		echo "tmux not found. Install tmux or run the manual steps from README.md in separate terminals."; \
		exit 1; \
	fi
	@if tmux has-session -t portfolio-stack 2>/dev/null; then \
		echo "tmux session 'portfolio-stack' already exists. Run make fullstack-local-down first."; \
		exit 1; \
	fi
	@tmux new-session -d -s portfolio-stack -n infra "cd $(NOTIFIER) && docker compose up -d kafka kafka-init worker; cd $(BFF) && docker compose up -d mysql; echo 'infra up'"
	@tmux new-window -t portfolio-stack:1 -n calendar "cd $(CALENDAR) && export KAFKA_PRODUCER_ENABLED=true; export KAFKA_BOOTSTRAP_SERVERS=localhost:9092; dotnet run"
	@tmux new-window -t portfolio-stack:2 -n bff "cd $(BFF) && export DB_HOST=127.0.0.1; make dev"
	@tmux new-window -t portfolio-stack:3 -n bff-consumer "cd $(BFF) && export DB_HOST=127.0.0.1; export KAFKA_BOOTSTRAP_SERVERS=localhost:9092; if [ -x .venv/bin/python ]; then .venv/bin/python manage.py consume_appointments; else python manage.py consume_appointments; fi"
	@tmux new-window -t portfolio-stack:4 -n frontend "cd $(PORTFOLIO_FRONTEND) && make dev"
	@tmux select-window -t portfolio-stack:0
	@tmux attach -t portfolio-stack

fullstack-local-down:
	@tmux kill-session -t portfolio-stack 2>/dev/null || true
	@cd $(NOTIFIER) && docker compose down
	@cd $(BFF) && docker compose stop mysql

fullstack-docker:
	@cd $(NOTIFIER) && docker compose up -d kafka kafka-init worker
	@cd $(BFF) && docker compose up -d --build
	@cd $(CALENDAR) && docker build -t portfolio-calendar:local .
	@docker rm -f portfolio-calendar >/dev/null 2>&1 || true
	@docker run -d --name portfolio-calendar \
		--network notifier_service_default \
		-p 8002:8002 \
		-e KAFKA_PRODUCER_ENABLED=true \
		-e KAFKA_BOOTSTRAP_SERVERS=kafka:19092 \
		-e KAFKA_TOPIC_APPOINTMENTS_CREATED=appointments.created \
		-e KAFKA_NOTIFY_EMAIL_DEFAULT=true \
		-e KAFKA_NOTIFY_SMS_DEFAULT=false \
		-e CONTACT_DEFAULT_PHONE_REGION=US \
		-e ALLOWED_ORIGINS=http://localhost:3000 \
		portfolio-calendar:local
	@cd $(PORTFOLIO_FRONTEND) && docker compose --env-file .env -f docker-compose.yml up -d --build

fullstack-docker-down:
	@cd $(PORTFOLIO_FRONTEND) && docker compose --env-file .env -f docker-compose.yml down --remove-orphans
	@docker rm -f portfolio-calendar >/dev/null 2>&1 || true
	@cd $(BFF) && docker compose down --remove-orphans
	@cd $(NOTIFIER) && docker compose down

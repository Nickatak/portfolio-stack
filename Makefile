SHELL := /bin/bash

ROOT := $(CURDIR)
FRONTEND := $(ROOT)/portfolio-frontend
BFF := $(ROOT)/portfolio-bff
CALENDAR := $(ROOT)/portfolio-calendar
NOTIFIER := $(ROOT)/notifier_service

.PHONY: help status nuke dev-up dev-down dev-clean \
	dev-frontend-up dev-frontend-down dev-frontend-clean dev-frontend-seed \
	local-frontend-up local-frontend-down local-frontend-clean local-frontend-seed \
	dev-bff-up dev-bff-down dev-bff-clean dev-bff-seed dev-bff-up-seed \
	local-bff-up local-bff-down local-bff-clean local-bff-seed local-bff-up-seed \
	local-bff-superuser \
	dev-bff-consumer-up dev-bff-consumer-down dev-bff-consumer-clean \
	local-bff-consumer-up local-bff-consumer-down local-bff-consumer-clean \
	dev-calendar-up dev-calendar-down dev-calendar-clean \
	local-calendar-up local-calendar-down local-calendar-clean \
	dev-kafka-up dev-kafka-down dev-kafka-clean \
	dev-db-up dev-db-down dev-db-clean \
	dev-notifier-up dev-notifier-down dev-notifier-clean \
	local-notifier-up local-notifier-down local-notifier-clean

help:
	@echo "Targets:"
	@echo "  status                         Show git status for all repos"
	@echo "  nuke                           Stop containers, remove volumes, reset repo"
	@echo "  dev-up                         Start full docker dev stack"
	@echo "  dev-down                       Stop full docker dev stack"
	@echo "  dev-clean                      Remove docker dev stack containers/volumes"
	@echo "  dev-frontend-{up,down,clean,seed}      Docker frontend"
	@echo "  local-frontend-{up,down,clean,seed}    Local frontend"
	@echo "  dev-bff-{up,down,clean,seed}           Docker BFF (API + MySQL)"
	@echo "  local-bff-{up,down,clean,seed}         Local BFF API"
	@echo "  dev-bff-up-seed / local-bff-up-seed    Convenience start + seed"
	@echo "  local-bff-superuser                   Create Django admin user"
	@echo "  dev-bff-consumer-{up,down,clean}       Docker BFF Kafka consumer"
	@echo "  local-bff-consumer-{up,down,clean}     Local BFF Kafka consumer"
	@echo "  dev-calendar-{up,down,clean}           Docker calendar API"
	@echo "  local-calendar-{up,down,clean}         Local calendar API"
	@echo "  dev-kafka-{up,down,clean}              Docker Kafka (broker + init)"
	@echo "  dev-db-{up,down,clean}                 Docker MySQL (BFF)"
	@echo "  dev-notifier-{up,down,clean}           Docker notifier worker"
	@echo "  local-notifier-{up,down,clean}         Local notifier worker"

dev-up:
	@$(MAKE) dev-kafka-up
	@$(MAKE) dev-bff-up
	@$(MAKE) dev-bff-consumer-up
	@KAFKA_PRODUCER_ENABLED=true KAFKA_BOOTSTRAP_SERVERS=kafka:19092 $(MAKE) dev-calendar-up
	@$(MAKE) dev-frontend-up
	@$(MAKE) dev-notifier-up

dev-down:
	@$(MAKE) dev-notifier-down
	@$(MAKE) dev-frontend-down
	@$(MAKE) dev-calendar-down
	@$(MAKE) dev-bff-consumer-down
	@$(MAKE) dev-bff-down
	@$(MAKE) dev-kafka-down

dev-clean:
	@$(MAKE) dev-notifier-clean
	@$(MAKE) dev-frontend-clean
	@$(MAKE) dev-calendar-clean
	@$(MAKE) dev-bff-consumer-clean
	@$(MAKE) dev-bff-clean
	@$(MAKE) dev-kafka-clean

status:
	@echo "--- portfolio-frontend" && git -C $(FRONTEND) status -sb
	@echo "--- portfolio-bff" && git -C $(BFF) status -sb
	@echo "--- portfolio-calendar" && git -C $(CALENDAR) status -sb
	@echo "--- notifier_service" && git -C $(NOTIFIER) status -sb

nuke:
	@if [ "$$NUKE" != "1" ]; then \
		echo "Refusing to run. Set NUKE=1 to proceed: make nuke NUKE=1"; \
		exit 1; \
	fi
	@echo "Stopping containers and removing volumes..."
	@cd $(NOTIFIER) && docker compose down --remove-orphans -v || true
	@cd $(BFF) && docker compose down --remove-orphans -v || true
	@cd $(CALENDAR) && docker compose down --remove-orphans -v || true
	@cd $(FRONTEND) && docker compose --env-file .env -f docker-compose.yml down --remove-orphans -v || true
	@docker rm -f portfolio-calendar >/dev/null 2>&1 || true
	@echo "Resetting repo and submodules to clean clone state..."
	@git reset --hard HEAD
	@git clean -fdx
	@git submodule foreach --recursive 'git reset --hard HEAD && git clean -fdx'

# ---------- Frontend ----------

dev-frontend-up:
	@cd $(FRONTEND) && make docker-up

dev-frontend-down:
	@cd $(FRONTEND) && make docker-down

dev-frontend-clean:
	@cd $(FRONTEND) && make docker-down
	@cd $(FRONTEND) && make clean

dev-frontend-seed:
	@cd $(FRONTEND) && make env-init prepare-portfolio-data

local-frontend-up:
	@cd $(FRONTEND) && make install
	@cd $(FRONTEND) && make dev

local-frontend-down:
	@echo "frontend: stop with Ctrl+C in the terminal running it"

local-frontend-clean:
	@cd $(FRONTEND) && make clean

local-frontend-seed:
	@cd $(FRONTEND) && make env-init prepare-portfolio-data

# ---------- BFF ----------

dev-bff-up:
	@cd $(BFF) && docker compose up -d --build
	@cd $(BFF) && for i in $$(seq 1 30); do \
		docker compose exec -T bff python manage.py migrate && break; \
		sleep 1; \
	done

dev-bff-down:
	@cd $(BFF) && docker compose down

dev-bff-clean:
	@cd $(BFF) && docker compose down --remove-orphans -v

dev-bff-seed:
	@cd $(BFF) && docker compose exec -T bff python manage.py seed_portfolio_content --reset

dev-bff-up-seed:
	@$(MAKE) dev-bff-up
	@$(MAKE) dev-bff-seed

local-bff-up:
	@cd $(BFF) && make install
	@cd $(BFF) && DB_HOST=127.0.0.1 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py migrate
	@cd $(BFF) && DB_HOST=127.0.0.1 make dev

local-bff-down:
	@echo "bff: stop with Ctrl+C in the terminal running it"

local-bff-clean:
	@cd $(BFF) && rm -rf .venv db.sqlite3
	@cd $(BFF) && find . -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true

local-bff-seed:
	@cd $(BFF) && DB_HOST=127.0.0.1 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py seed_portfolio_content --reset

local-bff-up-seed:
	@$(MAKE) local-bff-up
	@$(MAKE) local-bff-seed

local-bff-superuser:
	@cd $(BFF) && DB_HOST=127.0.0.1 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py createsuperuser

# ---------- BFF Consumer ----------

dev-bff-consumer-up:
	@cd $(BFF) && docker compose up -d --build consumer

dev-bff-consumer-down:
	@cd $(BFF) && docker compose stop consumer

dev-bff-consumer-clean:
	@cd $(BFF) && docker compose rm -sfv consumer

local-bff-consumer-up:
	@cd $(BFF) && DB_HOST=127.0.0.1 KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py consume_appointments

local-bff-consumer-down:
	@echo "bff-consumer: stop with Ctrl+C in the terminal running it"

local-bff-consumer-clean:
	@echo "bff-consumer: no clean step"

# ---------- Calendar ----------

dev-calendar-up:
	@cd $(CALENDAR) && docker compose up -d --build

dev-calendar-down:
	@cd $(CALENDAR) && docker compose down

dev-calendar-clean:
	@cd $(CALENDAR) && docker compose down --remove-orphans -v

local-calendar-up:
	@cd $(CALENDAR) && \
		export KAFKA_PRODUCER_ENABLED=true; \
		export KAFKA_BOOTSTRAP_SERVERS=localhost:9092; \
		dotnet run

local-calendar-down:
	@echo "calendar: stop with Ctrl+C in the terminal running it"

local-calendar-clean:
	@cd $(CALENDAR) && rm -rf bin obj

# ---------- Kafka ----------

dev-kafka-up:
	@cd $(NOTIFIER) && docker compose up -d kafka kafka-init

dev-kafka-down:
	@cd $(NOTIFIER) && docker compose stop kafka kafka-init

dev-kafka-clean:
	@cd $(NOTIFIER) && docker compose down --remove-orphans -v

# ---------- Database (MySQL) ----------

dev-db-up:
	@cd $(BFF) && docker compose up -d mysql

dev-db-down:
	@cd $(BFF) && docker compose stop mysql

dev-db-clean:
	@cd $(BFF) && docker compose rm -sfv mysql

# ---------- Notifier Worker ----------

dev-notifier-up:
	@cd $(NOTIFIER) && \
		if [ ! -f .env ]; then \
			echo "notifier: .env missing; using .env.example (email won't send without real creds)"; \
			NOTIFIER_ENV_FILE=.env.example docker compose up -d worker; \
		else \
			docker compose up -d worker; \
		fi

dev-notifier-down:
	@cd $(NOTIFIER) && docker compose stop worker

dev-notifier-clean:
	@cd $(NOTIFIER) && docker compose rm -sfv worker

local-notifier-up:
	@cd $(NOTIFIER) && python3 scripts/run_kafka_email_worker.py

local-notifier-down:
	@echo "notifier: stop with Ctrl+C in the terminal running it"

local-notifier-clean:
	@cd $(NOTIFIER) && find . -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true

.DEFAULT_GOAL := help

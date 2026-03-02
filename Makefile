SHELL := /bin/bash

ROOT     := $(CURDIR)
FRONTEND := $(ROOT)/portfolio-frontend
BFF      := $(ROOT)/portfolio-bff
CALENDAR := $(ROOT)/portfolio-calendar
NOTIFIER := $(ROOT)/notifier_service

BFF_DC      = cd $(BFF) && docker compose
CALENDAR_DC = cd $(CALENDAR) && docker compose
NOTIFIER_DC = cd $(NOTIFIER) && docker compose

-include ports.env
export PORTFOLIO_PORT PORTFOLIO_BFF_PORT PORTFOLIO_BFF_DB_PORT \
       PORTFOLIO_BFF_ADMIN_UI_PORT CALENDAR_API_PORT

# ============================================================================
# HELP
# ============================================================================

.PHONY: help

help:
	@echo "portfolio-stack — command reference"
	@echo ""
	@echo "Full Stack"
	@echo "  docker-up                      Start full Docker stack"
	@echo "  docker-down                    Stop full Docker stack"
	@echo "  docker-clean                   Remove all containers and volumes"
	@echo ""
	@echo "Per-Service Docker (docker-{service}-{up,down,clean})"
	@echo "  frontend, bff, bff-consumer, admin-ui, calendar, notifier"
	@echo ""
	@echo "Per-Service Local (local-{service}-{up,down,clean})"
	@echo "  frontend, bff, bff-consumer, admin-ui, calendar, notifier"
	@echo "  (local-*-up auto-stops the Docker counterpart)"
	@echo ""
	@echo "Infrastructure"
	@echo "  docker-kafka-{up,down,clean}   Kafka broker + init"
	@echo "  docker-db-{up,down,clean}      MySQL (BFF)"
	@echo ""
	@echo "Shortcuts"
	@echo "  docker-bff-up-seed             Start BFF + seed data"
	@echo "  local-bff-up-seed              Start local BFF + seed data"
	@echo "  docker-bff-superuser           Create Django admin user (Docker)"
	@echo "  local-bff-superuser            Create Django admin user (local)"
	@echo ""
	@echo "Utilities"
	@echo "  status                         Git status across all submodules"
	@echo "  nuke                           Full teardown (requires NUKE=1)"

# ============================================================================
# FULL STACK
# ============================================================================

.PHONY: docker-up docker-down docker-clean

docker-up:
	@$(MAKE) docker-kafka-up
	@$(MAKE) docker-bff-up
	@$(MAKE) docker-bff-consumer-up
	@KAFKA_PRODUCER_ENABLED=true KAFKA_BOOTSTRAP_SERVERS=kafka:19092 $(MAKE) docker-calendar-up
	@$(MAKE) docker-frontend-up
	@$(MAKE) docker-notifier-up

docker-down:
	@$(MAKE) docker-notifier-down
	@$(MAKE) docker-frontend-down
	@$(MAKE) docker-calendar-down
	@$(MAKE) docker-bff-consumer-down
	@$(MAKE) docker-bff-down
	@$(MAKE) docker-kafka-down

docker-clean:
	@$(MAKE) docker-notifier-clean
	@$(MAKE) docker-frontend-clean
	@$(MAKE) docker-calendar-clean
	@$(MAKE) docker-bff-consumer-clean
	@$(MAKE) docker-bff-clean
	@$(MAKE) docker-kafka-clean

# ============================================================================
# FRONTEND
# ============================================================================

.PHONY: docker-frontend-up docker-frontend-down docker-frontend-clean \
	local-frontend-up local-frontend-down local-frontend-clean

docker-frontend-up:
	@cd $(FRONTEND) && make docker-up

docker-frontend-down:
	@cd $(FRONTEND) && make docker-down

docker-frontend-clean:
	@cd $(FRONTEND) && make docker-down
	@cd $(FRONTEND) && make clean

local-frontend-up:
	@cd $(FRONTEND) && docker compose --env-file .env -f docker-compose.yml stop web >/dev/null 2>&1 || true
	@cd $(FRONTEND) && make install
	@cd $(FRONTEND) && make local-up

local-frontend-down:
	@echo "frontend: stop with Ctrl+C in the terminal running it"

local-frontend-clean:
	@cd $(FRONTEND) && make clean

# ============================================================================
# BFF
# ============================================================================

.PHONY: docker-bff-up docker-bff-down docker-bff-clean \
	docker-bff-seed docker-bff-up-seed docker-bff-superuser \
	local-bff-up local-bff-down local-bff-clean \
	local-bff-seed local-bff-up-seed local-bff-superuser

docker-bff-up:
	@$(BFF_DC) up -d --build

docker-bff-down:
	@$(BFF_DC) down

docker-bff-clean:
	@$(BFF_DC) down --remove-orphans -v

docker-bff-seed:
	@$(BFF_DC) exec -T bff python manage.py seed_portfolio_content --reset

docker-bff-up-seed:
	@$(MAKE) docker-bff-up
	@$(MAKE) docker-bff-seed

docker-bff-superuser:
	@$(BFF_DC) exec bff python manage.py createsuperuser

local-bff-up:
	@$(BFF_DC) stop bff >/dev/null 2>&1 || true
	@cd $(BFF) && make install
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		CSRF_TRUSTED_ORIGINS=$${CSRF_TRUSTED_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		ADMIN_UI_ORIGINS=$${ADMIN_UI_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py migrate
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		CSRF_TRUSTED_ORIGINS=$${CSRF_TRUSTED_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		ADMIN_UI_ORIGINS=$${ADMIN_UI_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		make local-up

local-bff-down:
	@echo "bff: stop with Ctrl+C in the terminal running it"

local-bff-clean:
	@cd $(BFF) && rm -rf .venv db.sqlite3
	@cd $(BFF) && find . -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true

local-bff-seed:
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py seed_portfolio_content --reset

local-bff-up-seed:
	@$(MAKE) local-bff-up
	@$(MAKE) local-bff-seed

local-bff-superuser:
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py createsuperuser

# ============================================================================
# BFF CONSUMER
# ============================================================================

.PHONY: docker-bff-consumer-up docker-bff-consumer-down docker-bff-consumer-clean \
	local-bff-consumer-up local-bff-consumer-down local-bff-consumer-clean

docker-bff-consumer-up:
	@$(BFF_DC) up -d --build consumer

docker-bff-consumer-down:
	@$(BFF_DC) stop consumer

docker-bff-consumer-clean:
	@$(BFF_DC) rm -sfv consumer

local-bff-consumer-up:
	@$(BFF_DC) stop consumer >/dev/null 2>&1 || true
	@cd $(BFF) && make install
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py consume_appointments

local-bff-consumer-down:
	@echo "bff-consumer: stop with Ctrl+C in the terminal running it"

local-bff-consumer-clean:
	@echo "bff-consumer: no clean step"

# ============================================================================
# ADMIN UI
# ============================================================================

.PHONY: docker-admin-ui-up docker-admin-ui-down docker-admin-ui-clean \
	local-admin-ui-up local-admin-ui-down local-admin-ui-clean

docker-admin-ui-up:
	@$(BFF_DC) up -d admin-ui

docker-admin-ui-down:
	@$(BFF_DC) stop admin-ui

docker-admin-ui-clean:
	@$(BFF_DC) rm -sfv admin-ui

local-admin-ui-up:
	@$(BFF_DC) stop admin-ui >/dev/null 2>&1 || true
	@cd $(BFF) && make admin-install
	@cd $(BFF) && make admin-up

local-admin-ui-down:
	@echo "admin-ui: stop with Ctrl+C in the terminal running it"

local-admin-ui-clean:
	@echo "admin-ui: no clean step"

# ============================================================================
# CALENDAR
# ============================================================================

.PHONY: docker-calendar-up docker-calendar-down docker-calendar-clean \
	local-calendar-up local-calendar-down local-calendar-clean

docker-calendar-up:
	@$(CALENDAR_DC) up -d --build

docker-calendar-down:
	@$(CALENDAR_DC) down

docker-calendar-clean:
	@$(CALENDAR_DC) down --remove-orphans -v

local-calendar-up:
	@$(CALENDAR_DC) stop calendar-api >/dev/null 2>&1 || true
	@cd $(CALENDAR) && \
		export KAFKA_PRODUCER_ENABLED=true; \
		export KAFKA_BOOTSTRAP_SERVERS=localhost:9092; \
		dotnet run

local-calendar-down:
	@echo "calendar: stop with Ctrl+C in the terminal running it"

local-calendar-clean:
	@cd $(CALENDAR) && rm -rf bin obj

# ============================================================================
# INFRASTRUCTURE (Kafka + DB)
# ============================================================================

.PHONY: docker-kafka-up docker-kafka-down docker-kafka-clean \
	docker-db-up docker-db-down docker-db-clean

docker-kafka-up:
	@$(NOTIFIER_DC) up -d kafka kafka-init

docker-kafka-down:
	@$(NOTIFIER_DC) stop kafka kafka-init

docker-kafka-clean:
	@$(NOTIFIER_DC) down --remove-orphans -v

docker-db-up:
	@$(BFF_DC) up -d mysql

docker-db-down:
	@$(BFF_DC) stop mysql

docker-db-clean:
	@$(BFF_DC) rm -sfv mysql

# ============================================================================
# NOTIFIER
# ============================================================================

.PHONY: docker-notifier-up docker-notifier-down docker-notifier-clean \
	local-notifier-up local-notifier-down local-notifier-clean

docker-notifier-up:
	@cd $(NOTIFIER) && \
		if [ ! -f .env ]; then \
			echo "notifier: .env missing; using .env.example (email won't send without real creds)"; \
			NOTIFIER_ENV_FILE=.env.example docker compose up -d worker; \
		else \
			docker compose up -d worker; \
		fi

docker-notifier-down:
	@$(NOTIFIER_DC) stop worker

docker-notifier-clean:
	@$(NOTIFIER_DC) rm -sfv worker

local-notifier-up:
	@$(NOTIFIER_DC) stop worker >/dev/null 2>&1 || true
	@cd $(NOTIFIER) && \
		if [ -f .env ]; then \
			while IFS= read -r line || [ -n "$$line" ]; do \
				case "$$line" in ''|\#*) continue ;; esac; \
				key="$${line%%=*}"; \
				value="$${line#*=}"; \
				export "$$key=$$value"; \
			done < .env; \
		fi; \
		KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		python3 scripts/run_kafka_email_worker.py

local-notifier-down:
	@echo "notifier: stop with Ctrl+C in the terminal running it"

local-notifier-clean:
	@cd $(NOTIFIER) && find . -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true


# ============================================================================
# UTILITIES
# ============================================================================

.PHONY: status nuke

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
	@$(NOTIFIER_DC) down --remove-orphans -v || true
	@$(BFF_DC) down --remove-orphans -v || true
	@$(CALENDAR_DC) down --remove-orphans -v || true
	@cd $(FRONTEND) && docker compose --env-file .env -f docker-compose.yml down --remove-orphans -v || true
	@docker rm -f portfolio-calendar >/dev/null 2>&1 || true
	@echo "Resetting repo and submodules to clean clone state..."
	@git reset --hard HEAD
	@git clean -fdx
	@git submodule foreach --recursive 'git reset --hard HEAD && git clean -fdx'

.DEFAULT_GOAL := help

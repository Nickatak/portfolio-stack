SHELL := /bin/bash

ROOT     := $(CURDIR)
FRONTEND := $(ROOT)/portfolio_frontend
BFF      := $(ROOT)/portfolio_bff
CALENDAR := $(ROOT)/portfolio_calendar
WORKER   := $(ROOT)/worker

DC = docker compose

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
	@echo "Full Stack (Docker)"
	@echo "  docker-up                      Start the full stack"
	@echo "  docker-down                    Stop the full stack"
	@echo "  docker-clean                   Remove all containers and volumes"
	@echo "  docker-logs                    Tail logs for all services"
	@echo ""
	@echo "Per-Service Docker"
	@echo "  docker-{service}-up            Start a single service"
	@echo "  docker-{service}-down          Stop a single service"
	@echo "  docker-{service}-logs          Tail logs for a service"
	@echo "  Services: web, bff, consumer, admin-ui, calendar-api,"
	@echo "            notifier-worker, kafka, mysql"
	@echo ""
	@echo "Local Dev (run natively, infrastructure stays in Docker)"
	@echo "  local-bff-up                   Run BFF locally (stops Docker bff)"
	@echo "  local-frontend-up              Run frontend locally"
	@echo "  local-bff-consumer-up          Run Kafka consumer locally"
	@echo "  local-calendar-up              Run calendar API locally"
	@echo "  local-notifier-up              Run notifier worker locally"
	@echo "  local-admin-ui-up              Run admin UI locally"
	@echo ""
	@echo "Shortcuts"
	@echo "  seed                           Seed portfolio content (Docker)"
	@echo "  local-seed                     Seed portfolio content (local)"
	@echo "  superuser                      Create Django admin user (Docker)"
	@echo "  local-superuser                Create Django admin user (local)"
	@echo ""
	@echo "Utilities"
	@echo "  status                         Git status summary"
	@echo "  nuke                           Full teardown (requires NUKE=1)"

# ============================================================================
# FULL STACK
# ============================================================================

.PHONY: docker-up docker-down docker-clean docker-logs

docker-up:
	@$(DC) up -d --build

docker-down:
	@$(DC) down

docker-clean:
	@$(DC) down --remove-orphans -v

docker-logs:
	@$(DC) logs -f

# ============================================================================
# PER-SERVICE DOCKER
# ============================================================================

# Generic per-service targets: docker-{service}-{up,down,logs}
# Services: web, bff, consumer, admin-ui, calendar-api, notifier-worker, kafka, mysql

.PHONY: docker-web-up docker-web-down docker-web-logs \
	docker-bff-up docker-bff-down docker-bff-logs \
	docker-consumer-up docker-consumer-down docker-consumer-logs \
	docker-admin-ui-up docker-admin-ui-down docker-admin-ui-logs \
	docker-calendar-api-up docker-calendar-api-down docker-calendar-api-logs \
	docker-notifier-worker-up docker-notifier-worker-down docker-notifier-worker-logs \
	docker-kafka-up docker-kafka-down docker-kafka-logs \
	docker-mysql-up docker-mysql-down docker-mysql-logs

docker-%-up:
	@$(DC) up -d --build $*

docker-%-down:
	@$(DC) stop $*

docker-%-logs:
	@$(DC) logs -f $*

# ============================================================================
# LOCAL DEV
# ============================================================================

.PHONY: local-bff-up local-frontend-up local-bff-consumer-up \
	local-calendar-up local-notifier-up local-admin-ui-up

local-bff-up:
	@$(DC) stop bff >/dev/null 2>&1 || true
	@cd $(BFF) && make install 2>/dev/null || true
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		CSRF_TRUSTED_ORIGINS=$${CSRF_TRUSTED_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		ADMIN_UI_ORIGINS=$${ADMIN_UI_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py migrate
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		CSRF_TRUSTED_ORIGINS=$${CSRF_TRUSTED_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		ADMIN_UI_ORIGINS=$${ADMIN_UI_ORIGINS:-http://localhost:$(PORTFOLIO_BFF_ADMIN_UI_PORT)} \
		make local-up

local-frontend-up:
	@$(DC) stop web >/dev/null 2>&1 || true
	@cd $(FRONTEND) && make install 2>/dev/null || true
	@cd $(FRONTEND) && make local-up

local-bff-consumer-up:
	@$(DC) stop consumer >/dev/null 2>&1 || true
	@cd $(BFF) && make install 2>/dev/null || true
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py consume_appointments

local-calendar-up:
	@$(DC) stop calendar-api >/dev/null 2>&1 || true
	@cd $(CALENDAR) && \
		KAFKA_PRODUCER_ENABLED=true \
		KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		dotnet run

local-notifier-up:
	@$(DC) stop notifier-worker >/dev/null 2>&1 || true
	@cd $(WORKER) && \
		if [ -f .env ]; then \
			while IFS= read -r line || [ -n "$$line" ]; do \
				case "$$line" in ''|\#*) continue ;; esac; \
				key="$${line%%=*}"; \
				value="$${line#*=}"; \
				export "$$key=$$value"; \
			done < .env; \
		fi; \
		KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		python3 run_worker.py

local-admin-ui-up:
	@$(DC) stop admin-ui >/dev/null 2>&1 || true
	@cd $(BFF) && make admin-install 2>/dev/null || true
	@cd $(BFF) && make admin-up

# ============================================================================
# SHORTCUTS
# ============================================================================

.PHONY: seed local-seed superuser local-superuser

seed:
	@$(DC) exec bff python manage.py seed_portfolio_content --reset

local-seed:
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py seed_portfolio_content --reset

superuser:
	@$(DC) exec bff python manage.py createsuperuser

local-superuser:
	@cd $(BFF) && DB_HOST=127.0.0.1 DB_PORT=$(PORTFOLIO_BFF_DB_PORT) \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py createsuperuser

# ============================================================================
# UTILITIES
# ============================================================================

.PHONY: status nuke

status:
	@git status -sb

nuke:
	@if [ "$$NUKE" != "1" ]; then \
		echo "Refusing to run. Set NUKE=1 to proceed: make nuke NUKE=1"; \
		exit 1; \
	fi
	@echo "Stopping containers and removing volumes..."
	@$(DC) down --remove-orphans -v || true
	@echo "Resetting repo to clean state..."
	@git reset --hard HEAD
	@git clean -fdx

.DEFAULT_GOAL := help

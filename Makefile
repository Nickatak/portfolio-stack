SHELL := /bin/bash

ROOT := $(CURDIR)
FRONTEND := $(ROOT)/portfolio-frontend
BFF := $(ROOT)/portfolio-bff
CALENDAR := $(ROOT)/portfolio-calendar
NOTIFIER := $(ROOT)/notifier_service

.PHONY: help status nuke docker-up docker-down docker-clean \
	docker-frontend-up docker-frontend-down docker-frontend-clean \
	local-frontend-up local-frontend-down local-frontend-clean \
	docker-bff-up docker-bff-down docker-bff-clean docker-bff-seed docker-bff-up-seed \
	docker-bff-superuser \
	docker-admin-ui-up docker-admin-ui-down docker-admin-ui-clean \
	local-bff-up local-bff-down local-bff-clean local-bff-seed local-bff-up-seed \
	local-bff-superuser \
	docker-bff-consumer-up docker-bff-consumer-down docker-bff-consumer-clean \
	local-bff-consumer-up local-bff-consumer-down local-bff-consumer-clean \
	replace-bff replace-admin-ui replace-consumer replace-calendar replace-frontend replace-notifier \
	docker-calendar-up docker-calendar-down docker-calendar-clean \
	local-calendar-up local-calendar-down local-calendar-clean \
	docker-kafka-up docker-kafka-down docker-kafka-clean \
	docker-db-up docker-db-down docker-db-clean \
	docker-notifier-up docker-notifier-down docker-notifier-clean \
	local-notifier-up local-notifier-down local-notifier-clean

help:
	@echo "Targets:"
	@echo "  status                         Show git status for all repos"
	@echo "  nuke                           Stop containers, remove volumes, reset repo"
	@echo "  docker-up                         Start full docker stack"
	@echo "  docker-down                       Stop full docker stack"
	@echo "  docker-clean                      Remove docker stack containers/volumes"
	@echo "  docker-frontend-{up,down,clean}           Docker frontend"
	@echo "  local-frontend-{up,down,clean}         Local frontend"
	@echo "  docker-bff-{up,down,clean,seed}           Docker BFF (API + MySQL)"
	@echo "  docker-admin-ui-{up,down,clean}           Docker BFF admin UI"
	@echo "  local-bff-{up,down,clean,seed}         Local BFF API"
	@echo "  docker-bff-up-seed / local-bff-up-seed    Convenience start + seed"
	@echo "  docker-bff-superuser                     Create Django admin user (docker)"
	@echo "  local-bff-superuser                   Create Django admin user"
	@echo "  docker-bff-consumer-{up,down,clean}       Docker BFF Kafka consumer"
	@echo "  local-bff-consumer-{up,down,clean}     Local BFF Kafka consumer"
	@echo "  replace-bff                           Stop docker BFF, run local BFF"
	@echo "  replace-admin-ui                      Stop docker admin UI, run local admin UI"
	@echo "  replace-consumer                      Stop docker consumer, run local consumer"
	@echo "  replace-calendar                      Stop docker calendar, run local calendar"
	@echo "  replace-frontend                      Stop docker frontend, run local frontend"
	@echo "  replace-notifier                      Stop docker worker, run local worker"
	@echo "  docker-calendar-{up,down,clean}           Docker calendar API"
	@echo "  local-calendar-{up,down,clean}         Local calendar API"
	@echo "  docker-kafka-{up,down,clean}              Docker Kafka (broker + init)"
	@echo "  docker-db-{up,down,clean}                 Docker MySQL (BFF)"
	@echo "  docker-notifier-{up,down,clean}           Docker notifier worker"
	@echo "  local-notifier-{up,down,clean}         Local notifier worker"

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

docker-frontend-up:
	@cd $(FRONTEND) && make docker-up

docker-frontend-down:
	@cd $(FRONTEND) && make docker-down

docker-frontend-clean:
	@cd $(FRONTEND) && make docker-down
	@cd $(FRONTEND) && make clean

local-frontend-up:
	@cd $(FRONTEND) && make install
	@cd $(FRONTEND) && make local-up

local-frontend-down:
	@echo "frontend: stop with Ctrl+C in the terminal running it"

local-frontend-clean:
	@cd $(FRONTEND) && make clean

# ---------- BFF ----------

docker-bff-up:
	@cd $(BFF) && docker compose up -d --build

docker-bff-down:
	@cd $(BFF) && docker compose down

docker-bff-clean:
	@cd $(BFF) && docker compose down --remove-orphans -v

docker-bff-seed:
	@cd $(BFF) && docker compose exec -T bff python manage.py seed_portfolio_content --reset

docker-bff-up-seed:
	@$(MAKE) docker-bff-up
	@$(MAKE) docker-bff-seed

docker-bff-superuser:
	@cd $(BFF) && docker compose exec bff python manage.py createsuperuser

docker-admin-ui-up:
	@cd $(BFF) && docker compose up -d admin-ui

docker-admin-ui-down:
	@cd $(BFF) && docker compose stop admin-ui

docker-admin-ui-clean:
	@cd $(BFF) && docker compose rm -sfv admin-ui

local-bff-up:
	@cd $(BFF) && make install
	@cd $(BFF) && DB_HOST=127.0.0.1 \
		CSRF_TRUSTED_ORIGINS=$${CSRF_TRUSTED_ORIGINS:-http://localhost:3001} \
		ADMIN_UI_ORIGINS=$${ADMIN_UI_ORIGINS:-http://localhost:3001} \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py migrate
	@cd $(BFF) && DB_HOST=127.0.0.1 \
		CSRF_TRUSTED_ORIGINS=$${CSRF_TRUSTED_ORIGINS:-http://localhost:3001} \
		ADMIN_UI_ORIGINS=$${ADMIN_UI_ORIGINS:-http://localhost:3001} \
		make local-up

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

docker-bff-consumer-up:
	@cd $(BFF) && docker compose up -d --build consumer

docker-bff-consumer-down:
	@cd $(BFF) && docker compose stop consumer

docker-bff-consumer-clean:
	@cd $(BFF) && docker compose rm -sfv consumer

local-bff-consumer-up:
	@cd $(BFF) && DB_HOST=127.0.0.1 KAFKA_BOOTSTRAP_SERVERS=localhost:9092 \
		$$( [ -x .venv/bin/python ] && echo .venv/bin/python || echo python3 ) \
		manage.py consume_appointments

local-bff-consumer-down:
	@echo "bff-consumer: stop with Ctrl+C in the terminal running it"

local-bff-consumer-clean:
	@echo "bff-consumer: no clean step"

# ---------- Bridge (Docker -> Local) ----------

replace-bff:
	@cd $(BFF) && docker compose stop bff
	@$(MAKE) local-bff-up

replace-admin-ui:
	@cd $(BFF) && docker compose stop admin-ui
	@cd $(BFF) && make admin-install
	@cd $(BFF) && make admin-up

replace-consumer:
	@cd $(BFF) && docker compose stop consumer
	@cd $(BFF) && make install
	@$(MAKE) local-bff-consumer-up

replace-calendar:
	@cd $(CALENDAR) && docker compose stop calendar-api
	@$(MAKE) local-calendar-up

replace-frontend:
	@cd $(FRONTEND) && docker compose --env-file .env -f docker-compose.yml stop web
	@$(MAKE) local-frontend-up

replace-notifier:
	@cd $(NOTIFIER) && docker compose stop worker
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

# ---------- Calendar ----------

docker-calendar-up:
	@cd $(CALENDAR) && docker compose up -d --build

docker-calendar-down:
	@cd $(CALENDAR) && docker compose down

docker-calendar-clean:
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

docker-kafka-up:
	@cd $(NOTIFIER) && docker compose up -d kafka kafka-init

docker-kafka-down:
	@cd $(NOTIFIER) && docker compose stop kafka kafka-init

docker-kafka-clean:
	@cd $(NOTIFIER) && docker compose down --remove-orphans -v

# ---------- Database (MySQL) ----------

docker-db-up:
	@cd $(BFF) && docker compose up -d mysql

docker-db-down:
	@cd $(BFF) && docker compose stop mysql

docker-db-clean:
	@cd $(BFF) && docker compose rm -sfv mysql

# ---------- Notifier Worker ----------

docker-notifier-up:
	@cd $(NOTIFIER) && \
		if [ ! -f .env ]; then \
			echo "notifier: .env missing; using .env.example (email won't send without real creds)"; \
			NOTIFIER_ENV_FILE=.env.example docker compose up -d worker; \
		else \
			docker compose up -d worker; \
		fi

docker-notifier-down:
	@cd $(NOTIFIER) && docker compose stop worker

docker-notifier-clean:
	@cd $(NOTIFIER) && docker compose rm -sfv worker

local-notifier-up:
	@cd $(NOTIFIER) && python3 scripts/run_kafka_email_worker.py

local-notifier-down:
	@echo "notifier: stop with Ctrl+C in the terminal running it"

local-notifier-clean:
	@cd $(NOTIFIER) && find . -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true

.DEFAULT_GOAL := help

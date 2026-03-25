SHELL := /bin/bash

VENV_DIR ?= .venv
PYTHON := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip
PORTFOLIO_BFF_PORT ?= 8001

.PHONY: help venv install local-up migrate seed superuser \
	admin-fix-perms admin-install admin-up admin-build admin-lint \
	db-up db-down \
	docker-build docker-up docker-down docker-logs

help:
	@echo "portfolio-bff"
	@echo "============="
	@echo ""
	@echo "Local (no Docker):"
	@echo "  make venv           Create virtualenv in $(VENV_DIR)"
	@echo "  make install        Install Python deps into $(VENV_DIR)"
	@echo "  make migrate        Run Django migrations"
	@echo "  make seed           Seed portfolio content"
	@echo "  make superuser      Create Django superuser"
	@echo "  make local-up       Run Django dev server"
	@echo ""
	@echo "Admin UI (Next.js):"
	@echo "  make admin-fix-perms Fix admin-ui/node_modules ownership for local npm use"
	@echo "  make admin-install  Install admin UI deps"
	@echo "  make admin-up       Run admin UI local server (port 3001)"
	@echo "  make admin-build    Build admin UI"
	@echo "  make admin-lint     Lint admin UI"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build   Build images"
	@echo "  make docker-up      Run services"
	@echo "  make docker-down    Stop services"
	@echo "  make docker-logs    Follow logs"
	@echo ""
	@echo "MySQL (Docker only):"
	@echo "  make db-up          Start MySQL container"
	@echo "  make db-down        Stop MySQL container"

venv:
	@python3 -m venv $(VENV_DIR)

install: venv
	@$(PIP) install -r requirements.txt

migrate:
	@$(PYTHON) manage.py migrate

seed:
	@$(PYTHON) manage.py seed_portfolio_content --reset

superuser:
	@$(PYTHON) manage.py createsuperuser

local-up:
	@PORT=$${PORTFOLIO_BFF_PORT:-$(PORTFOLIO_BFF_PORT)}; \
	if command -v lsof >/dev/null 2>&1; then \
		if lsof -iTCP -sTCP:LISTEN -P | grep -q ":$${PORT} "; then \
			echo "Port $${PORT} is already in use. Stop the conflicting process or set PORTFOLIO_BFF_PORT explicitly."; \
			exit 1; \
		fi; \
	elif command -v ss >/dev/null 2>&1; then \
		if ss -ltn | awk '{print $$4}' | grep -q ":$${PORT}$$"; then \
			echo "Port $${PORT} is already in use. Stop the conflicting process or set PORTFOLIO_BFF_PORT explicitly."; \
			exit 1; \
		fi; \
	fi; \
	$(PYTHON) manage.py runserver 0.0.0.0:$(PORTFOLIO_BFF_PORT)

admin-fix-perms:
	@if find admin-ui -maxdepth 3 -user root | grep -q .; then \
		echo "admin-ui has root-owned files; fixing ownership via Docker..."; \
		docker run --rm -v "$(CURDIR)/admin-ui:/app" alpine:3.20 sh -c "chown -R $$(id -u):$$(id -g) /app"; \
	fi

admin-install: admin-fix-perms
	@cd admin-ui && npm install

admin-up:
	@cd admin-ui && npm run dev

admin-build:
	@cd admin-ui && npm run build

admin-lint:
	@cd admin-ui && npm run lint

docker-build:
	@docker compose build

docker-up:
	@docker compose up --build

docker-down:
	@docker compose down --remove-orphans

docker-logs:
	@docker compose logs -f --tail=200

db-up:
	@docker compose up -d mysql

db-down:
	@docker compose stop mysql

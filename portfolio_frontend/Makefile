FRONTEND_DIR ?= frontend
PORTFOLIO_PORT ?= 3100

ENV_FILE ?= .env

COMPOSE_BASE_FILE ?= docker-compose.yml
DOCKER_COMPOSE ?= docker compose --env-file $(ENV_FILE) -f $(COMPOSE_BASE_FILE)

DEMO_COMPOSE_FILE ?= docker-compose.demo.yml
DEMO_COMPOSE ?= docker compose -f $(DEMO_COMPOSE_FILE)

.PHONY: help \
	env-init \
	install local-up build start lint clean \
	docker-build docker-up docker-down docker-logs \
	demo-build demo-up demo-down demo-logs

help:
	@echo "Portfolio Frontend"
	@echo "================="
	@echo ""
	@echo "Environment file:"
	@echo "  Active: $(ENV_FILE)"
	@echo "  make env-init          Create $(ENV_FILE) from .env.example if missing"
	@echo ""
	@echo "Local (no Docker):"
	@echo "  make install           Install frontend dependencies"
	@echo "  make local-up          Run Next.js dev server"
	@echo "  make build             Build frontend assets"
	@echo "  make start             Start production server"
	@echo "  make lint              Lint frontend"
	@echo "  make clean             Clean build/cache artifacts"
	@echo ""
	@echo "Docker (uses $(ENV_FILE)):"
	@echo "  make docker-build      Build frontend image"
	@echo "  make docker-up         Run frontend container"
	@echo "  make docker-down       Stop dev stack"
	@echo "  make docker-logs       Follow dev logs"
	@echo ""
	@echo "Demo (frontend only, mock appointments):"
	@echo "  make demo-build        Build demo image"
	@echo "  make demo-up           Run demo stack"
	@echo "  make demo-down         Stop demo stack"
	@echo "  make demo-logs         Follow demo logs"

env-init:
	@if [ ! -f $(ENV_FILE) ]; then cp .env.example $(ENV_FILE); echo "Created $(ENV_FILE) from .env.example"; fi

install:
	cd $(FRONTEND_DIR) && npm ci

local-up:
	@PORT=$${PORTFOLIO_PORT:-$(PORTFOLIO_PORT)}; \
	if command -v lsof >/dev/null 2>&1; then \
		if lsof -iTCP -sTCP:LISTEN -P | grep -q ":$${PORT} "; then \
			echo "Port $${PORT} is already in use. Stop the conflicting process or set PORTFOLIO_PORT explicitly."; \
			exit 1; \
		fi; \
	elif command -v ss >/dev/null 2>&1; then \
		if ss -ltn | awk '{print $$4}' | grep -q ":$${PORT}$$"; then \
			echo "Port $${PORT} is already in use. Stop the conflicting process or set PORTFOLIO_PORT explicitly."; \
			exit 1; \
		fi; \
	fi; \
	set -a; [ -f $(ENV_FILE) ] && . ./$(ENV_FILE); set +a; \
	cd $(FRONTEND_DIR); \
	PORTFOLIO_PORT=$${PORT}; \
	NEXT_PUBLIC_API_BASE_URL=$${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8002} \
	NEXT_PUBLIC_GOOGLE_CLIENT_ID=$${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-} \
	NEXT_PUBLIC_DISPLAY_NAME=$${NEXT_PUBLIC_DISPLAY_NAME:-Your Name} \
	NEXT_PUBLIC_CONTACT_EMAIL=$${NEXT_PUBLIC_CONTACT_EMAIL:-hello@example.com} \
	npm run dev -- --hostname 0.0.0.0 --port $${PORT}

build:
	cd $(FRONTEND_DIR) && npm run build

start:
	cd $(FRONTEND_DIR) && npm run start

lint:
	cd $(FRONTEND_DIR) && npm run lint

clean:
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/dist
	find $(FRONTEND_DIR) -type d -name ".turbo" -exec rm -rf {} + 2>/dev/null || true

# ---------- Docker ----------
docker-build: env-init
	$(DOCKER_COMPOSE) build

docker-up: env-init
	$(DOCKER_COMPOSE) up --build -d

docker-down:
	$(DOCKER_COMPOSE) down --remove-orphans

docker-logs:
	$(DOCKER_COMPOSE) logs -f --tail=200

# ---------- Demo Docker ----------
demo-build:
	$(DEMO_COMPOSE) build

demo-up:
	$(DEMO_COMPOSE) up --build

demo-down:
	$(DEMO_COMPOSE) down --remove-orphans

demo-logs:
	$(DEMO_COMPOSE) logs -f --tail=200

.DEFAULT_GOAL := help

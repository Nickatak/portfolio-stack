# Runbook: Repository Split Process

## Objective

Split shared concerns out of the app repo into dedicated repository boundaries
while preserving local development flow.

## Scope

This runbook covers:

- Messaging infra split (`portfolio-calendar/infra/messaging` -> `portfolio-infra-messaging`)
- Contract split (`portfolio-calendar/contracts/notifier` -> `portfolio-notifier-contracts`)

Note: backend services now live in separate repositories (`portfolio-calendar`,
`portfolio-bff`). This runbook focuses on infra/contracts only.

## Preconditions

- GitHub repositories exist:
  - `portfolio-infra-messaging`
  - `portfolio-notifier-contracts`
- Maintainer has repo write/admin permissions.
- Local branch is clean before extraction.

## Step 1: Identify and Map Boundaries

Define ownership before moving files.

- Frontend UI: `frontend/`
- Messaging infra: Kafka + topic bootstrap definitions
- Contracts: event schemas and compatibility docs

## Step 2: Extract Files into Boundary Directories

Move or create artifacts:

  - `portfolio-calendar/infra/messaging/docker-compose.yml`
  - `portfolio-calendar/contracts/notifier/events/*.schema.json`
- Boundary README files in each directory

## Step 3: Preserve Dev Workflow

Ensure the frontend workflow remains stable and document any compose changes.

## Step 4: Document Structure and Decision Rationale

Update docs:

- ADR for boundary decision
- Repository structure document
- README references to new boundaries and commands

## Step 5: Validate

Minimum checks:

- `docker compose --env-file .env -f docker-compose.yml config` renders compose config
- `make build` succeeds

## Step 6: Sync Boundary Directories to Dedicated Repositories

Use one of the approaches below.

### Option A: Copy into cloned target repo

1. Clone target repo locally.
2. Copy boundary directory contents.
3. Commit and push in target repo.

### Option B: Subtree split from this monorepo

Example commands:

```bash
git subtree split --prefix portfolio-calendar/infra/messaging -b split/infra-messaging
git subtree split --prefix portfolio-calendar/contracts/notifier -b split/notifier-contracts

git push <portfolio-infra-messaging-remote> split/infra-messaging:main
git push <portfolio-notifier-contracts-remote> split/notifier-contracts:main
```

If target repositories were auto-initialized and histories conflict, perform a
normal clone/copy flow instead of force pushing by default.

## Step 7: Convert Boundaries to Submodules

After dedicated repositories are populated, replace in-repo copies with
submodule references:

```bash
git submodule add git@github.com:Nickatak/portfolio-infra-messaging.git portfolio-calendar/infra/messaging
git submodule add git@github.com:Nickatak/portfolio-notifier-contracts.git portfolio-calendar/contracts/notifier
```

Bootstrap for consumers:

```bash
git submodule update --init --recursive
```

## Post-Split Governance

- Treat contracts as versioned interfaces.
- Keep infra changes isolated from app runtime changes unless interface changes require coordination.

## Rollback Strategy

If split causes workflow breakage:

1. Restore compose wiring to known-good state.
2. Revert boundary moves in a single rollback commit.
3. Re-run validation checks and reopen split in smaller phases.

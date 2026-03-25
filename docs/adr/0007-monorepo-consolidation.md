# ADR 0007: Consolidate Submodules into Monorepo

**Date:** 2026-03-24
**Status:** Accepted

## Context

The portfolio stack was originally built as a set of independent repositories connected via git submodules:

- `portfolio-frontend` — Next.js frontend
- `portfolio-bff` — Django backend + admin UI
- `portfolio-calendar` — C# .NET 8 Calendar API
- `notifier_service` — Python Kafka broker + email worker

Each repo had its own git history, Docker Compose file, and development workflow. The parent `portfolio-stack` repo served as an orchestration layer that pinned submodule pointers and provided a top-level Makefile.

The rationale at the time was that individual services might eventually be reused in other projects or deployed independently. In practice, this never happened.

## Problem

The submodule structure imposed daily costs with no realized benefits:

1. **Pointer bump ceremony** — Every commit inside a submodule required a follow-up commit in the parent repo to bump the pointer. Every parent commit was `chore(submodule): bump X`.
2. **Network spaghetti in Docker** — Four separate Compose stacks required cross-referencing external networks (`portfolio_net`, `notifier_service_default`), creating order-dependent startup and implicit coupling.
3. **Scattered documentation** — ADRs, architecture docs, and runbooks were split across repos with no clear ownership. System-level ADRs lived in `portfolio-frontend/docs/adr/` for historical reasons.
4. **No standalone usage** — None of the services were ever run, developed, or deployed independently. The "each service could be extracted" benefit was never exercised.

Working on Bill n' Chill (a monorepo from inception) demonstrated how much simpler development is when the entire system lives in one repository: atomic commits across backend and frontend, one Compose file, one network, no pointer choreography.

## Decision

Flatten all submodules into regular directories within `portfolio-stack`:

- `portfolio-frontend/` → `portfolio_frontend/`
- `portfolio-bff/` → `portfolio_bff/`
- `portfolio-calendar/` → `portfolio_calendar/`
- `notifier_service/` → `notifier_service/` (unchanged)

Directory names were normalized to underscores for consistency.

A single `docker-compose.yml` at the repo root replaces the four separate Compose stacks. All services share one default network. The Makefile was rewritten to use this single Compose file.

Documentation was consolidated into a top-level `docs/` directory with `adr/`, `architecture/`, and `runbooks/` subdirectories.

Git history from the individual repositories was not preserved in the migration. The original repos remain on GitHub as historical references.

## Consequences

**Positive:**
- Atomic commits across the entire stack
- One Compose file, one network, no cross-stack dependencies
- Simplified Makefile (single `docker compose up -d --build`)
- Documentation lives in one place with clear ownership
- No more submodule pointer bumps

**Negative:**
- Individual repo git history is not available via `git log` in the monorepo (but remains accessible on GitHub)
- Larger repository size (all services in one repo)
- CI/CD would need to be reorganized if per-service pipelines were in place (none currently are)

**Neutral:**
- The deployment repo (`ntakemori-deployment`) was updated to reference `portfolio-stack` as a single entry instead of four submodule repos

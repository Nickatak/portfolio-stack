# ADR 0001: Adopt Monorepo Structure for Portfolio Stack

- Status: Accepted
- Date: 2026-02-14
- Decision Owners: Portfolio Maintainer

## Context

The portfolio system originally operated as three repositories:

1. `Nickatak/portfolio-frontend` (Next.js frontend)
2. `Nickatak/calendar` (Django API)
3. `Nickatak/portfolio_orchestration` (compose + local orchestration glue)

This model created recurring friction in day-to-day development:

- Cross-repo changes were the norm, not the exception.
- Refactors required synchronized updates across multiple repositories.
- Environment and path wiring lived in orchestration while runtime logic lived elsewhere.
- Development feedback loops were slower due to repository context switching.
- Privacy-sensitive data handling (personal contact/profile information) required careful local mutability controls across boundaries.

At this stage of the project, the cost of repository boundaries exceeded their value.

## Decision Drivers

- Optimize for fast local iteration across frontend and backend.
- Keep privacy controls simple and explicit for portfolio data.
- Reduce operational overhead for builds, compose orchestration, and docs.
- Improve traceability for full-stack changes in a single commit history.
- Present clear, maintainable architecture for portfolio review.

## Decision

Adopt a single monorepo rooted at `Nickatak/portfolio-frontend` with explicit app boundaries:

- `frontend/` for Next.js
- `backend/` for Django

Supporting decisions:

- Keep one root `.env.example` for stack-level configuration.
- Keep app-level examples where useful (`backend/.env.example`) for local app context.
- Keep one root `Makefile` as the primary developer interface.
- Keep one root `docker-compose.yml` for full-stack workflows.
- Preserve clear app ownership by directory rather than by repository boundary.

## Alternatives Considered

### 1. Keep Three Repositories (Status Quo)

Rejected.

- Pros:
  - Strict separation of concerns by repository.
  - Independent release/versioning cadence.
- Cons:
  - High coordination cost for routine changes.
  - Higher cognitive load for local development.
  - Privacy and configuration concerns spread across repo boundaries.

### 2. Keep Two Repositories (App Repos) and a Thin Orchestration Repo

Rejected.

- Pros:
  - Less tooling drift than three-repo setup.
  - Still allows some independent ownership.
- Cons:
  - Core friction remains for changes touching both apps.
  - Orchestration still adds indirection and duplicated docs/config.

### 3. Full Monorepo (Chosen)

Accepted.

- Pros:
  - Single change set for full-stack features/refactors.
  - Faster development cycle and reduced context switching.
  - Simpler privacy-focused data handling patterns.
  - Easier onboarding and clearer portfolio story.
- Cons:
  - Larger repository checkout.
  - Less isolation between apps.
  - Requires discipline to maintain clear app boundaries.

## Consequences

### Positive

- Frontend/backend changes can ship together in one PR/commit.
- Build/run/dev commands are centralized and consistent.
- Documentation and architecture decisions are discoverable in one place.
- Operational setup is simpler for local development and demos.

### Negative / Risks

- Root-level tooling can become a dumping ground if unchecked.
- App boundaries can erode without conventions.
- CI runtime may grow as more checks are centralized.

### Mitigations

- Keep strict directory boundaries (`frontend/`, `backend/`).
- Use root tooling only for orchestration; keep app-specific details in app dirs.
- Use ADRs for major architecture decisions.
- Keep sensitive/local data out of version control with example files and ignore rules.

## Implementation Notes

- Merged repositories into `Nickatak/portfolio-frontend`.
- Reorganized layout into `frontend/` and `backend/`.
- Updated root `Makefile`, `docker-compose.yml`, `.env.example`, and docs accordingly.

## Success Criteria

- New contributor can run frontend + backend from one repository in under 10 minutes.
- Full-stack change can be implemented without repository switching.
- Privacy-sensitive fields remain controlled via local env/data files, not committed secrets.
- Architecture rationale is clear and auditable via ADRs.

# ADR 0003: Split Messaging Infra and Contract Boundaries

- Status: Accepted
- Date: 2026-02-14
- Decision Owners: Portfolio Maintainer

## Context

ADR 0001 optimized for development speed by adopting a monorepo. ADR 0002 then
established project-first repository naming for long-term scaling.

This ADR refines ADR 0001's single-root-compose implementation detail by
introducing layered compose files while preserving one-command full-stack usage.

As Kafka-based notifier integration matured, two concerns emerged as distinct
boundaries:

- Messaging infrastructure lifecycle (broker, topic bootstrap, and operational config)
- Producer/consumer event contract lifecycle (schema changes and compatibility)

Keeping both concerns embedded only in app-level files created hidden coupling:

- Kafka infra definitions lived in the root compose file alongside app runtime.
- Event payload shape existed primarily in producer code, with no explicit schema artifact.
- Cross-repository ownership with notifier components was harder to reason about.

## Decision Drivers

- Keep app runtime concerns separate from shared messaging infrastructure concerns.
- Create explicit, versionable contracts for producer/consumer integration.
- Preserve local developer ergonomics (`make up`) while preparing for repo-level extraction.
- Make architecture boundaries obvious for maintenance, onboarding, and portfolio review.

## Decision

Split the monorepo structure into explicit boundary directories aligned with
project-first repository strategy.

### Boundary Structure

- App runtime compose remains at root: `docker-compose.yml`
- Messaging infra compose extracted to: `portfolio-calendar/infra/messaging/docker-compose.yml`
- Notifier event contracts extracted to: `portfolio-calendar/contracts/notifier/events/`

### Workflow Decisions

- Root `Makefile` compose commands now merge:
  - `docker-compose.yml`
  - `portfolio-calendar/infra/messaging/docker-compose.yml`
- `make up` keeps full-stack behavior.
- `make up-core` runs app services without messaging infra.

### Repository Alignment

- `portfolio-calendar/infra/messaging/` aligns with `portfolio-infra-messaging`
- `portfolio-calendar/contracts/notifier/` aligns with `portfolio-notifier-contracts`

## Alternatives Considered

### 1. Keep Everything in Root Compose and Producer Code

Rejected.

- Pros:
  - No file moves or command changes.
- Cons:
  - Implicit boundaries and tighter coupling.
  - Harder extraction path to dedicated repos.
  - Contract visibility remains weak.

### 2. Immediate Full Extraction Out of Monorepo

Rejected for now.

- Pros:
  - Strong separation with clean ownership.
- Cons:
  - Larger migration blast radius.
  - Risk to local development workflow during transition.

### 3. Internal Boundary Split with Extraction Path (Chosen)

Accepted.

- Pros:
  - Introduces clear boundaries now.
  - Maintains current local workflow.
  - Enables phased migration to dedicated repos.
- Cons:
  - Temporary dual maintenance during extraction period.

## Consequences

### Positive

- Shared infrastructure and contracts are now explicit artifacts.
- Repository split and ownership mapping are clearer.
- Interview/demo narrative is stronger due to visible architecture boundaries.

### Negative / Risks

- Additional files and docs increase maintenance overhead.
- Contract schemas can drift from producer code if not validated in CI.

### Mitigations

- Keep schemas close to producer implementation until contracts repo CI is established.
- Add compatibility checks in future contract validation workflows.
- Keep ADRs and runbooks updated as extraction progresses.

## Implementation Notes

- Kafka services were moved out of root compose into `portfolio-calendar/infra/messaging/`.
- Notifier schemas were introduced under `portfolio-calendar/contracts/notifier/events/`.
- `Makefile` compose targets were updated to use merged compose files.
- Boundary directories were converted to Git submodules so source-of-truth lives in dedicated repositories.
- Supporting architecture/process documentation was added.

## Success Criteria

- Full stack still starts with one command (`make up`).
- App-only stack starts independently (`make up-core`).
- Event contract files are discoverable and versionable.
- Boundary directories map directly to dedicated repository targets.

# ADR 0005: Deployment Orchestration Repo for Single-Host Ingress

- Status: Accepted
- Date: 2026-02-16
- Decision Owners: Portfolio Maintainer

## Context

We only have one host and want to serve multiple domains/projects from it. The
application repos should remain focused on product code and local development,
without hosting or domain-specific production configuration. We also want a
repeatable way to add more projects to the same host without rewriting each app
repo.

## Decision Drivers

- Avoid paying for additional hosts while supporting multiple domains.
- Keep domain/host configuration out of development repos.
- Preserve local and Docker dev workflows in each app repo.
- Make it easy to onboard additional projects to the same host.

## Decision

Create a dedicated deployment orchestration repository (`ntakemori-deploy`) that
owns host-level ingress, TLS, and environment-specific overrides. Application
repositories remain deploy-agnostic and only carry local/dev config.

### Key Mechanics

- A single ingress container (Nginx) publishes ports 80/443 on the host.
- A shared external Docker network (`edge`) connects all app services to the
  ingress container.
- Each app repo is composed with a deploy-repo override file that:
  - removes host port publishing
  - attaches services to the `edge` network with stable aliases
- TLS certificates are managed via Let’s Encrypt (DNS-01) with Cloudflare.
- Environment-specific overrides and runbooks live in `ntakemori-deploy`.

## Alternatives Considered

### 1. Per-repo production config

Rejected.

- Pros: simple to reason about in isolation.
- Cons: duplicates ingress/TLS logic and mixes host concerns into dev repos.

### 2. Multiple hosts per project

Rejected for cost reasons.

- Pros: strong isolation, minimal shared complexity.
- Cons: higher cost and operational overhead.

### 3. Ingress + overrides repo (Chosen)

Accepted.

- Pros: centralizes host concerns, scales to more projects, keeps app repos clean.
- Cons: introduces a new repository and deployment workflow.

## Consequences

### Positive

- Full separation of host/domain configuration from app repos.
- Consistent deployment pattern across all projects.
- Easy to add more domains/projects to the same host.

### Negative / Risks

- Additional repo to maintain.
- More moving pieces in deployment workflow.
- Requires clear documentation to avoid confusion.

### Mitigations

- Provide runbooks and templates in the deploy repo.
- Keep app repos deploy-agnostic with stable env contracts.
- Use consistent naming conventions for network aliases and compose projects.

## Implementation Notes

- `ntakemori-deploy` owns ingress and environment-specific overrides.
- App repos are started with their own compose files plus deploy repo overrides.
- TLS is handled via Cloudflare DNS-01 using certbot.

## Success Criteria

- All projects on the host are reachable via their domains through one ingress.
- App repos contain no production host configuration.
- Adding a new project requires only deploy-repo configuration, not app-repo
  changes.

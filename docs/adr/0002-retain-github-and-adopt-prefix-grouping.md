# ADR 0002: Retain GitHub and Adopt Prefix-Based Repository Grouping

- Status: Accepted
- Date: 2026-02-14
- Decision Owners: Portfolio Maintainer

## Context

The portfolio stack now includes cross-repository concerns beyond the core monorepo, especially integration with the notifier-service ecosystem for Kafka-driven notifications.

Current pressure points discussed:

- Repository discoverability and logical grouping as related repos grow.
- Desire for a second grouping dimension (project-level structure) beyond a flat repo list.
- Coordination between producer-side architecture (`portfolio` calendar API) and consumer-side architecture (notifier-service).

Platform options considered during this discussion:

- Keep GitHub and improve local conventions.
- Move to GitLab for native hierarchical grouping (groups/subgroups).

At the current stage, there is one owner and no immediate team-scale permission complexity. The architecture is evolving, but not yet creating material delivery risk that justifies a platform migration.

## Decision Drivers

- Preserve delivery velocity while architecture is still being refined.
- Avoid migration overhead for repositories, CI/CD, permissions, and workflows.
- Improve repo discoverability with minimal operational change.
- Keep decision quality high for interviews/portfolio artifacts by documenting explicit tradeoffs.
- Maintain flexibility to revisit when scale or ownership complexity changes.

## Decision

Retain GitHub as the current VCS hosting platform and implement project-first repository naming as a lightweight grouping strategy.

Supporting decisions:

- Use a consistent project-first naming pattern for new repos: `<project>-<domain>-<component>`.
- Keep architecture and infrastructure ownership decisions (for example Kafka broker placement between producer and notifier contexts) separate from VCS platform decisions.
- Defer GitLab migration unless explicit trigger conditions are met.
- Reassess this ADR when team size, repository count, or access-control complexity increases.

## Naming Convention

Adopt and enforce a project-first repository naming convention:

- Pattern: `<project>-<domain>-<component>`
- Project segment: `portfolio`

Examples:

- `portfolio-infra-messaging`
- `portfolio-notifier-contracts`
- `portfolio-notifier-service`

Guidelines:

- Apply to all new repositories.
- Do not rename stable existing repositories unless there is a clear operational benefit.
- Use repo topics/descriptions alongside prefixes to improve filtering and search.

## Alternatives Considered

### 1. Migrate to GitLab Now

Rejected for now.

- Pros:
  - Native hierarchical grouping via groups/subgroups.
  - Strong namespace model for multi-project organizations.
- Cons:
  - Immediate migration overhead without commensurate short-term value for a single-owner setup.
  - Added risk during an active architecture evolution period.
  - Time diverted from product and platform improvements.

### 2. Create Multiple GitHub Organizations Per Project

Rejected.

- Pros:
  - Strong separation boundaries.
  - Independent settings/security per org.
- Cons:
  - Higher administrative overhead.
  - Fragmented visibility and governance for a single maintainer.
  - Over-engineered for current scale.

### 3. Keep GitHub and Standardize Naming (Chosen)

Accepted.

- Pros:
  - Minimal operational disruption.
  - Immediate improvement in discoverability.
  - Preserves current momentum and tooling.
- Cons:
  - Prefixes are conventions, not enforced hierarchy.
  - Permission and policy inheritance remains less expressive than GitLab groups.

## Consequences

### Positive

- No near-term migration effort or workflow churn.
- Better repository navigation through consistent naming.
- Clear documented rationale for architecture and platform choices.

### Negative / Risks

- Grouping remains convention-based rather than platform-enforced.
- Future scale may outgrow flat GitHub org structure.
- Cross-repo ownership may become harder as contributors increase.

### Mitigations

- Maintain clear naming standards and repository metadata.
- Keep ADRs current for platform and architecture boundaries.
- Define explicit review triggers and revisit on schedule.

## Revisit Triggers

Re-open this decision if any of the following occur:

- Active maintainers grow beyond one primary owner.
- Repository count grows enough that prefix grouping becomes insufficient for day-to-day navigation.
- Permission models require stronger hierarchical inheritance than GitHub can provide comfortably.
- Cross-repo coordination overhead materially slows delivery.

## Implementation Notes

- Apply naming convention immediately for new repositories.
- Keep existing repo topology unchanged in the near term.
- Continue architecture work (including notifier/Kafka responsibilities) independent of VCS migration.
- Initial repository alignment completed:
  - `infra-messaging` -> `portfolio-infra-messaging`
  - `notifier-contracts` -> `portfolio-notifier-contracts`

## Success Criteria

- Repository purpose and ownership are understandable from names alone.
- No VCS migration work is required to support near-term delivery.
- Decision remains valid at next architecture review unless trigger conditions are hit.

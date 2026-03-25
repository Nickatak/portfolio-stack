# ADR 0004: Use Kafka as an Architectural Showcase

- Status: Accepted
- Date: 2026-02-16
- Decision Owners: Portfolio Maintainer

## Context

This portfolio project is intended to demonstrate real-world architecture choices
beyond a single web app. The core product is a scheduling application, but the
learning and showcase goals include event-driven design, schema contracts, and
multi-consumer data streams.

A key objective is to make appointment events reusable by other applications
without modifying the primary application. This enables future consumers, such
as a dashboard service, to independently build read models and workflows from
the same event stream.

Kafka introduces operational complexity compared to direct database reads or a
single synchronous API. However, it provides a concrete way to demonstrate
bounded responsibilities and integration patterns that are common in production
systems.

## Decision Drivers

- Demonstrate decoupled, multi-consumer event streams in a portfolio project.
- Provide a realistic integration boundary that external services can subscribe
  to without direct coupling to the core app.
- Align with existing contract-first decisions and notifier architecture.
- Accept additional operational overhead in exchange for clearer architectural
  storytelling and learning outcomes.

## Decision

Adopt Kafka as the event stream backbone for appointments, using a published
`appointments.created` topic with versioned schemas. The calendar API remains a
producer, while downstream consumers (e.g., notifier worker, future dashboard)
subscribe independently via Kafka consumer groups.

## Alternatives Considered

### 1. Direct API Calls to Each Consumer

Rejected.

- Pros:
  - Simplest to implement.
  - Fewer moving parts.
- Cons:
  - Tight coupling between producer and consumers.
  - Harder to scale to multiple consumers without cascading changes.

### 2. Polling the Database from Secondary Apps

Rejected.

- Pros:
  - Minimal new infrastructure.
- Cons:
  - Leaky abstraction and shared database coupling.
  - Poor fit for independent services or schema evolution.

### 3. Kafka with Contracted Events (Chosen)

Accepted.

- Pros:
  - Clear separation between producer and consumers.
  - Multiple services can consume independently.
  - Demonstrates event-driven architecture and versioned contracts.
- Cons:
  - Added operational complexity for a portfolio app.
  - Requires schema management discipline.

## Consequences

### Positive

- Supports a strong interview narrative around decoupling and reusability.
- Enables new consumers (e.g., dashboard service) without modifying the core app.
- Aligns with contract-driven boundaries already established in this repo.

### Negative / Risks

- Kafka adds operational overhead for local development and deployment.
- Consumers must handle idempotency and schema evolution.

### Mitigations

- Keep local dev workflows simple via compose and Make targets.
- Use explicit JSON schemas and versioning for events.
- Implement DLQ handling for malformed payloads.

## Implementation Notes

- `appointments.created` topic publishes new appointment events from the calendar
  API when Kafka is enabled.
- Contracts are defined in `portfolio-calendar/contracts/notifier/events/` and used by producers and
  consumers.
- Future consumers (e.g., dashboard) should validate against contracts and
  maintain their own read models.

## Success Criteria

- A new consumer can be added without changes to the calendar API.
- Contracts are discoverable, versioned, and enforced by consumers.
- Local development supports running the full stack with Kafka when needed.

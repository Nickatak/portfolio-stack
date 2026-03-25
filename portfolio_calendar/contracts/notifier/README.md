# portfolio-notifier-contracts

Versioned event contracts for notifier-related producer/consumer integrations.

## Current Schemas

- `events/appointments.created.schema.json`
- `events/appointments.created.dlq.schema.json`

## Compatibility Guidance

- Additive changes should remain backward compatible.
- Breaking changes require coordinated rollout across producers/consumers.
- Consumers should validate payloads against schema revisions.

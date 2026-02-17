# Handoff (2026-02-16)

## Summary
- Kafka-backed appointment flow is working end-to-end:
  - `portfolio-calendar` publishes `appointments.created`.
  - `portfolio-bff` consumes and persists to `AppointmentEvent`.
- Added a runbook for manual appointment testing.
- All repos are clean and pushed.

## Current State
- Containers are shut down (`portfolio-bff`, `portfolio-calendar`, `notifier_service`).
- `notifier_service_default` Docker network still exists because unrelated container `practical_margulis` is attached to it.

## Runbook
- Manual test steps live in:
  - `portfolio-frontend/docs/runbooks/appointments-manual-testing.md`

## Notes / Gotchas
- Port `8000` may be in use by `/home/nick/bill_n_chill/backend` (Django dev server). If so, run calendar on `8002` as in the runbook.
- `portfolio-bff` consumer expects Kafka reachable at `kafka:19092` on `notifier_service_default` network.

## Next Steps
- Start services and follow the runbook for manual testing.
- Optional: add a `GET /api/appointments` endpoint in `portfolio-bff` for dashboard usage.

# Portfolio Stack

Parent orchestration repo for the portfolio ecosystem. This repo owns the
stack-level README/runbooks and wires the service repos together via submodules.

## Submodules

- `portfolio-frontend` (Next.js frontend)
- `portfolio-bff` (Django BFF + dashboard)
- `portfolio-calendar` (C# minimal API producer)
- `notifier_service` (Kafka broker + notifier worker runtime)

Initialize submodules after cloning:

```bash
git submodule update --init --recursive
```

## Quick Start

Manual clean run (recommended for first-time setup):

- `docs/runbooks/fullstack-local-clean.md`

One-command helpers (optional):

```bash
make fullstack-local
```

```bash
make fullstack-docker
```

## Ops Repo

Host-specific deployment lives in `ntakemori-deploy` and is intentionally
separate from this portable stack repo.

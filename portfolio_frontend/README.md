# Portfolio Frontend

Next.js frontend for the portfolio stack. This repo owns the public website
and booking UI. It reads portfolio content from the BFF API and sends booking
requests to the Calendar API.

Full stack instructions live in the parent stack repo: `../README.md`.

## Role In The System

- Renders the portfolio site and schedule form.
- Reads content from the BFF (`/api/portfolio-content`).
- Sends appointment requests to the Calendar API (`/api/appointments`).
- Demo mode can render static example data instead of calling the BFF.

## Dependencies

- BFF API: `../portfolio-bff`
- Calendar API: `../portfolio-calendar`

## Local Development

```bash
make env-init
make install
make local-up
```

The dev server runs on `http://localhost:3100`.

## Docker Development

```bash
make docker-up
```

Stop:

```bash
make docker-down
```

Quick demo (frontend only): `make demo-up` (stop with `make demo-down`).

## Environment Variables

Root `.env` drives frontend runtime values.

Frequently edited:

- `NEXT_PUBLIC_API_BASE_URL` (Calendar API base, default `http://localhost:8002`)
- `NEXT_PUBLIC_DISPLAY_NAME` (marketing display name)
- `NEXT_PUBLIC_CONTACT_EMAIL` (contact email shown in UI)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Google OAuth client ID, if used)
- `NEXT_PUBLIC_BFF_BASE_URL` (BFF base URL, default `http://localhost:8001`)
- `PORTFOLIO_PORT` (dev server port, default `3100`)
- `DEMO_MODE` (`true` to render demo content)

See `.env.example` for full defaults and comments.

## Ports

- Frontend: `3100` (host)

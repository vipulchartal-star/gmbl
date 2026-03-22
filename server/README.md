# GMBL API

Node + Postgres backend for the betting app.

## What this fixes

- Pool totals are no longer writable directly by the mobile client.
- Passwords are hashed on the server with Node `crypto.scrypt`.
- Bets, balance debits, wallet ledger entries, and market pool updates happen in one Postgres transaction.
- The database becomes the source of truth for balances and pool totals.

## Setup

1. Copy `.env.example` to `.env`.
2. Create a Postgres database.
3. Run `server/sql/schema.sql` against that database.
4. Install dependencies with `npm install` inside `server`.
5. Start with `npm start`.

## API

- `GET /health`
- `GET /market`
- `GET /market/stream` for Server-Sent Events
- `POST /auth/signup`
- `POST /auth/login`
- `GET /me`
- `POST /bets`
- `GET /bets/me`

## Deploying to Render

1. Push this repo to Git.
2. In Render, create a Blueprint from `render.yaml`.
3. After the Postgres database is created, run `server/sql/schema.sql` in that database.
4. Deploy the `gmbl-api` service.

## Important

This is much safer than the Firebase-client-only version, but it is still not literally hack-proof. You still need:

- rate limiting
- admin authorization
- market settlement logic
- HTTPS in production
- proper secret rotation
- monitoring and backups

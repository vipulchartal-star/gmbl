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
5. Set `ADMIN_SECRET` if you want the admin panel enabled.
6. Set `ODDS_API_KEY` if you want external sports and odds in the app.
7. Start with `npm start`.

## API

- `GET /health`
- `GET /market`
- `GET /odds/sports`
- `GET /odds/matches?sport=cricket_ipl&regions=uk&markets=h2h,spreads,totals`
- `GET /external-odds` legacy alias for `/odds/matches`
- `GET /market/stream` for Server-Sent Events
- `POST /auth/signup`
- `POST /auth/login`
- `GET /me`
- `POST /bets`
- `GET /bets/me`
- `GET /admin`
- `GET /admin/markets`
- `POST /admin/markets/:marketSlug/settle`
- `GET /admin/users/search?q=<login>`
- `GET /admin/users/:userId`
- `POST /admin/users/:userId/balance`

## Deploying to Render

1. Push this repo to Git.
2. In Render, create a Blueprint from `render.yaml`.
3. After the Postgres database is created, run `server/sql/schema.sql` in that database.
4. Set `ADMIN_SECRET` on the `gmbl-api` service.
5. Deploy the `gmbl-api` service.

## Admin Panel

Set `ADMIN_SECRET` on the server, then open `/admin` in a browser. The panel stores the secret in session storage for that browser tab, lets you search players by login id or username, shows current balance and recent activity, and records an `admin_adjustment` wallet transaction whenever you submit a new balance.

## Important

This is much safer than the Firebase-client-only version, but it is still not literally hack-proof. You still need:

- rate limiting
- stronger admin authorization than a shared secret
- HTTPS in production
- proper secret rotation
- monitoring and backups

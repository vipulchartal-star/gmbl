# GMBL

This repo now contains two parts:

- Expo mobile app in the repo root
- Node + Postgres API in `server/`

## Recommended architecture

Use the Node + Postgres backend in `server/` for any real betting logic.

The backend owns:

- account creation and login
- password hashing
- user balances
- immutable bet records
- wallet ledger entries
- market pool totals

## Hosting

Recommended production hosting is Render:

- Node API as a Render Web Service
- Postgres as a Render Postgres database
- deploy using `render.yaml`

## Backend files

- API entry: `server/src/index.js`
- Schema: `server/sql/schema.sql`
- Render deploy blueprint: `render.yaml`
- Environment template: `server/.env.example`

## Current mobile app

The Expo app still exists in the root, but it has not yet been rewritten to consume the new Node API.
The serious backend is now scaffolded and ready to deploy first.

## Web Deploy

The Expo web build can be deployed to Vercel with `npx expo export --platform web`.

Test push via vipulchartal-star.
Author test via vipulchartal-star.

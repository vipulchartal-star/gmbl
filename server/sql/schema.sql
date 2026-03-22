create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  login_id text not null unique,
  username text not null,
  password_hash text not null,
  balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  status text not null default 'open',
  yes_pool numeric(12, 2) not null default 0,
  no_pool numeric(12, 2) not null default 0,
  total_bets integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bets (
  id uuid primary key default gen_random_uuid(),
  market_slug text not null references markets(slug) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  side text not null check (side in ('yes', 'no')),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  kind text not null,
  amount_delta numeric(12, 2) not null,
  balance_after numeric(12, 2) not null,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists bets_user_created_at_idx on bets(user_id, created_at desc);
create index if not exists wallet_transactions_user_created_at_idx on wallet_transactions(user_id, created_at desc);

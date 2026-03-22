import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  defaultMarketSlug: process.env.DEFAULT_MARKET_SLUG ?? 'live-yes-no',
  defaultMarketQuestion: process.env.DEFAULT_MARKET_QUESTION ?? 'Will the outcome be YES?',
  signupStartingBalance: Number(process.env.SIGNUP_STARTING_BALANCE ?? 1000),
};

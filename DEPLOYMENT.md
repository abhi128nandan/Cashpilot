# CashPilot Deployment Guide

## Prerequisites
- Node.js >= 18.18
- Supabase Project (PostgreSQL)
- Vercel (or equivalent hosting supporting Next.js Server Actions)

## Environment Variables
Ensure the following are set in `.env.local` (and in your Vercel deployment):
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (Required for Engine bypass RLS)
```

## Database Migrations
Before deploying the code, execute all migrations in `supabase/migrations/` sequentially. The idempotency keys on `transactions` are strictly required to prevent catastrophic billing errors.

## Recurring Transaction Engine
Currently, the `RecurringProcessingEngine` runs "lazily" when a user logs into their dashboard. 
- **Known Limitation**: If a user does not log in for 6 months, their transactions won't generate until they return.
- **Future Roadmap**: This is slated to be replaced by a Vercel Cron Job hitting a protected API endpoint (Milestone 6C).

## Operational Notes
- Logs are JSON-structured via `logger.ts` in production. Route them to Datadog or Vercel Axiom for ingestion.
- Monitor `failedCount` on `recurring_engine` log entries. Failure usually indicates database timeouts or schema corruption.

# ✅ Production Checklist

Before officially going live with CashPilot, verify the following:

## Environment & Secrets
- [ ] Ensure `NODE_ENV` is set to `production`.
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.
- [ ] Verify `OPENAI_API_KEY` is valid.
- [ ] Confirm no secrets are hardcoded in the repository.

## Security
- [ ] Next.js Security Headers (HSTS, Frame-Options) are active.
- [ ] Supabase Row Level Security (RLS) is fully enabled for all tables.
- [ ] Rate limiting is active on API endpoints.
- [ ] Input validation exists for all POST/PUT routes (Zod).

## Performance & Build
- [ ] `npm run build` completes without warnings.
- [ ] `npx tsc --noEmit` returns zero errors.
- [ ] ESLint passes without errors.
- [ ] Images and static assets are optimized.

## Resilience
- [ ] Smart Fallback UI triggers successfully if the OpenAI key is removed or invalid.
- [ ] Health endpoints (`/api/health`, `/api/health/liveness`) return 200 OK.
- [ ] Docker container restarts automatically (`restart: always`).

## Database
- [ ] Initial schema migrations (`supabase/migrations/`) are executed in production.
- [ ] Email Authentication is configured properly in Supabase.
- [ ] Database connection pooling is active (if applicable).

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Enterprise Production Upgrade

### Added
- **Docker Support**: Added `Dockerfile`, `docker-compose.yml`, and `.dockerignore` for containerized deployments.
- **CI/CD Pipeline**: Added `.github/workflows/ci.yml` for automated linting, testing, and building.
- **Smart Fallback System**: Enhanced the AI Chatbot UI in `chat-interface.tsx` to handle provider outages, rate limits, and missing API keys gracefully by displaying suggested retry prompts instead of crashing.
- **Observability**: Added `/api/health` and `/api/health/liveness` endpoints for container orchestration readiness checks.
- **Testing Suite**: Added Jest, React Testing Library, Supertest, and Playwright configurations with initial health endpoint tests.
- **Documentation**: Added comprehensive guides in `docs/`:
  - `01-architecture-audit.md`
  - `02-production-readiness.md`
  - `03-security-audit.md`
  - `04-chatbot-verification.md`
  - `docker-guide.md`
  - `deployment-guide.md`
  - `production-checklist.md`

### Changed
- **API Error Handling**: `api/chat/route.ts` now explicitly returns a `503 Service Unavailable` JSON response when the `OPENAI_API_KEY` is missing instead of failing silently or throwing an internal 500.
- **Next.js Config**: Set `output: 'standalone'` in `next.config.ts` to optimize the Docker image footprint.

### Security
- Audited middleware to ensure headers and route guards are production-ready.
- Verified Rate Limiting and Zod validation exist on critical transaction API routes.

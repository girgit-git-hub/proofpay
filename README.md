# ProofPay

AI-verified proof of work with risk-aware PayPal payouts.

## Stack

- React + Vite + TypeScript
- Fastify + TypeScript
- PostgreSQL + Prisma
- PayPal REST APIs + Payouts + Webhooks
- PayPal Agent Toolkit + PayPal MCP configuration
- AI vision adapter: OpenAI GPT-4o or Gemini 2.5 Flash
- Sharp + pHash + Exifr
- Render Workflows SDK
- AG Grid / AG Charts
- Bryntum Scheduler Pro adapter (optional licensed dependency)
- Leaflet + OpenStreetMap
- Channel3 product-data adapter

## Quick start

1. Copy `.env.example` to `.env` and fill PayPal sandbox credentials.
2. Start PostgreSQL: `docker compose up -d postgres`
3. Install dependencies: `npm install`
4. Generate Prisma client: `npm run db:generate`
5. Migrate: `npm run db:migrate`
6. Seed: `npm run db:seed`
7. Start: `npm run dev`
8. Open http://localhost:5173

The app runs in `mock` AI mode by default so the demo works without an AI key. Set `AI_PROVIDER=openai` or `AI_PROVIDER=gemini` for real vision verification.

## PayPal

Create a PayPal sandbox REST app and put its client ID/secret in `.env`. The backend uses OAuth 2.0 and REST APIs. Payouts are deliberately gated by the verification decision and an idempotency key.

For webhook testing, expose `POST /api/webhooks/paypal` over HTTPS (for example through a tunnel) and register the URL in the PayPal Developer Dashboard. Set `PAYPAL_WEBHOOK_ID` for signature verification.

## PayPal MCP

`mcp.json` contains the sandbox MCP configuration. The official remote sandbox endpoint is `https://mcp.sandbox.paypal.com/http`. Keep credentials out of source control.

## Render Workflows

`workflows/index.ts` contains the durable verification tasks. Deploy it as a Render Workflow service or run the workflow logic locally through the API's synchronous fallback.

## Sponsor integration notes

- AG Grid is used for the review workbench and donor analytics.
- Bryntum Scheduler Pro is supported through `apps/web/src/components/FraudTimeline.tsx`. Install the licensed package and set its license key when you have sponsor access. A CSS/HTML timeline fallback is included for local development.
- Channel3 is behind a typed adapter so the demo can use deterministic fixtures until the sponsor API credentials are configured.
- Render Workflows is a real TypeScript workflow definition, not a mock queue.

## Demo flow

1. Create a task.
2. Fund it in PayPal sandbox or use demo funding mode.
3. Upload evidence.
4. Run verification.
5. Inspect the 9-check proof score.
6. Approve verified work.
7. Trigger a PayPal payout.
8. Simulate/replay a webhook.
9. Use the fraud timeline and natural-language review UI.

## Safety

Never put PayPal secrets or access tokens in the frontend. Never let an LLM directly decide to transfer funds without deterministic server-side eligibility checks and idempotency protection.

## Real AI + PayPal sandbox

This build uses real providers by default. Configure `AI_PROVIDER=gemini` or `AI_PROVIDER=openai` and supply the corresponding API key. PayPal runs in SANDBOX by default and requires your own Developer Dashboard Client ID/Secret. See `docs/SANDBOX-SETUP.md`.

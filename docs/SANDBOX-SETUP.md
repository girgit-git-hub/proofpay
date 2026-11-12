# PayPal Sandbox Setup

1. Create/sign into a PayPal Developer account.
2. Open **Apps & Credentials** and create/select a REST app under **Sandbox**.
3. Copy the sandbox Client ID and Secret into `.env`:

```env
PAYPAL_ENVIRONMENT=SANDBOX
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
```

4. In **Testing Tools > Sandbox Accounts**, use the generated business and personal accounts for testing. Do not use real credentials in the repository.
5. Configure a webhook URL for the app. For local development, expose the Fastify server with an HTTPS tunnel, then use:

```text
https://YOUR_PUBLIC_HOST/api/webhooks/paypal
```

6. Start the API and run:

```bash
npm run paypal:sandbox:check
```

7. For real sandbox events, PayPal will POST to the webhook endpoint. ProofPay verifies the PayPal signature using the webhook verification API when `PAYPAL_WEBHOOK_ID` is configured and deduplicates events by PayPal event ID.

## AI key

ProofPay does not ship a fake AI provider. Set either:

```env
AI_PROVIDER=gemini
GOOGLE_API_KEY=...
GOOGLE_MODEL=gemini-2.5-flash
```

or:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o
```

The secret belongs in your local `.env` and must never be committed. The repository only contains `.env.example` placeholders.

## PayPal MCP

The sandbox MCP endpoint is:

```text
https://mcp.sandbox.paypal.com
```

The included `mcp.json` is configured for the official `@paypal/mcp` package. Obtain a sandbox access token from your PayPal credentials flow and expose it to the MCP process as `PAYPAL_MCP_ACCESS_TOKEN`.

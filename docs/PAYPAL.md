# PayPal integration

ProofPay has three PayPal integration surfaces:

1. REST API: backend OAuth, Orders and Payouts.
2. Webhooks: `/api/webhooks/paypal` records events idempotently and reconciles payout status.
3. Agent layer: `@paypal/agent-toolkit` is configured in `apps/api/src/services/agent-toolkit.ts`; `mcp.json` configures the official PayPal sandbox MCP server for compatible MCP hosts.

The official PayPal MCP sandbox endpoint is `https://mcp.sandbox.paypal.com/http`. The official local MCP package is `@paypal/mcp`.

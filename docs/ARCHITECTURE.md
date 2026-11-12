# ProofPay architecture

The payout path is deliberately split into AI verification and deterministic payment authorization.

1. Evidence enters through Fastify.
2. Sharp/Exifr/pHash produce machine-checkable evidence signals.
3. Channel3 can supply product references and market-price signals.
4. Vision AI produces structured checks.
5. The server persists a Verification decision.
6. Only VERIFIED tasks can enter the payout service.
7. Payout service derives an idempotency key from the task ID.
8. PayPal Payouts API is called with PayPal-Request-Id.
9. PayPal webhooks reconcile asynchronous payout states.
10. The agent layer can query/operate PayPal using the Agent Toolkit/MCP, but financial actions remain server-side gated.

This separation is important: an LLM can recommend an action, but it cannot bypass ProofPay's deterministic eligibility rules.

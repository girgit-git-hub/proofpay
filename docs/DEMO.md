# 3-minute demo script

1. Open ProofPay dashboard. Point out the PayPal sandbox badge, AG Grid review workbench and sponsor integrations.
2. Select `Repair village water pump`.
3. Upload a completion photo. Explain that Sharp, Exifr and pHash create deterministic evidence signals before the model runs.
4. Click `Run verification`. Show the 9 checks and proof score.
5. Click `Pay via PayPal`. In sandbox mode the payout path creates a PayPal payout with a deterministic idempotency key.
6. Open the fraud timeline and show how submissions become visible as events.
7. Ask the agent: `show workers with 2+ flags this week, worst first`. Explain that the production version routes this through PayPal Agent Toolkit/MCP plus the ProofPay data layer.
8. Explain the fail-safe: if AI verification fails, the task is retried/held; the payout service cannot pay unless a persisted VERIFIED decision exists, and the PayPal request carries the same idempotency key.

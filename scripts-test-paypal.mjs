const base = process.env.PROOFPAY_API_URL || 'http://localhost:4000';
const r = await fetch(`${base}/api/paypal/sandbox/check`, { method:'POST' });
console.log(await r.text());
process.exitCode = r.ok ? 0 : 1;

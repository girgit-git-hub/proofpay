import { env } from '../config/env.js';

const base = env.PAYPAL_ENVIRONMENT === 'PRODUCTION' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
let cached: { token:string; expiresAt:number } | null = null;

export async function paypalAccessToken(){
  if(!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) throw new Error('PayPal credentials are not configured');
  if(cached && cached.expiresAt > Date.now()+60_000) return cached.token;
  const basic = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${base}/v1/oauth2/token`, {method:'POST', headers:{Authorization:`Basic ${basic}`, 'Content-Type':'application/x-www-form-urlencoded'}, body:'grant_type=client_credentials'});
  if(!r.ok) throw new Error(`PayPal OAuth failed: ${r.status} ${await r.text()}`);
  const j:any=await r.json(); cached={token:j.access_token,expiresAt:Date.now()+j.expires_in*1000}; return cached.token;
}

export async function paypalRequest(path:string, init:RequestInit={}){
  const token=await paypalAccessToken();
  const headers=new Headers(init.headers); headers.set('Authorization',`Bearer ${token}`); headers.set('Content-Type','application/json');
  const r=await fetch(`${base}${path}`, {...init,headers}); const text=await r.text();
  if(!r.ok) throw new Error(`PayPal ${r.status}: ${text}`); return text?JSON.parse(text):{};
}

export async function createOrder(amount:number,currency='USD',customId?:string){
 return paypalRequest('/v2/checkout/orders',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:customId||'PROOFPAY',amount:{currency_code:currency,value:amount.toFixed(2)}}]})});
}

export async function createPayout(workerEmail:string,amount:number,currency='USD',idempotencyKey:string){
 return paypalRequest('/v1/payments/payouts',{method:'POST',headers:{'PayPal-Request-Id':idempotencyKey},body:JSON.stringify({sender_batch_header:{sender_batch_id:`PP-${idempotencyKey}`,email_subject:'ProofPay verified task payout',email_message:'Your ProofPay task has been verified and paid.'},items:[{recipient_type:'EMAIL',amount:{value:amount.toFixed(2),currency},receiver:workerEmail,note:'ProofPay verified work payout',sender_item_id:idempotencyKey}]})});
}

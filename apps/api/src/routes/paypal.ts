import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { paypalAccessToken, paypalRequest } from '../lib/paypal.js';

export async function paypalRoutes(app:FastifyInstance){
  app.get('/api/paypal/status', async()=>({environment:env.PAYPAL_ENVIRONMENT,configured:Boolean(env.PAYPAL_CLIENT_ID&&env.PAYPAL_CLIENT_SECRET),mcpConfigured:Boolean(env.PAYPAL_MCP_ACCESS_TOKEN)}));
  app.post('/api/paypal/sandbox/check', async(_req,reply)=>{
    try {
      if(env.PAYPAL_ENVIRONMENT!=='SANDBOX') return reply.code(400).send({ok:false,error:'Sandbox check requires PAYPAL_ENVIRONMENT=SANDBOX'});
      const token=await paypalAccessToken();
      return {ok:true,environment:'SANDBOX',tokenType:'Bearer',accessTokenConfigured:Boolean(token),ordersEndpoint:'https://api-m.sandbox.paypal.com/v2/checkout/orders',payoutsEndpoint:'https://api-m.sandbox.paypal.com/v1/payments/payouts'};
    } catch(e:any){ return reply.code(400).send({ok:false,error:e.message}); }
  });
  app.get('/api/paypal/order/:id', async(req,reply)=>{try{return await paypalRequest(`/v2/checkout/orders/${(req.params as any).id}`)}catch(e:any){return reply.code(400).send({error:e.message})}});
}

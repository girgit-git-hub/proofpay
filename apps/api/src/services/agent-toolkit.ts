import { PayPalAgentToolkit, ALL_TOOLS_ENABLED } from '@paypal/agent-toolkit/ai-sdk';
import { env } from '../config/env.js';

export function createPayPalToolkit(){
  if(!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) return null;
  return new PayPalAgentToolkit({clientId:env.PAYPAL_CLIENT_ID,clientSecret:env.PAYPAL_CLIENT_SECRET,configuration:{actions:ALL_TOOLS_ENABLED,context:{sandbox:env.PAYPAL_ENVIRONMENT==='SANDBOX'}}});
}

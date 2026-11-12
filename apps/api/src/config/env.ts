import { z } from 'zod';
export const env = z.object({
 NODE_ENV:z.string().default('development'), API_PORT:z.coerce.number().default(4000), WEB_ORIGIN:z.string().default('http://localhost:5173'),
 DATABASE_URL:z.string(), PAYPAL_ENVIRONMENT:z.enum(['SANDBOX','PRODUCTION']).default('SANDBOX'), PAYPAL_CLIENT_ID:z.string().optional(), PAYPAL_CLIENT_SECRET:z.string().optional(), PAYPAL_WEBHOOK_ID:z.string().optional(),
 AI_PROVIDER:z.enum(['openai','gemini']).default('gemini'), OPENAI_API_KEY:z.string().optional(), OPENAI_MODEL:z.string().default('gpt-4o'), GOOGLE_API_KEY:z.string().optional(), GOOGLE_MODEL:z.string().default('gemini-2.5-flash'),
 CHANNEL3_API_URL:z.string().optional(), CHANNEL3_API_KEY:z.string().optional(), RENDER_WORKFLOW_URL:z.string().optional(), RENDER_API_KEY:z.string().optional(), PAYPAL_MCP_URL:z.string().default('https://mcp.sandbox.paypal.com/http'), PAYPAL_MCP_ACCESS_TOKEN:z.string().optional(), APP_BASE_URL:z.string().default('http://localhost:4000')
}).parse(process.env);

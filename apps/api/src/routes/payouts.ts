import { FastifyInstance } from 'fastify'; import { payoutTask } from '../services/payout.service.js';
export async function payoutRoutes(app:FastifyInstance){app.post('/api/tasks/:id/payout',async(req,reply)=>{try{return await payoutTask((req.params as any).id)}catch(e:any){return reply.code(400).send({error:e.message})}});}

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { createOrder } from '../lib/paypal.js';

export async function taskRoutes(app:FastifyInstance){
 app.get('/api/tasks',async()=>prisma.task.findMany({include:{verification:true,payout:true,evidence:true},orderBy:{createdAt:'desc'}}));
 app.post('/api/tasks',async(req,reply)=>{const b=z.object({title:z.string(),description:z.string(),amount:z.coerce.number().positive(),currency:z.string().default('USD'),requiredProduct:z.string().optional(),funderId:z.string(),workerId:z.string().optional()}).parse(req.body); const t=await prisma.task.create({data:b}); return reply.code(201).send(t);});
 app.post('/api/tasks/:id/fund',async(req,reply)=>{const id=(req.params as any).id; const task=await prisma.task.findUnique({where:{id}}); if(!task) return reply.code(404).send({error:'Task not found'}); if(process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET){const o:any=await createOrder(Number(task.amount),task.currency,task.id); await prisma.task.update({where:{id},data:{status:'FUNDED',paypalOrderId:o.id}}); return {order:o};} await prisma.task.update({where:{id},data:{status:'FUNDED',paypalOrderId:`DEMO-ORDER-${id}`}}); return {order:{id:`DEMO-ORDER-${id}`,status:'CREATED'}};});
}

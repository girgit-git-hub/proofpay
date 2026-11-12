import { prisma } from '../lib/prisma.js';
import { lookupProduct } from './channel3.service.js';
import { verifyEvidence } from './ai.service.js';

export async function verifyTask(taskId:string){
 const task=await prisma.task.findUnique({where:{id:taskId},include:{evidence:true}}); if(!task) throw new Error('Task not found');
 if(!task.evidence.length) throw new Error('No evidence uploaded');
 const evidence=task.evidence[0]; await prisma.evidence.update({where:{id:evidence.id},data:{status:'VERIFYING'}});
 const product=task.requiredProduct?await lookupProduct(task.requiredProduct):null;
 const result=await verifyEvidence(task,evidence,product);
 const v=await prisma.verification.upsert({where:{taskId},create:{taskId,decision:result.decision,overallScore:result.score,checks:result.checks,explanation:result.explanation,model:result.model},update:{decision:result.decision,overallScore:result.score,checks:result.checks,explanation:result.explanation,model:result.model}});
 await prisma.evidence.update({where:{id:evidence.id},data:{status:result.decision==='VERIFIED'?'VERIFIED':result.decision==='REJECTED'?'REJECTED':'FLAGGED'}});
 await prisma.task.update({where:{id:taskId},data:{status:result.decision==='VERIFIED'?'VERIFIED':result.decision==='REJECTED'?'REJECTED':'REVIEW'}});
 return v;
}

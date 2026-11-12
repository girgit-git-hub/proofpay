import {task, type TaskContext} from '@renderinc/sdk/workflows';
export const normalizeEvidence=task({name:'normalizeEvidence'},async(ctx:TaskContext,input:{taskId:string;evidenceId:string})=>({...input,stage:'normalized'}));
export const inspectEvidence=task({name:'inspectEvidence'},async(ctx:TaskContext,input:{taskId:string;evidenceId:string})=>({...input,stage:'metadata-inspected'}));
export const verifyWithAI=task({name:'verifyWithAI'},async(ctx:TaskContext,input:{taskId:string;evidenceId:string})=>({...input,stage:'ai-verified'}));
export const finalizeProof=task({name:'finalizeProof'},async(ctx:TaskContext,input:{taskId:string;evidenceId:string})=>({...input,stage:'decision-ready'}));
export const proofPipeline=task({name:'proofPipeline'},async(ctx:TaskContext,input:{taskId:string;evidenceId:string})=>{const a=await ctx.run(normalizeEvidence,input);const b=await ctx.run(inspectEvidence,a);const c=await ctx.run(verifyWithAI,b);return ctx.run(finalizeProof,c);});

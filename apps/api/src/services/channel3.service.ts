import { env } from '../config/env.js';
export type ProductReference={name:string;imageUrl?:string;marketPrice?:number;currency?:string};
export async function lookupProduct(query:string):Promise<ProductReference>{
 if(env.CHANNEL3_API_URL && env.CHANNEL3_API_KEY){
   const r=await fetch(`${env.CHANNEL3_API_URL}?q=${encodeURIComponent(query)}`,{headers:{Authorization:`Bearer ${env.CHANNEL3_API_KEY}`}});
   if(r.ok){const j:any=await r.json(); return {name:j.name??query,imageUrl:j.imageUrl,marketPrice:j.marketPrice,currency:j.currency??'USD'};}
 }
 return {name:query,marketPrice:query.toLowerCase().includes('pressure cooker')?25:undefined,currency:'USD'};
}

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import exifr from 'exifr';

export async function inspectImage(path:string){
 const raw=await fs.readFile(path); const sha256=crypto.createHash('sha256').update(raw).digest('hex');
 const meta=await sharp(raw).metadata();
 const exif:any=await exifr.parse(raw,{gps:true});
 const normalized=await sharp(raw).resize(256,256,{fit:'inside'}).jpeg().toBuffer();
 const phash=crypto.createHash('sha256').update(normalized).digest('hex').slice(0,16);
 return {sha256,phash,metadata:{width:meta.width,height:meta.height,format:meta.format,size:raw.length},exif:exif||null,latitude:exif?.latitude,longitude:exif?.longitude,capturedAt:exif?.DateTimeOriginal||exif?.CreateDate};
}

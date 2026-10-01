'use client'
async function capability(body:unknown) {
  const result=await fetch('/api/portal/storage',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)})
  const data=await result.json()
  if(!result.ok)throw new Error(data.error || 'File request failed')
  return data
}
export function createBrowserStorage() {
  return {from(bucket:string){return {
    async upload(key:string,body:Blob,options?:{contentType?:string;upsert?:boolean}) {
      try {
        const access=await capability({operation:'upload',bucket,key,size:body.size,contentType:options?.contentType || body.type,upsert:options?.upsert})
        const result=await fetch(access.url,{method:'PUT',headers:access.headers,body})
        if(!result.ok)throw new Error('Private upload failed')
        return {data:{path:key},error:null}
      }catch(error){return {data:null,error:{message:error instanceof Error?error.message:'Upload failed'}}}
    },
    async createSignedUrl(key:string,expiresIn:number){try{return {data:await capability({operation:'download',bucket,key,expiresIn}),error:null}}catch(error){return {data:null,error:{message:error instanceof Error?error.message:'File unavailable'}}}},
    async download(key:string){try{const access=await capability({operation:'download',bucket,key});const result=await fetch(access.signedUrl);if(!result.ok)throw new Error('File unavailable');return {data:await result.blob(),error:null}}catch(error){return {data:null,error:{message:error instanceof Error?error.message:'File unavailable'}}}},
    async remove(keys:string[]){try{return {data:await capability({operation:'remove',bucket,keys}),error:null}}catch(error){return {data:null,error:{message:error instanceof Error?error.message:'File removal failed'}}}},
  }}}
}

import {api} from './api.js';
export async function downloadClientFile(path){
 const response=await api.get(path,{responseType:'blob'});
 const url=URL.createObjectURL(response.data);const link=document.createElement('a');
 link.href=url;
 link.download=(response.headers['content-disposition']||'').match(/filename="([^"]+)"/)?.[1]||'trans-document.pdf';
 document.body.appendChild(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),60000);
}

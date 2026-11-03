import {api} from './api';
export async function downloadContainerPass(source,id,type){
  const response=await api.get(`/client/container-tracking/${source}/${id}/pass/${type}`,{responseType:'blob'});
  const url=URL.createObjectURL(response.data);
  const link=document.createElement('a');link.href=url;link.download=`trans-roadway-${type.toLowerCase()}-${id}.pdf`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}

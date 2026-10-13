import { useEffect, useState, type ReactNode } from 'react';
import { authorizedFetch } from './index';
export default function PrivateMediaLink({path,children,className}:{path:string;children:ReactNode;className?:string}) {
  const [url,setUrl]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
  const open=async()=>{
    setLoading(true);setError('');
    try {
      const relative=path.replace(/^https?:\/\/[^/]+\//,'').replace(/^\//,'');
      if(!/^uploads\/(atelier|service-bookings)\/[a-f0-9-]+\.(jpg|jpeg|png|webp|gif|heic|heif)$/.test(relative))throw new Error('Unsupported private attachment.');
      const response=await authorizedFetch(`${(process.env.NEXT_PUBLIC_API_BASE_URL??'http://localhost:1997').replace(/\/$/,'')}/${relative.replace(/^uploads\//,'private-media/')}`,{cache:'no-store'});
      if(!response.ok)throw new Error('This attachment could not be opened.');
      const blob=await response.blob();if(!blob.type.startsWith('image/'))throw new Error('Unsupported attachment format.');
      if(url)URL.revokeObjectURL(url);setUrl(URL.createObjectURL(blob));
    }catch(cause){setError(cause instanceof Error?cause.message:'Attachment unavailable.');}finally{setLoading(false);}
  };
  return <span className={className}><button type="button" disabled={loading} onClick={()=>void open()}>{loading?'Opening…':children}</button>{error&&<span role="alert">{error}</span>}{url&&<span style={{display:'block'}}><img src={url} alt="Private uploaded attachment" style={{maxWidth:'100%',maxHeight:500}}/><button type="button" onClick={()=>{URL.revokeObjectURL(url);setUrl('');}}>Close image</button></span>}</span>;
}

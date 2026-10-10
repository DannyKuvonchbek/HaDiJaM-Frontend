import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { initializeAuth, startActivityTracking } from './index';
import { useRouter } from 'next/router';
export default function AuthBootstrap({children}:{children:ReactNode}) {
  const router=useRouter();
  const protectedPage=/^\/(my-page|admin|seller|checkout)(\/|$)/.test(router.pathname) || /^\/services\/(repair-restoration|ultrasonic-cleaning)(\/|$)/.test(router.pathname);
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[identity,setIdentity]=useState(0);
  useEffect(()=>{
    let mounted=true;
    const reset=()=>setIdentity(value=>value+1);
    window.addEventListener('hadijam:session-identity-changed',reset);
    const stop=startActivityTracking();
    void initializeAuth().then(()=>{if(mounted)setReady(true);}).catch(()=>{if(mounted)setFailed(true);});
    return()=>{mounted=false;stop();window.removeEventListener('hadijam:session-identity-changed',reset);};
  },[]);
  if(failed && protectedPage)return <main role="alert" style={{padding:32}}>We could not restore your session. Check your connection and <button onClick={()=>window.location.reload()}>try again</button>.</main>;
  if(!ready && protectedPage)return <main role="status" style={{padding:32}}>Loading HaDiJaM…</main>;
  return <Fragment key={identity}>{children}</Fragment>;
}

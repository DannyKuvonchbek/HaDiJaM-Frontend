import { ApolloClient, HttpLink, InMemoryCache, ApolloLink, Observable, type NormalizedCacheObject } from '@apollo/client';
import { useMemo } from 'react';
import { ensureAccessToken } from '@/libs/auth';
let browserClient: ApolloClient<NormalizedCacheObject> | undefined;
function createApolloClient() {
  const authLink=new ApolloLink((operation,forward)=>new Observable(observer=>{
    let subscription:any, cancelled=false;
    const run=async(retry=false)=>{
      try {
        const token=operation.getContext().skipSessionRefresh ? "" : await ensureAccessToken(retry);
        if(cancelled)return;
        operation.setContext(({headers={}})=>({headers:{...headers,authorization:token?`Bearer ${token}`:'','X-Hadijam-CSRF':'1'}}));
        subscription=forward(operation).subscribe({next:result=>{
          const authFailure=result.errors?.some((e:any)=>e.extensions?.code==='UNAUTHENTICATED'||e.extensions?.originalError?.statusCode===401);
          if(authFailure&&token&&!retry){subscription?.unsubscribe();void run(true);return;}
          observer.next(result); observer.complete();
        },error:error=>{if(error.statusCode===401&&token&&!retry){void run(true);return;}observer.error(error);}});
      }catch(error){observer.error(error);}
    };void run();return()=>{cancelled=true;subscription?.unsubscribe();};
  }));
  return new ApolloClient({ssrMode:typeof window==='undefined',link:authLink.concat(new HttpLink({uri:process.env.NEXT_PUBLIC_API_URL??'http://localhost:9702/graphql',credentials:'include'})),cache:new InMemoryCache()});
}
export function initializeApollo(initialState?:NormalizedCacheObject){
  if(typeof window!=='undefined'&&!browserClient){browserClient=createApolloClient();window.addEventListener('hadijam:session-identity-changed',()=>{void browserClient?.clearStore();});}
  const client=typeof window==='undefined'?createApolloClient():browserClient!;
  if(initialState)client.cache.restore(initialState);return client;
}
export function useApollo(initialState?:NormalizedCacheObject){return useMemo(()=>initializeApollo(initialState),[initialState]);}

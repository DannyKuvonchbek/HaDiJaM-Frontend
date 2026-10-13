export type SessionMember = { _id: string; memberNick: string; memberType: string; memberStatus?: string; memberImage?: string; sellerIntent?: boolean };
let token = '', member: SessionMember | null = null;
let initialized = false, boot: Promise<void> | undefined, pending: Promise<string> | undefined;
let channel: BroadcastChannel | undefined;
let lastInteraction = 0, lastActivity = 0, stopping = false;
const api = () => (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:1997').replace(/\/$/, '');
const authKeys = ['accessToken', 'memberNick', 'memberType', 'memberImage', 'login', 'logout'];
const emit = () => window.dispatchEvent(new Event('hadijam:auth-updated'));
const changed = () => window.dispatchEvent(new Event('hadijam:token-updated'));
function expires(value: string): number { try { return JSON.parse(atob(value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp * 1000; } catch { return 0; } }
export function getAccessToken(): string { return token; }
export function getSessionMember(): SessionMember | null { return member; }
export function authValue(key: string): string {
  if (key === 'accessToken') return token;
  return member ? String((member as any)[key] ?? '') : '';
}
export function setAuthValue(key: string, value: string) {
  if (!member || key === 'accessToken' || (member as any)[key] === value) return;
  member = { ...member, [key]: value }; emit();
}
function apply(accessToken: string, currentMember: SessionMember, broadcast = true) {
  const identityChanged = member?._id !== currentMember._id;
  token = accessToken; member = currentMember;
  if (identityChanged) window.dispatchEvent(new Event('hadijam:session-identity-changed'));
  emit(); changed();
  if (broadcast) channel?.postMessage({ type: 'session', accessToken, member: currentMember });
}
function clear(broadcast = true) {
  token = ''; member = null;
  authKeys.forEach(key => localStorage.removeItem(key));
  for (let i = sessionStorage.length - 1; i >= 0; i--) { const key = sessionStorage.key(i); if (key?.startsWith('seller-application-draft:')) sessionStorage.removeItem(key); }
  emit(); changed(); window.dispatchEvent(new Event('hadijam:session-identity-changed'));
  if (broadcast) { channel?.postMessage({ type: 'logout' }); localStorage.setItem('hadijam:session-logout', crypto.randomUUID()); }
}
// Web Locks serialize cookies across tabs; fallback leases contain no credentials.
let lockDb: Promise<IDBDatabase> | undefined;
function db(): Promise<IDBDatabase> {
  return lockDb ??= new Promise((resolve,reject) => { const request=indexedDB.open('hadijam-auth-coordination',1); request.onupgradeneeded=()=>request.result.createObjectStore('locks'); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
}
export async function withAuthCookieLock<T>(work: () => Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request('hadijam-session-cookie', work);
  const database=await db(), owner=crypto.randomUUID();
  const tryAcquire = () => new Promise<boolean>((resolve,reject) => {
    const tx=database.transaction('locks','readwrite'), store=tx.objectStore('locks'); let acquired=false;
    const req=store.get('refresh'); req.onsuccess=()=>{ if (!req.result || req.result.until < Date.now()) {store.put({owner,until:Date.now()+30000},'refresh'); acquired=true;} };
    tx.oncomplete=()=>resolve(acquired); tx.onerror=()=>reject(tx.error);
  });
  while (!(await tryAcquire())) await new Promise(resolve=>setTimeout(resolve,100));
  try { return await work(); } finally {
    await new Promise<void>((resolve,reject)=>{const tx=database.transaction('locks','readwrite'), store=tx.objectStore('locks'), req=store.get('refresh');req.onsuccess=()=>{if(req.result?.owner===owner)store.delete('refresh');};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
  }
}
async function authRequest(path: string, bearer?: string): Promise<Response> {
  return fetch(`${api()}/auth/${path}`, { method:'POST', credentials:'include', cache:'no-store', headers:{'X-Hadijam-CSRF':'1', ...(bearer?{Authorization:`Bearer ${bearer}`}:{})}, signal:AbortSignal.timeout(10000) });
}
async function refresh(force = false): Promise<string> {
  if (stopping) return '';
  if (pending) return pending;
  const original = token;
  pending = withAuthCookieLock(async()=>{
    if ((!force || token !== original) && token && expires(token)>Date.now()+30000) return token;
    const response=await authRequest('refresh');
    if (response.status===401) { clear(); return ''; }
    if (!response.ok) throw new Error('Session refresh is temporarily unavailable. Please try again.');
    const result=await response.json(); apply(result.accessToken,result.member); return token;
  }).finally(()=>{pending=undefined;});
  return pending;
}
export async function ensureAccessToken(force = false): Promise<string> {
  if (typeof window==='undefined') return '';
  if (!initialized) await initializeAuth();
  if (stopping) return '';
  if (!member && !token) return '';
  return !force && token && expires(token)>Date.now()+30000 ? token : refresh(force);
}
export async function acceptLogin(accessToken: string, currentMember: SessionMember) {
  if (pending) await pending;
  apply(accessToken,currentMember); lastInteraction=Date.now(); lastActivity=0;
  await recordActivity();
}
export async function logoutSession(all = false): Promise<void> {
  const bearer = all ? await ensureAccessToken() : undefined;
  stopping = true;
  try {
    await withAuthCookieLock(async()=> { const response=await authRequest(all?'logout-all':'logout',bearer); if(!response.ok) throw new Error('Sign out could not be confirmed. Please try again.'); });
    clear();
  } finally { stopping=false; }
}
async function recordActivity(): Promise<void> {
  if (!member || stopping || Date.now()-lastActivity<60000) return;
  lastActivity=Date.now();
  try {
    const access=await ensureAccessToken(); if(!access)return;
    await withAuthCookieLock(async()=>{const response=await authRequest('activity', token); if(response.status===401) clear(); else if(!response.ok) lastActivity=0;});
  } catch { lastActivity=0; }
}
export function initializeAuth(): Promise<void> {
  if (typeof window==='undefined') return Promise.resolve();
  return boot ??= (async()=>{
    authKeys.forEach(key=>localStorage.removeItem(key));
    window.addEventListener('storage', event=>{if(event.key==='hadijam:session-logout')clear(false);});
    if (typeof BroadcastChannel!=='undefined') {
      channel=new BroadcastChannel('hadijam-auth');
      channel.onmessage=(event)=>{const data=event.data; if(data?.type==='session' && typeof data.accessToken==='string' && data.member?._id) apply(data.accessToken,data.member,false); if(data?.type==='logout')clear(false);};
    }
    try { await refresh(); } finally { initialized=true; }
    if (member && document.visibilityState === 'visible') { lastInteraction=Date.now(); void recordActivity(); }
  })();
}
export function startActivityTracking(): () => void {
  const interaction = (event: Event) => {if (!event.isTrusted || document.visibilityState!=='visible') return;lastInteraction=Date.now();void recordActivity();};
  window.addEventListener('pointerdown',interaction);window.addEventListener('keydown',interaction);window.addEventListener('wheel',interaction,{passive:true});
  const timer=window.setInterval(()=>{if(member&&document.visibilityState==='visible'&&Date.now()-lastInteraction<60000)void ensureAccessToken().catch(()=>undefined);},15000);
  return ()=>{clearInterval(timer);window.removeEventListener('pointerdown',interaction);window.removeEventListener('keydown',interaction);window.removeEventListener('wheel',interaction);};
}
export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  let access=await ensureAccessToken();
  const run=()=>{const headers=new Headers(init.headers); if(access)headers.set('Authorization',`Bearer ${access}`);headers.set('X-Hadijam-CSRF','1');return fetch(input,{...init,headers,credentials:'include'});};
  let response=await run();
  let authFailure=response.status===401;
  if(!authFailure && response.headers.get('content-type')?.includes('application/json')) {try {const data=await response.clone().json();authFailure=data.errors?.some((e:any)=>e.extensions?.code==='UNAUTHENTICATED' || e.extensions?.originalError?.statusCode===401)??false;}catch{}}
  if(authFailure && access) {access=await ensureAccessToken(true);if(access)response=await run();}
  return response;
}

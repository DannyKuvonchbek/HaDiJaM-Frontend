import PrivateMediaLink from "@/libs/auth/PrivateMediaLink";
import { ensureAccessToken, getAccessToken } from "@/libs/auth";
import { authValue } from "@/libs/auth";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ATELIER_CHAT_HISTORY, GET_ATELIER_CONVERSATIONS } from "@/libs/graphql/ateliers";
import { uploadGraphqlFiles } from "@/libs/utils/uploadGraphqlFiles";
import type { AtelierDefinition } from "@/libs/data/ateliers";

const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702";
const socketUrl = base.replace(/^http/, "ws").replace(/\/$/, "") + "/atelier-chat";
const apiImage = (path?: string) => !path ? "" : /^(https?:|\/)/.test(path) ? path : `${base}/${path}`;
const isOpenNow = () => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday) && (hour > 9 || (hour === 9 && minute >= 0)) && hour < 20;
};

export default function AtelierChatPanel({ atelier, memberId, ownerId }: { atelier: AtelierDefinition; memberId: string; ownerId?: string }) {
  const isOwner = Boolean(memberId && ownerId && memberId === ownerId);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [connected, setConnected] = useState(false);
  const [openNow, setOpenNow] = useState(isOpenNow());
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [socketError, setSocketError] = useState("");
  const [socketVersion, setSocketVersion] = useState(0);
  const conversationsQuery = useQuery(GET_ATELIER_CONVERSATIONS, { variables: { atelier: atelier.slug }, skip: !isOwner, fetchPolicy: "network-only", pollInterval: isOwner ? 20000 : 0 });
  const conversations = conversationsQuery.data?.getAtelierConversations ?? [];
  const activeCustomerId = isOwner ? selectedCustomer : memberId;
  const historyQuery = useQuery(GET_ATELIER_CHAT_HISTORY, { variables: { atelier: atelier.slug, customerId: activeCustomerId, input: { page: 1, limit: 100 } }, skip: !memberId || !activeCustomerId, fetchPolicy: "network-only" });
  const messages = useMemo(() => historyQuery.data?.getAtelierChatMessages?.list ?? [], [historyQuery.data]);

  useEffect(() => { const timer = window.setInterval(() => setOpenNow(isOpenNow()), 30000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    setConnected(false); setSocketError("");
    const token = authValue("accessToken");
    if (!token || !memberId || !activeCustomerId) return;
    const socket = new WebSocket(socketUrl);
    let authenticatedToken = '', authPending: Promise<void> | undefined;
    let resolveAuth: (() => void) | undefined, rejectAuth: ((error: Error) => void) | undefined;
    let authTimeout: ReturnType<typeof setTimeout> | undefined;
    const authenticate = async () => {
      if (authPending) return authPending;
      const fresh = await ensureAccessToken();
      if (!fresh) { socket.close(); throw new Error('Please sign in again.'); }
      if (fresh === authenticatedToken) return;
      if (socket.readyState !== WebSocket.OPEN) throw new Error('Chat is disconnected.');
      authPending = new Promise<void>((resolve, reject) => { resolveAuth=resolve; rejectAuth=reject; authTimeout=setTimeout(()=>{reject(new Error('Chat authentication timed out.'));socket.close();},10000); });
      socket.send(JSON.stringify({ event: 'auth', data: { token:fresh, atelier:atelier.slug, customerId:isOwner?activeCustomerId:undefined } }));
      try { await authPending; authenticatedToken=fresh; } finally { clearTimeout(authTimeout); authPending=undefined; }
    };
    const refreshChat = () => { if(!getAccessToken()){socket.close();return;} if(socket.readyState===WebSocket.OPEN)void authenticate().catch(error=>setSocketError(error.message)); };
    socket.onopen = () => void authenticate().catch(error=>setSocketError(error.message));
    window.addEventListener('hadijam:token-updated',refreshChat);
    const sessionTimer=window.setInterval(refreshChat,30000);
    socket.onmessage = (event) => {
      try {
        const packet = JSON.parse(event.data); const data = packet?.data ?? packet;
        if (packet.event === "auth:success" || packet.event === "atelier:joined") { setConnected(true); resolveAuth?.(); }
        if (packet.event === "auth:error" || packet.event === "atelier:error") { setSocketError(data?.message ?? "The private chat connection could not be verified."); if(packet.event === "auth:error")rejectAuth?.(new Error("Chat authentication failed.")); }
        if (packet.event === "message:new") void historyQuery.refetch();
      } catch { setSocketError("The private chat returned an invalid response."); }
    };
    socket.onerror = () => setSocketError("The private chat connection is unavailable.");
    socket.onclose = () => { setConnected(false); rejectAuth?.(new Error("Chat is disconnected.")); };
    const send = (event: Event) => { const detail=(event as CustomEvent).detail;
      if(detail?.atelier!==atelier.slug||detail?.customerId!==activeCustomerId)return;
      void authenticate().then(()=>{if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({event:'message:send',data:{messageContent:detail.messageContent,attachments:detail.attachments??[]}}));}).catch(error=>setSocketError(error.message));
    };
    window.addEventListener("hadijam:atelier-send", send);
    return () => { clearInterval(sessionTimer); clearTimeout(authTimeout); window.removeEventListener("hadijam:token-updated",refreshChat); window.removeEventListener("hadijam:atelier-send", send); socket.close(); };
  }, [atelier.slug, memberId, activeCustomerId, isOwner, socketVersion]);

  const send = async () => {
    if (!openNow) return;
    const messageContent = text.trim(); if (!messageContent && !files.length) return;
    if (!connected) { setSocketError("Connecting to the atelier… Please try again in a moment."); return; }
    try {
      const attachments = files.length ? await uploadGraphqlFiles(files, "atelier") : [];
      window.dispatchEvent(new CustomEvent("hadijam:atelier-send", { detail: { atelier: atelier.slug, customerId: activeCustomerId, messageContent, attachments } }));
      setText(""); setFiles([]); await historyQuery.refetch();
    } catch (error) { setSocketError(error instanceof Error ? error.message : "Your message could not be sent."); }
  };

  return <section className="atelier-chat-card" aria-label={`Private chat with ${atelier.master}`}>
    <header className="atelier-chat-header"><img src={atelier.portrait} alt="" /><div><b>{isOwner ? "Atelier Private Inbox" : atelier.master}</b><span className={connected && openNow ? "online" : "offline"}>{openNow ? connected ? "Secure line connected" : "Connecting to private line…" : "Chat currently closed"}</span></div><span className="atelier-lock">⌑ PRIVATE</span></header>
    {isOwner ? <div className="atelier-conversation-list"><h3>Client conversations</h3>{conversationsQuery.loading && <p>Loading conversations…</p>}{!conversations.length && !conversationsQuery.loading && <p>New client conversations will appear here.</p>}{conversations.map((conversation: any) => <button className={selectedCustomer === conversation.customerId ? "selected" : ""} type="button" key={conversation.customerId} onClick={() => { setSelectedCustomer(conversation.customerId); setSocketVersion((version) => version + 1); }}><img src={apiImage(conversation.customerImage)} alt="" /><span><b>{conversation.customerNick || "Client"}</b><small>{conversation.lastMessage || "Open conversation"}</small></span>{conversation.unreadCount > 0 && <i>{conversation.unreadCount}</i>}</button>)}</div> : !memberId ? <div className="atelier-chat-gate"><span>🔒</span><h3>Private Atelier Line</h3><p>Sign in to begin a secure 1:1 conversation with the master.</p></div> : null}
    {memberId && (!isOwner || selectedCustomer) && <>
      <div className="atelier-chat-messages" aria-live="polite">{historyQuery.loading && !messages.length && <p className="atelier-muted">Loading conversation…</p>}{!messages.length && !historyQuery.loading && <p className="atelier-chat-welcome">Welcome to {atelier.name}. Send a private message to begin your consultation.</p>}{messages.map((message: any) => <article className={message.senderId === memberId ? "mine" : "theirs"} key={message._id}><small>{message.senderId === memberId ? "You" : message.senderNick} · {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "numeric", minute: "2-digit" }).format(new Date(message.createdAt))} KST</small>{message.messageContent && <p>{message.messageContent}</p>}{message.attachments?.map((file: string) => <PrivateMediaLink path={file} key={file}>View attached image ↗</PrivateMediaLink>)}</article>)}</div>
      {!openNow && <button type="button" className="atelier-chat-closed" onClick={() => setSocketError(`Our atelier chat is available ${atelier.hours}. Please reconnect during our next business hours.`)}><b>Private chat is closed</b><span>Tap for business hours</span></button>}
      <div className="atelier-chat-compose"><label className="atelier-attach" title="Attach images">＋<input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple disabled={!openNow} onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={openNow ? "Write a private message…" : "Chat is outside business hours"} disabled={!openNow} /><button type="button" onClick={() => void send()} disabled={!openNow || (!text.trim() && !files.length)}>➤</button></div>
      {files.length > 0 && <p className="atelier-attachment-list">{files.map((file) => file.name).join(", ")} <button type="button" onClick={() => setFiles([])}>Remove</button></p>}
    </>}
    <footer className="atelier-chat-footer"><span>Encrypted private atelier conversation</span><span>Mon–Fri · 9 AM–8 PM KST</span></footer>
    {socketError && <p className="atelier-chat-notice" role="status">{socketError}</p>}
  </section>;
}

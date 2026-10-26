import PrivateMediaLink from "@/libs/auth/PrivateMediaLink";
import { ensureAccessToken } from "@/libs/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ATELIER_CHAT_HISTORY, GET_ATELIER_CONVERSATIONS } from "@/libs/graphql/ateliers";
import { uploadGraphqlFiles } from "@/libs/utils/uploadGraphqlFiles";
import type { AtelierDefinition } from "@/libs/data/ateliers";

const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1997";
const socketUrl = base.replace(/^http/, "ws").replace(/\/$/, "") + "/atelier-chat";
const apiImage = (path?: string) => !path ? "" : /^(https?:|\/)/.test(path) ? path : `${base}/${path}`;


export default function AtelierChatPanel({ atelier, memberId, ownerId }: { atelier: AtelierDefinition; memberId: string; ownerId?: string }) {
  const isOwner = Boolean(memberId && ownerId && memberId === ownerId);
  const ownerResolved = Boolean(ownerId);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [socketError, setSocketError] = useState("");
  const [socketVersion, setSocketVersion] = useState(0);
  const reconnectAttempts = useRef(0);
  const conversationsQuery = useQuery(GET_ATELIER_CONVERSATIONS, { variables: { atelier: atelier.slug }, skip: !isOwner, fetchPolicy: "network-only", pollInterval: isOwner ? 20000 : 0 });
  const conversations = conversationsQuery.data?.getAtelierConversations ?? [];
  const activeCustomerId = ownerResolved ? (isOwner ? selectedCustomer : memberId) : "";
  const historyQuery = useQuery(GET_ATELIER_CHAT_HISTORY, { variables: { atelier: atelier.slug, customerId: activeCustomerId, input: { page: 1, limit: 100 } }, skip: !memberId || !ownerId || !activeCustomerId, fetchPolicy: "network-only" });
  const messages = useMemo(() => historyQuery.data?.getAtelierChatMessages?.list ?? [], [historyQuery.data]);

  useEffect(() => {
    setConnected(false); setSocketError("");
    if (!memberId || !ownerId || !activeCustomerId) return;
    const socket = new WebSocket(socketUrl);
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let authRejected = false;
    let authenticatedToken = '', authPending: Promise<void> | undefined;
    let resolveAuth: (() => void) | undefined, rejectAuth: ((error: Error) => void) | undefined;
    let authTimeout: ReturnType<typeof setTimeout> | undefined;
    const authenticate = async () => {
      if (authPending) return authPending;
      const fresh = await ensureAccessToken();
      if (disposed) return;
      if (!fresh) { socket.close(); throw new Error('Please sign in again.'); }
      if (fresh === authenticatedToken) return;
      if (socket.readyState !== WebSocket.OPEN) throw new Error('Chat is disconnected.');
      authPending = new Promise<void>((resolve, reject) => { resolveAuth=resolve; rejectAuth=reject; authTimeout=setTimeout(()=>{reject(new Error('Chat authentication timed out.'));socket.close();},10000); });
      socket.send(JSON.stringify({ event: 'auth', data: { token:fresh, atelier:atelier.slug, customerId:isOwner?activeCustomerId:undefined } }));
      try { await authPending; authenticatedToken=fresh; } finally { clearTimeout(authTimeout); authPending=undefined; }
    };
    const refreshChat = () => { if(socket.readyState===WebSocket.OPEN)void authenticate().catch(error=>{ if (!disposed) setSocketError(error.message); }); };
    socket.onopen = () => void authenticate().catch(error=>{ if (!disposed) setSocketError(error.message); });
    window.addEventListener('hadijam:token-updated',refreshChat);
    const sessionTimer=window.setInterval(refreshChat,30000);
    socket.onmessage = (event) => {
      if (disposed) return;
      try {
        const packet = JSON.parse(event.data); const data = packet?.data ?? packet;
        if (packet.event === "auth:success" || packet.event === "atelier:joined") { setConnected(true); setSocketError(""); reconnectAttempts.current = 0; resolveAuth?.(); }
        if (packet.event === "auth:error" || packet.event === "atelier:error") { setSocketError(data?.message ?? "The private chat connection could not be verified."); if(packet.event === "auth:error") { authRejected = true; setConnected(false); rejectAuth?.(new Error(data?.message ?? "Chat authentication failed.")); } }
        if (packet.event === "message:new") void historyQuery.refetch();
      } catch { setSocketError("The private chat returned an invalid response."); }
    };
    socket.onerror = () => { if (!disposed) setSocketError("The private chat connection is unavailable."); };
    socket.onclose = () => {
      if (disposed) return;
      setConnected(false); rejectAuth?.(new Error("Chat is disconnected."));
      if (!authRejected && reconnectAttempts.current < 3) {
        const delay = 1000 * 2 ** reconnectAttempts.current++;
        setSocketError("Chat disconnected. Reconnecting…");
        retryTimer = setTimeout(() => setSocketVersion(version => version + 1), delay);
      } else if (!authRejected) setSocketError("Chat is disconnected. Please retry the connection.");
    };
    const send = (event: Event) => { const detail=(event as CustomEvent).detail;
      if(detail?.atelier!==atelier.slug||detail?.customerId!==activeCustomerId)return;
      void authenticate().then(()=>{if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({event:'message:send',data:{messageContent:detail.messageContent,attachments:detail.attachments??[]}}));}).catch(error=>{ if (!disposed) setSocketError(error.message); });
    };
    window.addEventListener("hadijam:atelier-send", send);
    return () => { disposed = true; clearTimeout(retryTimer); socket.onmessage = null; socket.onerror = null; socket.onclose = null; rejectAuth?.(new Error("Chat connection changed.")); clearInterval(sessionTimer); clearTimeout(authTimeout); window.removeEventListener("hadijam:token-updated",refreshChat); window.removeEventListener("hadijam:atelier-send", send); socket.close(); };
  }, [atelier.slug, memberId, ownerId, activeCustomerId, isOwner, socketVersion]);

  const send = async () => {
    const messageContent = text.trim(); if (!messageContent && !files.length) return;
    if (!connected) return;
    try {
      const attachments = files.length ? await uploadGraphqlFiles(files, "atelier") : [];
      window.dispatchEvent(new CustomEvent("hadijam:atelier-send", { detail: { atelier: atelier.slug, customerId: activeCustomerId, messageContent, attachments } }));
      setText(""); setFiles([]); await historyQuery.refetch();
    } catch (error) { setSocketError(error instanceof Error ? error.message : "Your message could not be sent."); }
  };

  return <section className="atelier-chat-card" aria-label={`Private chat with ${atelier.master}`}>
    <header className="atelier-chat-header"><img src={atelier.portrait} alt="" /><div><b>{isOwner ? "Atelier Private Inbox" : atelier.master}</b><span className={connected ? "online" : "offline"}>{connected ? "Secure line connected" : "Connecting to private line…"}</span></div><span className="atelier-lock">⌑ PRIVATE</span></header>
    {isOwner ? <div className="atelier-conversation-list"><h3>Client conversations</h3>{conversationsQuery.loading && <p>Loading conversations…</p>}{!conversations.length && !conversationsQuery.loading && <p>New client conversations will appear here.</p>}{conversations.map((conversation: any) => <button className={selectedCustomer === conversation.customerId ? "selected" : ""} type="button" key={conversation.customerId} onClick={() => { setSelectedCustomer(conversation.customerId); setSocketVersion((version) => version + 1); }}><img src={apiImage(conversation.customerImage)} alt="" /><span><b>{conversation.customerNick || "Client"}</b><small>{conversation.lastMessage || "Open conversation"}</small></span>{conversation.unreadCount > 0 && <i>{conversation.unreadCount}</i>}</button>)}</div> : !memberId ? <div className="atelier-chat-gate"><span>🔒</span><h3>Private Atelier Line</h3><p>Sign in to begin a secure 1:1 conversation with the master.</p></div> : null}
    {memberId && !ownerResolved && <p className="atelier-muted">Waiting for the atelier profile…</p>}
    {memberId && ownerResolved && (!isOwner || selectedCustomer) && <>
      <div className="atelier-chat-messages" aria-live="polite">{historyQuery.loading && !messages.length && <p className="atelier-muted">Loading conversation…</p>}{!messages.length && !historyQuery.loading && <p className="atelier-chat-welcome">Welcome to {atelier.name}. Send a private message to begin your consultation.</p>}{messages.map((message: any) => <article className={message.senderId === memberId ? "mine" : "theirs"} key={message._id}><small>{message.senderId === memberId ? "You" : message.senderNick} · {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "numeric", minute: "2-digit" }).format(new Date(message.createdAt))} KST</small>{message.messageContent && <p>{message.messageContent}</p>}{message.attachments?.map((file: string) => <PrivateMediaLink path={file} key={file}>View attached image ↗</PrivateMediaLink>)}</article>)}</div>
      <div className="atelier-chat-compose"><label className="atelier-attach" title="Attach images">＋<input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Write a private message…" /><button type="button" onClick={() => void send()} disabled={!connected || (!text.trim() && !files.length)}>➤</button></div>
      {files.length > 0 && <p className="atelier-attachment-list">{files.map((file) => file.name).join(", ")} <button type="button" onClick={() => setFiles([])}>Remove</button></p>}
    </>}
    <footer className="atelier-chat-footer"><span>Encrypted private atelier conversation</span><span>Message anytime</span></footer>
    {memberId && ownerResolved && activeCustomerId && !connected && <button type="button" className="atelier-button" onClick={() => { reconnectAttempts.current = 0; setSocketVersion(version => version + 1); }}>Reconnect chat</button>}
    {socketError && <p className="atelier-chat-notice" role="status">{socketError}</p>}
  </section>;
}

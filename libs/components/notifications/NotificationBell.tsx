import { useMutation, useQuery } from '@apollo/client';
import { Badge, IconButton, Popover } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useEffect, useRef, useState } from 'react';
import { ensureAccessToken } from '@/libs/auth';
import { GET_MY_NOTIFICATIONS, MARK_MY_NOTIFICATION_READ } from '@/libs/graphql/myPage';
import { NOTIFICATIONS_REFRESH_EVENT } from './notificationEvents';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:1997';
const socketUrl = apiBase.replace(/^http/, 'ws').replace(/\/$/, '') + '/notifications';

type Props = { enabled: boolean; memberId: string };
export default function NotificationBell({ enabled, memberId }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [optimisticallyRead, setOptimisticallyRead] = useState<Set<string>>(() => new Set());
  const [markingId, setMarkingId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { data, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { input: { page: 1, limit: 20 } }, skip: !enabled || !memberId,
    // WebSocket events and booking-success events refresh immediately; polling
    // is a fallback for proxies that do not forward the notification socket.
    fetchPolicy: 'network-only', pollInterval: enabled && memberId ? 5_000 : 0,
  });
  const [markRead] = useMutation(MARK_MY_NOTIFICATION_READ);
  const result = data?.getMyNotifications;

  useEffect(() => {
    if (!enabled || !memberId) return;
    let alive = true, retryTimer: ReturnType<typeof setTimeout> | undefined, heartbeat: ReturnType<typeof setInterval> | undefined;
    let retryDelay = 1000;
    const connect = async () => {
      const token = await ensureAccessToken().catch(() => '');
      if (!alive || !token) return;
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;
      socket.onopen = () => {
        retryDelay = 1000;
        socket.send(JSON.stringify({ event: 'auth', data: { token } }));
        heartbeat = setInterval(() => {
          if (socket.readyState !== WebSocket.OPEN) return;
          void ensureAccessToken().then((fresh) => {
            if (fresh && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ event: 'auth', data: { token: fresh } }));
          }).catch(() => undefined);
        }, 120_000);
      };
      socket.onmessage = (event) => {
        try { if (JSON.parse(event.data)?.event === 'notification:new') void refetch(); } catch { /* Ignore malformed packets. */ }
      };
      socket.onclose = () => {
        if (heartbeat) clearInterval(heartbeat);
        if (alive) { retryTimer = setTimeout(() => { void connect(); retryDelay = Math.min(retryDelay * 2, 30_000); }, retryDelay); }
      };
      socket.onerror = () => socket.close();
    };
    void connect();
    const refreshAuth = () => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      void ensureAccessToken().then((token) => {
        if (token && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ event: 'auth', data: { token } }));
      }).catch(() => undefined);
    };
    window.addEventListener('hadijam:token-updated', refreshAuth);
    window.addEventListener('hadijam:auth-updated', refreshAuth);
    return () => {
      alive = false; if (retryTimer) clearTimeout(retryTimer); if (heartbeat) clearInterval(heartbeat);
      window.removeEventListener('hadijam:token-updated', refreshAuth); window.removeEventListener('hadijam:auth-updated', refreshAuth);
      socketRef.current?.close(); socketRef.current = null;
    };
  }, [enabled, memberId, refetch]);

  useEffect(() => {
    if (!enabled || !memberId) return;
    const refresh = () => { void refetch(); };
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, refresh);
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, refresh);
  }, [enabled, memberId, refetch]);

  if (!enabled || !memberId) return null;
  const notifications = result?.list ?? [];
  const count = Math.max(0, Number(result?.unreadCount ?? 0) - notifications.filter((item: any) => item.notificationStatus === 'UNREAD' && optimisticallyRead.has(item._id)).length);
  const open = Boolean(anchor);
  const onNotification = async (notification: any) => {
    if (notification.notificationStatus === 'READ' || optimisticallyRead.has(notification._id) || markingId === notification._id) return;
    setOptimisticallyRead((current) => new Set(current).add(notification._id));
    setMarkingId(notification._id);
    try {
      await markRead({ variables: { notificationId: notification._id } });
      await refetch();
    } catch {
      setOptimisticallyRead((current) => { const next = new Set(current); next.delete(notification._id); return next; });
    } finally {
      setMarkingId(null);
    }
  };
  return <>
    <IconButton aria-label={`Notifications${count ? `, ${count} unread` : ''}`} title="Notifications" onClick={(event) => { setAnchor(event.currentTarget); void refetch(); }}>
      <Badge badgeContent={count} color="primary" max={99}><NotificationsNoneOutlinedIcon /></Badge>
    </IconButton>
    <Popover open={open} anchorEl={anchor} onClose={() => setAnchor(null)} PaperProps={{ className: "notification-popover-paper" }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <section className="notification-popover" aria-label="Notifications">
        <header><div><span>YOUR ACCOUNT</span><h2>Notifications</h2></div><b>{count} unread</b></header>
        {!notifications.length ? <p className="notification-empty">You’re all caught up.</p> : <div className="notification-list">{notifications.map((item: any) => {
          const unread = item.notificationStatus === 'UNREAD' && !optimisticallyRead.has(item._id);
          return <button type="button" key={item._id} className={`notification-item ${unread ? 'unread' : 'read'}`} aria-label={`${item.notificationTitle}, ${unread ? 'unread' : 'read'}`} aria-busy={markingId === item._id} onClick={() => void onNotification(item)}><span className="notification-mark" aria-hidden="true" /> <span className="notification-copy"><strong>{item.notificationTitle}</strong><small>{item.notificationDesc}</small><time>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</time></span><span className="notification-status">{unread ? 'NEW' : 'READ'}</span></button>;
        })}</div>}
      </section>
    </Popover>
  </>;
}

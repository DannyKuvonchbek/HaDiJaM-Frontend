import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_NOTIFICATIONS, MARK_MY_NOTIFICATION_READ } from '@/libs/graphql/myPage';

export default function AccountMessagesPanel({ onUpdate }: { onUpdate?: () => void }) {
	const { data, loading, error, refetch } = useQuery(GET_MY_NOTIFICATIONS, { variables: { input: { page: 1, limit: 50 } }, fetchPolicy: 'network-only', pollInterval: 15000 });
	const [markRead, { loading: marking }] = useMutation(MARK_MY_NOTIFICATION_READ);
	const messages = data?.getMyNotifications?.list ?? [];
	const handleRead = async (id: string) => {
		try { await markRead({ variables: { notificationId: id } }); await refetch(); onUpdate?.(); } catch { /* Keep the message visible if the server rejects the update. */ }
	};
	return <section className="account-messages-panel">
		<header><div><span className="account-panel-eyebrow">ACCOUNT INBOX</span><h2>Messages</h2><p>Application decisions and updates from the HaDiJaM team.</p></div></header>
		{loading && <p className="account-messages-state">Loading your messages…</p>}
		{error && <p className="account-messages-state error" role="alert">{error.message}</p>}
		{!loading && !error && messages.length === 0 && <p className="account-messages-state">You don’t have any messages yet.</p>}
		<div className="account-message-list">{messages.map((item: any) => <article key={item._id} className={`account-message-card ${item.notificationStatus === 'UNREAD' ? 'unread' : ''}`}>
			<div className="account-message-heading"><span className="material-symbols-outlined">{item.notificationStatus === 'UNREAD' ? 'mark_email_unread' : 'drafts'}</span><div><h3>{item.notificationTitle}</h3><time>{new Date(item.createdAt).toLocaleString()}</time></div>{item.notificationStatus === 'UNREAD' && <b>NEW</b>}</div>
			<p>{item.notificationDesc}</p>
			{item.notificationStatus === 'UNREAD' && <button type="button" disabled={marking} onClick={() => void handleRead(item._id)}>{marking ? 'Saving…' : 'Mark as read'}</button>}
		</article>)}</div>
	</section>;
}

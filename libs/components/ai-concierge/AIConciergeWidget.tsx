import { authValue } from "@/libs/auth";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLazyQuery, useMutation } from '@apollo/client';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useLocale } from '@/libs/utils/LocaleProvider';
import { GET_MY_AI_CONVERSATION_MESSAGES, GET_MY_AI_CONVERSATIONS, SEND_AI_CONCIERGE_MESSAGE } from '@/libs/graphql/ai';
import AIConciergeLauncher from './AIConciergeLauncher';
import AIConciergeProductCard, { type ConciergeProduct } from './AIConciergeProductCard';
import { conciergeText, localeEnum } from './translations';

type ChatMessage = { role: 'USER' | 'ASSISTANT'; content: string; id: string; action?: { label: string; href: string } };
type SavedConversation = { _id: string; conversationTitle: string; lastMessageAt: string };

export default function AIConciergeWidget() {
	const { locale } = useLocale();
	const t = (key: string) => conciergeText(locale, key);
	const [open, setOpen] = useState(false);
	const [signedIn, setSignedIn] = useState(false);
	const [conversationId, setConversationId] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [suggestions, setSuggestions] = useState<ConciergeProduct[]>([]);
	const [text, setText] = useState('');
	const [notice, setNotice] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);
	const activeTokenRef = useRef<string | null>(null);
	const [loadConversations, conversationsQuery] = useLazyQuery(GET_MY_AI_CONVERSATIONS, { fetchPolicy: 'network-only' });
	const [loadMessages] = useLazyQuery(GET_MY_AI_CONVERSATION_MESSAGES, { fetchPolicy: 'network-only' });
	const [sendMessage, sendState] = useMutation(SEND_AI_CONCIERGE_MESSAGE);
	const conversations: SavedConversation[] = conversationsQuery.data?.getMyAIConversations ?? [];

	useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, suggestions, sendState.loading]);

	const openWidget = async () => {
		setOpen(true);
		setNotice('');
		const token = authValue("accessToken");
		const authenticated = Boolean(token);
		setSignedIn(authenticated);
		const identityChanged = activeTokenRef.current !== token;
		if (identityChanged) {
			activeTokenRef.current = token;
			setConversationId('');
			setMessages([]);
			setSuggestions([]);
		}
		if (authenticated && (identityChanged || (!conversationId && messages.length === 0))) {
			try {
				const result = await loadConversations();
				const latest = (result.data?.getMyAIConversations ?? [])[0] as SavedConversation | undefined;
				if (latest) {
					const history = await loadMessages({ variables: { conversationId: latest._id } });
					setConversationId(latest._id);
					setMessages((history.data?.getMyAIConversationMessages ?? []).map((m: any) => ({ id: m._id, role: m.role, content: m.content, action: m.action ?? undefined })));
				}
			} catch { setNotice(t('unavailable')); }
		}
	};

	const selectConversation = async (id: string) => {
		if (!id) return;
		try {
			const history = await loadMessages({ variables: { conversationId: id } });
			setConversationId(id);
			setMessages((history.data?.getMyAIConversationMessages ?? []).map((m: any) => ({ id: m._id, role: m.role, content: m.content, action: m.action ?? undefined })));
			setSuggestions([]);
			setNotice('');
		} catch { setNotice(t('unavailable')); }
	};

	const startNew = () => { setConversationId(''); setMessages([]); setSuggestions([]); setNotice(''); };
	const send = async () => {
		const message = text.trim();
		if (!message || sendState.loading) return;
		setText('');
		setNotice('');
		setMessages((current) => [...current, { id: `local-${Date.now()}`, role: 'USER', content: message }]);
		try {
			const result = await sendMessage({ variables: { input: { message, conversationId: conversationId || null, locale: localeEnum(locale) } } });
			const reply = result.data?.sendAIConciergeMessage;
			if (!reply) throw new Error(t('unavailable'));
			setConversationId(reply.conversationId ?? '');
			setMessages((current) => [...current, { id: `reply-${Date.now()}`, role: 'ASSISTANT', content: reply.answer, action: reply.action ?? undefined }]);
			setSuggestions(reply.recommendedProducts ?? []);
			if (signedIn) void loadConversations();
		} catch (error) {
			const detail = error instanceof Error ? error.message : '';
			if (/not configured/i.test(detail)) setNotice(t('config'));
			else if (/authentication failed|\b401\b/i.test(detail)) setNotice(t('authError'));
			else if (/quota|insufficient_quota/i.test(detail)) setNotice(t('quotaError'));
			else if (/rate limit|\b429\b/i.test(detail)) setNotice(t('rateError'));
			else if (/model is unavailable|model_not_found/i.test(detail)) setNotice(t('modelError'));
			else setNotice(t('unavailable'));
		}
	};
	const submit = (event: FormEvent) => { event.preventDefault(); void send(); };

	return <>
		{!open && <AIConciergeLauncher locale={locale} onClick={() => void openWidget()} />}
		{open && <div className="ai-concierge-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
			<section className="ai-concierge-panel" role="dialog" aria-modal="true" aria-label={t('title')}>
				<header className="ai-concierge-header"><span className="ai-concierge-mark"><AutoAwesomeRoundedIcon /></span><div><h2>{t('title')}</h2><p>{t('subtitle')}</p></div>{signedIn && <button type="button" className="ai-concierge-new" onClick={startNew} title={t('newChat')}><AddRoundedIcon /></button>}<button type="button" className="ai-concierge-close" onClick={() => setOpen(false)} aria-label={t('close')}><CloseRoundedIcon /></button></header>
				{signedIn && conversations.length > 0 && <div className="ai-concierge-history"><label>{t('history')}<select value={conversationId} onChange={(event) => void selectConversation(event.target.value)}><option value="">{t('newChat')}</option>{conversations.map((conversation) => <option key={conversation._id} value={conversation._id}>{conversation.conversationTitle}</option>)}</select></label></div>}
				<div className="ai-concierge-messages" ref={scrollRef} aria-live="polite">{messages.length === 0 && <div className="ai-concierge-welcome"><span className="ai-concierge-mark"><AutoAwesomeRoundedIcon /></span><p>{t('welcome')}</p></div>}{messages.map((message) => <article className={`ai-concierge-message ${message.role.toLowerCase()}`} key={message.id}>{message.role === 'ASSISTANT' && <span className="ai-concierge-mini-mark"><AutoAwesomeRoundedIcon /></span>}<div className="ai-concierge-message-content"><p>{message.content}</p>{message.action && <Link className="ai-concierge-action" href={message.action.href}>{message.action.label}<span aria-hidden="true">↗</span></Link>}</div></article>)}{sendState.loading && <div className="ai-concierge-thinking"><i /><i /><i /></div>}{suggestions.length > 0 && <section className="ai-concierge-suggestions"><h3>{t('products')}</h3>{suggestions.map((product) => <AIConciergeProductCard key={product._id} product={product} />)}</section>}{notice && <p className="ai-concierge-notice" role="status">{notice}</p>}</div>
				{!signedIn && <p className="ai-concierge-guest-note">{t('guest')}</p>}
				<form className="ai-concierge-composer" onSubmit={submit}><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={t('placeholder')} rows={1} maxLength={2000} /><button type="submit" disabled={!text.trim() || sendState.loading} aria-label={t('send')}><SendRoundedIcon /></button></form>
			</section>
		</div>}
	</>;
}

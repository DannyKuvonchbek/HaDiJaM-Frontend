import { useState } from 'react';
import AtelierChatPanel from './AtelierChatPanel';
import { ATELIERS } from '@/libs/data/ateliers';

export default function AtelierSellerInbox({ memberId }: { memberId: string }) {
	const [slug, setSlug] = useState(ATELIERS[0].slug);
	const atelier = ATELIERS.find((item) => item.slug === slug) ?? ATELIERS[0];
	return <section className="account-panel atelier-seller-inbox">
		<header><div><span className="eyebrow">PRIVATE CLIENT CONVERSATIONS</span><h2>Atelier Inbox</h2><p>Reply to each client in a separate, private conversation.</p></div><label>Atelier<select value={slug} onChange={(event) => setSlug(event.target.value as typeof slug)}>{ATELIERS.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label></header>
		<AtelierChatPanel key={atelier.slug} atelier={atelier} memberId={memberId} ownerId={memberId} />
	</section>;
}

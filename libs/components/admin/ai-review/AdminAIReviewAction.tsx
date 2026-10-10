import { useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { ANALYZE_PRODUCT_WITH_AI, GET_AI_PRODUCT_REVIEW } from '@/libs/graphql/ai';

type Review = { riskLevel: 'LOW' | 'REVIEW' | 'HIGH'; findings: string[]; analysisSummary: string; sellerMessageDraft: string; provider: string; model: string; updatedAt: string };
type Props = { productId: string; productTitle: string; onUseDraft: (draft: string) => void };

export default function AdminAIReviewAction({ productId, productTitle, onUseDraft }: Props) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [review, setReview] = useState<Review | null>(null);
	const [loadReview, query] = useLazyQuery(GET_AI_PRODUCT_REVIEW, { fetchPolicy: 'network-only' });
	const [analyze, mutation] = useMutation(ANALYZE_PRODUCT_WITH_AI);
	const openReview = async () => {
		setOpen(true); setError(''); setReview(null);
		try { const result = await loadReview({ variables: { productId } }); setReview(result.data?.getAIProductReview ?? null); }
		catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load the saved AI review.'); }
	};
	const runAnalysis = async () => {
		setError('');
		try { const result = await analyze({ variables: { input: { productId } } }); setReview(result.data?.analyzeProductWithAI ?? null); }
		catch (reason) { setError(reason instanceof Error ? reason.message.replace(/^GraphQL error:\s*/i, '') : 'AI analysis is unavailable.'); }
	};
	return <>
		<button type="button" className="admin-ai-review-trigger" onClick={() => void openReview()}><AutoAwesomeRoundedIcon /> Analyze with AI</button>
		{open && <div className="admin-ai-review-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="admin-ai-review-dialog" role="dialog" aria-modal="true" aria-labelledby={`ai-review-${productId}`}>
			<button type="button" className="admin-ai-review-close" onClick={() => setOpen(false)} aria-label="Close AI review">×</button>
			<span className="admin-ai-review-eyebrow"><AutoAwesomeRoundedIcon /> ADMIN ASSISTANT · HUMAN REVIEW REQUIRED</span><h2 id={`ai-review-${productId}`}>Listing review</h2><p className="admin-ai-review-product">{productTitle}</p>
			{query.loading && <p className="admin-ai-review-state">Loading saved review…</p>}
			{!review && !query.loading && <div className="admin-ai-review-intro"><p>AI can compare the listing text and product image for inconsistencies. Its findings are guidance only; it cannot block a listing or contact the seller.</p><button type="button" onClick={() => void runAnalysis()} disabled={mutation.loading}><AutoAwesomeRoundedIcon /> {mutation.loading ? 'Analyzing listing…' : 'Analyze listing'}</button></div>}
			{error && <p className="admin-ai-review-error" role="alert">{/not configured/i.test(error) ? 'AI provider is not configured yet. Choose a provider and add its server-side credentials to enable analysis.' : error}</p>}
			{review && <><div className="admin-ai-review-result"><span className={`admin-ai-risk ${review.riskLevel.toLowerCase()}`}>{review.riskLevel} RISK</span><p>{review.analysisSummary}</p>{review.findings.length > 0 && <ul>{review.findings.map((finding, index) => <li key={`${index}-${finding}`}>{finding}</li>)}</ul>}<small>{review.provider} · {review.model} · {new Date(review.updatedAt).toLocaleString()}</small></div><label className="admin-ai-review-draft">Seller message draft<textarea rows={7} value={review.sellerMessageDraft} readOnly /></label><div className="admin-ai-review-actions"><button type="button" className="secondary" onClick={() => void runAnalysis()} disabled={mutation.loading}>{mutation.loading ? 'Analyzing…' : 'Run again'}</button><button type="button" className="primary" onClick={() => { onUseDraft(review.sellerMessageDraft); setOpen(false); }}>Review &amp; send message</button></div></>}
		</section></div>}
	</>;
}

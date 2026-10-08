import Link from 'next/link';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import type { AccountOrder } from '@/libs/types/account';
import { accountApiBase, accountOrderProgress, accountOrderSteps, formatAccountDate, formatAccountStatus } from '@/libs/utils/account';
import { formatPrice } from '@/libs/utils/currency';
import { useUsdUzsRate } from '@/libs/utils/CurrencyProvider';

export default function AccountOrdersPanel({ orders, loading, error, onDetails }: { orders: AccountOrder[]; loading: boolean; error?: string; onDetails: (order: AccountOrder) => void }) {
	const usdUzsRate = useUsdUzsRate();
	return <section className="account-orders" role="tabpanel">{loading ? <p className="account-empty">Loading your orders…</p> : error ? <p className="account-feedback error" role="alert">{error}</p> : orders.length ? orders.map((order) => {
		const item = order.items[0];
		const progress = accountOrderProgress(order.orderStatus);
		const cancelled = ['CANCELLED', 'FAILED'].includes(order.orderStatus.toUpperCase());
		return <article className="account-order-card" key={order._id}><div className="account-order-top"><div className="account-order-piece">{item?.productImages?.[0] ? <img src={`${accountApiBase}/${item.productImages[0]}`} alt="" /> : <span className="material-symbols-outlined">diamond</span>}<div><span className="account-order-meta">ESCROW #{order._id.slice(-8).toUpperCase()} <i>·</i> {formatAccountDate(order.createdAt)}</span><h3>{item?.productTitle || 'HaDiJaM marketplace order'}</h3><p>{item ? `${formatAccountStatus(item.productType)} · ${item.quantity} item${item.quantity === 1 ? '' : 's'}` : formatAccountStatus(order.paymentMethod)}</p></div></div><div className="account-order-price"><b>{formatPrice(order.orderPrice, usdUzsRate)}</b><span className={`account-status-pill ${order.orderStatus.toLowerCase()}`}><i />{formatAccountStatus(order.orderStatus)}</span></div></div><div className="account-order-progress"><div className="account-progress-summary"><span>{item ? 'Order Progress:' : 'Service Progress:'}</span><strong>{formatAccountStatus(order.orderStatus)}</strong></div><div className="account-progress-track"><i style={{ width: `${cancelled ? 0 : (progress / (accountOrderSteps.length - 1)) * 100}%` }} /></div><div className="account-progress-labels">{accountOrderSteps.map((step, index) => <span className={index <= progress && !cancelled ? 'done' : ''} key={step}>{index + 1}. {step}</span>)}</div></div><div className="account-order-bottom"><span><VerifiedUserOutlinedIcon /> Escrow Guarantee: {order.paymentStatus === 'PAID' ? 'Payment confirmed' : `Payment ${formatAccountStatus(order.paymentStatus)}; protected until confirmation`}</span><button type="button" onClick={() => onDetails(order)}><VisibilityOutlinedIcon /> Order Details &amp; Proof of Custody</button></div></article>;
	}) : <div className="account-empty"><span className="material-symbols-outlined">inventory_2</span><h3>Your order history is clear.</h3><p>When you place an order, its status will appear here.</p><Link className="button button-gold" href="/catalog">Explore the marketplace <span>↗</span></Link></div>}</section>;
}

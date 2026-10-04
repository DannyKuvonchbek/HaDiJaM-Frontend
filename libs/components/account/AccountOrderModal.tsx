import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { AccountOrder } from '@/libs/types/account';
import { formatAccountDate, formatAccountStatus } from '@/libs/utils/account';
import { formatPrice } from '@/libs/data/catalog';

export default function AccountOrderModal({ order, phone, onClose }: { order: AccountOrder; phone?: string; onClose: () => void }) {
	return <div className="account-order-modal-backdrop" role="presentation" onClick={onClose}><section className="account-order-modal" role="dialog" aria-modal="true" aria-labelledby="account-order-modal-title" onClick={(event) => event.stopPropagation()}><button type="button" className="account-order-modal-close" aria-label="Close order details" onClick={onClose}><CloseRoundedIcon /></button><span className="eyebrow">PROOF OF CUSTODY</span><h2 id="account-order-modal-title">Escrow #{order._id.slice(-8).toUpperCase()}</h2><p className="account-order-modal-status">{formatAccountStatus(order.orderStatus)} · {formatAccountDate(order.createdAt)}</p><dl><div><dt>Payment status</dt><dd>{formatAccountStatus(order.paymentStatus)}</dd></div><div><dt>Payment method</dt><dd>{formatAccountStatus(order.paymentMethod)}</dd></div><div><dt>Delivery address</dt><dd>{order.deliveryAddress || 'No delivery address recorded'}</dd></div><div><dt>Contact phone</dt><dd>{order.deliveryPhone || phone || 'No phone number recorded'}</dd></div><div><dt>Order total</dt><dd>{formatPrice(order.orderPrice)}</dd></div></dl></section></div>;
}

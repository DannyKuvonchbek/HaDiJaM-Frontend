import { productImageUrl } from "@/libs/utils/productImage";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { AccountOrder } from '@/libs/types/account';
import { formatAccountDate, formatAccountStatus } from '@/libs/utils/account';
import { formatPrice } from '@/libs/utils/currency';
import { useUsdUzsRate } from '@/libs/utils/CurrencyProvider';

export default function AccountOrderModal({ order, phone, onClose }: { order: AccountOrder; phone?: string; onClose: () => void }) {
	const usdUzsRate = useUsdUzsRate();
	const buyerName = order.memberData?.memberFullName?.trim() || order.memberData?.memberNick?.trim() || 'Buyer';
	return <div className="account-order-modal-backdrop" role="presentation" onClick={onClose}><section className="account-order-modal" role="dialog" aria-modal="true" aria-labelledby="account-order-modal-title" onClick={(event) => event.stopPropagation()}><button type="button" className="account-order-modal-close" aria-label="Close order details" onClick={onClose}><CloseRoundedIcon /></button><span className="eyebrow">PROOF OF CUSTODY</span><h2 id="account-order-modal-title">{buyerName}</h2><p className="account-order-modal-status">{formatAccountStatus(order.orderStatus)} · {formatAccountDate(order.createdAt)}</p><div className="account-order-items">{order.items.map((item) => <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0" }}>{item.productImages?.[0] ? <img src={productImageUrl(item.productImages[0])} alt={item.productTitle} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} /> : <span className="material-symbols-outlined">diamond</span>}<div><h4>{item.productTitle}</h4><p>{item.quantity} × {formatPrice(item.unitPrice, usdUzsRate)}</p></div></div>)}</div><dl><div><dt>Payment status</dt><dd>{formatAccountStatus(order.paymentStatus)}</dd></div><div><dt>Payment method</dt><dd>{formatAccountStatus(order.paymentMethod)}</dd></div><div><dt>Delivery address</dt><dd>{order.deliveryAddress || 'No delivery address recorded'}</dd></div><div><dt>Contact phone</dt><dd>{order.deliveryPhone || phone || 'No phone number recorded'}</dd></div><div><dt>Order total</dt><dd>{formatPrice(order.orderPrice, usdUzsRate)}</dd></div></dl></section></div>;
}

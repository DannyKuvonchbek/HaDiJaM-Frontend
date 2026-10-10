import Link from 'next/link';
import { productImageUrl } from '@/libs/utils/productImage';

export type ConciergeProduct = { _id: string; productTitle: string; productType: string; productPrice: number; productImages: string[] };
export default function AIConciergeProductCard({ product }: { product: ConciergeProduct }) {
	return <Link className="ai-concierge-product" href={`/product/${product._id}`}>
		{product.productImages?.[0] ? <img src={productImageUrl(product.productImages[0])} alt="" /> : <span className="material-symbols-outlined">diamond</span>}
		<span><b>{product.productTitle}</b><small>{product.productType} · ${Number(product.productPrice).toLocaleString('en-US')}</small></span><i>↗</i>
	</Link>;
}

import Link from "next/link";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useState } from "react";
import EntityLikeButton from "@/libs/components/catalog/EntityLikeButton";
import { addToCart } from "@/libs/cart";
import type { Product } from "@/libs/types/product";
import { formatPrice } from "@/libs/utils/currency";
import { useUsdUzsRate } from "@/libs/utils/CurrencyProvider";
import { useLocale } from "@/libs/utils/LocaleProvider";

export default function ProductCard({ product, marketplace = false }: { product: Product; marketplace?: boolean }) {
  const [added, setAdded] = useState(false);
  const usdUzsRate = useUsdUzsRate();
  const { t } = useLocale();

  const acquire = () => {
    addToCart({ id: product.id, title: product.title, price: product.price, image: product.image });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className={`product-card${marketplace ? " marketplace-product-card" : ""}${product.category === "chain" ? " chain-product-card" : ""}${product.category === "ring" ? " ring-product-card" : ""}`}>
      <Link className="product-media" href={`/product/${product.id}`}>
        <img src={product.image} alt={product.title} />
        <span className="product-badge">
          <VerifiedRoundedIcon /> {product.badge}
        </span>
        {marketplace && <span className="marketplace-purity"><VerifiedRoundedIcon /> {t("Assay checked")}</span>}
      </Link>
      <EntityLikeButton
        entityType="product"
        entityId={product.id}
        initialLiked={Boolean(product.meLiked?.some((like) => like.myFavorite))}
        initialCount={product.productLikes ?? 0}
        label={product.title}
        className="product-favorite"
      />
      <div className="product-copy">
        <div className="marketplace-product-meta"><span className="product-seller">{product.seller}</span><span className="marketplace-rating">★ 4.9 <small>({product.badge === "One of a kind" ? "84" : "128"})</small></span></div>
        <Link href={`/product/${product.id}`} className="product-name">
          {product.title}
        </Link>
        <p>{product.subtitle}</p>
        {marketplace ? <div className="product-price-row marketplace-price-row"><span><small>{t("Insured transit included")}</small><strong>{formatPrice(product.price, usdUzsRate)}</strong></span><button type="button" onClick={acquire}><ShoppingBagOutlinedIcon />{added ? t("Added") : t("Acquire")}</button></div> : <div className="product-price-row"><strong>{formatPrice(product.price, usdUzsRate)}</strong><Link href={`/product/${product.id}`} aria-label={`View ${product.title}`}>↗</Link></div>}
      </div>
    </article>
  );
}

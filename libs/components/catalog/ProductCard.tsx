import Link from "next/link";
import { IconButton } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useState } from "react";
import { addToCart } from "@/libs/cart";
import type { Product } from "@/libs/types/product";
import { formatPrice } from "@/libs/data/catalog";

export default function ProductCard({ product, marketplace = false }: { product: Product; marketplace?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  const acquire = () => {
    addToCart({ id: product.id, title: product.title, price: product.price, image: product.image });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className={`product-card${marketplace ? " marketplace-product-card" : ""}`}>
      <Link className="product-media" href={`/product/${product.id}`}>
        <img src={product.image} alt={product.title} />
        <span className="product-badge">
          <VerifiedRoundedIcon /> {product.badge}
        </span>
        {marketplace && <span className="marketplace-purity"><VerifiedRoundedIcon /> Assay checked</span>}
      </Link>
      <IconButton
        className="product-favorite"
        aria-label={`Save ${product.title}`}
        aria-pressed={saved}
        onClick={() => setSaved((value) => !value)}
      >
        <FavoriteBorderRoundedIcon className={saved ? "saved" : ""} />
      </IconButton>
      <div className="product-copy">
        <div className="marketplace-product-meta"><span className="product-seller">{product.seller}</span><span className="marketplace-rating">★ 4.9 <small>({product.badge === "One of a kind" ? "84" : "128"})</small></span></div>
        <Link href={`/product/${product.id}`} className="product-name">
          {product.title}
        </Link>
        <p>{product.subtitle}</p>
        {marketplace ? <div className="product-price-row marketplace-price-row"><span><small>Insured transit included</small><strong>{formatPrice(product.price)}</strong></span><button type="button" onClick={acquire}><ShoppingBagOutlinedIcon />{added ? "Added" : "Acquire"}</button></div> : <div className="product-price-row"><strong>{formatPrice(product.price)}</strong><Link href={`/product/${product.id}`} aria-label={`View ${product.title}`}>↗</Link></div>}
      </div>
    </article>
  );
}

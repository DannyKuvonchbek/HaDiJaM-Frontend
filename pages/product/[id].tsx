import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useRouter } from "next/router";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import ProductCard from "@/libs/components/catalog/ProductCard";
import EntityLikeButton from "@/libs/components/catalog/EntityLikeButton";
import { featuredProducts } from "@/libs/data/catalog";
import { getProductImage } from "@/libs/data/productImages";
import { getProductDisplayTitle } from "@/libs/data/productTitles";
import { formatPrice } from "@/libs/utils/currency";
import { useUsdUzsRate } from "@/libs/utils/CurrencyProvider";
import { GET_PRODUCT } from "@/libs/graphql/products";
import { addToCart } from "@/libs/cart";
import type { ProductCategory } from "@/libs/types/product";

export default function ProductPage() {
  const usdUzsRate = useUsdUzsRate();
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const product =
    featuredProducts.find((item) => item.id === id) ?? featuredProducts[0];
  const { data } = useQuery(GET_PRODUCT, {
    variables: { productId: id },
    skip: !id || !/^[a-f\d]{24}$/i.test(id),
  });
  const [activeImage, setActiveImage] = useState(product.image);
  const [added, setAdded] = useState(false);
  const remote = data?.getProduct;
  const shownProduct = useMemo(
    () =>
      remote
        ? {
            ...product,
            id: remote._id,
            title: getProductDisplayTitle(remote.productType, remote.productTitle, 0),
            price: remote.productPrice,
            subtitle:
              remote.productDesc ??
              `${remote.productType} · verified by HaDiJaM`,
            category: remote.productType as ProductCategory,
            image: getProductImage(remote.productType, remote.productTitle, 0, remote.productImages?.[0]
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702"}/${remote.productImages[0]}`
              : product.image),
          }
        : product,
    [remote, product],
  );
  useEffect(() => {
    setActiveImage(shownProduct.image);
  }, [shownProduct.image]);
  const images = ["chain", "earring", "ring"].includes(shownProduct.category)
    ? [shownProduct.image]
    : [shownProduct.image, ...featuredProducts
      .filter((item) => item.id !== shownProduct.id)
      .slice(0, 3)
      .map((item) => item.image)];
  const add = () => {
    addToCart({
      id: shownProduct.id,
      title: shownProduct.title,
      price: shownProduct.price,
      image: shownProduct.image,
    });
    setAdded(true);
  };

  return (
    <SiteLayout title={`${shownProduct.title} | HaDiJaM`}>
      <section className="product-detail section-shell">
        <div className="breadcrumbs">
          <a href="/">Maison</a>
          <span>/</span>
          <a href="/catalog">Collections</a>
          <span>/</span>
          <span>{shownProduct.title}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-gallery">
            <div className={`detail-main-image${shownProduct.category === "chain" ? " chain-detail-image" : ""}${shownProduct.category === "ring" ? " ring-detail-image" : ""}`}>
              <img src={activeImage} alt={shownProduct.title} />
            </div>
            <div className="detail-thumbnails">
              {images.map((image, index) => (
                <button
                  className={activeImage === image ? "selected" : ""}
                  onClick={() => setActiveImage(image)}
                  key={`${image}-${index}`}
                >
                  <img
                    src={image}
                    alt={`${shownProduct.title} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="detail-copy">
            <div className="eyebrow">
              <span />
              {shownProduct.seller}
            </div>
            <h1>{shownProduct.title}</h1>
            <p className="detail-subtitle">{shownProduct.subtitle}</p>
            <div className="detail-rating">
              <span>★★★★★</span>{" "}
              <small>Maison selection · independently verified</small>
            </div>
            <div className="detail-price">
              {formatPrice(shownProduct.price, usdUzsRate)}
              <small>Price includes insured salon handling</small>
            </div>
            <p className="detail-description">
              A considered piece chosen for exceptional character and lasting
              beauty. Every HaDiJaM selection is reviewed by our team and
              prepared with care before it reaches you.
            </p>
            <div className="detail-actions">
              <button className="button button-gold" onClick={add}>
                {added ? "Added to your bag" : "Add to your bag"}{" "}
                <span>{added ? "✓" : "↗"}</span>
              </button>
              <EntityLikeButton
                entityType="product"
                entityId={shownProduct.id}
                initialLiked={Boolean(remote?.meLiked?.some((like: { myFavorite: boolean }) => like.myFavorite))}
                initialCount={remote?.productLikes ?? 0}
                label={shownProduct.title}
                className="detail-heart"
              />
            </div>
            <div className="detail-assurances">
              <div>
                <VerifiedUserOutlinedIcon />
                <span>
                  <strong>Maison verified</strong>
                  <small>Authenticity reviewed by our specialists</small>
                </span>
              </div>
              <div>
                <LocalShippingOutlinedIcon />
                <span>
                  <strong>Insured delivery</strong>
                  <small>Secure, discreet delivery to your door</small>
                </span>
              </div>
              <div>
                <span className="escrow-symbol">◇</span>
                <span>
                  <strong>Protected payment</strong>
                  <small>Your purchase is held in secure custody</small>
                </span>
              </div>
            </div>
            <button
              className="appointment-link"
              onClick={() => router.push("/services")}
            >
              Prefer to view in person? Arrange a private salon viewing ↗
            </button>
          </div>
        </div>
      </section>
      <section className="featured-section">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONSIDERED COMPANIONS</span>
              <h2>
                More to <em>discover.</em>
              </h2>
            </div>
            <a className="text-link" href="/catalog">
              View all pieces ↗
            </a>
          </div>
          <div className="product-grid">
            {featuredProducts
              .filter((item) => item.id !== shownProduct.id)
              .slice(0, 3)
              .map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

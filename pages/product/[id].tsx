import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useRouter } from "next/router";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import ProductCard from "@/libs/components/catalog/ProductCard";
import { featuredProducts, formatPrice } from "@/libs/data/catalog";
import { GET_PRODUCT } from "@/libs/graphql/products";
import { addToCart } from "@/libs/cart";

export default function ProductPage() {
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
            title: remote.productTitle,
            price: remote.productPrice,
            subtitle:
              remote.productDesc ??
              `${remote.productType} · verified by HaDiJaM`,
            image: remote.productImages?.[0]
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702"}/${remote.productImages[0]}`
              : product.image,
          }
        : product,
    [remote, product],
  );
  const images = [
    shownProduct.image,
    ...featuredProducts
      .filter((item) => item.id !== shownProduct.id)
      .slice(0, 3)
      .map((item) => item.image),
  ];
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
            <div className="detail-main-image">
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
              {formatPrice(shownProduct.price)}
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
              <button className="detail-heart" aria-label="Save this piece">
                <FavoriteBorderRoundedIcon />
              </button>
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

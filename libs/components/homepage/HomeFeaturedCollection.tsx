import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ProductCard from "@/libs/components/catalog/ProductCard";
import { homeProductFilters } from "@/libs/data/homepage";
import type { Product, ProductCategory } from "@/libs/types/product";
import { useLocale } from "@/libs/utils/LocaleProvider";

export default function HomeFeaturedCollection({
  products,
  activeCategory,
  onCategoryChange,
}: {
  products: Product[];
  activeCategory: "all" | ProductCategory;
  onCategoryChange: (category: "all" | ProductCategory) => void;
}) {
  const { t } = useLocale();
  return (
    <section className="featured-section home-popular">
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("VERIFIED VAULT ACQUISITIONS")}</span>
            <h2>{t("Popular Pieces")}</h2>
            <p className="section-subtitle">
              {t("Timeless pieces selected for their craft and enduring value.")}
            </p>
          </div>
          <Link className="text-link" href="/catalog">
            {t("View All Pieces")} <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <div className="home-product-toolbar">
          <div
            className="home-product-filters"
            aria-label={t("Filter popular pieces")}
          >
            {homeProductFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={activeCategory === filter.value ? "active" : ""}
                onClick={() => onCategoryChange(filter.value)}
              >
                {t(filter.label)}
              </button>
            ))}
          </div>
          <span>{t("INDEPENDENTLY VERIFIED · SECURE ESCROW")}</span>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!products.length && (
          <p className="home-empty-products">
            {t("More verified pieces in this collection are coming soon.")}
          </p>
        )}
      </div>
    </section>
  );
}

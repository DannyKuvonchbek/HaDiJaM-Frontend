import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ProductCard from "@/libs/components/catalog/ProductCard";
import { homeProductFilters } from "@/libs/data/homepage";
import type { Product, ProductCategory } from "@/libs/types/product";

export default function HomeFeaturedCollection({
  products,
  activeCategory,
  onCategoryChange,
}: {
  products: Product[];
  activeCategory: "all" | ProductCategory;
  onCategoryChange: (category: "all" | ProductCategory) => void;
}) {
  return (
    <section className="featured-section home-popular">
      <div className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">VERIFIED VAULT ACQUISITIONS</span>
            <h2>Popular Pieces</h2>
            <p className="section-subtitle">
              Timeless pieces selected for their craft and enduring value.
            </p>
          </div>
          <Link className="text-link" href="/catalog">
            View All Pieces <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <div className="home-product-toolbar">
          <div
            className="home-product-filters"
            aria-label="Filter popular pieces"
          >
            {homeProductFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={activeCategory === filter.value ? "active" : ""}
                onClick={() => onCategoryChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span>INDEPENDENTLY VERIFIED · SECURE ESCROW</span>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!products.length && (
          <p className="home-empty-products">
            More verified pieces in this collection are coming soon.
          </p>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { homeCategories } from "@/libs/data/homepage";

export default function HomeCategories() {
  return (
    <section className="category-section section-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">COLLECTIONS</span>
          <h2>Shop by Category</h2>
          <p className="section-subtitle">
            Curated collections of high-karat gold and certified precious
            stones.
          </p>
        </div>
        <Link className="text-link" href="/catalog">
          View All Categories <ArrowForwardRoundedIcon />
        </Link>
      </div>
      <div className="category-grid home-category-grid">
        {homeCategories.map((category) => (
          <Link
            href={`/catalog?category=${category.value}`}
            className="category-tile"
            key={category.label}
          >
            <img src={category.image} alt={category.label} />
            <span className="category-copy">
              <strong>{category.label}</strong>
              <small>{category.detail}</small>
            </span>
            <span className="category-arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { homeCategories } from "@/libs/data/homepage";
import { useLocale } from "@/libs/utils/LocaleProvider";

export default function HomeCategories() {
  const { t } = useLocale();
  return (
    <section className="category-section section-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("COLLECTIONS")}</span>
          <h2>{t("Shop by Category")}</h2>
          <p className="section-subtitle">
            {t("Curated collections of high-karat gold and certified precious stones.")}
          </p>
        </div>
        <Link className="text-link" href="/catalog">
          {t("View All Categories")} <ArrowForwardRoundedIcon />
        </Link>
      </div>
      <div className="category-grid home-category-grid">
        {homeCategories.map((category) => (
          <Link
            href={`/catalog?category=${category.value}`}
            className="category-tile"
            key={category.label}
          >
            <img src={category.image} alt={t(category.label)} />
            <span className="category-copy">
              <strong>{t(category.label)}</strong>
              <small>{t(category.detail)}</small>
            </span>
            <span className="category-arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

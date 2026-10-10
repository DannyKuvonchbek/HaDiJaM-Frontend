import Link from "next/link";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useLocale } from "@/libs/utils/LocaleProvider";

const assurances = [
  {
    title: "100% Authentic",
    detail: "Expert-reviewed precious gold",
    icon: <VerifiedUserOutlinedIcon />,
  },
  {
    title: "Fast, Insured Transit",
    detail: "At-your-door delivery",
    icon: <LocalShippingOutlinedIcon />,
  },
  {
    title: "Escrow Security",
    detail: "Protected transactions",
    icon: <DiamondOutlinedIcon />,
  },
  {
    title: "24/7 VIP Concierge",
    detail: "Private salon assistance",
    icon: <ArrowForwardRoundedIcon />,
  },
];

export default function HeroSection() {
  const { t } = useLocale();
  return (
    <>
      <section className="hero-section">
        <div className="hero-halo" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> {t("PREMIUM JEWELRY & SERVICE MARKETPLACE")}
            </div>
            <h1>
              {t("Timeless Beauty,")}
              <br />
              <em>{t("Lasting Value.")}</em>
            </h1>
            <p className="hero-lede">
              {t("Discover bespoke atelier craftsmanship, independently appraised 18K & 24K gold pieces, and verified services — all in one curated sanctuary.")}
            </p>
            <div className="hero-buttons">
              <Link href="/catalog" className="button button-gold">
                {t("Explore Marketplace")} <span>→</span>
              </Link>
              <Link href="/services" className="button button-quiet">
                {t("Our Services")}
              </Link>
            </div>
            <div className="hero-metrics">
              <span>
                <b>14,800+</b> {t("VERIFIED PIECES")}
              </span>
              <span>
                <b>100%</b> {t("ASSAY ASSURED")}
              </span>
              <span>
                <b>4.98 / 5</b> {t("CLIENT SATISFACTION")}
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label={t("HaDiJaM fine jewelry collection")}
          >
            <div className="hero-art-frame">
              <img
                src="/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-hadijam-fine-jewelry-collection-015.jpg"
                alt={t("HaDiJaM fine jewelry collection")}
              />
            </div>
            <div className="hero-art-topline">
              <span>◉ &nbsp;CURATED 18K &amp; 24K</span>
              <span>01 / 08</span>
            </div>
            <div className="hero-caption">
              <span>PRIVATE VAULT No. 01</span>
              <span>IN TASHKENT · SEOUL · GENEVA</span>
            </div>
          </div>
        </div>
        <div className="shell hero-assurances">
          {assurances.map((item) => (
            <article key={item.title}>
              <span className="hero-assurance-icon">{item.icon}</span>
              <div>
                <strong>{t(item.title)}</strong>
                <small>{t(item.detail)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

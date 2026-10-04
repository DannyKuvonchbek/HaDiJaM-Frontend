import Link from "next/link";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

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
  return (
    <>
      <section className="hero-section">
        <div className="hero-halo" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> PREMIUM JEWELRY &amp; SERVICE MARKETPLACE
            </div>
            <h1>
              Timeless Beauty,
              <br />
              <em>Lasting Value.</em>
            </h1>
            <p className="hero-lede">
              Discover bespoke atelier craftsmanship, independently appraised
              18K &amp; 24K gold pieces, and verified services — all in one
              curated sanctuary.
            </p>
            <div className="hero-buttons">
              <Link href="/catalog" className="button button-gold">
                Explore Marketplace <span>→</span>
              </Link>
              <Link href="/services" className="button button-quiet">
                Our Services
              </Link>
            </div>
            <div className="hero-metrics">
              <span>
                <b>14,800+</b> VERIFIED PIECES
              </span>
              <span>
                <b>100%</b> ASSAY ASSURED
              </span>
              <span>
                <b>4.98 / 5</b> CLIENT SATISFACTION
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="HaDiJaM fine jewelry collection"
          >
            <div className="hero-art-frame">
              <img
                src="/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-hadijam-fine-jewelry-collection-015.jpg"
                alt="HaDiJaM fine jewelry collection"
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
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

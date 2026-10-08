import { useState } from "react";
import Link from "next/link";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import TelegramIcon from "@mui/icons-material/Telegram";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

const guarantees = [
  {
    icon: <LocalShippingOutlinedIcon />,
    title: "Insured Armored Transit",
    body: "Shipments travel through licensed specialist couriers, including Brink’s, with declared-value insurance. Each piece is secured in a sealed, protected case.",
    foot: "Sealed, Insured Logistics",
  },
  {
    icon: <WorkspacePremiumOutlinedIcon />,
    title: "Lifetime Authenticity & Hallmark",
    body: "Eligible 18K and 24K gold pieces and natural diamonds are reviewed against available hallmark and gemological documentation. An authenticity record accompanies each verified piece.",
    foot: "Lifetime Authenticity Record",
  },
  {
    icon: <FactCheckOutlinedIcon />,
    title: "14-Day Independent Appraisal Rights",
    body: "From the day you receive your piece, you have 14 days to arrange an independent review with a qualified laboratory. If findings differ from the item’s stated specifications, contact our concierge to review the case.",
    foot: "14-Day Appraisal Window",
  },
];

const steps = [
  {
    icon: <AccountBalanceWalletOutlinedIcon />,
    title: "Order & Escrow Deposit",
    body: "Choose a piece and place your payment into the protected escrow process. Funds remain held while the order is reviewed.",
  },
  {
    icon: <BiotechOutlinedIcon />,
    title: "Gemological Lab Assay",
    body: "The piece is submitted for specialist review of its metal, stones, condition and supporting documentation.",
  },
  {
    icon: <MarkEmailReadOutlinedIcon />,
    title: "Hallmarked & Insured Transit",
    body: "After review, the item is documented, securely packed and sent with insured courier handling to the buyer.",
  },
  {
    icon: <HandshakeOutlinedIcon />,
    title: "Direct Acceptance or Refund Review",
    body: "Inspect the piece on arrival. Confirm the order when satisfied, or contact the concierge promptly if it does not match its description.",
  },
];

const faqs = [
  {
    question: "What should I do if an item is damaged during delivery?",
    answer:
      "Document the parcel and item on arrival, then contact the HaDiJaM concierge with photographs and your order details as soon as possible. Our team will review the shipment and explain the available next steps under the applicable delivery and escrow terms.",
  },
  {
    question: "How long does a refund take to reach my bank account?",
    answer:
      "Once a cancellation or refund is approved, processing time depends on the payment provider and receiving bank. The source material states 1–3 bank business days; your concierge can confirm the timing for your specific transaction.",
  },
  {
    question: "Is delivery across Uzbekistan really free?",
    answer:
      "The supplied design describes delivery to regional centers and districts in Uzbekistan as complimentary, with shipment protection. Please confirm the terms for your order with the concierge before purchase.",
  },
  {
    question: "How does the 14-day independent appraisal period work?",
    answer:
      "The supplied policy describes a 14-day period from receipt to arrange an independent appraisal. Contact the concierge with the report if its findings differ from the item documentation so the case can be reviewed under the applicable terms.",
  },
];

const socialLinks = [
  {
    icon: <TelegramIcon />,
    label: "Concierge & Updates",
    title: "@hadijam_official",
    body: "Follow official updates and reach our team through the HaDiJaM Telegram channel.",
    cta: "Open Telegram",
    href: "https://t.me/hadijam_official",
  },
  {
    icon: <InstagramIcon />,
    label: "Jewelry & Atelier Gallery",
    title: "@hadijam.luxury",
    body: "Discover jewelry highlights, atelier details and new collections on Instagram.",
    cta: "Follow on Instagram",
    href: "https://instagram.com/hadijam.luxury",
  },
  {
    icon: <FacebookIcon />,
    label: "News & Events",
    title: "HaDiJaM Haute Joaillerie",
    body: "Visit our Facebook page for company updates, events and announcements.",
    cta: "Visit Facebook",
    href: "https://facebook.com/hadijam.luxury",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<"hallmark" | "policy" | null>(
    null,
  );

  return (
    <SiteLayout title="About Us & Guarantee | HaDiJaM">
      <div className="about-page">
        <div className="about-ambient" aria-hidden="true" />
        <section className="about-hero section-shell">
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>About Us &amp; Guarantee</span>
          </nav>
          <div className="about-hero-grid">
            <div className="about-hero-copy">
              <span className="about-eyebrow">
                <VerifiedUserOutlinedIcon /> HaDiJaM Heritage &amp; Metrological
                Standards
              </span>
              <h1>
                About Us: <em>Authenticity</em>, Trust &amp; Master Haute
                Joaillerie Guarantee
              </h1>
              <p className="about-lead">
                HaDiJaM is a considered destination for authenticated fine
                jewelry and bespoke atelier craftsmanship. Precious metal and
                gemstone details are reviewed with care and supporting
                documentation.
              </p>
              <div className="about-stats">
                <div>
                  <strong>100%</strong>
                  <span>Insured escrow deposit*</span>
                </div>
                <div>
                  <strong>585 / 750 / 999</strong>
                  <span>Hallmark standards referenced</span>
                </div>
                <div>
                  <strong>14 days</strong>
                  <span>Independent appraisal window*</span>
                </div>
              </div>
              <small className="about-footnote">
                *Subject to the applicable transaction and guarantee terms.
              </small>
            </div>
            <div className="about-hero-visual">
              <img
                src="/images/stitch/about/hadijam-about-us-guarantee-assay-seal-desktop-data-image-image-27-alt-text-002.jpg"
                alt="Master jeweler carefully inspecting a fine jewelry piece"
              />
              <div className="about-image-shade" />
              <div className="about-hallmark-card">
                <span className="about-icon-disc">
                  <WorkspacePremiumOutlinedIcon />
                </span>
                <div>
                  <b>Metrological Hallmark Seal</b>
                  <span>HaDiJaM Vault Assayed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal("hallmark")}
                >
                  View seal
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="about-guarantee-band">
          <div className="section-shell">
            <div className="about-section-heading about-guarantee-heading">
              <div>
                <span className="about-eyebrow">
                  <ShieldOutlinedIcon /> 100% Money-Back Policy
                </span>
                <h2>100% Money-Back &amp; Transit Damage Protection</h2>
                <p>
                  Clear support for collectors and buyers throughout review,
                  delivery and order acceptance. HaDiJaM’s applicable
                  transaction terms explain the protections available for each
                  purchase.
                </p>
              </div>
              <button
                className="about-secondary-button"
                type="button"
                onClick={() => setActiveModal("policy")}
              >
                <PolicyOutlinedIcon /> Full Policy Details
              </button>
            </div>
            <div className="about-refund-card">
              <div className="about-refund-copy">
                <span className="about-eyebrow">
                  <CurrencyExchangeOutlinedIcon /> 100% Money-Back Policy
                </span>
                <h3>Clear and Complete Refund Review</h3>
                <p>
                  If an item arrives damaged, its packaging is compromised, or
                  it materially differs from its listing, contact HaDiJaM
                  promptly. We will review the order under the applicable terms
                  and guide you through the available resolution.
                </p>
              </div>
              <div className="about-refund-facts">
                <div>
                  <VerifiedUserOutlinedIcon />
                  <span>
                    <b>Escrow protection</b>
                    <small>Funds held during the transaction process</small>
                  </span>
                </div>
                <div>
                  <ScheduleOutlinedIcon />
                  <span>
                    <b>Timely review</b>
                    <small>Our concierge will explain the next steps</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="about-guarantee-grid">
              {guarantees.map((item) => (
                <article className="about-guarantee-card" key={item.title}>
                  <span className="about-icon-box">{item.icon}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <b className="about-card-foot">
                    <VerifiedUserOutlinedIcon /> {item.foot}
                  </b>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-process section-shell">
          <div className="about-centered-heading">
            <span className="about-eyebrow">
              <ShieldOutlinedIcon /> Secure Transaction Process
            </span>
            <h2>How It Works: 4-Step Secure Acquisition Protocol</h2>
            <p>
              The escrow process is designed to support both parties while an
              order is reviewed. Funds remain within the applicable process
              until the item is received and the transaction is resolved.
            </p>
          </div>
          <div className="about-steps">
            {steps.map((step, index) => (
              <article className="about-step-card" key={step.title}>
                <div className="about-step-top">
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span>{step.icon}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-maison-band">
          <div className="section-shell about-maison-grid">
            <div className="about-maison-info">
              <span className="about-eyebrow">
                <StorefrontOutlinedIcon /> Official Flagship Salon &amp; Vault
              </span>
              <h2>HaDiJaM Grand Maison &amp; Flagship Vault — Seoul</h2>
              <p>
                Our Seoul maison brings together private viewing, gemological
                expertise and personal concierge service in a discreet setting.
              </p>
              <div className="about-detail">
                <LocationOnOutlinedIcon />
                <div>
                  <small>Flagship Address</small>
                  <b>Cheongdam-dong, Gangnam-gu, Seoul, South Korea</b>
                </div>
              </div>
              <div className="about-detail">
                <ScheduleOutlinedIcon />
                <div>
                  <small>Visiting Hours</small>
                  <b>Private viewing by prior appointment</b>
                  <small>Seoul, South Korea</small>
                </div>
              </div>
              <div className="about-phone-grid">
                <a href="tel:+8225488890">
                  <CallOutlinedIcon />
                  <small>Seoul Gangnam Salon Desk</small>
                  <b>+82 (2) 548-8890</b>
                </a>
              </div>
            </div>
            <div className="about-maison-side">
              <div className="about-map-frame">
                <iframe
                  title="Map showing the HaDiJaM flagship salon area in Gangnam, Seoul"
                  src="https://maps.google.com/maps?q=Cheongdam-dong%2C%20Gangnam-gu%2C%20Seoul&hl=en&gl=kr&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href="https://maps.google.com/?q=Cheongdam-dong+Gangnam-gu+Seoul&hl=en"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open map <ArrowOutwardIcon />
                </a>
              </div>
              <div className="about-contact-grid">
                <a href="mailto:concierge@hadijam.luxury">
                  <MailOutlineIcon />
                  <span>
                    <b>Private Concierge</b>
                    <strong>concierge@hadijam.luxury</strong>
                    <small>Official VIP concierge service</small>
                  </span>
                </a>
                <a href="mailto:support@hadijam.uz">
                  <HelpOutlineOutlinedIcon />
                  <span>
                    <b>Technical Support</b>
                    <strong>support@hadijam.uz</strong>
                    <small>Platform and order assistance</small>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="about-social section-shell">
          <div className="about-centered-heading">
            <span className="about-eyebrow">
              <ShareOutlinedIcon /> Stay in Touch
            </span>
            <h2>Official Concierge &amp; Social Channels</h2>
            <p>
              Follow HaDiJaM for news, jewelry highlights and atelier stories
              through our official channels.
            </p>
          </div>
          <div className="about-social-grid">
            {socialLinks.map((item) => (
              <a
                className="about-social-card"
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="about-social-top">
                  <i>{item.icon}</i>
                  <ArrowOutwardIcon />
                </span>
                <small>{item.label}</small>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <b>
                  {item.cta} <span>›</span>
                </b>
              </a>
            ))}
          </div>
        </section>

        <section className="about-faq-band">
          <div className="about-faq-wrap">
            <div className="about-centered-heading">
              <span className="about-eyebrow">
                <HelpOutlineOutlinedIcon /> Answers to Common Questions
              </span>
              <h2>Frequently Asked Questions</h2>
              <p>
                Information about delivery, appraisal and transaction support.
              </p>
            </div>
            <div className="about-faq-list">
              {faqs.map((faq, index) => (
                <article
                  className={`about-faq-item ${openFaq === index ? "is-open" : ""}`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    aria-expanded={openFaq === index}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ExpandMoreIcon />
                  </button>
                  {openFaq === index && <p>{faq.answer}</p>}
                </article>
              ))}
            </div>
            <div className="about-faq-cta">
              <div>
                <h3>Still have questions?</h3>
                <p>Our concierge team is ready to help with your inquiry.</p>
              </div>
              <Link href="/contact">
                Contact the Concierge <ArrowOutwardIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>
      {activeModal && (
        <div
          className="about-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveModal(null);
          }}
        >
          <section
            className="about-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-modal-title"
          >
            <button
              className="about-modal-close"
              type="button"
              aria-label="Close dialog"
              onClick={() => setActiveModal(null)}
            >
              <CloseIcon />
            </button>
            {activeModal === "hallmark" ? (
              <>
                <span className="about-eyebrow">
                  <WorkspacePremiumOutlinedIcon /> HaDiJaM Vault
                </span>
                <h2 id="about-modal-title">Metrological Hallmark Seal</h2>
                <img
                  src="/images/stitch/about/hadijam-about-us-guarantee-assay-seal-desktop-data-image-image-26-alt-text-004.jpg"
                  alt="HaDiJaM hallmark and assay seal"
                />
                <p>
                  Hallmark and assay documentation is provided with eligible
                  pieces where available. Please refer to the item record and
                  contact the concierge if you need help reviewing its
                  documentation.
                </p>
              </>
            ) : (
              <>
                <span className="about-eyebrow">
                  <PolicyOutlinedIcon /> Buyer Protection
                </span>
                <h2 id="about-modal-title">Transaction &amp; Refund Policy</h2>
                <p>
                  Each order is subject to its listing, transaction record and
                  applicable HaDiJaM terms. If an item is damaged in transit or
                  materially differs from its description, preserve the
                  packaging and contact the concierge with your order details
                  and photographs for review.
                </p>
                <p>
                  The source material describes escrow handling, a 1–3 bank
                  business day reimbursement estimate after an approved refund,
                  and a 14-day independent appraisal period from receipt.
                  Timing, eligibility and resolution depend on the applicable
                  order terms and review findings.
                </p>
                <p>
                  Contact{" "}
                  <a href="mailto:concierge@hadijam.luxury">
                    concierge@hadijam.luxury
                  </a>{" "}
                  for help with a specific order.
                </p>
              </>
            )}
            <button
              className="about-modal-done"
              type="button"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </SiteLayout>
  );
}

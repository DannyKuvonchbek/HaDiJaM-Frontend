import Link from "next/link";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import PageIntro from "@/libs/components/layout/PageIntro";

export default function AboutPage() {
  return (
    <SiteLayout title="Our maison | HaDiJaM">
      <PageIntro
        eyebrow="OUR MAISON"
        title="A promise built around trust."
        description="HaDiJaM brings fine jewelry, skilled independent ateliers and personal care together under one considered promise."
      />
      <section className="about-story section-shell">
        <div className="about-photo">
          <img
            src="/images/stitch/about/hadijam-biz-haqimizda-100-kafolat-siyosati-desktop-a-master-uzbek-high-jewelry-goldsmith-wearing-velvet-gloves-inspecting-a-005.jpg"
            alt="Gold jewelry presented in the HaDiJaM salon"
          />
          <span>OBJECTS TO KEEP · CRAFT TO TRUST</span>
        </div>
        <div>
          <span className="eyebrow">TIMELESS BEAUTY · LASTING CARE</span>
          <h2>
            Beautiful things
            <br />
            deserve <em>better care.</em>
          </h2>
          <p>
            We believe exceptional jewelry is more than a possession. It carries
            memory, artistry and value. HaDiJaM creates a thoughtful way to
            discover, verify and care for fine pieces, with trusted specialists
            close at hand.
          </p>
          <p>
            From first viewing to final delivery, our team makes every detail
            feel personal, clear and secure.
          </p>
          <Link href="/services" className="button button-gold">
            Meet the atelier <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="guarantee-section">
        <div className="section-shell">
          <div className="eyebrow">THE HaDiJaM GUARANTEE</div>
          <h2>
            Confidence in <em>every detail.</em>
          </h2>
          <div className="guarantee-grid">
            <article>
              <VerifiedUserOutlinedIcon />
              <h3>Reviewed for authenticity</h3>
              <p>
                We verify hallmarks, documentation and provenance with care
                before eligible pieces are listed.
              </p>
            </article>
            <article>
              <WorkspacePremiumOutlinedIcon />
              <h3>Four-step assurance</h3>
              <p>
                Every order moves through clear review, confirmation, protected
                settlement and careful handover.
              </p>
            </article>
            <article>
              <LocalShippingOutlinedIcon />
              <h3>Insured in transit</h3>
              <p>
                Specialist packaging and insured delivery protect your piece
                from salon to doorstep.
              </p>
            </article>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

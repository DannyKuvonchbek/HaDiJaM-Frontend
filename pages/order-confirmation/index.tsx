import Link from "next/link";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SiteLayout from "@/libs/components/layout/SiteLayout";

export default function OrderConfirmationPage() {
  return (
    <SiteLayout title="Acquisition received | HaDiJaM">
      <section className="confirmation section-shell">
        <span className="confirmation-icon">
          <VerifiedUserOutlinedIcon />
        </span>
        <span className="eyebrow">YOUR ACQUISITION IS IN OUR CARE</span>
        <h1>
          Thank you.
          <br />
          <em>We’ll take it from here.</em>
        </h1>
        <p>
          Your order has been received. A HaDiJaM concierge will contact you to
          confirm the details and guide you through secure payment and delivery.
        </p>
        <div className="confirmation-steps">
          <span>
            <b>01</b> Order received
          </span>
          <span>
            <b>02</b> Concierge confirmation
          </span>
          <span>
            <b>03</b> Secure, insured delivery
          </span>
        </div>
        <div className="confirmation-actions">
          <Link href="/my-page" className="button button-gold">
            View My Orders <span>↗</span>
          </Link>
          <Link href="/catalog" className="text-link">
            Return to the collection
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

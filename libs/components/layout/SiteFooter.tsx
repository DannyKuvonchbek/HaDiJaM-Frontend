import Link from "next/link";
import { useLocale } from "@/libs/utils/LocaleProvider";

export default function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-brand-lockup" aria-label="HaDiJaM homepage">
            <img src="/images/stitch/brand/diamond-mark.png" alt="" />
            <span>
              <strong>HaDiJaM</strong>
              <small>HAUTE JOAILLERIE</small>
            </span>
          </Link>
          <p>
            {t("Timeless beauty, lasting value.")}
            <br />{t("A considered world of fine jewelry and care.")}
          </p>
        </div>
        <div>
          <span className="footer-title">{t("Discover")}</span>
          <Link href="/catalog">{t("Collections")}</Link>
          <Link href="/services">{t("Atelier services")}</Link>
          <Link href="/about">{t("Our maison")}</Link>
        </div>
        <div>
          <span className="footer-title">{t("Client care")}</span>
          <Link href="/services">{t("Book a consultation")}</Link>
          <Link href="/about">{t("Authenticity & guarantee")}</Link>
          <Link href="/contact">{t("Contact concierge")}</Link>
        </div>
        <div className="footer-contact">
          <span className="footer-title">{t("Seoul Gangnam Salon")}</span>
          <p>Cheongdam-dong, Gangnam-gu, Seoul, South Korea</p>
          <p>Mon–Sat, 10:00–19:00 KST</p>
          <span>+82 (2) 548-8890</span>
          <span className="gold-rule" />
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} HaDiJaM Maison</span>
        <span>
          {t("Private acquisition · Verified craftsmanship · Insured delivery")}
        </span>
        <span>UZ · USD</span>
      </div>
    </footer>
  );
}

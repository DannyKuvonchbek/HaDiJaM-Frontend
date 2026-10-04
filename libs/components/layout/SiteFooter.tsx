import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div className="footer-brand">
          <div className="footer-brand-lockup">
            <img src="/images/stitch/brand/diamond-mark.png" alt="" />
            <span>
              <strong>HaDiJaM</strong>
              <small>HAUTE JOAILLERIE</small>
            </span>
          </div>
          <p>
            Timeless beauty, lasting value.
            <br />A considered world of fine jewelry and care.
          </p>
        </div>
        <div>
          <span className="footer-title">Discover</span>
          <Link href="/catalog">Collections</Link>
          <Link href="/services">Atelier services</Link>
          <Link href="/about">Our maison</Link>
        </div>
        <div>
          <span className="footer-title">Client care</span>
          <Link href="/services">Book a consultation</Link>
          <Link href="/about">Authenticity &amp; guarantee</Link>
          <Link href="/contact">Contact concierge</Link>
        </div>
        <div className="footer-contact">
          <span className="footer-title">Tashkent salon</span>
          <p>Mon–Sat, 10:00–19:00</p>
          <a href="tel:+998712000000">+998 71 200 00 00</a>
          <span className="gold-rule" />
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} HaDiJaM Maison</span>
        <span>
          Private acquisition · Verified craftsmanship · Insured delivery
        </span>
        <span>UZ · USD</span>
      </div>
    </footer>
  );
}

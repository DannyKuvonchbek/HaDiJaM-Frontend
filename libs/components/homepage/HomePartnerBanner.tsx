import Link from 'next/link';

export default function HomePartnerBanner() {
	return <section className="home-partner-banner"><img src="/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-hadijam-artisanal-craftsmanship-025.jpg" alt="Hands at work on fine gold jewelry" /><div className="home-partner-copy"><span className="eyebrow">THE HAUTE STANDARD</span><h2>Your Trusted Partner in<br />Fine Jewelry &amp; Services</h2><p>Uncompromising authenticity, museum-grade gemological evaluation, and insured escrow for peace of mind.</p><Link href="/services" className="button button-gold">Explore Certified Services <span>→</span></Link></div></section>;
}

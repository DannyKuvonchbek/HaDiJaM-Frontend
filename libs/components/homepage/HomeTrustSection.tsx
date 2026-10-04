import Link from 'next/link';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const assurances = [
	{ title: 'Authentic Products', text: 'Certified hallmarks and documentation with every eligible piece.', icon: <VerifiedUserOutlinedIcon /> },
	{ title: 'Secure Transactions', text: 'Escrow protects your payment until your order is safely received.', icon: <LocalAtmOutlinedIcon /> },
	{ title: 'Expert Support', text: 'Personalized guidance from our concierge and atelier partners.', icon: <WorkspacePremiumOutlinedIcon /> },
	{ title: 'Fast, Insured Transit', text: 'Discreet delivery with specialist packaging and insurance.', icon: <LocalShippingOutlinedIcon /> },
];

export default function HomeTrustSection() {
	return <section className="trust-section section-shell home-trust"><div className="home-trust-photo"><img src="/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-authenticity-and-verification-box-030.jpg" alt="Authenticated HaDiJaM fine jewelry presentation box" /><span>✧ &nbsp; INDEPENDENTLY ASSAYED</span></div><div className="trust-intro"><span className="eyebrow">THE HAUTE STANDARD</span><h2>Authenticity, Quality,<br /><em>Your Unwavering Trust</em></h2><p>Every creation traded within the HaDiJaM marketplace undergoes meticulous multi-point verification before release.</p><div className="trust-grid">{assurances.map((item) => <article key={item.title}><span className="trust-icon">{item.icon}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div><Link className="button button-gold" href="/about">Learn More About Our Escrow <span>→</span></Link></div></section>;
}

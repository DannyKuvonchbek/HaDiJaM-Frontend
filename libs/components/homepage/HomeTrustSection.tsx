import Link from 'next/link';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useLocale } from '@/libs/utils/LocaleProvider';

const assurances = [
	{ title: 'Authentic Products', text: 'Certified hallmarks and documentation with every eligible piece.', icon: <VerifiedUserOutlinedIcon /> },
	{ title: 'Secure Transactions', text: 'Escrow protects your payment until your order is safely received.', icon: <LocalAtmOutlinedIcon /> },
	{ title: 'Expert Support', text: 'Personalized guidance from our concierge and atelier partners.', icon: <WorkspacePremiumOutlinedIcon /> },
	{ title: 'Fast, Insured Transit', text: 'Discreet delivery with specialist packaging and insurance.', icon: <LocalShippingOutlinedIcon /> },
];

export default function HomeTrustSection() {
	const { t } = useLocale();
	return <section className="trust-section section-shell home-trust"><div className="home-trust-photo"><img src="/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-authenticity-and-verification-box-030.jpg" alt={t('Authenticated HaDiJaM fine jewelry presentation box')} /><span>✧ &nbsp; {t('INDEPENDENTLY ASSAYED')}</span></div><div className="trust-intro"><span className="eyebrow">{t('THE HAUTE STANDARD')}</span><h2>{t('Authenticity, Quality,')}<br /><em>{t('Your Unwavering Trust')}</em></h2><p>{t('Every creation traded within the HaDiJaM marketplace undergoes meticulous multi-point verification before release.')}</p><div className="trust-grid">{assurances.map((item) => <article key={item.title}><span className="trust-icon">{item.icon}</span><div><h3>{t(item.title)}</h3><p>{t(item.text)}</p></div></article>)}</div><Link className="button button-gold" href="/about">{t('Learn More About Our Escrow')} <span>→</span></Link></div></section>;
}

import Link from 'next/link';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { homeServices } from '@/libs/data/homepage';
import { useLocale } from '@/libs/utils/LocaleProvider';

export default function HomeServices() {
	const { t } = useLocale();
	return <section className="home-services section-shell"><div className="section-heading"><div><span className="eyebrow">{t('ATELIER EXPERTISE')}</span><h2>{t('Featured Services')}</h2><p className="section-subtitle">{t('Professional master crafts for your most valuable family heirlooms and collectibles.')}</p></div><Link className="text-link" href="/services#atelier-workshop">{t('View All Atelier Services')} <ArrowForwardRoundedIcon /></Link></div><div className="home-service-grid">{homeServices.map((service, index) => <article className="home-service-card" key={service.title}><Link href="/services#atelier-workshop" className="home-service-image"><img src={service.image} alt={t(service.title)} /><span>0{index + 1}</span></Link><div><h3>{t(service.title)}</h3><p>{t(service.description)}</p><Link href="/services#atelier-workshop">{t('Visit Atelier')} <span>↗</span></Link></div></article>)}</div></section>;
}

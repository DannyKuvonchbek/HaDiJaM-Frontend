import Link from 'next/link';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { homeServices } from '@/libs/data/homepage';

export default function HomeServices() {
	return <section className="home-services section-shell"><div className="section-heading"><div><span className="eyebrow">ATELIER EXPERTISE</span><h2>Featured Services</h2><p className="section-subtitle">Professional master crafts for your most valuable family heirlooms and collectibles.</p></div><Link className="text-link" href="/services#atelier-workshop">View All Atelier Services <ArrowForwardRoundedIcon /></Link></div><div className="home-service-grid">{homeServices.map((service, index) => <article className="home-service-card" key={service.title}><Link href="/services#atelier-workshop" className="home-service-image"><img src={service.image} alt={service.title} /><span>0{index + 1}</span></Link><div><h3>{service.title}</h3><p>{service.description}</p><Link href="/services#atelier-workshop">Visit Atelier <span>↗</span></Link></div></article>)}</div></section>;
}

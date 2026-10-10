import Link from 'next/link';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { collectorReviews } from '@/libs/data/homepage';
import { useLocale } from '@/libs/utils/LocaleProvider';

export default function HomeReviews() {
	const { t } = useLocale();
	return <section className="home-reviews section-shell"><div className="section-heading"><div><span className="eyebrow">{t('VERIFIED COLLECTOR STORIES')}</span><h2>{t('What Our Customers Say')}</h2><p className="section-subtitle">{t('Real experiences from discerning jewelry collectors around the world.')}</p></div><Link className="text-link" href="/about">{t('Meet the HaDiJaM family')} <ArrowForwardRoundedIcon /></Link></div><div className="home-review-grid">{collectorReviews.map((review) => <article key={review.name}><div className="home-review-stars">★★★★★ <span>5.0</span></div><p>“{review.quote}”</p><div className="home-review-person"><img src={review.image} alt="" /><span><strong>{review.name}</strong><small>{review.place}</small></span></div></article>)}</div></section>;
}

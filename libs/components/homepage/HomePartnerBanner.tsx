import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/libs/utils/LocaleProvider';

export default function HomePartnerBanner() {
	const { t } = useLocale();
	const videoRef = useRef<HTMLVideoElement>(null);
	const sectionRef = useRef<HTMLElement>(null);
	const [videoVisible, setVideoVisible] = useState(false);
	const [introVisible, setIntroVisible] = useState(true);

	useEffect(() => {
		let introTimer: ReturnType<typeof setTimeout> | undefined;
		const startVideo = () => {
			setVideoVisible(true);
			void videoRef.current?.play().catch(() => undefined);
			introTimer = setTimeout(() => setIntroVisible(false), 1800);
		};
		const section = sectionRef.current;
		if (!section || !('IntersectionObserver' in window)) {
			startVideo();
			return () => clearTimeout(introTimer);
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				startVideo();
				observer.disconnect();
			}
		}, { threshold: 0.25 });
		observer.observe(section);
		return () => { observer.disconnect(); clearTimeout(introTimer); };
	}, []);

	return <section ref={sectionRef} className="home-partner-banner home-cinematic-banner" aria-label="The HaDiJaM Seoul showroom">
		<div className="home-partner-stage">
			<video ref={videoRef} className={videoVisible ? 'is-visible' : ''} src="/videos/hadijam-seoul-showroom.mp4" poster="/images/home/hadijam-seoul-showroom.png" muted loop playsInline preload="auto" aria-label="HaDiJaM showroom film" />
			<div className={`home-partner-intro${introVisible ? ' is-visible' : ''}`} aria-hidden="true">
				<img src="/images/home/hadijam-seoul-showroom.png" alt="" />
			</div>
			<div className="home-partner-shade" />
		</div>
		<div className="home-partner-copy"><span className="eyebrow">{t('THE HAUTE STANDARD')}</span><h2>{t('Your Trusted Partner in')}<br />{t('Fine Jewelry & Services')}</h2><p>{t('Uncompromising authenticity, museum-grade gemological evaluation, and insured escrow for peace of mind.')}</p><Link href="/services" className="button button-gold">{t('Explore Certified Services')} <span>→</span></Link></div>
	</section>;
}

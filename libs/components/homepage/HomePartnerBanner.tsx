import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function HomePartnerBanner() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const sectionRef = useRef<HTMLElement>(null);
	const [videoVisible, setVideoVisible] = useState(false);
	const [introVisible, setIntroVisible] = useState(true);

	useEffect(() => {
		const startVideo = () => {
			setVideoVisible(true);
			void videoRef.current?.play().catch(() => undefined);
			window.setTimeout(() => setIntroVisible(false), 1800);
		};
		const section = sectionRef.current;
		if (!section || !('IntersectionObserver' in window)) {
			startVideo();
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				startVideo();
				observer.disconnect();
			}
		}, { threshold: 0.25 });
		observer.observe(section);
		return () => observer.disconnect();
	}, []);

	return <section ref={sectionRef} className="home-partner-banner home-cinematic-banner" aria-label="The HaDiJaM Seoul showroom">
		<div className="home-partner-stage">
			<video ref={videoRef} className={videoVisible ? 'is-visible' : ''} src="/videos/hadijam-seoul-showroom.mp4" poster="/images/home/hadijam-seoul-showroom.png" muted loop playsInline preload="auto" aria-label="HaDiJaM showroom film" />
			<div className={`home-partner-intro${introVisible ? ' is-visible' : ''}`} aria-hidden="true">
				<img src="/images/home/hadijam-seoul-showroom.png" alt="" />
			</div>
			<div className="home-partner-shade" />
		</div>
		<div className="home-partner-copy"><span className="eyebrow">THE HAUTE STANDARD</span><h2>Your Trusted Partner in<br />Fine Jewelry &amp; Services</h2><p>Uncompromising authenticity, museum-grade gemological evaluation, and insured escrow for peace of mind.</p><Link href="/services" className="button button-gold">Explore Certified Services <span>→</span></Link></div>
	</section>;
}

import type { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function SiteLayout({ children, title = 'HaDiJaM | Fine Jewelry & Atelier' }: { children: ReactNode; title?: string }) {
	const router = useRouter();
	const isAccountPage = router.pathname === '/my-page';
	return <div className={`site-layout${isAccountPage ? ' account-layout' : ''}`}>
		<Head><title>{title}</title><meta name="description" content="Discover fine jewelry, certified ateliers and private salon services at HaDiJaM." /><meta name="theme-color" content="#131313" /></Head>
		<SiteHeader />
		<main>{children}</main>
		<SiteFooter />
	</div>;
}

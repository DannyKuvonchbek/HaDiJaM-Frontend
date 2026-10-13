import { logoutSession } from "@/libs/auth";
import { authValue, setAuthValue } from "@/libs/auth";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Badge, IconButton, Menu, MenuItem } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { readCart } from '@/libs/cart';
import { GET_MEMBER_PROFILE } from '@/libs/graphql/myPage';
import { accountApiBase, readMemberId } from '@/libs/utils/account';
import { useLocale, type Locale } from '@/libs/utils/LocaleProvider';
import HeaderSearch from './HeaderSearch';
import NotificationBell from '@/libs/components/notifications/NotificationBell';

const links = [
	['Collections', '/catalog'],
	['Services', '/services'],
	['About Us', '/about'],
	['Contact', '/contact'],
] as const;

const memberLinks: ReadonlyArray<readonly [string, string]> = [
	['My Account', '/my-page'],
];
const sellerLinks: ReadonlyArray<readonly [string, string]> = [['Add a product', '/seller/add-product']];
const adminLinks: ReadonlyArray<readonly [string, string]> = [['Admin Console', '/admin']];

export default function SiteHeader() {
	const router = useRouter();
	const { locale, setLocale, t } = useLocale();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [language, setLanguage] = useState<null | HTMLElement>(null);
	const [searchOpen, setSearchOpen] = useState(false);
	const [cartCount, setCartCount] = useState(0);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isSeller, setIsSeller] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [memberId, setMemberId] = useState('');
	const [memberImage, setMemberImage] = useState('');
	const [accountMenu, setAccountMenu] = useState<null | HTMLElement>(null);
	const { data: memberData } = useQuery(GET_MEMBER_PROFILE, {
		variables: { memberId },
		skip: !memberId,
		fetchPolicy: 'network-only',
	});
	useEffect(() => {
		const updateCount = () => setCartCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
		updateCount(); window.addEventListener('hadijam:cart-updated', updateCount); window.addEventListener('storage', updateCount);
		const updateAuth = () => {
			const token = authValue("accessToken") ?? '';
			setIsAuthenticated(Boolean(token));
			setCartCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
			setIsSeller(authValue("memberType") === 'SELLER');
			setIsAdmin(authValue('memberType') === 'ADMIN');
			setMemberId(token ? readMemberId(token) : '');
			setMemberImage(authValue("memberImage") ?? '');
		};
		updateAuth(); window.addEventListener('hadijam:auth-updated', updateAuth); window.addEventListener('storage', updateAuth);
		return () => {
			window.removeEventListener('hadijam:cart-updated', updateCount); window.removeEventListener('storage', updateCount);
			window.removeEventListener('hadijam:auth-updated', updateAuth);
		};
	}, []);
	useEffect(() => {
		const currentMember = memberData?.getMember?._id === memberId && isAuthenticated ? memberData.getMember : null;
		const image = currentMember?.memberImage;
		setIsAdmin(currentMember?.memberType === 'ADMIN');
		if (typeof image === 'string' && image) {
			setAuthValue("memberImage", image);
			setMemberImage(image);
		}
	}, [isAuthenticated, memberData, memberId]);
	useEffect(() => { setMobileOpen(false); }, [router.asPath]);
	useEffect(() => {
		if (!mobileOpen) return;
		const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
		window.addEventListener('keydown', close);
		return () => window.removeEventListener('keydown', close);
	}, [mobileOpen]);
	const navLinks: ReadonlyArray<readonly [string, string]> = isAuthenticated ? [...links, ...memberLinks, ...(isSeller ? sellerLinks : []), ...(isAdmin ? adminLinks : [])] : links;
	const logout = async () => {
    try { await logoutSession(); setAccountMenu(null); await router.push('/'); }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Sign out failed.'); }
  };

	return (
		<header className="site-header">
			<div className="top-ribbon">{t('A private world of fine jewelry')} <span>·</span> {t('Complimentary insured delivery in Uzbekistan')}</div>
			<div className="header-main shell">
				<IconButton className="mobile-menu-button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>
					{mobileOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
				</IconButton>
				<Link href="/" className="brand-lockup" aria-label="HaDiJaM home">
					<img src="/images/stitch/brand/diamond-mark.png" alt="" /><span className="brand-wordmark"><strong>HaDiJaM</strong><small>HAUTE JOAILLERIE</small></span>
				</Link>
				<nav className="desktop-nav" aria-label="Main navigation">
					{navLinks.map(([label, href]) => <Link key={href} href={href} className={router.pathname === href ? 'active' : undefined} aria-current={router.pathname === href ? 'page' : undefined}>{t(label)}</Link>)}
				</nav>
				<div className="header-actions">
					<button className="language-button" onClick={(event) => setLanguage(event.currentTarget)} aria-label={t('Language')}>{locale.toUpperCase()} <span>⌄</span></button>
					<Menu anchorEl={language} open={Boolean(language)} onClose={() => setLanguage(null)}>
						<MenuItem selected={locale === 'en'} onClick={() => { setLocale('en'); setLanguage(null); }}>English</MenuItem>
						<MenuItem selected={locale === 'uz'} onClick={() => { setLocale('uz'); setLanguage(null); }}>O‘zbekcha</MenuItem>
						<MenuItem selected={locale === 'ko'} onClick={() => { setLocale('ko'); setLanguage(null); }}>한국어</MenuItem>
						<MenuItem selected={locale === 'ru'} onClick={() => { setLocale('ru'); setLanguage(null); }}>Русский</MenuItem>
					</Menu>
					<IconButton aria-label={t('Search')} onClick={() => setSearchOpen(true)}><SearchRoundedIcon /></IconButton>
					<NotificationBell enabled={isAuthenticated} memberId={memberId} />
					{isAuthenticated && <IconButton component={Link} href="/my-page?tab=saved" aria-label="Saved pieces"><Badge badgeContent={0} color="primary"><FavoriteBorderRoundedIcon /></Badge></IconButton>}
					{isAuthenticated && <IconButton aria-label="Shopping bag" component={Link} href="/cart"><Badge badgeContent={cartCount} color="primary"><ShoppingBagOutlinedIcon /></Badge></IconButton>}
					{isAuthenticated ? <>
						<IconButton className="account-link account-link-authenticated" aria-label={t('My Account')} title={t('Signed in')} onClick={(event) => setAccountMenu(event.currentTarget)}>
							{memberImage ? <img className="account-link-avatar" src={/^(https?:)?\/\//.test(memberImage) ? memberImage : `${accountApiBase.replace(/\/$/, '')}/${memberImage.replace(/^\//, '')}`} alt="" /> : <PersonOutlineRoundedIcon />}
						</IconButton>
						<Menu anchorEl={accountMenu} open={Boolean(accountMenu)} onClose={() => setAccountMenu(null)}>
							<MenuItem component={Link} href="/my-page" onClick={() => setAccountMenu(null)}><AccountCircleRoundedIcon fontSize="small" sx={{ mr: 1 }} />{t('My Page')}</MenuItem>
							{isAdmin && <MenuItem component={Link} href="/admin" onClick={() => setAccountMenu(null)}>{t('Admin Console')}</MenuItem>}
							{isSeller && <MenuItem component={Link} href="/seller/add-product" onClick={() => setAccountMenu(null)}><span className="material-symbols-outlined" style={{ marginRight: 8, fontSize: 18 }}>add_circle</span>{t('Add a product')}</MenuItem>}
							<MenuItem component={Link} href="/contact" onClick={() => setAccountMenu(null)}>{t('Contact concierge')}</MenuItem>
							<MenuItem onClick={logout}>{t('Log out')}</MenuItem>
						</Menu>
					</> : <IconButton component={Link} href="/sign-in?mode=signin" className="account-link" aria-label={t('Sign in or create an account')} title={t('Sign in or create an account')}><PersonOutlineRoundedIcon /></IconButton>}
				</div>
			</div>
			{mobileOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{navLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)}>{t(label)}<span>↗</span></Link>)}<button type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>{t('Search')}<span>⌕</span></button><label className="mobile-language-picker">{t('Language')}<select aria-label={t('Language')} value={locale} onChange={(event) => setLocale(event.target.value as Locale)}><option value="en">English</option><option value="uz">O‘zbekcha</option><option value="ko">한국어</option><option value="ru">Русский</option></select></label>{isAuthenticated && <button type="button" onClick={logout}>{t('Log out')}<span>↗</span></button>}</nav>}
			<HeaderSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
		</header>
	);
}

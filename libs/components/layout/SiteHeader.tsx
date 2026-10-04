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

const links = [
	['Collections', '/catalog'],
	['Atelier services', '/services'],
	['Our maison', '/about'],
	['Contact', '/contact'],
] as const;

const memberLinks: ReadonlyArray<readonly [string, string]> = [
	['My Account', '/my-page'],
];
const sellerLinks: ReadonlyArray<readonly [string, string]> = [['Add a product', '/seller/add-product']];

export default function SiteHeader() {
	const router = useRouter();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [language, setLanguage] = useState<null | HTMLElement>(null);
	const [cartCount, setCartCount] = useState(0);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isSeller, setIsSeller] = useState(false);
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
			const token = localStorage.getItem('accessToken') ?? '';
			setIsAuthenticated(Boolean(token));
			setIsSeller(localStorage.getItem('memberType') === 'SELLER');
			setMemberId(token ? readMemberId(token) : '');
			setMemberImage(localStorage.getItem('memberImage') ?? '');
		};
		updateAuth(); window.addEventListener('hadijam:auth-updated', updateAuth); window.addEventListener('storage', updateAuth);
		return () => {
			window.removeEventListener('hadijam:cart-updated', updateCount); window.removeEventListener('storage', updateCount);
			window.removeEventListener('hadijam:auth-updated', updateAuth);
		};
	}, []);
	useEffect(() => {
		const image = memberData?.getMember?.memberImage;
		if (typeof image === 'string' && image) {
			localStorage.setItem('memberImage', image);
			setMemberImage(image);
		}
	}, [memberData]);
	const navLinks: ReadonlyArray<readonly [string, string]> = isAuthenticated ? [...links, ...memberLinks, ...(isSeller ? sellerLinks : [])] : links;
	const logout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('memberNick');
		localStorage.removeItem('memberType');
		localStorage.removeItem('memberImage');
		setMemberImage('');
		setAccountMenu(null);
		window.dispatchEvent(new Event('hadijam:auth-updated'));
	};

	return (
		<header className="site-header">
			<div className="top-ribbon">A private world of fine jewelry <span>·</span> Complimentary insured delivery in Uzbekistan</div>
			<div className="header-main shell">
				<IconButton className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(!mobileOpen)}>
					{mobileOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
				</IconButton>
				<Link href="/" className="brand-lockup" aria-label="HaDiJaM home">
					<img src="/images/stitch/brand/diamond-mark.png" alt="" /><span className="brand-wordmark"><strong>HaDiJaM</strong><small>HAUTE JOAILLERIE</small></span>
				</Link>
				<nav className="desktop-nav" aria-label="Main navigation">
					{navLinks.map(([label, href]) => <Link key={href} href={href} className={router.pathname === href ? 'active' : undefined} aria-current={router.pathname === href ? 'page' : undefined}>{label}</Link>)}
				</nav>
				<div className="header-actions">
					<button className="language-button" onClick={(event) => setLanguage(event.currentTarget)}>EN <span>⌄</span></button>
					<Menu anchorEl={language} open={Boolean(language)} onClose={() => setLanguage(null)}>
						<MenuItem onClick={() => setLanguage(null)}>English</MenuItem>
						<MenuItem onClick={() => setLanguage(null)}>O‘zbekcha</MenuItem>
						<MenuItem onClick={() => setLanguage(null)}>한국어</MenuItem>
						<MenuItem onClick={() => setLanguage(null)}>Русский</MenuItem>
					</Menu>
					<IconButton aria-label="Search"><SearchRoundedIcon /></IconButton>
					<IconButton aria-label="Saved pieces"><Badge badgeContent={0} color="primary"><FavoriteBorderRoundedIcon /></Badge></IconButton>
					<IconButton aria-label="Shopping bag" component={Link} href="/cart"><Badge badgeContent={cartCount} color="primary"><ShoppingBagOutlinedIcon /></Badge></IconButton>
					{isAuthenticated ? <>
						<IconButton className="account-link account-link-authenticated" aria-label="My account menu" title="Signed in" onClick={(event) => setAccountMenu(event.currentTarget)}>
							{memberImage ? <img className="account-link-avatar" src={/^(https?:)?\/\//.test(memberImage) ? memberImage : `${accountApiBase.replace(/\/$/, '')}/${memberImage.replace(/^\//, '')}`} alt="" /> : <PersonOutlineRoundedIcon fontSize="small" />}
						</IconButton>
						<Menu anchorEl={accountMenu} open={Boolean(accountMenu)} onClose={() => setAccountMenu(null)}>
							<MenuItem component={Link} href="/my-page" onClick={() => setAccountMenu(null)}><AccountCircleRoundedIcon fontSize="small" sx={{ mr: 1 }} />My Page</MenuItem>
							{isSeller && <MenuItem component={Link} href="/seller/add-product" onClick={() => setAccountMenu(null)}><span className="material-symbols-outlined" style={{ marginRight: 8, fontSize: 18 }}>add_circle</span>Add a product</MenuItem>}
							<MenuItem component={Link} href="/contact" onClick={() => setAccountMenu(null)}>Contact concierge</MenuItem>
							<MenuItem onClick={logout}>Log out</MenuItem>
						</Menu>
					</> : <Link href="/sign-in?mode=signin" className="account-link" aria-label="Login"><PersonOutlineRoundedIcon fontSize="small" /></Link>}
				</div>
			</div>
			{mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{navLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)}>{label}<span>↗</span></Link>)}{isAuthenticated && <button type="button" onClick={logout}>Log out<span>↗</span></button>}</nav>}
		</header>
	);
}

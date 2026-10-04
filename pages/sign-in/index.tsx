import { FormEvent, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import SiteLayout from '@/libs/components/layout/SiteLayout';
import { LOGIN, SIGNUP } from '@/libs/graphql/auth';

type AccountType = 'USER' | 'SELLER';
type SocialProvider = 'Google' | 'Facebook';

const socialAuthUrls: Record<SocialProvider, string | undefined> = {
	Google: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL,
	Facebook: process.env.NEXT_PUBLIC_FACEBOOK_OAUTH_URL,
};

function GoogleMark() {
	return <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.58-5.14 3.58-8.64Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-3c-1.08.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.76-4.97H1.24v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.24 14.26a7.2 7.2 0 0 1 0-4.52v-3.1H1.24a12 12 0 0 0 0 10.72l4-3.1Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8L20 3.15C17.95 1.23 15.23 0 12 0A12 12 0 0 0 1.24 6.64l4 3.1C6.2 6.89 8.86 4.77 12 4.77Z"/></svg>;
}

function FacebookMark() {
	return <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.71 4.54-4.71 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.28h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07Z"/></svg>;
}

export default function SignInPage() {
	const router = useRouter();
	const [register, setRegister] = useState(true);
	const [accountType, setAccountType] = useState<AccountType>('USER');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [busy, setBusy] = useState(false);
	const [login] = useMutation(LOGIN);
	const [signup] = useMutation(SIGNUP);

	useEffect(() => {
		if (router.isReady && router.query.mode === 'signin') setRegister(false);
	}, [router.isReady, router.query.mode]);

	const returnPath = () => {
		const next = router.query.next;
		return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
	};

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setBusy(true);
		setError('');
		setSuccess('');
		const form = new FormData(event.currentTarget);
		const input = {
			memberNick: String(form.get('memberNick') ?? '').trim(),
			memberPassword: String(form.get('memberPassword') ?? ''),
		};
		try {
			const result = register
				? await signup({ variables: { input: { ...input, memberPhone: String(form.get('memberPhone') ?? '').trim(), memberType: accountType } } })
				: await login({ variables: { input } });
			const member = result.data?.[register ? 'signup' : 'login'];
			if (!member?.accessToken) throw new Error(register ? 'Account creation did not return a sign-in token. Please try again.' : 'Sign-in did not return an authentication token. Please try again.');
			localStorage.setItem('accessToken', member.accessToken);
			localStorage.setItem('memberNick', member.memberNick);
			localStorage.setItem('memberType', member.memberType);
			localStorage.removeItem('memberImage');
			window.dispatchEvent(new Event('hadijam:auth-updated'));
			setSuccess(register ? 'Your account was created and you are now signed in.' : 'You are now signed in.');
			await new Promise((resolve) => window.setTimeout(resolve, 1200));
			await router.push(returnPath());
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : 'We could not complete your request.');
		} finally {
			setBusy(false);
		}
	};

	const startSocialAuth = (provider: SocialProvider) => {
		const authUrl = socialAuthUrls[provider];
		if (!authUrl) {
			setError(`${provider} orqali kirish hozircha ulanmagan. Backend OAuth endpointi va provider sozlamalari kerak.`);
			return;
		}
		const destination = new URL(authUrl, window.location.origin);
		destination.searchParams.set('next', returnPath());
		window.location.assign(destination.toString());
	};

	return (
		<SiteLayout title="Private client access | HaDiJaM">
			<section className="auth-page">
				<aside className="auth-story">
					<div className="auth-story-brand">
						<img src="/images/stitch/brand/diamond-mark.png" alt="" />
					<span><strong>HaDiJaM</strong><small>MAISON DE HAUTE ORFÈVRERIE</small></span>
					</div>
					<div className="eyebrow"><span /> BESPOKE PRIVATE SALON VAULT</div>
					<h1>Where High Jewelry<br />Meets <em>Uncompromising<br />Trust.</em></h1>
					<p>Join an exclusive circle of collectors and master ateliers, with sovereign hallmarked treasures and personal care.</p>
					<article className="auth-seal-card">
						<img src="/images/stitch/account/hadijam-sign-in-sign-up-ro-yxatdan-o-tish-va-kirish-sovereign-official-gold-metrological-assay-seal-coin-stamped-with-luxury-102.jpg" alt="Gold assay seal from the HaDiJaM Stitch design" />
						<div><span className="eyebrow">✺ STATE METROLOGY GUARANTEED</span><h2>Assay Office &amp; GIA Escrow Vault</h2><p>Every gold, carat and gem independently appraised and recorded on the sovereign ledger.</p></div>
					</article>
					<div className="auth-trust-row"><div><b>✧</b><strong>100% CERTIFIED</strong><span>State Proba Assay</span></div><div><b>♙</b><strong>BANK ESCROW</strong><span>Zero-Risk Transit</span></div><div><b>↗</b><strong>VIP CONCIERGE</strong><span>Private Salon View</span></div></div>
					<div className="auth-story-foot"><span>◉ &nbsp;Curated by HaDiJaM Council<br />&nbsp;&nbsp;&nbsp;&nbsp; Geneva · Tashkent · Seoul</span><b>MAISON SÉCURISÉ</b></div>
				</aside>

				<section className="auth-card">
					<div className="auth-card-heading">
						<div><span className="eyebrow">PRIVATE PORTAL ACCESS</span><h2>{register ? 'Create Your Account' : 'Welcome Back'}</h2><p>{register ? 'Unlock fine bespoke jewelry, metrological verifications, and private auctions.' : 'Sign in to your private HaDiJaM salon account.'}</p></div>
						<div className="auth-mode" role="tablist" aria-label="Account access mode">
							<button type="button" role="tab" aria-selected={register} className={register ? 'active' : ''} onClick={() => { setRegister(true); setError(''); setSuccess(''); }}>Sign Up</button>
							<button type="button" role="tab" aria-selected={!register} className={!register ? 'active' : ''} onClick={() => { setRegister(false); setError(''); setSuccess(''); }}>Sign In</button>
						</div>
					</div>

					{register && <div className="auth-roles"><span className="auth-field-caption">ACCOUNT PRIVILEGE CLASSIFICATION</span><div>
						<button type="button" className={accountType === 'USER' ? 'selected' : ''} aria-pressed={accountType === 'USER'} onClick={() => setAccountType('USER')}><b>♙</b><span><strong>Collector / Buyer</strong><small>Private salon acquisition</small></span></button>
						<button type="button" className={accountType === 'SELLER' ? 'selected' : ''} aria-pressed={accountType === 'SELLER'} onClick={() => setAccountType('SELLER')}><b>⚒</b><span><strong>Master Jeweler</strong><small>Certified atelier showcase</small></span></button>
					</div></div>}

					<form className="auth-form" onSubmit={submit}>
						{register && <label><span className="auth-field-caption">USERNAME</span><input name="memberNick" minLength={3} maxLength={12} autoComplete="username" required placeholder="Choose a username" /></label>}
						{register && <label><span className="auth-field-caption">DIRECT MOBILE &amp; VAULT VERIFICATION</span><input name="memberPhone" type="tel" autoComplete="tel" required placeholder="+998 90 123 45 67" /></label>}
						{!register && <label className="auth-username"><span className="auth-field-caption">USERNAME</span><input name="memberNick" minLength={3} maxLength={12} autoComplete="username" required placeholder="Your username" /></label>}
						<label className="auth-password"><span className="auth-field-caption">PASSWORD</span><input name="memberPassword" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={5} maxLength={72} required placeholder="Enter your password" /></label>
						{register && <label className="auth-consent"><input type="checkbox" required /><span>I agree to the <b>HaDiJaM Metrological Assays Protocol</b>, Escrow Guarantee, and data confidentiality protection.</span></label>}
						{error && <p className="form-error" role="alert">{error}</p>}
						{success && <p className="form-success" role="status">{success}</p>}
						<button className="button button-gold auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create Exclusive Account' : 'Login'} <span>→</span></button>
					</form>

					<div className="auth-divider"><span>OR CONTINUE WITH / YOKI ORQALI</span></div>
					<div className="auth-socials">
						<button type="button" onClick={() => startSocialAuth('Google')}><GoogleMark /> Google Account</button>
						<button type="button" onClick={() => startSocialAuth('Facebook')}><FacebookMark /> Facebook</button>
					</div>
					<div className="auth-switch">{register ? 'Already registered in the high-jewelry vault?' : 'New to the HaDiJaM salon?'} <button type="button" onClick={() => { setRegister(!register); setError(''); setSuccess(''); }}>{register ? 'Sign In to Salon →' : 'Create your account →'}</button></div>
					<div className="auth-security"><span>♙ 256-Bit SSL Escrow Protected</span><span>✺ Davlat Proba Assayed</span><span>♧ Kafolat &amp; Insurance Protocol</span></div>
				</section>
			</section>
		</SiteLayout>
	);
}

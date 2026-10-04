import Link from 'next/link';
import type { ChangeEvent } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import type { MemberProfile } from '@/libs/types/account';
import { accountApiBase } from '@/libs/utils/account';

export default function AccountSidebar({ profile, initials, loading, uploading, status, onAvatarUpload }: { profile: MemberProfile | null; initials: string; loading: boolean; uploading: boolean; status: string; onAvatarUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
	const seller = profile?.memberType === 'SELLER';
	return <aside className="account-profile-card"><div className="account-avatar-wrap" aria-busy={uploading}>{profile?.memberImage ? <img src={`${accountApiBase}/${profile.memberImage}`} alt={`${profile.memberNick} portrait`} /> : <span>{initials}</span>}<input id="account-avatar-input" className="account-avatar-input" type="file" accept="image/jpeg,image/png" onChange={onAvatarUpload} disabled={uploading} /><label className="account-avatar-upload" htmlFor="account-avatar-input"><span className="material-symbols-outlined">photo_camera</span><span>{uploading ? 'Updating…' : 'Update portrait'}</span></label><i><VerifiedUserOutlinedIcon /></i></div>
		<h2>{profile?.memberFullName || profile?.memberNick || (loading ? 'Loading profile…' : 'Your profile')}</h2><span className="account-handle">@{profile?.memberNick ?? 'member'}</span><span className="account-role-pill"><span className="material-symbols-outlined">diamond</span>{seller ? 'Master Jeweler' : 'Private Collector'}</span>
		<div className="account-stats"><div><small>PORTFOLIO ASSETS</small><b>{profile?.memberPoints ?? 0}<span> pt</span></b></div><div><small>VAULT RATING</small><b>#{profile?.memberRank ?? 0}<span> · RANK</span></b></div></div>
		<div className="account-contact-details"><div><LocalPhoneOutlinedIcon /><span><small>CONTACT PHONE</small><b>{profile?.memberPhone || 'Add a phone number in your profile'}</b></span></div><div><LocationOnOutlinedIcon /><span><small>PRIMARY VAULT DELIVERY ADDRESS</small><b>{profile?.memberAddress || 'Add a delivery address in your profile'}</b></span></div></div>
		<div className="account-security"><span className="eyebrow">ACCOUNT SECURITY</span><div><LockOutlinedIcon /><span>Protected account</span><b>{status || 'Checking'}</b></div><div><VerifiedUserOutlinedIcon /><span>Member status</span><b>{status || 'Checking'}</b></div></div>
		<div className="account-role-gateways"><span className="eyebrow">MANAGEMENT CENTER / ROLE GATEWAYS</span><div className="account-active-gateway"><PersonOutlineRoundedIcon /><span>Patron / Personal Profile</span><b>ACTIVE</b></div>{seller && <Link href="/seller/add-product" className="account-seller-gateway"><span className="material-symbols-outlined">precision_manufacturing</span><span><b>Artisan Studio (Seller)</b><small>Manage your product listings</small></span><ArrowForwardRoundedIcon /></Link>}{profile?.memberType === 'ADMIN' && <div className="account-admin-gateway" aria-label="Master admin console access"><span className="material-symbols-outlined">admin_panel_settings</span><span><b>Master Admin Console</b><small>System Control &amp; Ledger</small></span><b className="account-admin-badge">ADMIN</b></div>}</div>
	</aside>;
}

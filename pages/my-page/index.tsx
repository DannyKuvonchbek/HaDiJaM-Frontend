import { authorizedFetch } from "@/libs/auth";
import { authValue, setAuthValue } from "@/libs/auth";
import { productImageUrl } from "@/libs/utils/productImage";
import SellerApplicationPanel from '@/libs/components/account/SellerApplicationPanel';
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import SiteLayout from '@/libs/components/layout/SiteLayout';
import AccountSidebar from '@/libs/components/account/AccountSidebar';
import AccountTabs from '@/libs/components/account/AccountTabs';
import AccountProfilePanel from '@/libs/components/account/AccountProfilePanel';
import AccountOrdersPanel from '@/libs/components/account/AccountOrdersPanel';
import AccountSavedPanel from '@/libs/components/account/AccountSavedPanel';
import AccountOrderModal from '@/libs/components/account/AccountOrderModal';
import SalonReservationsPanel from '@/libs/components/account/SalonReservationsPanel';
import ServiceBookingsPanel from '@/libs/components/account/ServiceBookingsPanel';
import AccountMessagesPanel from '@/libs/components/account/AccountMessagesPanel';
import AtelierSellerInbox from '@/libs/components/ateliers/AtelierSellerInbox';
import { addToCart } from '@/libs/cart';
import { GET_MY_FAVORITES, GET_MEMBER_PROFILE, GET_MY_NOTIFICATIONS, GET_MY_ORDERS, UPDATE_MEMBER_PROFILE } from '@/libs/graphql/myPage';
import { LIKE_PRODUCT } from '@/libs/graphql/products';
import type { AccountOrder, AccountTab, MemberProfile, SavedProduct } from '@/libs/types/account';
import { formatAccountStatus, readMemberId } from '@/libs/utils/account';

export default function MyPage() {
	const router = useRouter();
	const [memberId, setMemberId] = useState('');
	const [tab, setTab] = useState<AccountTab>('orders');
	const [profile, setProfile] = useState<MemberProfile | null>(null);
	const [fullName, setFullName] = useState('');
	const [nickname, setNickname] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [description, setDescription] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [selectedOrder, setSelectedOrder] = useState<AccountOrder | null>(null);
	const [avatarUploading, setAvatarUploading] = useState(false);
	const [saveProfile, { loading: saving }] = useMutation(UPDATE_MEMBER_PROFILE);
	const [toggleLike] = useMutation(LIKE_PRODUCT);
	const { data: memberResult, loading: memberLoading, error: memberError, refetch: refetchMember } = useQuery(GET_MEMBER_PROFILE, { variables: { memberId }, skip: !memberId, fetchPolicy: 'network-only', pollInterval: memberId ? (profile?.sellerIntent && profile.memberType === "USER" ? 1000 : 15000) : 0 });
	const { data: orderResult, loading: ordersLoading, error: ordersError } = useQuery(GET_MY_ORDERS, { variables: { input: { page: 1, limit: 20 } }, skip: !memberId || tab !== 'orders', fetchPolicy: 'network-only' });
	const { data: favoritesResult, loading: favoritesLoading, error: favoritesError, refetch: refetchFavorites } = useQuery(GET_MY_FAVORITES, { variables: { input: { page: 1, limit: 24 } }, skip: !memberId || tab !== 'saved', fetchPolicy: 'network-only' });
	const { data: notificationsResult, refetch: refetchNotifications } = useQuery(GET_MY_NOTIFICATIONS, { variables: { input: { page: 1, limit: 1 } }, skip: !memberId, fetchPolicy: 'network-only', pollInterval: memberId ? (profile?.sellerIntent && profile.memberType === "USER" ? 1000 : 15000) : 0 });
	const orders: AccountOrder[] = orderResult?.getMyOrders?.list ?? [];
	const favorites: SavedProduct[] = favoritesResult?.getFavorites?.list ?? [];
	const totalOrders = orderResult?.getMyOrders?.metaCounter?.[0]?.total ?? orders.length;
	const totalFavorites = favoritesResult?.getFavorites?.metaCounter?.[0]?.total ?? favorites.length;
	const unreadMessages = notificationsResult?.getMyNotifications?.unreadCount ?? 0;
	const member = memberResult?.getMember as MemberProfile | undefined;
	const initials = useMemo(() => (profile?.memberFullName || profile?.memberNick || 'H').split(/\s+/).slice(0, 2).map((name) => name[0]).join('').toUpperCase(), [profile]);

	useEffect(() => {
		if (!router.isReady) return;
		const token = authValue("accessToken");
		if (!token) { const requestedTab = router.query.tab; const next = requestedTab === 'saved' || requestedTab === 'salon' || requestedTab === 'services' || requestedTab === 'messages' || requestedTab === 'atelier-inbox' ? `%2Fmy-page%3Ftab%3D${requestedTab}` : '%2Fmy-page'; void router.replace(`/sign-in?mode=signin&next=${next}`); return; }
		const id = readMemberId(token);
		if (!id) { setError('We could not read your account session. Please sign in again.'); return; }
		setMemberId(id);
	}, [router.isReady, router.query.tab, router]);

	useEffect(() => {
		if (!router.isReady || typeof router.query.tab !== 'string') return;
		if (router.query.tab === 'saved' || router.query.tab === 'orders' || router.query.tab === 'profile' || router.query.tab === 'salon' || router.query.tab === 'services' || router.query.tab === 'messages' || router.query.tab === 'atelier-inbox') {
			setTab(router.query.tab);
		}
	}, [router.isReady, router.query.tab]);

	useEffect(() => {
		if (!member) return;
        if (authValue("memberType") !== member.memberType) {
            setAuthValue("memberType", member.memberType);
            window.dispatchEvent(new Event('hadijam:auth-updated'));
        }
		setProfile(member);
		setFullName(member.memberFullName ?? '');
		setNickname(member.memberNick ?? '');
		setPhone(member.memberPhone ?? '');
		setAddress(member.memberAddress ?? '');
		setDescription(member.memberDesc ?? '');
	}, [member]);

	const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault(); setMessage(''); setError('');
		if (!profile) return;
		try {
			const result = await saveProfile({ variables: { input: { _id: profile._id, memberFullName: fullName.trim(), memberNick: nickname.trim(), memberPhone: phone.trim(), memberAddress: address.trim(), memberDesc: description.trim() } } });
			const updated = result.data?.updateMember;
			if (!updated) throw new Error('Profile changes were not confirmed by the server.');
			setProfile((current) => current ? { ...current, ...updated } : current);
			setMessage('Your profile has been updated.');
			await refetchMember();
		} catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not save your profile.'); }
	};

	const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
		if (!file || !profile) return;
		if (!/^image\/(jpeg|png)$/.test(file.type)) { setError('Choose a JPG or PNG image.'); return; }
		if (file.size > 8 * 1024 * 1024) { setError('Choose an image smaller than 8 MB.'); return; }
		setError(''); setMessage(''); setAvatarUploading(true);
		try {
			const token = authValue("accessToken");
			if (!token) throw new Error('Your session has expired. Please sign in again.');
			const formData = new FormData();
			formData.append('operations', JSON.stringify({ query: 'mutation UploadMemberImage($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }', variables: { file: null, target: 'member' } }));
			formData.append('map', JSON.stringify({ '0': ['variables.file'] })); formData.append('0', file, file.name);
			const response = await authorizedFetch(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:1997/graphql', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'apollo-require-preflight': 'true' }, body: formData });
			const payload = await response.json(); const memberImage = payload.data?.imageUploader;
			if (!response.ok || payload.errors?.length || typeof memberImage !== 'string') throw new Error(payload.errors?.[0]?.message ?? 'Profile photo upload failed. Please try again.');
			const result = await saveProfile({ variables: { input: { _id: profile._id, memberImage } } });
			const updated = result.data?.updateMember;
			if (!updated) throw new Error('The server did not confirm your profile photo update.');
			if (updated.memberImage) setAuthValue("memberImage", updated.memberImage);
			window.dispatchEvent(new Event('hadijam:auth-updated'));
			setProfile((current) => current ? { ...current, ...updated } : current); setMessage('Your profile photo has been updated.'); await refetchMember();
		} catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not update your profile photo.'); }
		finally { setAvatarUploading(false); }
	};

	const removeFavorite = async (productId: string) => {
		try { await toggleLike({ variables: { productId } }); await refetchFavorites(); }
		catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not update your saved pieces.'); }
	};
	const addSavedProductToBag = (item: SavedProduct) => {
		const image = item.productImages?.[0] ? productImageUrl(item.productImages[0]) : '';
		addToCart({ id: item._id, title: item.productTitle, price: item.productPrice, image });
		setMessage(`${item.productTitle} was added to your bag.`);
	};
	const switchTab = (next: AccountTab) => { setTab(next); setError(''); setMessage(''); };
	const accountStatus = profile?.memberStatus === 'ACTIVE' ? 'Vault active' : formatAccountStatus(profile?.memberStatus ?? '');

	return <SiteLayout title="My Account | HaDiJaM"><section className="account-portal section-shell"><div className="account-portal-heading"><div><span className="eyebrow"><i /> MONOGRAM SUITE · ENCRYPTED CONNECTION</span><h1>Private Residence &amp; Account Portal</h1></div></div><div className="account-portal-grid"><AccountSidebar profile={profile} initials={initials} loading={memberLoading} uploading={avatarUploading} status={accountStatus} onAvatarUpload={handleAvatarUpload} /><div className="account-details-column">{profile && <SellerApplicationPanel memberType={profile.memberType} sellerIntent={profile.sellerIntent} onApproved={() => { void refetchMember(); void refetchNotifications(); }} />}<AccountTabs active={tab} orders={totalOrders} unreadMessages={unreadMessages} sellerInbox={profile?.memberType === 'SELLER' && profile.memberNick?.toLowerCase() === 'martin'} onChange={switchTab} />{tab === 'profile' && <AccountProfilePanel loading={memberLoading && !profile} loadError={memberError?.message} saving={saving} error={error} message={message} fullName={fullName} nickname={nickname} phone={phone} address={address} description={description} onFullName={setFullName} onNickname={setNickname} onPhone={setPhone} onAddress={setAddress} onDescription={setDescription} onSubmit={handleProfileSave} />}{tab === 'orders' && <><AccountOrdersPanel orders={orders} loading={ordersLoading} error={ordersError?.message} onDetails={setSelectedOrder} />{error && <p className="account-feedback error" role="alert">{error}</p>}{message && <p className="account-feedback success" role="status">{message}</p>}</>}{tab === 'services' && memberId && <ServiceBookingsPanel />}{tab === 'atelier-inbox' && memberId && profile?.memberType === 'SELLER' && profile.memberNick?.toLowerCase() === 'martin' && <AtelierSellerInbox memberId={memberId} />}{tab === 'saved' && <><AccountSavedPanel items={favorites} loading={favoritesLoading} error={favoritesError?.message} onRemove={removeFavorite} onAddToBag={addSavedProductToBag} />{error && <p className="account-feedback error" role="alert">{error}</p>}{message && <p className="account-feedback success" role="status">{message}</p>}</>}{tab === 'salon' && memberId && <SalonReservationsPanel />}{tab === 'messages' && memberId && <AccountMessagesPanel key={profile?.memberType} onUpdate={() => { void refetchNotifications(); }} />}</div></div>{selectedOrder && <AccountOrderModal order={selectedOrder} phone={profile?.memberPhone} onClose={() => setSelectedOrder(null)} />}</section></SiteLayout>;
}

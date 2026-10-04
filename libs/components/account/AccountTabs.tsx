import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import type { AccountTab } from '@/libs/types/account';

export default function AccountTabs({ active, orders, saved, onChange }: { active: AccountTab; orders: number; saved: number; onChange: (tab: AccountTab) => void }) {
	return <div className="account-tabs" role="tablist" aria-label="Account sections"><button type="button" role="tab" aria-selected={active === 'profile'} className={active === 'profile' ? 'active' : ''} onClick={() => onChange('profile')}><AccountBoxOutlinedIcon />Personal Profile</button><button type="button" role="tab" aria-selected={active === 'orders'} className={active === 'orders' ? 'active' : ''} onClick={() => onChange('orders')}><span className="material-symbols-outlined">gavel</span>My Orders &amp; Escrow <i>{orders}</i></button><button type="button" role="tab" aria-selected={active === 'saved'} className={active === 'saved' ? 'active' : ''} onClick={() => onChange('saved')}><FavoriteRoundedIcon />Saved Pieces <i>{saved}</i></button></div>;
}

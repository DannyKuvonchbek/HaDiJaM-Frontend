import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import type { Locale } from '@/libs/utils/LocaleProvider';
import { conciergeText } from './translations';

export default function AIConciergeLauncher({ locale, onClick }: { locale: Locale; onClick: () => void }) {
	return <button type="button" className="ai-concierge-launcher" onClick={onClick} aria-label={conciergeText(locale, 'launcher')} title={conciergeText(locale, 'launcher')}><AutoAwesomeRoundedIcon /></button>;
}

import { productImageUrl } from "@/libs/utils/productImage";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SiteLayout from '@/libs/components/layout/SiteLayout';
import ProductCard from '@/libs/components/catalog/ProductCard';
import { featuredProducts } from '@/libs/data/catalog';
import { getProductImage } from '@/libs/data/productImages';
import { findGeneratedTitleSearch, getProductDisplayTitle } from '@/libs/data/productTitles';
import { usdToUzs } from '@/libs/utils/currency';
import { useUsdUzsRate } from '@/libs/utils/CurrencyProvider';
import { GET_PRODUCTS } from '@/libs/graphql/products';
import type { ApiProduct, Product, ProductCategory } from '@/libs/types/product';
import { useLocale } from '@/libs/utils/LocaleProvider';

const categoryShowcase: { label: string; sublabel: string; value: ProductCategory; lots: string; image: string }[] = [
	{ label: 'Rings', sublabel: 'Solitaire & statement', value: 'ring', lots: '412 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-bespoke-hand-engraved-monogram-heavy-signet-ring-in-rich-18k-yellow-gold-064.jpg' },
	{ label: 'Earrings', sublabel: 'Hoops, studs & drops', value: 'earring', lots: '10 Pieces', image: '/images/stitch/products/hadijam-mahsulot-sotuvchi-profili-desktop-pair-of-matching-18k-yellow-gold-halo-stud-earrings-set-with-brilliant-d-074.jpg' },
	{ label: 'Bracelets', sublabel: 'Bangles & links', value: 'bracelet', lots: '184 Lots', image: '/images/stitch/home/hadijam-bosh-sahifa-homepage-gold-bracelets-037.jpg' },
	{ label: 'Chains', sublabel: 'Gold chains', value: 'chain', lots: '340 Lots', image: '/images/stitch/home/hadijam-bosh-sahifa-homepage-gold-chains-038.jpg' },
	{ label: 'Timepieces', sublabel: 'Watches & horology', value: 'watch', lots: '96 Pieces', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-luxury-swiss-yellow-gold-chronometer-watch-with-fluted-bezel-and-gold-pr-062.jpg' },
];

const metalOptions = ['14K Gold', '18K Yellow Gold', '24K Pure Gold', '18K White Gold', '18K Rose Gold', 'Platinum 950'];
const metalSearchValues: Record<string, string[]> = {
	'14K Gold': ['14K Gold', '14K Yellow Gold', '14K White Gold', '14K Rose Gold', '14K Solid Gold'],
};
const gemstoneOptions = ['Natural Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Pearl', 'No Gems'];
const certificationOptions = ['GIA Dossier / Diamond', 'State Metrology Hallmark', 'HaDiJaM Vault Escrow Seal'];
const CATALOG_PAGE_SIZE = 10;
const MAX_PRICE = 20000000;

interface CatalogFilters {
	search: string;
	minPrice: number | '';
	maxPrice: number | '';
	metals: string[];
	gemstone: string | null;
	certifications: string[];
}

const emptyFilters = (): CatalogFilters => ({
	search: '',
	minPrice: '',
	maxPrice: '',
	metals: [],
	gemstone: null,
	certifications: [],
});

function toCatalogProduct(item: ApiProduct, index: number): Product {
	const fallback = featuredProducts[index % featuredProducts.length].image;
	const category = (['ring', 'necklace', 'bracelet', 'chain', 'brooch', 'earring', 'watch'].includes(item.productType) ? item.productType : 'ring') as ProductCategory;
	const uploadedImage = item.productImages?.[0] ? productImageUrl(item.productImages[0]) : fallback;
	return {
		...featuredProducts[index % featuredProducts.length],
		id: item._id,
		title: getProductDisplayTitle(category, item.productTitle, index),
		price: item.productPrice,
		subtitle: item.productDesc ?? 'Selected and verified by HaDiJaM',
		image: item.productImages?.[0] ? uploadedImage : getProductImage(category, item.productTitle, index, uploadedImage),
		category,
		badge: 'Maison verified',
		seller: 'Independent atelier',
		productLikes: item.productLikes ?? 0,
		meLiked: item.meLiked ?? [],
	};
}

export default function CatalogPage() {
	const router = useRouter();
	const { t } = useLocale();
	const usdUzsRate = useUsdUzsRate();
	const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
	const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [sort, setSort] = useState('featured');
	const [columns, setColumns] = useState<2 | 3>(2);
	const [applied, setApplied] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [sellerId, setSellerId] = useState('');

	useEffect(() => {
		if (!router.isReady) return;
		const queryCategory = router.query.category;
		const category = Array.isArray(queryCategory) ? queryCategory[0] : queryCategory;
		const querySellerId = Array.isArray(router.query.sellerId) ? router.query.sellerId[0] : router.query.sellerId;
		const querySearch = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q;
		const supportedCategories: ProductCategory[] = ['ring', 'necklace', 'bracelet', 'chain', 'brooch', 'earring', 'watch'];
		setActiveCategory(supportedCategories.includes(category as ProductCategory) ? (category as ProductCategory) : 'all');
		setSellerId(typeof querySellerId === 'string' ? querySellerId : '');
		if (typeof querySearch === 'string') setFilters((current) => ({ ...current, search: querySearch }));
		setCurrentPage(1);
	}, [router.isReady, router.query.category, router.query.sellerId, router.query.q]);

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 300);
		return () => window.clearTimeout(timer);
	}, [filters.search]);
	const generatedTitleSearch = useMemo(
		() => findGeneratedTitleSearch(debouncedSearch, activeCategory),
		[activeCategory, debouncedSearch],
	);

	const productQueryVariables = useMemo(() => ({
		input: {
			page: currentPage,
			limit: CATALOG_PAGE_SIZE,
			sort: sort === 'price-low' || sort === 'price-high' ? 'productPrice' : 'createdAt',
			direction: sort === 'price-low' ? 'ASC' : 'DESC',
			search: {
				productStatus: 'ACTIVE',
				...(sellerId ? { memberId: sellerId } : {}),
				...(filters.minPrice !== '' || filters.maxPrice !== '' ? {
					...(filters.minPrice !== '' ? { minPrice: usdToUzs(filters.minPrice, usdUzsRate) } : {}),
					...(filters.maxPrice !== '' ? { maxPrice: usdToUzs(filters.maxPrice, usdUzsRate) } : {}),
				} : {}),
				...((activeCategory !== 'all' || generatedTitleSearch) ? {
					productType: generatedTitleSearch?.productType ?? activeCategory,
				} : {}),
				...(debouncedSearch ? { text: generatedTitleSearch?.number ?? debouncedSearch } : {}),
				...(filters.metals.length ? { metals: filters.metals.flatMap((metal) => metalSearchValues[metal] ?? [metal]) } : {}),
				...(filters.gemstone ? { gemstone: filters.gemstone } : {}),
				...(filters.certifications.length ? { certifications: filters.certifications } : {}),
			},
		},
	}), [activeCategory, currentPage, debouncedSearch, filters.certifications, filters.gemstone, filters.maxPrice, filters.metals, generatedTitleSearch, sellerId, sort, usdUzsRate]);
	const { data, loading: queryLoading, error: queryError, refetch } = useQuery(GET_PRODUCTS, {
		variables: productQueryVariables,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const products = useMemo(() => ((data?.getProducts?.list ?? []) as ApiProduct[]).map(toCatalogProduct), [data]);
	const totalProducts = Number(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
	const pageCount = Math.max(1, Math.ceil(totalProducts / CATALOG_PAGE_SIZE));
	const pageWindowStart = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
	const visiblePages = Array.from({ length: Math.min(pageCount, 5) }, (_, index) => pageWindowStart + index);
	const isLoading = queryLoading;

	const toggleFilterValue = (key: 'metals' | 'certifications', value: string) => {
		setFilters((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
		setCurrentPage(1);
	};
	const toggleGemstone = (gemstone: string) => {
		setFilters((current) => ({ ...current, gemstone: current.gemstone === gemstone ? null : gemstone }));
		setCurrentPage(1);
	};
	const applyFilters = () => {
		setApplied(true);
		setCurrentPage(1);
		void refetch({ ...productQueryVariables, input: { ...productQueryVariables.input, page: 1 } });
	};
	const selectCategory = (category: ProductCategory) => {
		const nextCategory = activeCategory === category ? 'all' : category;
		setActiveCategory(nextCategory);
		setCurrentPage(1);
		const query = new URLSearchParams();
		if (nextCategory !== 'all') query.set('category', nextCategory);
		if (sellerId) query.set('sellerId', sellerId);
		void router.push(query.size ? `/catalog?${query.toString()}` : '/catalog', undefined, { shallow: true, scroll: false });
	};
	const resetFilters = () => {
		setActiveCategory('all');
		setFilters(emptyFilters());
		setDebouncedSearch('');
		setSort('featured');
		setCurrentPage(1);
		setApplied(false);
		setSellerId('');
		void router.replace('/catalog', undefined, { shallow: true, scroll: false });
	};

	return <SiteLayout title="HaDiJaM | Fine Jewelry & Atelier">
		<div className="marketplace-page">
			<header className="marketplace-hero section-shell">
				<nav className="marketplace-breadcrumb" aria-label="Breadcrumb"><span>{t('Home')}</span><b>›</b><span>{t('Marketplace')}</span><b>›</b><strong>{t('Fine Jewelry')}</strong></nav>
				<div className="marketplace-hero-row"><div><div className="marketplace-edition"><span>{t('Vault Assayed 2025')}</span><i /> {t('Seoul · Geneva · Milan')}</div><h1>{t('HaDiJaM Fine Jewelry Collection')}</h1><p>{t('Explore verified 18K/24K solid gold, rare-cut gemstones, and bespoke creations selected from independent ateliers.')}</p></div><div className="marketplace-stats"><div><small>{t('Certified In-Vault')}</small><strong>{t('1,480+ Pieces')}</strong></div><i /><div><small>{t('Metrological Purity')}</small><strong>99.9% 24K</strong></div></div></div>
			</header>

			<section className="marketplace-categories section-shell" aria-label={t('Shop by category')}>{categoryShowcase.map((category) => <button type="button" key={category.value} className={`marketplace-category ${activeCategory === category.value ? 'active' : ''}`} onClick={() => selectCategory(category.value)}><span className="marketplace-category-image"><img src={category.image} alt="" /><small>{category.lots}</small></span><span className="marketplace-category-copy"><span><strong>{t(category.label)}</strong><small>{t(category.sublabel)}</small></span><b>→</b></span></button>)}</section>

			<section className="marketplace-layout section-shell">
				<aside className="marketplace-filter-panel">
					<div className="marketplace-filter-title"><h2><TuneRoundedIcon /> {t('Filter Vault')}</h2><button type="button" onClick={resetFilters}>{t('Reset All')}</button></div>
					<label className="marketplace-filter-label" htmlFor="market-search">{t('Keyword Assay')}</label>
					<div className="marketplace-filter-search"><SearchRoundedIcon /><input id="market-search" value={filters.search} onChange={(event) => { setFilters((current) => ({ ...current, search: event.target.value })); setCurrentPage(1); }} placeholder={t('Cut, carat, maison name…')} /></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">{t('Price Range (USD)')}</span><div className="marketplace-price-inputs"><label><span>{t('Min')}</span><input aria-label={t('Minimum price')} type="number" min="0" max={MAX_PRICE} placeholder="$0" value={filters.minPrice} onChange={(event) => { const value = event.target.value === '' ? '' : Math.min(MAX_PRICE, Math.max(0, Number(event.target.value))); setFilters((current) => ({ ...current, minPrice: value })); setCurrentPage(1); }} /></label><span className="marketplace-price-divider">—</span><label><span>{t('Max')}</span><input aria-label={t('Maximum price')} type="number" min="0" max={MAX_PRICE} placeholder={`$${MAX_PRICE.toLocaleString('en-US')}`} value={filters.maxPrice} onChange={(event) => { const value = event.target.value === '' ? '' : Math.min(MAX_PRICE, Math.max(0, Number(event.target.value))); setFilters((current) => ({ ...current, maxPrice: value })); setCurrentPage(1); }} /></label></div><div className="marketplace-range-labels"><span>0</span><span>{t('Up to')} ${MAX_PRICE.toLocaleString('en-US')}</span></div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">{t('Alloy & Karat Purity')}</span><div className="marketplace-check-list">{metalOptions.map((metal) => <label key={metal}><input type="checkbox" checked={filters.metals.includes(metal)} onChange={() => toggleFilterValue('metals', metal)} /><span>{metal}</span></label>)}</div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">{t('Rare Gemstone Assortment')}</span><div className="marketplace-gem-filters">{gemstoneOptions.map((gem) => <button type="button" aria-pressed={filters.gemstone === gem} className={filters.gemstone === gem ? 'selected' : ''} key={gem} onClick={() => toggleGemstone(gem)}>{gem}</button>)}</div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">{t('Independent Certification')}</span><div className="marketplace-check-list">{certificationOptions.map((item, index) => <label key={item}><input type="checkbox" checked={filters.certifications.includes(item)} onChange={() => toggleFilterValue('certifications', item)} /><span>{item}</span><span className="material-symbols-outlined">{index === 0 ? 'verified' : index === 1 ? 'workspace_premium' : 'lock'}</span></label>)}</div></div>
					<button className="marketplace-apply-button" type="button" onClick={applyFilters}><TuneRoundedIcon />{t('Apply Curated Filters')} <span>({totalProducts})</span></button>
					{applied && !isLoading && <p className="marketplace-filter-note" role="status">{t('Filters applied')} · {totalProducts} {t('pieces match your selection.')}</p>}
				</aside>

				<div className="marketplace-results">
					<div className="marketplace-results-toolbar"><div className="marketplace-results-summary"><strong>{isLoading ? t('Loading Collection…') : `${t('Showing')} ${totalProducts} ${t('Curated Creations')}`}</strong><span>{isLoading ? t('Please wait') : t('Live Catalogue')}</span></div><div className="marketplace-results-controls"><label>{t('Sort by')}<select value={sort} onChange={(event) => { setSort(event.target.value); setCurrentPage(1); }}><option value="featured">{t('Curated & Featured')}</option><option value="price-high">{t('Price: High to Low')}</option><option value="price-low">{t('Price: Low to High')}</option></select><KeyboardArrowDownRoundedIcon /></label><div className="marketplace-grid-toggle"><button type="button" aria-label="Two column view" aria-pressed={columns === 2} className={columns === 2 ? 'active' : ''} onClick={() => setColumns(2)}><span className="material-symbols-outlined">grid_view</span></button><button type="button" aria-label="Three column view" aria-pressed={columns === 3} className={columns === 3 ? 'active' : ''} onClick={() => setColumns(3)}><span className="material-symbols-outlined">view_column</span></button></div></div></div>
					{isLoading ? <div className="marketplace-empty" role="status"><span className="material-symbols-outlined">hourglass_top</span><h2>{t('Loading collection')}</h2><p>{t('Finding matching pieces across the full catalogue.')}</p></div> : queryError ? <div className="marketplace-empty" role="alert"><span className="material-symbols-outlined">cloud_off</span><h2>{t('Catalogue unavailable')}</h2><p>{t('We could not load the full collection. Please try again.')}</p><button type="button" onClick={() => { setCurrentPage(1); void refetch(); }}>{t('Try again')}</button></div> : !totalProducts ? <div className="marketplace-empty"><span className="material-symbols-outlined">search_off</span><h2>{t('No pieces found')}</h2><p>{filters.metals.length || filters.gemstone || filters.certifications.length ? 'These filters search the specifications saved in each product listing. No active listing currently matches the selected purity, gemstone, or certification. Ask the seller to add verified details, or clear the filters.' : t('Change your search or clear filters to see more of the collection.')}</p><button type="button" onClick={resetFilters}>{t('Clear filters')}</button></div> : <div className={`product-grid marketplace-products columns-${columns}`}>{products.map((product) => <ProductCard key={product.id} product={product} marketplace />)}</div>}
					{!isLoading && !queryError && totalProducts > 0 && <nav className="marketplace-pagination" aria-label="Marketplace pages"><span>Showing {(currentPage - 1) * CATALOG_PAGE_SIZE + 1}–{Math.min(currentPage * CATALOG_PAGE_SIZE, totalProducts)} of {totalProducts} verified pieces · Page {currentPage} of {pageCount}</span><div><button type="button" disabled={currentPage === 1} aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button>{pageWindowStart > 1 && <><button type="button" aria-label="Page 1" onClick={() => setCurrentPage(1)}>1</button><span className="marketplace-page-ellipsis">…</span></>}{visiblePages.map((page) => <button type="button" key={page} className={currentPage === page ? 'current' : ''} aria-label={`Page ${page}`} aria-current={currentPage === page ? 'page' : undefined} onClick={() => setCurrentPage(page)}>{page}</button>)}{pageWindowStart + visiblePages.length - 1 < pageCount && <><span className="marketplace-page-ellipsis">…</span><button type="button" aria-label={`Page ${pageCount}`} onClick={() => setCurrentPage(pageCount)}>{pageCount}</button></>}<button type="button" disabled={currentPage >= pageCount} aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>›</button></div></nav>}
				</div>
			</section>

			<section className="marketplace-trust section-shell" aria-label={t('Marketplace guarantees')}><article><span className="material-symbols-outlined">shield</span><div><h3>{t('Authentic Escrow Vault')}</h3><p>Funds remain locked in third-party escrow until inspection and approval.</p></div></article><article><span className="material-symbols-outlined">workspace_premium</span><div><h3>{t('State Assay Hallmark')}</h3><p>Gold pieces are checked against their listed purity and documentation.</p></div></article><article><span className="material-symbols-outlined">local_shipping</span><div><h3>{t('Insured Delivery')}</h3><p>Delivery details are confirmed for each order with the concierge.</p></div></article><article><span className="material-symbols-outlined">currency_exchange</span><div><h3>{t('Inspection Window')}</h3><p>Review the piece and its paperwork before confirming receipt.</p></div></article></section>
		</div>
	</SiteLayout>;
}

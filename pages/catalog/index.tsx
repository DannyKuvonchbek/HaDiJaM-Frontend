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
import { getProductDisplayTitle } from '@/libs/data/productTitles';
import { usdToUzs } from '@/libs/utils/currency';
import { useUsdUzsRate } from '@/libs/utils/CurrencyProvider';
import { GET_PRODUCTS } from '@/libs/graphql/products';
import type { ApiProduct, Product, ProductCategory } from '@/libs/types/product';

const categoryShowcase: { label: string; sublabel: string; value: ProductCategory; lots: string; image: string }[] = [
	{ label: 'Rings', sublabel: 'Solitaire & statement', value: 'ring', lots: '412 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-exquisite-solitaire-brilliant-cut-diamond-ring-in-18k-warm-yellow-gold-s-054.jpg' },
	{ label: 'Earrings', sublabel: 'Hoops, studs & drops', value: 'earring', lots: '10 Pieces', image: '/images/products/earrings/unsplash-gold-earrings-02.jpg' },
	{ label: 'Bracelets', sublabel: 'Bangles & links', value: 'bracelet', lots: '184 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-intricate-geometric-diamond-gold-bangle-bracelet-illuminated-on-smooth-v-056.jpg' },
	{ label: 'Chains', sublabel: 'Gold chains', value: 'chain', lots: '340 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-solid-24-karat-pure-yellow-gold-woven-curb-chain-coiled-on-textured-matt-057.jpg' },
	{ label: 'Timepieces', sublabel: 'Watches & horology', value: 'watch', lots: '96 Pieces', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-high-horology-yellow-gold-automatic-wristwatch-with-champange-dial-resti-058.jpg' },
];

const metalOptions = ['14K Gold', '18K Yellow Gold', '24K Pure Gold', '18K White Gold', '18K Rose Gold', 'Platinum 950'];
const metalSearchValues: Record<string, string[]> = {
	'14K Gold': ['14K Gold', '14K Yellow Gold', '14K White Gold', '14K Rose Gold', '14K Solid Gold'],
};
const gemstoneOptions = ['Natural Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Pearl', 'No Gems'];
const certificationOptions = ['GIA Dossier / Diamond', 'State Metrology Hallmark', 'HaDiJaM Vault Escrow Seal'];
const CATALOG_PAGE_SIZE = 24;
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
	const uploadedImage = item.productImages?.[0] ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9702'}/${item.productImages[0]}` : fallback;
	return {
		...featuredProducts[index % featuredProducts.length],
		id: item._id,
		title: getProductDisplayTitle(category, item.productTitle, index),
		price: item.productPrice,
		subtitle: item.productDesc ?? 'Selected and verified by HaDiJaM',
		image: getProductImage(category, item.productTitle, index, uploadedImage),
		category,
		badge: 'Maison verified',
		seller: 'Independent atelier',
		productLikes: item.productLikes ?? 0,
		meLiked: item.meLiked ?? [],
	};
}

export default function CatalogPage() {
	const router = useRouter();
	const usdUzsRate = useUsdUzsRate();
	const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
	const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [sort, setSort] = useState('featured');
	const [columns, setColumns] = useState<2 | 3>(2);
	const [applied, setApplied] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		if (!router.isReady) return;
		const queryCategory = router.query.category;
		const category = Array.isArray(queryCategory) ? queryCategory[0] : queryCategory;
		const supportedCategories: ProductCategory[] = ['ring', 'necklace', 'bracelet', 'chain', 'brooch', 'earring', 'watch'];
		setActiveCategory(supportedCategories.includes(category as ProductCategory) ? (category as ProductCategory) : 'all');
		setCurrentPage(1);
	}, [router.isReady, router.query.category]);

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 300);
		return () => window.clearTimeout(timer);
	}, [filters.search]);

	const productQueryVariables = useMemo(() => ({
		input: {
			page: currentPage,
			limit: CATALOG_PAGE_SIZE,
			sort: sort === 'price-low' || sort === 'price-high' ? 'productPrice' : 'createdAt',
			direction: sort === 'price-low' ? 'ASC' : 'DESC',
			search: {
				productStatus: 'ACTIVE',
				...(filters.minPrice !== '' || filters.maxPrice !== '' ? {
					...(filters.minPrice !== '' ? { minPrice: usdToUzs(filters.minPrice, usdUzsRate) } : {}),
					...(filters.maxPrice !== '' ? { maxPrice: usdToUzs(filters.maxPrice, usdUzsRate) } : {}),
				} : {}),
				...(activeCategory !== 'all' ? { productType: activeCategory } : {}),
				...(debouncedSearch ? { text: debouncedSearch } : {}),
				...(filters.metals.length ? { metals: filters.metals.flatMap((metal) => metalSearchValues[metal] ?? [metal]) } : {}),
				...(filters.gemstone ? { gemstone: filters.gemstone } : {}),
				...(filters.certifications.length ? { certifications: filters.certifications } : {}),
			},
		},
	}), [activeCategory, currentPage, debouncedSearch, filters.certifications, filters.gemstone, filters.maxPrice, filters.metals, sort, usdUzsRate]);
	const { data, loading: queryLoading, error: queryError, refetch } = useQuery(GET_PRODUCTS, {
		variables: productQueryVariables,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const products = useMemo(() => ((data?.getProducts?.list ?? []) as ApiProduct[]).map(toCatalogProduct), [data]);
	const totalProducts = Number(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
	const pageCount = Math.max(1, Math.ceil(totalProducts / CATALOG_PAGE_SIZE));
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
		void router.push(nextCategory === 'all' ? '/catalog' : `/catalog?category=${nextCategory}`, undefined, { shallow: true, scroll: false });
	};
	const resetFilters = () => {
		setActiveCategory('all');
		setFilters(emptyFilters());
		setDebouncedSearch('');
		setSort('featured');
		setCurrentPage(1);
		setApplied(false);
		void router.replace('/catalog', undefined, { shallow: true, scroll: false });
	};

	return <SiteLayout title="HaDiJaM | Fine Jewelry & Atelier">
		<div className="marketplace-page">
			<header className="marketplace-hero section-shell">
				<nav className="marketplace-breadcrumb" aria-label="Breadcrumb"><span>Home</span><b>›</b><span>Marketplace</span><b>›</b><strong>Fine Jewelry</strong></nav>
				<div className="marketplace-hero-row"><div><div className="marketplace-edition"><span>Vault Assayed 2025</span><i /> Seoul · Geneva · Milan</div><h1>HaDiJaM Fine Jewelry Collection</h1><p>Explore verified 18K/24K solid gold, rare-cut gemstones, and bespoke creations selected from independent ateliers.</p></div><div className="marketplace-stats"><div><small>Certified In-Vault</small><strong>1,480+ Pieces</strong></div><i /><div><small>Metrological Purity</small><strong>99.9% 24K</strong></div></div></div>
			</header>

			<section className="marketplace-categories section-shell" aria-label="Shop by category">{categoryShowcase.map((category) => <button type="button" key={category.value} className={`marketplace-category ${activeCategory === category.value ? 'active' : ''}`} onClick={() => selectCategory(category.value)}><span className="marketplace-category-image"><img src={category.image} alt="" /><small>{category.lots}</small></span><span className="marketplace-category-copy"><span><strong>{category.label}</strong><small>{category.sublabel}</small></span><b>→</b></span></button>)}</section>

			<section className="marketplace-layout section-shell">
				<aside className="marketplace-filter-panel">
					<div className="marketplace-filter-title"><h2><TuneRoundedIcon /> Filter Vault</h2><button type="button" onClick={resetFilters}>Reset All</button></div>
					<label className="marketplace-filter-label" htmlFor="market-search">Keyword Assay</label>
					<div className="marketplace-filter-search"><SearchRoundedIcon /><input id="market-search" value={filters.search} onChange={(event) => { setFilters((current) => ({ ...current, search: event.target.value })); setCurrentPage(1); }} placeholder="Cut, carat, maison name…" /></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Price Range (USD)</span><div className="marketplace-price-inputs"><label><span>Min</span><input aria-label="Minimum price" type="number" min="0" max={MAX_PRICE} placeholder="$0" value={filters.minPrice} onChange={(event) => { const value = event.target.value === '' ? '' : Math.min(MAX_PRICE, Math.max(0, Number(event.target.value))); setFilters((current) => ({ ...current, minPrice: value })); setCurrentPage(1); }} /></label><span className="marketplace-price-divider">—</span><label><span>Max</span><input aria-label="Maximum price" type="number" min="0" max={MAX_PRICE} placeholder={`$${MAX_PRICE.toLocaleString('en-US')}`} value={filters.maxPrice} onChange={(event) => { const value = event.target.value === '' ? '' : Math.min(MAX_PRICE, Math.max(0, Number(event.target.value))); setFilters((current) => ({ ...current, maxPrice: value })); setCurrentPage(1); }} /></label></div><div className="marketplace-range-labels"><span>0</span><span>Up to ${MAX_PRICE.toLocaleString('en-US')}</span></div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Alloy &amp; Karat Purity</span><div className="marketplace-check-list">{metalOptions.map((metal) => <label key={metal}><input type="checkbox" checked={filters.metals.includes(metal)} onChange={() => toggleFilterValue('metals', metal)} /><span>{metal}</span></label>)}</div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Rare Gemstone Assortment</span><div className="marketplace-gem-filters">{gemstoneOptions.map((gem) => <button type="button" aria-pressed={filters.gemstone === gem} className={filters.gemstone === gem ? 'selected' : ''} key={gem} onClick={() => toggleGemstone(gem)}>{gem}</button>)}</div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Independent Certification</span><div className="marketplace-check-list">{certificationOptions.map((item, index) => <label key={item}><input type="checkbox" checked={filters.certifications.includes(item)} onChange={() => toggleFilterValue('certifications', item)} /><span>{item}</span><span className="material-symbols-outlined">{index === 0 ? 'verified' : index === 1 ? 'workspace_premium' : 'lock'}</span></label>)}</div></div>
					<button className="marketplace-apply-button" type="button" onClick={applyFilters}><TuneRoundedIcon /> Apply Curated Filters <span>({totalProducts})</span></button>
					{applied && !isLoading && <p className="marketplace-filter-note" role="status">Filters applied · {totalProducts} pieces match your selection.</p>}
				</aside>

				<div className="marketplace-results">
					<div className="marketplace-results-toolbar"><div className="marketplace-results-summary"><strong>{isLoading ? 'Loading Collection…' : `Showing ${totalProducts} Curated Creations`}</strong><span>{isLoading ? 'Please wait' : 'Live Catalogue'}</span></div><div className="marketplace-results-controls"><label>Sort by<select value={sort} onChange={(event) => { setSort(event.target.value); setCurrentPage(1); }}><option value="featured">Curated &amp; Featured</option><option value="price-high">Price: High to Low</option><option value="price-low">Price: Low to High</option></select><KeyboardArrowDownRoundedIcon /></label><div className="marketplace-grid-toggle"><button type="button" aria-label="Two column view" aria-pressed={columns === 2} className={columns === 2 ? 'active' : ''} onClick={() => setColumns(2)}><span className="material-symbols-outlined">grid_view</span></button><button type="button" aria-label="Three column view" aria-pressed={columns === 3} className={columns === 3 ? 'active' : ''} onClick={() => setColumns(3)}><span className="material-symbols-outlined">view_column</span></button></div></div></div>
					{isLoading ? <div className="marketplace-empty" role="status"><span className="material-symbols-outlined">hourglass_top</span><h2>Loading collection</h2><p>Finding matching pieces across the full catalogue.</p></div> : queryError ? <div className="marketplace-empty" role="alert"><span className="material-symbols-outlined">cloud_off</span><h2>Catalogue unavailable</h2><p>We could not load the full collection. Please try again.</p><button type="button" onClick={() => { setCurrentPage(1); void refetch(); }}>Try again</button></div> : !totalProducts ? <div className="marketplace-empty"><span className="material-symbols-outlined">search_off</span><h2>No pieces found</h2><p>{filters.metals.length ? `No products are currently available for ${filters.metals.join(' or ')}. Try another alloy or clear the filters.` : 'Change your search or clear filters to see more of the collection.'}</p><button type="button" onClick={resetFilters}>Clear filters</button></div> : <div className={`product-grid marketplace-products columns-${columns}`}>{products.map((product) => <ProductCard key={product.id} product={product} marketplace />)}</div>}
					{!isLoading && !queryError && totalProducts > 0 && <nav className="marketplace-pagination" aria-label="Marketplace pages"><span>Showing {(currentPage - 1) * CATALOG_PAGE_SIZE + 1}–{Math.min(currentPage * CATALOG_PAGE_SIZE, totalProducts)} of {totalProducts} verified pieces · Page {currentPage} of {pageCount}</span><div><button type="button" disabled={currentPage === 1} aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</button><button type="button" className="current" aria-current="page">{currentPage}</button><button type="button" disabled={currentPage >= pageCount} aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>›</button></div></nav>}
				</div>
			</section>

			<section className="marketplace-trust section-shell" aria-label="Marketplace guarantees"><article><span className="material-symbols-outlined">shield</span><div><h3>Authentic Escrow Vault</h3><p>Funds remain locked in third-party escrow until inspection and approval.</p></div></article><article><span className="material-symbols-outlined">workspace_premium</span><div><h3>State Assay Hallmark</h3><p>Gold pieces are checked against their listed purity and documentation.</p></div></article><article><span className="material-symbols-outlined">local_shipping</span><div><h3>Insured Delivery</h3><p>Delivery details are confirmed for each order with the concierge.</p></div></article><article><span className="material-symbols-outlined">currency_exchange</span><div><h3>Inspection Window</h3><p>Review the piece and its paperwork before confirming receipt.</p></div></article></section>
		</div>
	</SiteLayout>;
}

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SiteLayout from '@/libs/components/layout/SiteLayout';
import ProductCard from '@/libs/components/catalog/ProductCard';
import { featuredProducts, formatPrice } from '@/libs/data/catalog';
import { GET_PRODUCTS } from '@/libs/graphql/products';
import type { ApiProduct, Product, ProductCategory } from '@/libs/types/product';

const categoryShowcase: { label: string; sublabel: string; value: ProductCategory; lots: string; image: string }[] = [
	{ label: 'Rings', sublabel: 'Solitaire & statement', value: 'ring', lots: '412 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-exquisite-solitaire-brilliant-cut-diamond-ring-in-18k-warm-yellow-gold-s-054.jpg' },
	{ label: 'Necklaces', sublabel: 'Pendants & parures', value: 'necklace', lots: '298 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-cascading-diamond-and-18k-yellow-gold-necklace-pendant-displayed-on-dark-055.jpg' },
	{ label: 'Bracelets', sublabel: 'Bangles & links', value: 'bracelet', lots: '184 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-intricate-geometric-diamond-gold-bangle-bracelet-illuminated-on-smooth-v-056.jpg' },
	{ label: 'Chains', sublabel: 'Gold chains', value: 'chain', lots: '340 Lots', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-solid-24-karat-pure-yellow-gold-woven-curb-chain-coiled-on-textured-matt-057.jpg' },
	{ label: 'Timepieces', sublabel: 'Watches & horology', value: 'watch', lots: '96 Pieces', image: '/images/stitch/catalog/hadijam-katalog-marketplace-desktop-high-horology-yellow-gold-automatic-wristwatch-with-champange-dial-resti-058.jpg' },
];

const metalOptions = ['18K Yellow Gold', '24K Pure Gold', '18K White Gold', '18K Rose Gold', 'Platinum 950'];

export default function CatalogPage() {
	const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
	const [search, setSearch] = useState('');
	const [maxPrice, setMaxPrice] = useState(150000000);
	const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
	const [sort, setSort] = useState('featured');
	const [columns, setColumns] = useState<2 | 3>(2);
	const [applied, setApplied] = useState(false);
	const { data } = useQuery(GET_PRODUCTS, { variables: { input: { page: 1, limit: 24, sort: 'createdAt', direction: 'DESC', search: { productStatus: 'ACTIVE' } } } });

	const products = useMemo<Product[]>(() => {
		const remote: ApiProduct[] | undefined = data?.getProducts?.list;
		if (!remote?.length) return featuredProducts;
		return remote.map((item, index) => ({ ...featuredProducts[index % featuredProducts.length], id: item._id, title: item.productTitle, price: item.productPrice, subtitle: item.productDesc ?? 'Selected and verified by HaDiJaM', image: item.productImages?.[0] ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9702'}/${item.productImages[0]}` : featuredProducts[index % featuredProducts.length].image, category: (['ring', 'necklace', 'bracelet', 'chain', 'brooch', 'earring', 'watch'].includes(item.productType) ? item.productType : 'ring') as ProductCategory, badge: 'Maison verified', seller: 'Independent atelier' }));
	}, [data]);

	const filtered = useMemo(() => {
		const result = products.filter((product) => {
			const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
			const matchesSearch = `${product.title} ${product.subtitle} ${product.seller}`.toLowerCase().includes(search.trim().toLowerCase());
			const matchesPrice = product.price <= maxPrice;
			const matchesMetal = !selectedMetals.length || selectedMetals.some((metal) => `${product.title} ${product.subtitle} ${product.badge}`.toLowerCase().includes(metal.split(' ')[0].toLowerCase()));
			return matchesCategory && matchesSearch && matchesPrice && matchesMetal;
		});
		if (sort === 'price-low') return [...result].sort((a, b) => a.price - b.price);
		if (sort === 'price-high') return [...result].sort((a, b) => b.price - a.price);
		return result;
	}, [products, activeCategory, search, maxPrice, selectedMetals, sort]);

	const toggleMetal = (metal: string) => setSelectedMetals((current) => current.includes(metal) ? current.filter((value) => value !== metal) : [...current, metal]);
	const resetFilters = () => { setActiveCategory('all'); setSearch(''); setMaxPrice(150000000); setSelectedMetals([]); setSort('featured'); setApplied(false); };

	return <SiteLayout title="Marketplace | HaDiJaM">
		<div className="marketplace-page">
			<header className="marketplace-hero section-shell">
				<nav className="marketplace-breadcrumb" aria-label="Breadcrumb"><span>Home</span><b>›</b><span>Marketplace</span><b>›</b><strong>Fine Jewelry</strong></nav>
				<div className="marketplace-hero-row"><div><div className="marketplace-edition"><span>Vault Assayed 2025</span><i /> Seoul · Geneva · Milan</div><h1>HaDiJaM Fine Jewelry Collection</h1><p>Explore verified 18K/24K solid gold, rare-cut gemstones, and bespoke creations selected from independent ateliers.</p></div><div className="marketplace-stats"><div><small>Certified In-Vault</small><strong>1,480+ Pieces</strong></div><i /><div><small>Metrological Purity</small><strong>99.9% 24K</strong></div></div></div>
			</header>

			<section className="marketplace-categories section-shell" aria-label="Shop by category">{categoryShowcase.map((category) => <button type="button" key={category.value} className={`marketplace-category ${activeCategory === category.value ? 'active' : ''}`} onClick={() => setActiveCategory(activeCategory === category.value ? 'all' : category.value)}><span className="marketplace-category-image"><img src={category.image} alt="" /><small>{category.lots}</small></span><span className="marketplace-category-copy"><span><strong>{category.label}</strong><small>{category.sublabel}</small></span><b>→</b></span></button>)}</section>

			<section className="marketplace-layout section-shell">
				<aside className="marketplace-filter-panel">
					<div className="marketplace-filter-title"><h2><TuneRoundedIcon /> Filter Vault</h2><button type="button" onClick={resetFilters}>Reset All</button></div>
					<label className="marketplace-filter-label" htmlFor="market-search">Keyword Assay</label>
					<div className="marketplace-filter-search"><SearchRoundedIcon /><input id="market-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cut, carat, maison name…" /></div>
					<div className="marketplace-filter-block"><div className="marketplace-filter-row"><label className="marketplace-filter-label" htmlFor="price-range">Price Acquisition</label><strong>Up to {formatPrice(maxPrice)}</strong></div><input id="price-range" className="marketplace-range" type="range" min="1000000" max="150000000" step="1000000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><div className="marketplace-range-labels"><span>{formatPrice(1000000)}</span><span>{formatPrice(150000000)}</span></div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Alloy &amp; Karat Purity</span><div className="marketplace-check-list">{metalOptions.map((metal) => <label key={metal}><input type="checkbox" checked={selectedMetals.includes(metal)} onChange={() => toggleMetal(metal)} /><span>{metal}</span></label>)}</div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Rare Gemstone Assortment</span><div className="marketplace-gem-filters">{['Natural Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Pearl', 'No Gems'].map((gem, index) => <button type="button" className={index === 0 ? 'selected' : ''} key={gem} onClick={() => { setSearch(gem === 'Natural Diamond' ? 'diamond' : gem); setApplied(true); }}>{gem}</button>)}</div></div>
					<div className="marketplace-filter-block"><span className="marketplace-filter-label">Independent Certification</span><div className="marketplace-check-list">{['GIA Dossier / Diamond', 'State Metrology Hallmark', 'HaDiJaM Vault Escrow Seal'].map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index < 2} onChange={() => setApplied(true)} /><span>{item}</span><span className="material-symbols-outlined">{index === 0 ? 'verified' : index === 1 ? 'workspace_premium' : 'lock'}</span></label>)}</div></div>
					<button className="marketplace-apply-button" type="button" onClick={() => setApplied(true)}><TuneRoundedIcon /> Apply Curated Filters <span>({filtered.length})</span></button>
					{applied && <p className="marketplace-filter-note" role="status">Filters applied · {filtered.length} pieces match your selection.</p>}
				</aside>

				<div className="marketplace-results">
					<div className="marketplace-results-toolbar"><div className="marketplace-results-summary"><strong>Showing {filtered.length} Curated Creations</strong><span>Live Catalogue</span></div><div className="marketplace-results-controls"><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Curated &amp; Featured</option><option value="price-high">Price: High to Low</option><option value="price-low">Price: Low to High</option></select><KeyboardArrowDownRoundedIcon /></label><div className="marketplace-grid-toggle"><button type="button" aria-label="Two column view" aria-pressed={columns === 2} className={columns === 2 ? 'active' : ''} onClick={() => setColumns(2)}><span className="material-symbols-outlined">grid_view</span></button><button type="button" aria-label="Three column view" aria-pressed={columns === 3} className={columns === 3 ? 'active' : ''} onClick={() => setColumns(3)}><span className="material-symbols-outlined">view_column</span></button></div></div></div>
					<div className={`product-grid marketplace-products columns-${columns}`}>{filtered.map((product) => <ProductCard key={product.id} product={product} marketplace />)}</div>
					{!filtered.length && <div className="marketplace-empty"><span className="material-symbols-outlined">search_off</span><h2>No pieces found</h2><p>Change your search or clear filters to see more of the collection.</p><button type="button" onClick={resetFilters}>Clear filters</button></div>}
					{filtered.length > 0 && <nav className="marketplace-pagination" aria-label="Marketplace pages"><span>Showing {filtered.length} verified pieces</span><div><button type="button" disabled aria-label="Previous page">‹</button><button type="button" className="current">1</button><button type="button" disabled aria-label="Next page">›</button></div></nav>}
				</div>
			</section>

			<section className="marketplace-trust section-shell" aria-label="Marketplace guarantees"><article><span className="material-symbols-outlined">shield</span><div><h3>Authentic Escrow Vault</h3><p>Funds remain locked in third-party escrow until inspection and approval.</p></div></article><article><span className="material-symbols-outlined">workspace_premium</span><div><h3>State Assay Hallmark</h3><p>Gold pieces are checked against their listed purity and documentation.</p></div></article><article><span className="material-symbols-outlined">local_shipping</span><div><h3>Insured Delivery</h3><p>Delivery details are confirmed for each order with the concierge.</p></div></article><article><span className="material-symbols-outlined">currency_exchange</span><div><h3>Inspection Window</h3><p>Review the piece and its paperwork before confirming receipt.</p></div></article></section>
		</div>
	</SiteLayout>;
}

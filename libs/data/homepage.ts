import type { ProductCategory } from '@/libs/types/product';

export const homeCategories: { label: string; detail: string; image: string; value: ProductCategory }[] = [
	{ label: 'Rings', detail: 'Solitaire & Bands', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-diamond-and-gold-rings-016.jpg', value: 'ring' },
	{ label: 'Necklaces', detail: 'Pendants & Sautoirs', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-gold-necklaces-and-pendants-017.jpg', value: 'necklace' },
	{ label: 'Bracelets', detail: 'Cuffs & Tennis Lines', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-bangles-and-bracelets-018.jpg', value: 'bracelet' },
	{ label: 'Chains', detail: 'Cuban & Figaro Links', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-pure-gold-chains-019.jpg', value: 'chain' },
	{ label: 'Timepieces', detail: 'Rare Chronometers', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-haute-horlogerie-gold-watches-020.jpg', value: 'watch' },
];

export const homeProductFilters: { label: string; value: 'all' | ProductCategory }[] = [
	{ label: 'All', value: 'all' }, { label: 'Rings', value: 'ring' }, { label: 'Necklaces', value: 'necklace' }, { label: 'Bracelets', value: 'bracelet' }, { label: 'Watches', value: 'watch' },
];

export const homeServices = [
	{ title: 'Jewelry Repair', description: 'Meticulous restoration for your most valuable family heirlooms and collectibles.', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-jewelry-repair-and-restoration-026.jpg' },
	{ title: 'Custom Design', description: 'Turn your vision into a unique piece with our master jewelers.', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-custom-jewelry-design-and-3d-atelier-027.jpg' },
	{ title: 'Cleaning & Polishing', description: 'Restore the brilliance of treasured gold and gemstone pieces.', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-ultrasonic-cleaning-and-rhodium-polish-028.jpg' },
	{ title: 'Certified Appraisal', description: 'Professional valuation from independent gemological specialists.', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-gemological-appraisal-and-valuation-029.jpg' },
];

export const collectorReviews = [
	{ name: 'Sarah Kim', place: 'Seoul · Verified Buyer', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-sarah-kim-031.jpg', quote: 'Arranging quality and fast insured delivery! The 18K solitaire ring arrived secure with every hallmark verified.' },
	{ name: 'Minji Park', place: 'Singapore · Private Client', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-minji-park-032.jpg', quote: 'Professional bespoke design service! The 3D wax preview gave me total confidence before casting.' },
	{ name: 'David Lee', place: 'Tokyo · Heirloom Curator', image: '/images/stitch/home/hadijam-bosh-sahifa-desktop-homepage-david-lee-033.jpg', quote: 'The best jewelry marketplace platform in Asia. Transparent, detail-oriented and exceptionally prompt.' },
];

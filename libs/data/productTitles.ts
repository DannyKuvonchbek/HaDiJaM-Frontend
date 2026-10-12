import type { ProductCategory } from "@/libs/types/product";

const collectionTitles: Partial<Record<ProductCategory, string[]>> = {
	ring: [
		"Aurelia Pavé Solitaire",
		"Celeste Emerald Halo Ring",
		"Lumière Bezel Diamond Ring",
		"The Maison Signet",
		"Orchid Three-Stone Ring",
		"Étoile Sculpted Band",
		"Imperial Cluster Ring",
		"Belle Époque Cocktail Ring",
		"Golden Heirloom Solitaire",
		"Atelier Signature Ring",
	],
	earring: [
		"Golden Cascade Drops",
		"Soleil Halo Hoops",
		"Amethyst Bloom Earrings",
		"Sculpted Gold Huggies",
		"Gemstone Mosaic Drops",
		"Aurelia Square Studs",
		"Rose Petal Earrings",
		"Openwork Gold Hoops",
		"Luminous Evening Drops",
		"Celestial Filigree Earrings",
	],
	bracelet: [
		"Eternal Link Bracelet",
		"Aurelia Sculpted Cuff",
		"Maison Diamond Line Bracelet",
		"Byzantine Gold Bracelet",
		"Soleil Hinged Bangle",
		"Heirloom Rope Bracelet",
		"Imperial Woven Links",
		"Lumière Tennis Bracelet",
		"Golden Hour Cuff",
		"Atelier Signature Bracelet",
	],
	chain: [
		"Classic Cuban Link Chain",
		"Rope-Weave Gold Chain",
		"Box Link Chain",
		"Figaro Link Chain",
		"Sleek Snake Chain",
		"Wheat Link Chain",
		"Cuban Statement Chain",
		"Twisted Gold Chain",
		"Paperclip Link Chain",
		"Curb Link Chain",
	],
	watch: [
		"Aurelia Automatic Watch",
		"The Maison Chronometer",
		"Sovereign Moonphase Watch",
		"Étoile Gold Date Watch",
		"Heritage Automatic Timepiece",
		"Lumière Dress Watch",
		"Imperial Calendar Watch",
		"Atelier Classic Watch",
		"Celeste Gold Chronograph",
		"Grand Maison Timepiece",
	],
};

export function findGeneratedTitleSearch(
	query: string,
	activeCategory: ProductCategory | 'all',
): { productType: ProductCategory; number: string } | undefined {
	const normalize = (value: string) => value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
	const needle = normalize(query);
	if (needle.length < 3) return undefined;

	const matches = Object.entries(collectionTitles).flatMap(([category, titles]) => {
		if (activeCategory !== 'all' && category !== activeCategory) return [];
		return (titles ?? []).flatMap((title, index) =>
			normalize(title).includes(needle)
				? [{ productType: category as ProductCategory, number: String(index + 1).padStart(2, '0') }]
				: [],
		);
	});

	return matches.length === 1 ? matches[0] : undefined;
}

/** Replace only the generic HaDiJaM + No. ## seed titles with distinctive catalog names. */
export function getProductDisplayTitle(
	category: ProductCategory | string,
	storedTitle: string,
	index: number,
): string {
	if (!/^hadijam\b/i.test(storedTitle.trim()) || !/\bno\.?\s*\d+\b/i.test(storedTitle)) {
		return storedTitle;
	}
	const titles = collectionTitles[category as ProductCategory];
	if (!titles?.length) return storedTitle.replace(/\s+no\.?\s*\d+\s*$/i, "").trim();
	const itemNumber = Number(storedTitle.match(/\bno\.?\s*(\d+)\b/i)?.[1]);
	const titleIndex = Number.isFinite(itemNumber) && itemNumber > 0 ? itemNumber - 1 : index;
	return titles[titleIndex % titles.length];
}

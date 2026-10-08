import type { ProductCategory } from "@/libs/types/product";

export const chainProductImages = Array.from({ length: 10 }, (_, index) =>
	`/images/products/chains/${String(index + 1).padStart(2, "0")}_${[
		"classic_gold_chain",
		"rope_gold_chain",
		"box_gold_chain",
		"figaro_gold_chain",
		"snake_gold_chain",
		"wheat_gold_chain",
		"cuban_gold_chain",
		"twist_gold_chain",
		"paperclip_gold_chain",
		"curb_gold_chain",
	][index]}.jpg`,
);

export const earringProductImages = Array.from({ length: 10 }, (_, index) =>
	`/images/products/earrings/unsplash-gold-earrings-${String(index + 1).padStart(2, "0")}.jpg`,
);

export function getProductImage(
	category: ProductCategory | string,
	title: string,
	index: number,
	fallback: string,
): string {
	const images = category === "chain"
		? chainProductImages
		: category === "earring"
			? earringProductImages
			: undefined;
	if (!images) return fallback;
	const itemNumber = title.match(/\bno\.?\s*(\d+)\b/i)?.[1];
	const imageIndex = itemNumber ? (Number(itemNumber) - 1) % images.length : index % images.length;
	return images[imageIndex >= 0 ? imageIndex : 0];
}

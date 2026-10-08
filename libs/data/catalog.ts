import type { Product, ProductCategory } from "@/libs/types/product";

export const categories: {
  label: string;
  value: ProductCategory;
  image: string;
}[] = [
  {
    label: "Rings",
    value: "ring",
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-exquisite-solitaire-brilliant-cut-diamond-ring-in-18k-warm-yellow-gold-s-054.jpg",
  },
  {
    label: "Earrings",
    value: "earring",
    image: "/images/products/earrings/unsplash-gold-earrings-02.jpg",
  },
  {
    label: "Bracelets",
    value: "bracelet",
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-intricate-geometric-diamond-gold-bangle-bracelet-illuminated-on-smooth-v-056.jpg",
  },
  {
    label: "Chains",
    value: "chain",
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-solid-24-karat-pure-yellow-gold-woven-curb-chain-coiled-on-textured-matt-057.jpg",
  },
  {
    label: "Brooches",
    value: "brooch",
    image:
      "/images/stitch/catalog/katalog-5-kategoriya-opulent-gold-jewelry-still-life-of-a-handcrafted-broad-18k-filigree-gold-117.jpg",
  },
  {
    label: "Watches",
    value: "watch",
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-high-horology-yellow-gold-automatic-wristwatch-with-champange-dial-resti-058.jpg",
  },
];

export const featuredProducts: Product[] = [
  {
    id: "imperial-solitaire",
    title: "Imperial Solitaire Ring",
    subtitle: "18K yellow gold · brilliant cut",
    price: 48900000,
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-exquisite-solitaire-brilliant-cut-diamond-ring-in-18k-warm-yellow-gold-s-054.jpg",
    category: "ring",
    badge: "Certified",
    seller: "Kang & Sons Atelier",
  },
  {
    id: "royal-necklace",
    title: "Royal Byzantine Necklace",
    subtitle: "Handwoven 18K gold",
    price: 32500000,
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-cascading-diamond-and-18k-yellow-gold-necklace-pendant-displayed-on-dark-055.jpg",
    category: "necklace",
    badge: "One of a kind",
    seller: "HaDiJaM Maison",
  },
  {
    id: "heritage-bracelet",
    title: "Heritage Gold Bracelet",
    subtitle: "Italian woven links · 18K",
    price: 18700000,
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-intricate-geometric-diamond-gold-bangle-bracelet-illuminated-on-smooth-v-056.jpg",
    category: "bracelet",
    badge: "Verified",
    seller: "Kang & Sons Atelier",
  },
  {
    id: "sovereign-chronograph",
    title: "Sovereign Chronograph",
    subtitle: "18K gold · Swiss movement",
    price: 72000000,
    image:
      "/images/stitch/catalog/hadijam-katalog-marketplace-desktop-high-horology-yellow-gold-automatic-wristwatch-with-champange-dial-resti-058.jpg",
    category: "watch",
    badge: "Certified",
    seller: "HaDiJaM Maison",
  },
];

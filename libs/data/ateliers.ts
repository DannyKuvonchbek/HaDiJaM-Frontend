export type AtelierSlug = "kang-and-sons" | "aurum-gemological-lab" | "milano-heritage-restoration";
export type AtelierServiceSeed = { category: string; title: string; price: number; duration: string; description: string; image: string; bookingSlots: string[]; technician: string };
export type AtelierDefinition = {
  slug: AtelierSlug;
  name: string;
  location: string;
  master: string;
  specialty: string;
  heroTitle: string;
  heroText: string;
  heroImage: string;
  portrait: string;
  tags: string[];
  hours: string;
  weekdays: number[];
  bookingSlots: string[];
  services: AtelierServiceSeed[];
  portfolioTitle: string;
  reviewTitle: string;
  address: string;
  closingTitle: string;
};

const img = (folder: string, file: string) => `/images/stitch/${folder}/${file}`;

export const ATELIERS: AtelierDefinition[] = [
  {
    slug: "kang-and-sons", name: "Kang & Sons Haute Atelier", location: "Cheongdam-dong, Seoul", master: "Master Min-Seok Kang", specialty: "4th Generation Goldsmith Dynasty", heroTitle: "Kang & Sons Haute Atelier", heroText: "A family atelier devoted to precision goldsmithing, bespoke design, and the restoration of treasured heirlooms.", heroImage: img("catalog", "kang-sons-haute-atelier-master-collection-catalog-intimate-editorial-portrait-of-master-jeweler-kang-min-soo-inspecting-a--108.jpg"), portrait: img("products", "hadijam-mahsulot-sotuvchi-profili-desktop-portrait-of-master-korean-artisan-goldsmith-mr-kang-in-cheongdam-atelier-071.jpg"), tags: ["Platinum Master", "Hand Engraving", "28 Years at the Bench"], hours: "Monday–Friday · 9:00 AM–8:00 PM KST", weekdays: [1, 2, 3, 4, 5], bookingSlots: ["14:00", "16:30"], portfolioTitle: "Curated Haute Portfolio", reviewTitle: "Client Impressions & Provenance", address: "Cheongdam-dong, Gangnam-gu, Seoul", closingTitle: "Meet the Master at the Bench",
    services: [
      { category: "ATELIER_KANG_CUSTOM", title: "Custom Design & 3D Haute Atelier", price: 250, duration: "7–14 days", description: "Turn a personal sketch or heirloom into a bespoke creation with 3D CAD and a crafted wax preview.", image: img("services", "hadijam-services-live-calculator-photo-uploaded-state-digital-3d-cad-rendered-jewelry-blueprint-alongside-an-actual-carved-jew-089.jpg"), bookingSlots: ["14:00", "16:30"], technician: "Master Min-Seok Kang" },
      { category: "ATELIER_KANG_RESIZING", title: "Ring Resizing & Tension Calibration", price: 40, duration: "24–48 hours", description: "Refine a precious ring with careful sizing, laser work, and a final hand polish.", image: img("services", "hadijam-services-live-calculator-photo-uploaded-state-ring-resizing-mandrel-and-gold-calibration-gauges-on-a-dark-oak-jeweler--092.jpg"), bookingSlots: ["14:00", "16:30"], technician: "Master Min-Seok Kang" },
    ],
  },
  {
    slug: "aurum-gemological-lab", name: "Aurum Gemological Lab", location: "Gangnam, Seoul", master: "Dr. David C. Vance", specialty: "GIA Graduate Gemologist · Spectroscopy", heroTitle: "Aurum Gemological Lab & Assay Bureau", heroText: "Independent gemological analysis, gemstone origin research, and precise precious-metal assay performed with calibrated laboratory instruments.", heroImage: img("home", "hadijam-bosh-sahifa-desktop-homepage-gemological-appraisal-and-valuation-029.jpg"), portrait: img("services", "hadijam-services-live-calculator-photo-uploaded-state-licensed-gia-certified-gemologist-utilizing-an-electronic-refractometer--091.jpg"), tags: ["Gemstone Origin Reports", "Spectroscopy", "ISO 17025 Assay"], hours: "Monday–Friday · 9:00 AM–8:00 PM KST", weekdays: [1, 2, 3, 4, 5], bookingSlots: ["10:00", "14:00", "17:00"], portfolioTitle: "Certified Analytical Infrastructure", reviewTitle: "Appraisal Deeds of Trust", address: "Apgujeong-ro, Gangnam-gu, Seoul", closingTitle: "Reserve a Secure Lab Intake",
    services: [
      { category: "ATELIER_AURUM_GEMOLOGY", title: "Gemological Appraisal & Valuation", price: 80, duration: "24 hours", description: "Gemstone identification, origin analysis, and a documented valuation prepared by a certified gemologist.", image: img("services", "hadijam-services-live-calculator-photo-uploaded-state-licensed-gia-certified-gemologist-utilizing-an-electronic-refractometer--091.jpg"), bookingSlots: ["10:00", "14:00", "17:00"], technician: "Dr. David C. Vance" },
      { category: "ATELIER_AURUM_ASSAY", title: "Precious Metal Assay & Laser Hallmark", price: 80, duration: "Same day", description: "Spectrometric precious-metal analysis with a documented assay and laser hallmark service.", image: img("services", "hadijam-services-live-calculator-photo-uploaded-state-close-up-precision-shot-of-laser-welding-repair-on-an-antique-intricate--088.jpg"), bookingSlots: ["10:00", "14:00", "17:00"], technician: "Dr. David C. Vance" },
    ],
  },
  {
    slug: "milano-heritage-restoration", name: "Milano Heritage Restoration", location: "Itaewon, Seoul", master: "Maestro Marco Bellini", specialty: "Archival Restoration · Art Deco Conservation", heroTitle: "Milano Heritage Restoration", heroText: "Conservation-led restoration for important heirlooms, from archival documentation and delicate cleaning to specialist stone and setting work.", heroImage: img("services", "hadijam-service-booking-vault-logistics-desktop-modal-portrait-of-an-esteemed-senior-master-goldsmith-in-silk-apron-holding-lo-084.jpg"), portrait: img("services", "hadijam-services-live-calculator-photo-uploaded-state-distinguished-senior-master-goldsmith-portrait-with-round-spectacles-and-094.jpg"), tags: ["Art Deco Conservation", "Heirloom Restoration", "Gem Recutting"], hours: "Tuesday–Sunday · 11:00 AM–8:00 PM KST", weekdays: [0, 2, 3, 4, 5, 6], bookingSlots: ["11:00", "14:00", "17:00"], portfolioTitle: "Before & After Restoration Archive", reviewTitle: "Atelier Restorations Feedback", address: "Itaewon, Yongsan-gu, Seoul", closingTitle: "Entrust Your Heirloom to the Atelier",
    services: [
      { category: "ATELIER_MILANO_RESTORATION", title: "Jewelry Repair & Archival Restoration", price: 90, duration: "48–72 hours", description: "Documented conservation and precision restoration for antique and high-value jewelry.", image: img("home", "hadijam-bosh-sahifa-desktop-homepage-jewelry-repair-and-restoration-026.jpg"), bookingSlots: ["11:00", "14:00", "17:00"], technician: "Maestro Marco Bellini" },
      { category: "ATELIER_MILANO_POLISHING", title: "Ultrasonic Deep Cleaning & Rhodium Polish", price: 35, duration: "Same day", description: "A careful ultrasonic clean and finish refresh for suitable precious-metal pieces.", image: img("services", "hadijam-services-live-calculator-photo-uploaded-state-ultrasonic-gemstone-cleansing-tank-with-microscopic-mist-and-brilliant-p-090.jpg"), bookingSlots: ["11:00", "14:00", "17:00"], technician: "Maestro Marco Bellini" },
    ],
  },
];

export function getAtelier(slug: string | string[] | undefined) {
  return ATELIERS.find((atelier) => atelier.slug === slug);
}

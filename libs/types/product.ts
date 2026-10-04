export type ProductCategory =
  | "ring"
  | "necklace"
  | "bracelet"
  | "chain"
  | "brooch"
  | "earring"
  | "watch";

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  category: ProductCategory;
  badge: string;
  seller: string;
}

export interface ApiProduct {
  _id: string;
  productType: string;
  productTitle: string;
  productPrice: number;
  productImages: string[];
  productDesc?: string;
  productStatus: string;
  productLikes?: number;
}

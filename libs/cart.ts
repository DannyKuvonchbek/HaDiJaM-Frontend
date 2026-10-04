export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export const CART_KEY = "hadijam:cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("hadijam:cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">) {
  const cart = readCart();
  const existing = cart.find((line) => line.id === item.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...item, quantity: 1 });
  writeCart(cart);
}

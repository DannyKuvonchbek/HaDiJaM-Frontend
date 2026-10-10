import { authValue } from "@/libs/auth";
import { readMemberId } from "@/libs/utils/account";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_KEY_PREFIX = "hadijam:cart:";

function currentMemberCartKey(): string | null {
  if (typeof window === "undefined") return null;
  const token = authValue("accessToken");
  if (!token) return null;
  const memberId = readMemberId(token);
  return memberId ? `${CART_KEY_PREFIX}${memberId}` : null;
}

export function readCart(): CartItem[] {
  const key = currentMemberCartKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  const key = currentMemberCartKey();
  if (key) localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event("hadijam:cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">) {
  if (!currentMemberCartKey()) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/sign-in?mode=signin&next=${encodeURIComponent(next)}`);
    return;
  }
  const cart = readCart();
  const existing = cart.find((line) => line.id === item.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...item, quantity: 1 });
  writeCart(cart);
}

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/router";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import PageIntro from "@/libs/components/layout/PageIntro";
import { CART_KEY, readCart, writeCart, type CartItem } from "@/libs/cart";
import { CREATE_ORDER } from "@/libs/graphql/orders";
import { formatPrice } from "@/libs/data/catalog";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const [createOrder, { loading }] = useMutation(CREATE_ORDER);
  useEffect(() => {
    setItems(readCart());
  }, []);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const remove = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    writeCart(next);
  };
  const checkout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!items.length) return;
    if (items.some((item) => !/^[a-f\d]{24}$/i.test(item.id))) {
      setError(
        "These are preview pieces. Live ordering will be available when they are added to the backend catalogue. Contact our concierge for a private enquiry.",
      );
      return;
    }
    if (!localStorage.getItem("accessToken")) {
      await router.push("/sign-in?mode=signin&next=%2Fcart");
      return;
    }
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone"));
    const address = String(form.get("address"));
    try {
      for (const item of items)
        await createOrder({
          variables: {
            input: {
              productId: item.id,
              quantity: item.quantity,
              deliveryAddress: address,
              deliveryPhone: phone,
            },
          },
        });
      localStorage.removeItem(CART_KEY);
      writeCart([]);
      setItems([]);
      await router.push("/order-confirmation");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not place your order.",
      );
    }
  };
  return (
    <SiteLayout title="Shopping bag | HaDiJaM">
      <PageIntro
        eyebrow="YOUR PRIVATE SELECTION"
        title="A piece worth keeping."
        description="Your selected pieces are prepared with care and delivered with complete discretion."
      />
      <section className="cart-layout section-shell">
        {items.length ? (
          <>
            <div className="cart-lines">
              <div className="cart-title-row">
                <span>YOUR SHOPPING BAG</span>
                <span>
                  {items.length} {items.length === 1 ? "piece" : "pieces"}
                </span>
              </div>
              {items.map((item) => (
                <article className="cart-line" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div className="cart-line-copy">
                    <span>HaDiJaM Maison</span>
                    <h2>{item.title}</h2>
                    <p>Quantity · {item.quantity}</p>
                  </div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                  <button
                    aria-label={`Remove ${item.title}`}
                    onClick={() => remove(item.id)}
                  >
                    <DeleteOutlineRoundedIcon />
                  </button>
                </article>
              ))}
              <Link href="/catalog" className="text-link">
                ← Continue discovering
              </Link>
            </div>
            <aside className="checkout-panel">
              <span className="eyebrow">SECURE ACQUISITION</span>
              <h2>Delivery details</h2>
              <p>Your acquisition will be handled by our personal concierge.</p>
              <form onSubmit={checkout}>
                <label>
                  Phone number
                  <input
                    name="phone"
                    required
                    placeholder="+998 90 000 00 00"
                  />
                </label>
                <label>
                  Delivery address
                  <textarea
                    name="address"
                    minLength={5}
                    required
                    placeholder="Street, city, additional directions"
                    rows={3}
                  />
                </label>
                <div className="checkout-total">
                  <span>Order total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
                <div className="secure-note">
                  <LockOutlinedIcon /> Protected payment · Insured delivery
                </div>
                {error && <p className="form-error">{error}</p>}
                <button
                  className="button button-gold checkout-button"
                  disabled={loading}
                >
                  {loading ? "Preparing your order…" : "Continue securely"}{" "}
                  <span>↗</span>
                </button>
              </form>
            </aside>
          </>
        ) : (
          <div className="empty-state cart-empty">
            <span>◇</span>
            <h2>Your bag is awaiting a forever piece.</h2>
            <p>
              Explore our carefully chosen collection and save something
              special.
            </p>
            <Link href="/catalog" className="button button-gold">
              Explore the collection <span>↗</span>
            </Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

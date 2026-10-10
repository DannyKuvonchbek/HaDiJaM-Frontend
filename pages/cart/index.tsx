import { productImageUrl } from "@/libs/utils/productImage";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SiteLayout from "@/libs/components/layout/SiteLayout";
import PageIntro from "@/libs/components/layout/PageIntro";
import { readCart, writeCart, type CartItem } from "@/libs/cart";
import { formatPrice } from "@/libs/utils/currency";
import { useUsdUzsRate } from "@/libs/utils/CurrencyProvider";

export default function CartPage() {
  const usdUzsRate = useUsdUzsRate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  useEffect(() => {
    setItems(readCart());
  }, []);
  useEffect(() => {
    if (!showClearConfirmation) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowClearConfirmation(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showClearConfirmation]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const remove = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    writeCart(next);
  };
  const changeQuantity = (id: string, amount: number) => {
    const item = items.find((cartItem) => cartItem.id === id);
    if (!item) return;
    if (amount < 0 && item.quantity <= 1) {
      remove(id);
      return;
    }
    const next = items.map((cartItem) =>
      cartItem.id === id
        ? { ...cartItem, quantity: cartItem.quantity + amount }
        : cartItem,
    );
    setItems(next);
    writeCart(next);
  };
  const clearCart = () => {
    setItems([]);
    setShowClearConfirmation(false);
    writeCart([]);
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
                <div className="cart-title-actions">
                  <span>
                    {items.length} {items.length === 1 ? "piece" : "pieces"}
                  </span>
                  <button
                    className="cart-clear-button"
                    type="button"
                    onClick={() => setShowClearConfirmation(true)}
                  >
                    <DeleteOutlineRoundedIcon />
                    Clear all
                  </button>
                </div>
              </div>
              {items.map((item) => (
                <article className="cart-line" key={item.id}>
                  <img src={productImageUrl(item.image)} alt={item.title} />
                  <div className="cart-line-copy">
                    <span>HaDiJaM Maison</span>
                    <h2>{item.title}</h2>
                    <div className="cart-line-controls">
                      <div className="cart-quantity">
                        <span className="cart-quantity-label">Quantity</span>
                        <button
                          className="cart-quantity-button"
                          type="button"
                          aria-label={`Decrease quantity of ${item.title}`}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          <RemoveRoundedIcon />
                        </button>
                        <span className="cart-quantity-value">{item.quantity}</span>
                        <button
                          className="cart-quantity-button"
                          type="button"
                          aria-label={`Increase quantity of ${item.title}`}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          <AddRoundedIcon />
                        </button>
                      </div>
                      <strong className="cart-line-price">
                        {formatPrice(item.price * item.quantity, usdUzsRate)}
                      </strong>
                    </div>
                  </div>
                  <button
                    className="cart-line-remove"
                    type="button"
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
            <aside className="checkout-panel cart-summary-panel">
              <span className="eyebrow">SECURE ACQUISITION</span>
              <h2>Order summary</h2>
              <p>Your selection is reserved for secure checkout.</p>
              <div className="checkout-total">
                <span>{items.length} {items.length === 1 ? "piece" : "pieces"}</span>
                <strong>{formatPrice(total, usdUzsRate)}</strong>
              </div>
              <Link href="/checkout" className="button button-gold checkout-button">
                Continue to checkout <span>↗</span>
              </Link>
              <div className="secure-note">
                <span aria-hidden="true">◇</span> Concierge-assisted delivery
              </div>
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
        {showClearConfirmation && (
          <div
            className="cart-confirm-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setShowClearConfirmation(false);
            }}
          >
            <section
              className="cart-confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="cart-confirm-title"
              aria-describedby="cart-confirm-description"
            >
              <span className="material-symbols-outlined">delete</span>
              <h2 id="cart-confirm-title">Clear your shopping bag?</h2>
              <p id="cart-confirm-description">
                This will remove every selected piece from your bag.
              </p>
              <div className="cart-confirm-actions">
                <button
                  className="cart-confirm-cancel"
                  type="button"
                  autoFocus
                  onClick={() => setShowClearConfirmation(false)}
                >
                  Keep items
                </button>
                <button
                  className="cart-confirm-clear"
                  type="button"
                  onClick={clearCart}
                >
                  Clear all
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

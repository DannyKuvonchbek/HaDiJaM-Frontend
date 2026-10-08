import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { CART_KEY, readCart, writeCart, type CartItem } from "@/libs/cart";
import { CREATE_ORDER } from "@/libs/graphql/orders";
import { GET_PRODUCT } from "@/libs/graphql/products";
import { formatPrice } from "@/libs/utils/currency";
import { useUsdUzsRate } from "@/libs/utils/CurrencyProvider";

type CheckoutProduct = {
  _id: string;
  productTitle: string;
  productPrice: number;
  productImages?: string[];
};

type CheckoutLine = CartItem & {
  product?: CheckoutProduct;
  unavailable?: boolean;
};

function normalizePhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (/^\d{9}$/.test(digits)) return `+998${digits}`;
  if (/^998\d{9}$/.test(digits)) return `+${digits}`;
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return trimmed;
}

export default function CheckoutPage() {
  const client = useApolloClient();
  const router = useRouter();
  const usdUzsRate = useUsdUzsRate();
  const [items, setItems] = useState<CheckoutLine[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH">("CARD");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [createOrder, { loading: submitting }] = useMutation(CREATE_ORDER);

  useEffect(() => {
    const cart = readCart();
    if (!cart.length) {
      setItems([]);
      setProductsLoading(false);
      return;
    }
    let cancelled = false;
    setItems(cart);
    setProductsLoading(true);
    setProductError("");
    Promise.all(
      cart.map(async (item) => {
        if (!/^[a-f\d]{24}$/i.test(item.id)) return { ...item, unavailable: true };
        try {
          const result = await client.query({
            query: GET_PRODUCT,
            variables: { productId: item.id },
            fetchPolicy: "network-only",
          });
          const product = result.data?.getProduct as CheckoutProduct | null;
          return product
            ? { ...item, product }
            : { ...item, unavailable: true };
        } catch {
          return { ...item, unavailable: true };
        }
      }),
    ).then((lines) => {
      if (!cancelled) {
        setItems(lines);
        if (lines.some((line) => "unavailable" in line && line.unavailable))
          setProductError("Some items are no longer available. Return to your bag to review them.");
        setProductsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [client]);

  const total = useMemo(
    () => items.reduce((sum, line) => sum + (line.product?.productPrice ?? 0) * line.quantity, 0),
    [items],
  );
  const unavailableItems = items.some((line) => line.unavailable || !line.product);

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!items.length || unavailableItems || productsLoading) return;
    if (!localStorage.getItem("accessToken")) {
      await router.push("/sign-in?mode=signin&next=%2Fcheckout");
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = normalizePhone(String(form.get("phone") ?? ""));
    const city = String(form.get("city") ?? "").trim();
    const street = String(form.get("street") ?? "").trim();
    const suite = String(form.get("suite") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const address = [
      `Recipient: ${fullName}`,
      `City/Region: ${city}`,
      `Street address: ${street}`,
      suite && `Apartment/Suite: ${suite}`,
      notes && `Delivery notes: ${notes}`,
    ].filter(Boolean).join("\n");
    if (address.length > 500) {
      setError("Please shorten your delivery details to 500 characters or fewer.");
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setError("Enter a valid international phone number, including the country code (for example, +82 10 1234 5678).");
      return;
    }
    try {
      const result = await createOrder({
        variables: {
          input: {
            items: items.map((line) => ({ productId: line.id, quantity: line.quantity })),
            deliveryAddress: address,
            deliveryPhone: phone,
            paymentMethod,
          },
        },
      });
      const orderId = result.data?.createOrder?._id;
      if (!orderId) throw new Error("The order could not be confirmed. Please try again.");
      localStorage.removeItem(CART_KEY);
      writeCart([]);
      await router.push(`/order-confirmation?orderId=${encodeURIComponent(orderId)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not place your order. Please try again.");
    }
  };

  return (
    <div className="checkout-page">
      <Head>
        <title>Secure checkout | HaDiJaM</title>
        <meta name="description" content="Complete your HaDiJaM jewelry order securely." />
      </Head>
      <header className="checkout-header">
        <Link href="/cart" className="checkout-back"><ArrowBackRoundedIcon /> <span>RETURN TO<br />CART</span></Link>
        <div className="checkout-lock"><LockOutlinedIcon /> ENCRYPTED CHECKOUT</div>
        <Link href="/" className="checkout-wordmark"><strong>HADIJAM</strong><small>HAUTE JOAILLERIE ATELIER</small></Link>
        <nav className="checkout-progress" aria-label="Checkout progress">
          <b>1. VAULT<br />DISPATCH</b><i>/</i><span>2. SETTLEMENT</span><i>/</i><span>3. HALLMARKING</span>
        </nav>
        <Link href="/my-page" className="checkout-account" aria-label="My account">♙</Link>
      </header>

      <main className="checkout-main">
        <section className="checkout-intro">
          <div>
            <span className="checkout-kicker"><VerifiedUserOutlinedIcon /> BESPOKE DIRECT FULFILLMENT</span>
            <h1>Secure Checkout <span>·</span> Finalise Your Order</h1>
          </div>
          <div className="checkout-steps">
            <span className="is-current"><b>1</b><strong>SHIPPING</strong><small>Delivery details</small></span>
            <span><b>2</b><strong>PAYMENT</strong><small>Payment method</small></span>
            <span><b>3</b><strong>COMPLETE</strong><small>Order confirmation</small></span>
          </div>
        </section>

        {!items.length && !productsLoading ? (
          <section className="checkout-empty"><h2>Your bag is empty.</h2><Link href="/catalog">Explore the collection</Link></section>
        ) : (
          <form className="checkout-grid" onSubmit={submitOrder}>
            <div className="checkout-form-column">
              <section className="checkout-card checkout-delivery-card">
                <div className="checkout-section-heading">
                  <span className="checkout-icon">⌑</span>
                  <div><small>STEP 01 · ENCRYPTED DISPATCH</small><h2>Delivery and Contact Details</h2></div>
                  <span className="checkout-pill">◉ Direct Courier</span>
                </div>
                <div className="checkout-fields">
                  <label>Full Name <em>*</em><input name="fullName" autoComplete="name" required placeholder="e.g. Alisher Navoi" /></label>
                  <label>Phone Number <em>*</em><input name="phone" type="tel" autoComplete="tel" required placeholder="+998 90 123 45 67" /></label>
                  <label>City / Region <em>*</em><input name="city" autoComplete="address-level2" required placeholder="Tashkent City" /></label>
                  <label>Street Address <em>*</em><input name="street" autoComplete="street-address" required placeholder="Amir Temur Avenue, 42" /></label>
                  <label>Apartment / Suite <span>(Optional)</span><input name="suite" placeholder="Apartment, floor or office" /></label>
                  <label>Delivery Notes <span>(Optional)</span><input name="notes" placeholder="Intercom code or delivery instructions" /></label>
                </div>
                <div className="checkout-delivery-choice"><span className="checkout-radio-dot" /><div><strong>Standard Courier</strong><small>Careful, insured delivery arranged by our concierge</small></div><b>FREE</b></div>
              </section>

              <section className="checkout-card checkout-payment-card">
                <div className="checkout-section-heading">
                  <span className="checkout-icon">▤</span>
                  <div><small>STEP 02 · PAYMENT DETAILS</small><h2>Payment Method</h2></div>
                  <span className="checkout-pill">{paymentMethod === "CARD" ? "Card details check" : "Pay on delivery"}</span>
                </div>
                <div className="checkout-payment-options" role="group" aria-label="Select payment method">
                  <button type="button" className={paymentMethod === "CARD" ? "selected" : ""} onClick={() => setPaymentMethod("CARD")}>▣ <span>Bank Card</span></button>
                  <button type="button" className={paymentMethod === "CASH" ? "selected" : ""} onClick={() => setPaymentMethod("CASH")}>▤ <span>Cash on Delivery</span></button>
                </div>
                {paymentMethod === "CARD" ? (
                  <div className="checkout-card-entry">
                    <div className="checkout-fields">
                      <label className="checkout-card-wide">Name on Card <em>*</em><input name="cardholder" autoComplete="cc-name" required placeholder="Name as printed on the card" /></label>
                      <label className="checkout-card-wide">Card Number <em>*</em><input name="cardNumber" type="text" inputMode="numeric" autoComplete="cc-number" required placeholder="Enter card number" /></label>
                      <label>Expiry Date <em>*</em><input name="cardExpiry" type="text" autoComplete="cc-exp" required placeholder="MM/YY" /></label>
                      <label>Security Code <em>*</em><input name="cardSecurityCode" type="password" autoComplete="cc-csc" required placeholder="CVV" /></label>
                    </div>
                    <div className="checkout-payment-note"><LockOutlinedIcon /><p>Card details are not verified with a bank or charged. They are never sent to or saved by HaDiJaM. Your order is recorded as pending, and our concierge will contact you to arrange secure payment.</p></div>
                  </div>
                ) : (
                  <div className="checkout-payment-note"><LockOutlinedIcon /><p>Pay in cash when your order is delivered. Our concierge will contact you to confirm the delivery.</p></div>
                )}
              </section>
            </div>

            <aside className="checkout-review-card">
              <div className="checkout-review-heading"><div><small>STEP 03</small><h2>Order Review · Summary</h2></div><span>{items.length} {items.length === 1 ? "Item" : "Items"}</span></div>
              {productsLoading && <p className="checkout-loading">Loading current catalogue details…</p>}
              {productError && <p className="checkout-error">{productError}</p>}
              <div className="checkout-review-items">
                {items.map((line) => {
                  const product = line.product;
                  return <article className="checkout-review-item" key={line.id}>
                    <img src={product?.productImages?.[0] || line.image} alt={product?.productTitle || line.title} />
                    <div><h3>{product?.productTitle || line.title}</h3><p>{product ? formatPrice(product.productPrice, usdUzsRate) : "Unavailable"} · Qty: {line.quantity}</p><small>◇ In Vault</small></div>
                    <strong>{product ? formatPrice(product.productPrice * line.quantity, usdUzsRate) : "—"}</strong>
                  </article>;
                })}
              </div>
              <div className="checkout-totals">
                <div><span>Subtotal</span><strong>{formatPrice(total, usdUzsRate)}</strong></div>
                <div><span>Shipping</span><strong className="gold-text">FREE</strong></div>
                <div><span>Taxes</span><strong>Included</strong></div>
                <div className="checkout-grand-total"><span>Total</span><strong>{formatPrice(total, usdUzsRate)}</strong></div>
              </div>
              <label className="checkout-terms"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /><span>I agree to HaDiJaM’s terms of acquisition and purchase conditions for fine jewelry.</span></label>
              {error && <p className="checkout-error" role="alert">{error}</p>}
              <button className="checkout-submit" type="submit" disabled={submitting || productsLoading || unavailableItems || !items.length}>
                <LockOutlinedIcon /> {submitting ? "PLACING ORDER…" : `PLACE ORDER · ${formatPrice(total, usdUzsRate)}`}
              </button>
              <div className="checkout-trust"><p><VerifiedUserOutlinedIcon /> Genuine jewelry, carefully inspected</p><p><LockOutlinedIcon /> Your order details are handled securely</p></div>
              <Link href="/cart" className="checkout-edit-cart">← Return to your bag to edit quantities</Link>
            </aside>
          </form>
        )}
      </main>
      <footer className="checkout-footer"><div><strong>HaDiJaM Private Client Care</strong><span>Concierge assistance for your order</span></div><p>© 2026 HaDiJaM Fine Haute Joaillerie. All rights reserved.</p><span className="checkout-footer-terms">TERMS OF ACQUISITION · PRIVACY CHARTER</span></footer>
    </div>
  );
}

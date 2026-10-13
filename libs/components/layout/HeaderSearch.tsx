import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { SEARCH_ATELIERS, SEARCH_PRODUCTS, SEARCH_SERVICES } from "@/libs/graphql/search";
import { useLocale } from "@/libs/utils/LocaleProvider";
import { useUsdUzsRate } from "@/libs/utils/CurrencyProvider";
import { formatPrice } from "@/libs/utils/currency";

type SearchProps = { open: boolean; onClose: () => void };
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1997";
const imageUrl = (value?: string) => value ? (/^(https?:)?\/\//.test(value) ? value : `${apiBase.replace(/\/$/, "")}/${value.replace(/^\//, "")}`) : "";

export default function HeaderSearch({ open, onClose }: SearchProps) {
  const router = useRouter();
  const { t } = useLocale();
  const usdUzsRate = useUsdUzsRate();
  const [value, setValue] = useState("");
  const [queryText, setQueryText] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setQueryText(value.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [value]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  const productVariables = useMemo(() => ({ input: { page: 1, limit: 4, sort: "createdAt", direction: "DESC", search: { text: queryText } } }), [queryText]);
  const serviceVariables = useMemo(() => ({ input: { page: 1, limit: 4, sort: "createdAt", direction: "DESC", search: { text: queryText } } }), [queryText]);
  const atelierVariables = useMemo(() => ({ input: { page: 1, limit: 4, sort: "createdAt", direction: "DESC", search: { text: queryText } } }), [queryText]);
  const productsQuery = useQuery(SEARCH_PRODUCTS, { variables: productVariables, skip: !open || queryText.length < 2, fetchPolicy: "network-only" });
  const servicesQuery = useQuery(SEARCH_SERVICES, { variables: serviceVariables, skip: !open || queryText.length < 2, fetchPolicy: "network-only" });
  const ateliersQuery = useQuery(SEARCH_ATELIERS, { variables: atelierVariables, skip: !open || queryText.length < 2, fetchPolicy: "network-only" });
  if (!open) return null;

  const products = productsQuery.data?.getProducts?.list ?? [];
  const services = servicesQuery.data?.getServices?.list ?? [];
  const ateliers = ateliersQuery.data?.getSellers?.list ?? [];
  const loading = productsQuery.loading || servicesQuery.loading || ateliersQuery.loading;
  const failed = productsQuery.error || servicesQuery.error || ateliersQuery.error;
  const hasResults = products.length + services.length + ateliers.length > 0;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (queryText) { onClose(); void router.push(`/catalog?q=${encodeURIComponent(queryText)}`); }
  };

  return <div className="header-search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="header-search-dialog" role="dialog" aria-modal="true" aria-label={t("Search")}>
      <form className="header-search-form" onSubmit={submit}>
        <SearchRoundedIcon />
        <input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder={t("Search products, services, or ateliers")} aria-label={t("Search")} />
        <button type="button" className="header-search-close" onClick={onClose} aria-label={t("Close search")}><CloseRoundedIcon /></button>
      </form>
      <div className="header-search-content" aria-live="polite">
        {queryText.length < 2 ? <p className="header-search-hint">{t("Type at least 2 characters")}</p> : loading ? <p className="header-search-hint">{t("Searching…")}</p> : failed ? <p className="header-search-hint" role="alert">{t("Search is unavailable. Please try again.")}</p> : !hasResults ? <p className="header-search-hint">{t("No matching results")}</p> : <>
          {products.length > 0 && <section className="header-search-group"><h2>{t("Products")}</h2>{products.map((product: any) => <Link href={`/product/${product._id}`} key={product._id} onClick={onClose} className="header-search-result"><img src={imageUrl(product.productImages?.[0]) || "/images/stitch/brand/diamond-mark.png"} alt="" /><span><strong>{product.productTitle}</strong><small>{t(product.productType)} · {formatPrice(Number(product.productPrice), usdUzsRate)}</small></span><b>↗</b></Link>)}</section>}
          {(services.length > 0 || ateliers.length > 0) && <section className="header-search-group"><h2>{t("Services & ateliers")}</h2>
            {services.map((service: any) => {
              const category = `${service.serviceCategory} ${service.serviceTitle}`.toLowerCase();
              const href = /repair|restor|micro laser/.test(category) ? "/services/repair-restoration" : /ultrasonic|polish|clean|rhodium/.test(category) ? "/services/ultrasonic-cleaning" : /custom|design|cad/.test(category) ? "/services/custom-design" : /gemolog|apprais|valuation/.test(category) ? "/services/gemological-appraisal" : /resize|ring/.test(category) ? "/services/ring-resizing" : "/services";
              return <Link href={href} key={service._id} onClick={onClose} className="header-search-result"><span className="header-search-result-icon"><SearchRoundedIcon /></span><span><strong>{service.serviceTitle}</strong><small>{t("Services")}</small></span><b>↗</b></Link>;
            })}
            {ateliers.map((atelier: any) => <Link href={`/catalog?sellerId=${encodeURIComponent(atelier._id)}`} key={atelier._id} onClick={onClose} className="header-search-result"><span className="header-search-result-icon atelier">{atelier.memberImage ? <img src={imageUrl(atelier.memberImage)} alt="" /> : <span aria-hidden="true">✧</span>}</span><span><strong>{atelier.memberNick}</strong><small>{atelier.memberProducts} {t("Products").toLowerCase()}</small></span><b>↗</b></Link>)}
          </section>}
          <Link className="header-search-all" href={`/catalog?q=${encodeURIComponent(queryText)}`} onClick={onClose}>{t("View all results")} <span>↗</span></Link>
        </>}
      </div>
    </section>
  </div>;
}

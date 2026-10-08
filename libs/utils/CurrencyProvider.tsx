import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const fallbackUsdUzsRate = 11772.95;

const CurrencyContext = createContext(fallbackUsdUzsRate);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rate, setRate] = useState(fallbackUsdUzsRate);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok)
          throw new Error("Could not load the official currency rate.");
        return response.json();
      })
      .then(
        (rates: Array<{ Ccy?: string; Rate?: string; Nominal?: string }>) => {
          const usd = rates.find((item) => item.Ccy === "USD");
          const value = Number(usd?.Rate?.replace(/\s/g, "").replace(",", "."));
          const nominal = Number(usd?.Nominal ?? "1");
          if (
            Number.isFinite(value) &&
            value > 0 &&
            Number.isFinite(nominal) &&
            nominal > 0
          ) {
            setRate(value / nominal);
          }
        },
      )
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.warn("[Currency] Using the fallback USD/UZS rate.", error);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <CurrencyContext.Provider value={rate}>{children}</CurrencyContext.Provider>
  );
}

export function useUsdUzsRate() {
  return useContext(CurrencyContext);
}

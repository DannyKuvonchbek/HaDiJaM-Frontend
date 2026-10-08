import { fallbackUsdUzsRate } from "./CurrencyProvider";

export function formatPrice(
  uzsAmount: number,
  usdUzsRate = fallbackUsdUzsRate,
) {
  const usdAmount = uzsAmount / usdUzsRate;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usdAmount);
}

export function usdToUzs(usdAmount: number, usdUzsRate = fallbackUsdUzsRate) {
  return Math.round((usdAmount * usdUzsRate) / 1000) * 1000;
}

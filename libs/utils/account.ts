export const accountApiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:1997";
export const accountOrderSteps = [
  "Deposit",
  "Appraisal",
  "Transit",
  "Delivered",
];

export const formatAccountDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatAccountStatus = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const accountOrderProgress = (status: string) => {
  const normalized = status.toUpperCase();
  if (["DELIVERED", "COMPLETED"].includes(normalized)) return 3;
  if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(normalized))
    return 2;
  if (["CONFIRMED", "PROCESSING", "APPRAISAL"].includes(normalized)) return 1;
  return 0;
};

export function readMemberId(token: string): string {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      window.atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")),
    );
    return typeof payload.sub === "string" ? payload.sub : "";
  } catch {
    return "";
  }
}

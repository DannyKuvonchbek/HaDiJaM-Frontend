/** Uploaded images live on the API; frontend assets and absolute URLs keep their origin. */
export function productImageUrl(value?: string | null): string {
  const path = value?.trim().replace(/\\/g, "/") ?? "";
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("//") || path.startsWith("blob:") || path.startsWith("data:image/")) return path;
  const relative = path.replace(/^(?:\.\/|\/)+/, "");
  if (relative.startsWith("uploads/")) {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9702").replace(/\/+$/, "");
    return `${base}/${relative}`;
  }
  return `/${relative}`;
}

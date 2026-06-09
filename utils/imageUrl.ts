export function getImageUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

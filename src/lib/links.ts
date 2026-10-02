export function mapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function phonesIn(text: string): string[] {
  const matches = text.match(/\+\d[\d\s()-]{6,}\d|\b1\d{2}\b/g) ?? [];
  return [...new Set(matches.map((item) => item.trim()))];
}

export function safeFileName(title: string, mime: string): string {
  const base = title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "document";
  if (mime.includes("pdf")) return `${base}.pdf`;
  if (mime.includes("png")) return `${base}.png`;
  if (mime.includes("jpeg") || mime.includes("jpg")) return `${base}.jpg`;
  return base;
}

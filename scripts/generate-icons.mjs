import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#14283a"/>
  <rect x="116" y="132" width="280" height="248" rx="28" fill="none" stroke="#f4ead8" stroke-width="18"/>
  <circle cx="256" cy="256" r="34" fill="#f4ead8"/>
  <path d="M176 188h160" stroke="#f4ead8" stroke-width="14" stroke-linecap="round"/>
</svg>`;

const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#14283a"/>
  <rect x="146" y="156" width="220" height="200" rx="24" fill="none" stroke="#f4ead8" stroke-width="16"/>
  <circle cx="256" cy="256" r="28" fill="#f4ead8"/>
</svg>`;

await mkdir("public/icons", { recursive: true });
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile("public/icons/maskable-512.png");

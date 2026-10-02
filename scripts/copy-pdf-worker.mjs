import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const source = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
const target = "public/pdf.worker.min.mjs";
await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);

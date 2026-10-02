import { renderDemoFile } from "./demo-art";
import { VIENNA_TRIP, buildViennaDemo } from "./demo-data";
import { db, defaultSettings } from "./db";
import { setSessionKey } from "./session";
import type { DemoFileSpec, VaultFile } from "./types";

const ORIGINAL_FILE_IDS = [
  "file-flight-out",
  "file-flight-lior",
  "file-bp-elroi-out",
  "file-bp-lior-out",
  "file-flight-archive",
  "file-archive-lior",
];

const ORIGINAL_DOCUMENT_IDS = [
  "doc-flight-out",
  "doc-flight-lior",
  "doc-bp-elroi-out",
  "doc-bp-lior-out",
  "doc-flight-archive",
  "doc-archive-lior",
];

let seeding: Promise<void> | null = null;

export function seedIfEmpty(): Promise<void> {
  if (!seeding) {
    seeding = seedVault().finally(() => {
      seeding = null;
    });
  }
  return seeding;
}

async function seedVault(): Promise<void> {
  const existing = await db.trips.get(VIENNA_TRIP);
  if (existing) {
    const settings = await db.settings.get("security");
    if (!settings) await db.settings.put(defaultSettings(existing.id));
    await syncOriginalFlightFiles();
    return;
  }
  const demo = buildViennaDemo();
  const files: VaultFile[] = [];
  for (const spec of demo.fileSpecs) {
    files.push(await fileFromSpec(spec, demo.trip.createdAt));
  }
  await db.transaction("rw", [db.travelers, db.trips, db.documents, db.files, db.flights, db.hotels, db.attractions, db.cars, db.insurances, db.esims, db.days, db.activities, db.checklist, db.settings], async () => {
    await db.travelers.bulkAdd(demo.travelers);
    await db.trips.add(demo.trip);
    await db.documents.bulkAdd(demo.documents);
    await db.files.bulkAdd(files);
    await db.flights.bulkAdd(demo.flights);
    await db.hotels.bulkAdd(demo.hotels);
    await db.attractions.bulkAdd(demo.attractions);
    await db.cars.bulkAdd(demo.cars);
    await db.insurances.bulkAdd(demo.insurances);
    await db.esims.bulkAdd(demo.esims);
    await db.days.bulkAdd(demo.days);
    await db.activities.bulkAdd(demo.activities);
    await db.checklist.bulkAdd(demo.checklist);
    await db.settings.put(defaultSettings(demo.trip.id));
  });
}

async function syncOriginalFlightFiles(): Promise<void> {
  const outbound = await db.flights.get("flight-out");
  if (!outbound) return;
  const demo = buildViennaDemo();
  const specs = demo.fileSpecs.filter((spec) => ORIGINAL_FILE_IDS.includes(spec.fileId));
  const stored = await Promise.all(specs.map((spec) => db.files.get(spec.fileId)));
  if (stored.some((file) => file?.encrypted)) return;

  const stale = specs.filter((spec, index) => !isStoredOriginal(stored[index]));
  const documents = await Promise.all(ORIGINAL_DOCUMENT_IDS.map((id) => db.documents.get(id)));
  const missingDocument = documents.some((document) => !document);
  if (!stale.length && !missingDocument && !outbound.flightNumber.includes("353")) return;

  const files = await Promise.all(stale.map((spec) => fileFromSpec(spec, demo.trip.createdAt)));
  const documentIds = new Set(ORIGINAL_DOCUMENT_IDS);
  const activityIds = new Set(["act-dep", "act-land", "act-return-flight"]);
  await db.transaction("rw", [db.documents, db.files, db.flights, db.activities], async () => {
    await db.documents.bulkDelete(["doc-bp-elroi-ret", "doc-bp-lior-ret"]);
    await db.files.bulkDelete(["file-bp-elroi-ret", "file-bp-lior-ret"]);
    await db.documents.bulkPut(demo.documents.filter((document) => documentIds.has(document.id)));
    if (files.length) await db.files.bulkPut(files);
    await db.flights.bulkPut(demo.flights);
    await db.activities.bulkPut(demo.activities.filter((activity) => activityIds.has(activity.id)));
  });
}

async function fileFromSpec(spec: DemoFileSpec, createdAt: string): Promise<VaultFile> {
  return {
    id: spec.fileId,
    mime: spec.mime,
    encrypted: false,
    ivB64: null,
    bytes: await loadSpecBytes(spec),
    createdAt,
  };
}

async function loadSpecBytes(spec: DemoFileSpec): Promise<ArrayBuffer> {
  if (!spec.assetPath) return (await renderDemoFile(spec)).arrayBuffer();
  const response = await fetch(spec.assetPath);
  if (!response.ok) throw new Error(`לא ניתן לטעון את ${spec.assetPath}`);
  const bytes = await response.arrayBuffer();
  if (!isPdfBytes(bytes)) throw new Error(`הקובץ ${spec.assetPath} אינו PDF`);
  return bytes;
}

function isStoredOriginal(file: VaultFile | undefined): boolean {
  return Boolean(file && !file.encrypted && file.mime === "application/pdf" && file.bytes.byteLength >= 20_000 && isPdfBytes(file.bytes));
}

function isPdfBytes(bytes: ArrayBuffer): boolean {
  return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
}

export async function resetDemo(): Promise<void> {
  setSessionKey(null);
  await db.delete();
  await db.open();
  await seedIfEmpty();
}

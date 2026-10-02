import { renderDemoFile } from "./demo-art";
import { VIENNA_TRIP, buildViennaDemo } from "./demo-data";
import { db, defaultSettings } from "./db";
import { setSessionKey } from "./session";
import type { VaultFile } from "./types";

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
    await replacePlaceholderFlights();
    return;
  }
  const demo = buildViennaDemo();
  const files: VaultFile[] = [];
  for (const spec of demo.fileSpecs) {
    const blob = await renderDemoFile(spec);
    files.push({
      id: spec.fileId,
      mime: spec.mime,
      encrypted: false,
      ivB64: null,
      bytes: await blob.arrayBuffer(),
      createdAt: demo.trip.createdAt,
    });
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

async function replacePlaceholderFlights(): Promise<void> {
  const outbound = await db.flights.get("flight-out");
  if (!outbound || !outbound.flightNumber.includes("353")) return;
  const demo = buildViennaDemo();
  const specIds = new Set(["file-flight-out", "file-bp-elroi-out", "file-bp-lior-out", "file-flight-archive"]);
  const files: VaultFile[] = [];
  for (const spec of demo.fileSpecs.filter((spec) => specIds.has(spec.fileId))) {
    const current = await db.files.get(spec.fileId);
    if (current?.encrypted) continue;
    const blob = await renderDemoFile(spec);
    files.push({
      id: spec.fileId,
      mime: spec.mime,
      encrypted: false,
      ivB64: null,
      bytes: await blob.arrayBuffer(),
      createdAt: demo.trip.createdAt,
    });
  }
  const documentIds = new Set(["doc-flight-out", "doc-bp-elroi-out", "doc-bp-lior-out", "doc-flight-archive"]);
  const activityIds = new Set(["act-dep", "act-land", "act-return-flight"]);
  await db.transaction("rw", [db.documents, db.files, db.flights, db.activities], async () => {
    await db.documents.bulkDelete(["doc-bp-elroi-ret", "doc-bp-lior-ret"]);
    await db.files.bulkDelete(["file-bp-elroi-ret", "file-bp-lior-ret"]);
    await db.documents.bulkPut(demo.documents.filter((document) => documentIds.has(document.id)));
    await db.files.bulkPut(files);
    await db.flights.bulkPut(demo.flights);
    await db.activities.bulkPut(demo.activities.filter((activity) => activityIds.has(activity.id)));
  });
}

export async function resetDemo(): Promise<void> {
  setSessionKey(null);
  await db.delete();
  await db.open();
  await seedIfEmpty();
}

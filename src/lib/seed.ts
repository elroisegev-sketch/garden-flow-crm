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

export async function resetDemo(): Promise<void> {
  setSessionKey(null);
  await db.delete();
  await db.open();
  await seedIfEmpty();
}

import { createBiometricWrap, openWithBiometric } from "./biometric";
import { buildChecklist } from "./demo-data";
import { eachDate, nowIso } from "./dates";
import { db, defaultSettings } from "./db";
import { bytesToB64, b64ToBytes, decryptBuffer, encryptBuffer, openWithPin, protectWithPin, rewrapWithPin } from "./crypto";
import { assertNoPaymentSecrets } from "./secrets";
import { getSessionKey, setSessionKey } from "./session";
import type {
  Attraction,
  CarRental,
  DocumentInput,
  ESimPlan,
  Flight,
  Hotel,
  Insurance,
  SecuritySettings,
  TravelDocument,
  Traveler,
  Trip,
  TripActivity,
} from "./types";

async function settingsOrDefault(): Promise<SecuritySettings> {
  return (await db.settings.get("security")) ?? defaultSettings();
}

async function writeBlob(id: string, blob: Blob): Promise<void> {
  const bytes = await blob.arrayBuffer();
  const settings = await settingsOrDefault();
  const createdAt = nowIso();
  if (settings.pinEnabled) {
    const key = getSessionKey();
    if (!key) throw new Error("פתחו את הכספת עם הקוד לפני הוספת מסמך.");
    const encrypted = await encryptBuffer(key, bytes);
    await db.files.put({ id, mime: blob.type || "application/octet-stream", encrypted: true, ivB64: bytesToB64(encrypted.iv), bytes: encrypted.cipher, createdAt });
    return;
  }
  await db.files.put({ id, mime: blob.type || "application/octet-stream", encrypted: false, ivB64: null, bytes, createdAt });
}

async function deleteFileIfUnused(fileId: string | null): Promise<void> {
  if (!fileId) return;
  const documents = await db.documents.toArray();
  if (documents.some((document) => document.fileId === fileId)) return;
  await db.files.delete(fileId);
}

export async function loadFileBlob(fileId: string): Promise<Blob> {
  const file = await db.files.get(fileId);
  if (!file) throw new Error("הקובץ לא נמצא במכשיר.");
  if (!file.encrypted) return new Blob([file.bytes], { type: file.mime });
  const key = getSessionKey();
  if (!key || !file.ivB64) throw new Error("המסמך מוצפן. פתחו את האפליקציה עם הקוד.");
  const plain = await decryptBuffer(key, file.bytes, b64ToBytes(file.ivB64));
  return new Blob([plain], { type: file.mime });
}

export async function createDocument(input: DocumentInput, file: Blob | null): Promise<string> {
  assertNoPaymentSecrets(input.title, input.notes, input.bookingNumber);
  if (!input.title.trim()) throw new Error("צריך שם למסמך.");
  const id = crypto.randomUUID();
  let fileId: string | null = null;
  let fileType: string | null = null;
  if (file) {
    fileId = crypto.randomUUID();
    fileType = file.type || "application/octet-stream";
    await writeBlob(fileId, file);
  }
  const stamp = nowIso();
  await db.documents.add({ ...input, title: input.title.trim(), id, fileId, fileType, thumbnailId: null, createdAt: stamp, updatedAt: stamp });
  return id;
}

export async function updateDocument(id: string, input: DocumentInput, file: Blob | null): Promise<void> {
  assertNoPaymentSecrets(input.title, input.notes, input.bookingNumber);
  const existing = await db.documents.get(id);
  if (!existing) throw new Error("המסמך לא נמצא.");
  if (!input.title.trim()) throw new Error("צריך שם למסמך.");
  let fileId = existing.fileId;
  let fileType = existing.fileType;
  if (file) {
    fileId = crypto.randomUUID();
    fileType = file.type || "application/octet-stream";
    await writeBlob(fileId, file);
  }
  await db.documents.put({ ...existing, ...input, title: input.title.trim(), fileId, fileType, updatedAt: nowIso() });
  if (file && existing.fileId && existing.fileId !== fileId) await deleteFileIfUnused(existing.fileId);
}

export async function deleteDocument(id: string): Promise<void> {
  const existing = await db.documents.get(id);
  if (!existing) return;
  await db.documents.delete(id);
  await deleteFileIfUnused(existing.fileId);
  const flights = await db.flights.toArray();
  for (const flight of flights) {
    const boardingPassDocumentIds = flight.boardingPassDocumentIds.filter((item) => item !== id);
    const reservationDocumentId = flight.reservationDocumentId === id ? null : flight.reservationDocumentId;
    if (boardingPassDocumentIds.length !== flight.boardingPassDocumentIds.length || reservationDocumentId !== flight.reservationDocumentId) {
      await db.flights.update(flight.id, { boardingPassDocumentIds, reservationDocumentId });
    }
  }
  for (const hotel of await db.hotels.toArray()) {
    if (hotel.documentId === id) await db.hotels.update(hotel.id, { documentId: null });
  }
  for (const attraction of await db.attractions.toArray()) {
    if (attraction.documentId === id) await db.attractions.update(attraction.id, { documentId: null });
  }
  for (const car of await db.cars.toArray()) {
    const licenseDocumentIds = car.licenseDocumentIds.filter((item) => item !== id);
    const voucherDocumentId = car.voucherDocumentId === id ? null : car.voucherDocumentId;
    if (licenseDocumentIds.length !== car.licenseDocumentIds.length || voucherDocumentId !== car.voucherDocumentId) {
      await db.cars.update(car.id, { licenseDocumentIds, voucherDocumentId });
    }
  }
  for (const insurance of await db.insurances.toArray()) {
    const patch: Partial<Insurance> = {};
    if (insurance.documentId === id) patch.documentId = null;
    if (insurance.passportCardDocumentId === id) patch.passportCardDocumentId = null;
    if (Object.keys(patch).length) await db.insurances.update(insurance.id, patch);
  }
  for (const esim of await db.esims.toArray()) {
    if (esim.documentId === id) await db.esims.update(esim.id, { documentId: null });
  }
  for (const activity of await db.activities.toArray()) {
    if (activity.documentId === id) await db.activities.update(activity.id, { documentId: null });
  }
}

export async function setFavorite(id: string, favorite: boolean): Promise<void> {
  await db.documents.update(id, { favorite, updatedAt: nowIso() });
}

export async function setOfflineAvailable(id: string, offlineAvailable: boolean): Promise<void> {
  await db.documents.update(id, { offlineAvailable, updatedAt: nowIso() });
}

export async function saveTrip(trip: Trip, makeActive = false): Promise<void> {
  assertNoPaymentSecrets(trip.title, trip.destination, trip.notes);
  if (!trip.title.trim() || !trip.destination.trim()) throw new Error("צריך שם ויעד לטיול.");
  if (trip.endDate < trip.startDate) throw new Error("תאריך הסיום צריך להיות אחרי ההתחלה.");
  const existing = await db.trips.get(trip.id);
  const stamp = nowIso();
  await db.trips.put({ ...trip, title: trip.title.trim(), destination: trip.destination.trim(), createdAt: existing?.createdAt ?? stamp, updatedAt: stamp });
  const days = await db.days.where("tripId").equals(trip.id).toArray();
  for (const date of eachDate(trip.startDate, trip.endDate)) {
    if (!days.some((day) => day.date === date)) {
      await db.days.add({ id: crypto.randomUUID(), tripId: trip.id, date, title: "", notes: "" });
    }
  }
  if (!existing) await db.checklist.bulkAdd(buildChecklist(trip.id));
  if (makeActive || !existing) await setActiveTrip(trip.id);
}

export async function deleteTrip(id: string): Promise<void> {
  const documents = await db.documents.where("tripId").equals(id).toArray();
  await db.transaction("rw", [db.trips, db.documents, db.files, db.flights, db.hotels, db.attractions, db.cars, db.insurances, db.esims, db.days, db.activities, db.checklist, db.settings], async () => {
    for (const document of documents) {
      if (document.fileId) await db.files.delete(document.fileId);
    }
    await db.documents.where("tripId").equals(id).delete();
    await db.flights.where("tripId").equals(id).delete();
    await db.hotels.where("tripId").equals(id).delete();
    await db.attractions.where("tripId").equals(id).delete();
    await db.cars.where("tripId").equals(id).delete();
    await db.insurances.where("tripId").equals(id).delete();
    await db.esims.where("tripId").equals(id).delete();
    await db.days.where("tripId").equals(id).delete();
    await db.activities.where("tripId").equals(id).delete();
    await db.checklist.where("tripId").equals(id).delete();
    await db.trips.delete(id);
  });
  const settings = await settingsOrDefault();
  if (settings.activeTripId === id) {
    const remaining = await db.trips.toArray();
    await db.settings.put({ ...settings, activeTripId: remaining[0]?.id ?? null });
  }
}

export async function setActiveTrip(id: string): Promise<void> {
  const settings = await settingsOrDefault();
  await db.settings.put({ ...settings, activeTripId: id });
}

export async function saveTraveler(traveler: Traveler): Promise<void> {
  if (!traveler.name.trim()) throw new Error("צריך שם לנוסע.");
  const existing = await db.travelers.get(traveler.id);
  await db.travelers.put({ ...traveler, name: traveler.name.trim(), createdAt: existing?.createdAt ?? nowIso() });
}

export async function deleteTraveler(id: string): Promise<void> {
  const usedByDocument = await db.documents.filter((document) => document.travelerId === id).count();
  if (usedByDocument) throw new Error("אי אפשר למחוק נוסע שמקושר למסמכים.");
  const usedByTrip = await db.trips.filter((trip) => trip.travelerIds.includes(id)).count();
  if (usedByTrip) throw new Error("הנוסע משויך לטיול. הסירו אותו מהטיול קודם.");
  await db.travelers.delete(id);
}

export async function saveFlight(flight: Flight): Promise<void> {
  assertNoPaymentSecrets(flight.flightNumber, flight.confirmationNumber, flight.notes, flight.baggage, flight.airline);
  if (!flight.fromCode.trim() || !flight.toCode.trim()) throw new Error("צריך מוצא ויעד.");
  await db.flights.put({ ...flight, fromCode: flight.fromCode.trim().toUpperCase(), toCode: flight.toCode.trim().toUpperCase() });
}

export async function deleteFlight(id: string): Promise<void> {
  await db.flights.delete(id);
}

export async function saveHotel(hotel: Hotel): Promise<void> {
  assertNoPaymentSecrets(hotel.name, hotel.address, hotel.bookingNumber, hotel.notes, hotel.phone, hotel.room);
  if (!hotel.name.trim()) throw new Error("צריך שם מלון.");
  await db.hotels.put({ ...hotel, name: hotel.name.trim() });
}

export async function deleteHotel(id: string): Promise<void> {
  await db.hotels.delete(id);
}

export async function saveAttraction(attraction: Attraction): Promise<void> {
  assertNoPaymentSecrets(attraction.name, attraction.address, attraction.notes);
  if (!attraction.name.trim()) throw new Error("צריך שם לאטרקציה.");
  await db.attractions.put({ ...attraction, name: attraction.name.trim(), ticketCount: Math.max(0, attraction.ticketCount) });
}

export async function deleteAttraction(id: string): Promise<void> {
  await db.attractions.delete(id);
}

export async function saveCar(car: CarRental): Promise<void> {
  assertNoPaymentSecrets(car.company, car.reservationNumber, car.paymentNote, car.notes, car.pickupAddress, car.returnAddress, car.car);
  if (!car.company.trim()) throw new Error("צריך שם של חברת ההשכרה.");
  await db.cars.put({ ...car, company: car.company.trim() });
}

export async function deleteCar(id: string): Promise<void> {
  await db.cars.delete(id);
}

export async function saveInsurance(insurance: Insurance): Promise<void> {
  assertNoPaymentSecrets(insurance.company, insurance.policyNumber, insurance.emergencyPhone, insurance.notes, insurance.passportCardNote);
  if (!insurance.company.trim()) throw new Error("צריך שם של חברת הביטוח.");
  await db.insurances.put({ ...insurance, company: insurance.company.trim() });
}

export async function deleteInsurance(id: string): Promise<void> {
  await db.insurances.delete(id);
}

export async function saveEsim(esim: ESimPlan): Promise<void> {
  assertNoPaymentSecrets(esim.provider, esim.packageName, esim.notes, esim.activationSteps, esim.phoneNumber);
  if (!esim.provider.trim()) throw new Error("צריך שם ספק.");
  await db.esims.put({ ...esim, provider: esim.provider.trim() });
}

export async function deleteEsim(id: string): Promise<void> {
  await db.esims.delete(id);
}

export async function saveActivity(activity: TripActivity): Promise<void> {
  assertNoPaymentSecrets(activity.title, activity.note, activity.address);
  if (!activity.title.trim()) throw new Error("צריך שם לפעילות.");
  await db.activities.put({ ...activity, title: activity.title.trim() });
}

export async function deleteActivity(id: string): Promise<void> {
  await db.activities.delete(id);
}

export async function moveActivity(id: string, direction: -1 | 1): Promise<void> {
  const activity = await db.activities.get(id);
  if (!activity) return;
  const siblings = (await db.activities.where("dayId").equals(activity.dayId).toArray()).sort((a, b) => a.sortOrder - b.sortOrder || a.time.localeCompare(b.time));
  const index = siblings.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= siblings.length) return;
  const next = siblings.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  await Promise.all(next.map((entry, order) => db.activities.update(entry.id, { sortOrder: order })));
}

export async function setChecklistDone(id: string, done: boolean): Promise<void> {
  await db.checklist.update(id, { done });
}

export async function addChecklistItem(tripId: string, section: string, title: string): Promise<void> {
  assertNoPaymentSecrets(title);
  if (!title.trim()) throw new Error("צריך טקסט לפריט.");
  const items = await db.checklist.where("tripId").equals(tripId).toArray();
  const sortOrder = items.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;
  await db.checklist.add({ id: crypto.randomUUID(), tripId, section, title: title.trim(), done: false, sortOrder, href: null });
}

export async function deleteChecklistItem(id: string): Promise<void> {
  await db.checklist.delete(id);
}

export async function updatePreferences(partial: Pick<SecuritySettings, "autoLockMinutes" | "hideSensitivePreviews" | "hintDismissed">): Promise<void> {
  const settings = await settingsOrDefault();
  await db.settings.put({ ...settings, ...partial });
}

export async function enablePin(pin: string): Promise<void> {
  const settings = await settingsOrDefault();
  if (settings.pinEnabled) throw new Error("הקוד כבר פעיל.");
  const wrap = await protectWithPin(pin);
  const files = await db.files.toArray();
  const encryptedFiles: { id: string; ivB64: string; bytes: ArrayBuffer }[] = [];
  for (const file of files) {
    if (file.encrypted) continue;
    const encrypted = await encryptBuffer(wrap.vaultKey, file.bytes);
    encryptedFiles.push({ id: file.id, ivB64: bytesToB64(encrypted.iv), bytes: encrypted.cipher });
  }
  setSessionKey(wrap.vaultKey);
  try {
    await db.transaction("rw", db.files, db.settings, async () => {
      for (const file of encryptedFiles) {
        await db.files.update(file.id, { encrypted: true, ivB64: file.ivB64, bytes: file.bytes });
      }
      await db.settings.put({
        ...settings,
        pinEnabled: true,
        pinLength: wrap.pinLength,
        saltB64: wrap.saltB64,
        wrappedKeyB64: wrap.wrappedKeyB64,
        wrappedKeyIvB64: wrap.wrappedKeyIvB64,
        kdfIterations: wrap.iterations,
      });
    });
  } catch (error) {
    setSessionKey(null);
    throw error;
  }
}

export async function changePin(currentPin: string, nextPin: string): Promise<void> {
  const settings = await settingsOrDefault();
  if (!settings.pinEnabled || !settings.saltB64 || !settings.wrappedKeyB64 || !settings.wrappedKeyIvB64) throw new Error("אין קוד פעיל.");
  const vaultKey = await openWithPin(currentPin, {
    saltB64: settings.saltB64,
    wrappedKeyB64: settings.wrappedKeyB64,
    wrappedKeyIvB64: settings.wrappedKeyIvB64,
    kdfIterations: settings.kdfIterations,
  });
  const wrapped = await rewrapWithPin(vaultKey, nextPin, settings.kdfIterations);
  await db.settings.put({
    ...settings,
    pinLength: wrapped.pinLength,
    saltB64: wrapped.saltB64,
    wrappedKeyB64: wrapped.wrappedKeyB64,
    wrappedKeyIvB64: wrapped.wrappedKeyIvB64,
    kdfIterations: wrapped.iterations,
  });
  setSessionKey(vaultKey);
}

export async function disablePin(pin: string): Promise<void> {
  const settings = await settingsOrDefault();
  if (!settings.pinEnabled || !settings.saltB64 || !settings.wrappedKeyB64 || !settings.wrappedKeyIvB64) return;
  const vaultKey = await openWithPin(pin, {
    saltB64: settings.saltB64,
    wrappedKeyB64: settings.wrappedKeyB64,
    wrappedKeyIvB64: settings.wrappedKeyIvB64,
    kdfIterations: settings.kdfIterations,
  });
  const files = await db.files.toArray();
  const plainFiles: { id: string; bytes: ArrayBuffer }[] = [];
  for (const file of files) {
    if (!file.encrypted || !file.ivB64) continue;
    const plain = await decryptBuffer(vaultKey, file.bytes, b64ToBytes(file.ivB64));
    plainFiles.push({ id: file.id, bytes: plain });
  }
  await db.transaction("rw", db.files, db.settings, async () => {
    for (const file of plainFiles) await db.files.update(file.id, { encrypted: false, ivB64: null, bytes: file.bytes });
    await db.settings.put({
      ...settings,
      pinEnabled: false,
      pinLength: 4,
      saltB64: null,
      wrappedKeyB64: null,
      wrappedKeyIvB64: null,
      biometricEnabled: false,
      credentialIdB64: null,
      prfSaltB64: null,
      bioWrappedKeyB64: null,
      bioWrappedKeyIvB64: null,
    });
  });
  setSessionKey(null);
}

export async function unlockWithPin(pin: string): Promise<void> {
  const settings = await settingsOrDefault();
  if (!settings.pinEnabled || !settings.saltB64 || !settings.wrappedKeyB64 || !settings.wrappedKeyIvB64) return;
  const key = await openWithPin(pin, {
    saltB64: settings.saltB64,
    wrappedKeyB64: settings.wrappedKeyB64,
    wrappedKeyIvB64: settings.wrappedKeyIvB64,
    kdfIterations: settings.kdfIterations,
  });
  setSessionKey(key);
}

export function lockVault(): void {
  setSessionKey(null);
}

export async function enableBiometric(): Promise<void> {
  const key = getSessionKey();
  const settings = await settingsOrDefault();
  if (!settings.pinEnabled || !key) throw new Error("קודם מפעילים קוד ופותחים את הכספת.");
  const wrap = await createBiometricWrap(key);
  await db.settings.put({
    ...settings,
    biometricEnabled: true,
    credentialIdB64: wrap.credentialIdB64,
    prfSaltB64: wrap.prfSaltB64,
    bioWrappedKeyB64: wrap.wrappedKeyB64,
    bioWrappedKeyIvB64: wrap.wrappedKeyIvB64,
  });
}

export async function disableBiometric(): Promise<void> {
  const settings = await settingsOrDefault();
  await db.settings.put({
    ...settings,
    biometricEnabled: false,
    credentialIdB64: null,
    prfSaltB64: null,
    bioWrappedKeyB64: null,
    bioWrappedKeyIvB64: null,
  });
}

export async function unlockWithBiometric(): Promise<void> {
  const settings = await settingsOrDefault();
  if (!settings.biometricEnabled || !settings.credentialIdB64 || !settings.prfSaltB64 || !settings.bioWrappedKeyB64 || !settings.bioWrappedKeyIvB64) {
    throw new Error("Face ID לא הופעל.");
  }
  const key = await openWithBiometric({
    credentialIdB64: settings.credentialIdB64,
    prfSaltB64: settings.prfSaltB64,
    wrappedKeyB64: settings.bioWrappedKeyB64,
    wrappedKeyIvB64: settings.bioWrappedKeyIvB64,
  });
  setSessionKey(key);
}

export function documentFromRecord(document: TravelDocument): DocumentInput {
  return {
    tripId: document.tripId,
    title: document.title,
    type: document.type,
    category: document.category,
    travelerId: document.travelerId,
    date: document.date,
    expiryDate: document.expiryDate,
    bookingNumber: document.bookingNumber,
    notes: document.notes,
    favorite: document.favorite,
    offlineAvailable: document.offlineAvailable,
    sensitive: document.sensitive,
  };
}

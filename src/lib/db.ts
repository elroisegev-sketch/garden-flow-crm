import Dexie, { type EntityTable } from "dexie";
import type {
  Attraction,
  CarRental,
  ChecklistItem,
  ESimPlan,
  Flight,
  Hotel,
  Insurance,
  SecuritySettings,
  TravelDocument,
  Traveler,
  Trip,
  TripActivity,
  TripDay,
  VaultFile,
} from "./types";

export class VaultDB extends Dexie {
  trips!: EntityTable<Trip, "id">;
  travelers!: EntityTable<Traveler, "id">;
  documents!: EntityTable<TravelDocument, "id">;
  files!: EntityTable<VaultFile, "id">;
  flights!: EntityTable<Flight, "id">;
  hotels!: EntityTable<Hotel, "id">;
  attractions!: EntityTable<Attraction, "id">;
  cars!: EntityTable<CarRental, "id">;
  insurances!: EntityTable<Insurance, "id">;
  esims!: EntityTable<ESimPlan, "id">;
  days!: EntityTable<TripDay, "id">;
  activities!: EntityTable<TripActivity, "id">;
  checklist!: EntityTable<ChecklistItem, "id">;
  settings!: EntityTable<SecuritySettings, "id">;

  constructor() {
    super("travel-vault");
    this.version(1).stores({
      trips: "id, startDate",
      travelers: "id, name",
      documents: "id, tripId, category, type, travelerId, favorite, fileId, createdAt",
      files: "id",
      flights: "id, tripId, date",
      hotels: "id, tripId",
      attractions: "id, tripId, date",
      cars: "id, tripId",
      insurances: "id, tripId",
      esims: "id, tripId",
      days: "id, tripId, date",
      activities: "id, tripId, dayId, sortOrder",
      checklist: "id, tripId, section, sortOrder",
      settings: "id",
    });
  }
}

export const db = new VaultDB();

export function defaultSettings(activeTripId: string | null = null): SecuritySettings {
  return {
    id: "security",
    pinEnabled: false,
    pinLength: 4,
    saltB64: null,
    wrappedKeyB64: null,
    wrappedKeyIvB64: null,
    kdfIterations: 120_000,
    biometricEnabled: false,
    credentialIdB64: null,
    prfSaltB64: null,
    bioWrappedKeyB64: null,
    bioWrappedKeyIvB64: null,
    autoLockMinutes: 5,
    hideSensitivePreviews: false,
    activeTripId,
    hintDismissed: false,
  };
}

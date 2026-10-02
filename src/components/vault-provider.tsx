"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { db, defaultSettings } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { lockVault } from "@/lib/repository";
import { hasSessionKey, idleForMs, touchActivity } from "@/lib/session";
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
} from "@/lib/types";

interface Snapshot {
  settings: SecuritySettings;
  trips: Trip[];
  travelers: Traveler[];
  documents: TravelDocument[];
  flights: Flight[];
  hotels: Hotel[];
  attractions: Attraction[];
  cars: CarRental[];
  insurances: Insurance[];
  esims: ESimPlan[];
  days: TripDay[];
  activities: TripActivity[];
  checklist: ChecklistItem[];
}

export interface VaultState extends Snapshot {
  ready: boolean;
  bootError: string | null;
  activeTrip: Trip | null;
  unlocked: boolean;
  setUnlocked: (value: boolean) => void;
}

const VaultContext = createContext<VaultState | null>(null);
const ConfirmContext = createContext<(message: string) => Promise<boolean>>(async () => false);

export function useVaultState(): VaultState | null {
  return useContext(VaultContext);
}

export function useVault(): VaultState {
  const value = useContext(VaultContext);
  if (!value) throw new Error("Vault is missing");
  return value;
}

export function useConfirm(): (message: string) => Promise<boolean> {
  return useContext(ConfirmContext);
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [sessionOpen, setSessionOpen] = useState(hasSessionKey);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (value: boolean) => void } | null>(null);
  const snapshot = useLiveQuery(async (): Promise<Snapshot> => {
    const [trips, travelers, documents, flights, hotels, attractions, cars, insurances, esims, days, activities, checklist, settings] = await Promise.all([
      db.trips.toArray(),
      db.travelers.toArray(),
      db.documents.toArray(),
      db.flights.toArray(),
      db.hotels.toArray(),
      db.attractions.toArray(),
      db.cars.toArray(),
      db.insurances.toArray(),
      db.esims.toArray(),
      db.days.toArray(),
      db.activities.toArray(),
      db.checklist.toArray(),
      db.settings.get("security"),
    ]);
    return {
      trips,
      travelers,
      documents,
      flights,
      hotels,
      attractions,
      cars,
      insurances,
      esims,
      days,
      activities,
      checklist,
      settings: settings ?? defaultSettings(),
    };
  }, []);

  useEffect(() => {
    seedIfEmpty()
      .then(() => setBooted(true))
      .catch((error: unknown) => setBootError(error instanceof Error ? error.message : "לא ניתן לפתוח את המסמכים במכשיר"));
  }, []);

  const unlocked = Boolean(snapshot && (!snapshot.settings.pinEnabled || hasSessionKey()));

  useEffect(() => {
    if (!snapshot?.settings.pinEnabled || !sessionOpen) return;
    const minutes = snapshot.settings.autoLockMinutes;
    const mark = () => touchActivity();
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && minutes <= 0) {
        lockVault();
        setSessionOpen(false);
        return;
      }
      if (document.visibilityState === "visible" && minutes > 0 && idleForMs() >= minutes * 60_000) {
        lockVault();
        setSessionOpen(false);
      }
    };
    const timer = window.setInterval(() => {
      if (minutes > 0 && idleForMs() >= minutes * 60_000) {
        lockVault();
        setSessionOpen(false);
      }
    }, 5_000);
    window.addEventListener("pointerdown", mark);
    window.addEventListener("keydown", mark);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [snapshot, sessionOpen]);

  const confirm = (message: string) => new Promise<boolean>((resolve) => setConfirmState({ message, resolve }));
  const activeTrip = useMemo(() => {
    if (!snapshot) return null;
    return snapshot.trips.find((trip) => trip.id === snapshot.settings.activeTripId) ?? snapshot.trips.slice().sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
  }, [snapshot]);

  const value = useMemo<VaultState | null>(() => {
    if (!snapshot) return null;
    const tripId = activeTrip?.id;
    const inTrip = <T extends { tripId: string }>(items: T[]) => (tripId ? items.filter((item) => item.tripId === tripId) : []);
    return {
      ...snapshot,
      documents: inTrip(snapshot.documents),
      flights: inTrip(snapshot.flights).sort((a, b) => a.date.localeCompare(b.date)),
      hotels: inTrip(snapshot.hotels),
      attractions: inTrip(snapshot.attractions),
      cars: inTrip(snapshot.cars),
      insurances: inTrip(snapshot.insurances),
      esims: inTrip(snapshot.esims),
      days: inTrip(snapshot.days).sort((a, b) => a.date.localeCompare(b.date)),
      activities: inTrip(snapshot.activities).sort((a, b) => a.sortOrder - b.sortOrder || a.time.localeCompare(b.time)),
      checklist: inTrip(snapshot.checklist).sort((a, b) => a.sortOrder - b.sortOrder),
      activeTrip,
      ready: booted,
      bootError,
      unlocked,
      setUnlocked: setSessionOpen,
    };
  }, [snapshot, activeTrip, booted, bootError, unlocked]);

  return (
    <ConfirmContext.Provider value={confirm}>
      <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
      {confirmState ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 shadow-2xl">
            <p className="text-lg font-semibold leading-7">{confirmState.message}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" className="h-12 rounded-2xl bg-paper font-semibold" onClick={() => { confirmState.resolve(false); setConfirmState(null); }}>
                ביטול
              </button>
              <button type="button" className="h-12 rounded-2xl bg-danger font-semibold text-white" onClick={() => { confirmState.resolve(true); setConfirmState(null); }}>
                אישור
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

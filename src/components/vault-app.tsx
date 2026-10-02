"use client";

import { useEffect } from "react";
import { navigate, useRouter, RouterProvider } from "@/lib/router";
import type { AppRoute } from "@/lib/routes";
import { BootSplash, LockScreen } from "./lock-screen";
import { Shell } from "./shell";
import { VaultProvider, useVaultState } from "./vault-provider";
import { HomeScreen } from "@/screens/home";
import { DocumentCreateScreen, DocumentEditScreen, DocumentScreen, DocumentsScreen } from "@/screens/documents";
import { PresentScreen } from "@/screens/present";
import { FlightFormScreen, FlightsScreen } from "@/screens/flights";
import { AttractionDetailScreen, AttractionFormScreen, AttractionsScreen, CarFormScreen, CarScreen, EsimFormScreen, EsimScreen, HotelFormScreen, HotelScreen, InsuranceFormScreen, InsuranceScreen } from "@/screens/stay";
import { ActivityFormScreen, ChecklistScreen, TripDayScreen, TripScreen } from "@/screens/trip";
import { SettingsScreen, TravelerFormScreen, TripFormScreen } from "@/screens/settings";
import { Button, EmptyState } from "./ui";

export function VaultApp() {
  return (
    <RouterProvider>
      <VaultProvider>
        <Gate />
      </VaultProvider>
    </RouterProvider>
  );
}

function Gate() {
  const vault = useVaultState();
  const router = useRouter();
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);
  if (!vault?.ready) return <BootSplash error={vault?.bootError} />;
  if (vault.settings.pinEnabled && !vault.unlocked) return <LockScreen />;
  if (router.route.name === "present") return <PresentScreen id={router.route.id} />;
  return (
    <div className="min-h-dvh bg-[#e4dfd6]">
      <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-paper">
        <Shell>
          <Routes route={router.route} />
        </Shell>
      </div>
    </div>
  );
}

function Routes({ route }: { route: AppRoute }) {
  switch (route.name) {
    case "home":
      return <HomeScreen />;
    case "documents":
      return <DocumentsScreen />;
    case "document-new":
      return <DocumentCreateScreen />;
    case "document":
      return <DocumentScreen id={route.id} />;
    case "document-edit":
      return <DocumentEditScreen id={route.id} />;
    case "browse":
      return <DocumentsScreen category={route.category} />;
    case "favorites":
      return <DocumentsScreen favoritesOnly />;
    case "flights":
      return <FlightsScreen />;
    case "flight-new":
      return <FlightFormScreen />;
    case "flight-edit":
      return <FlightFormScreen id={route.id} />;
    case "hotel":
      return <HotelScreen />;
    case "hotel-new":
      return <HotelFormScreen />;
    case "hotel-edit":
      return <HotelFormScreen id={route.id} />;
    case "insurance":
      return <InsuranceScreen />;
    case "insurance-new":
      return <InsuranceFormScreen />;
    case "insurance-edit":
      return <InsuranceFormScreen id={route.id} />;
    case "car":
      return <CarScreen />;
    case "car-new":
      return <CarFormScreen />;
    case "car-edit":
      return <CarFormScreen id={route.id} />;
    case "attractions":
      return <AttractionsScreen />;
    case "attraction-new":
      return <AttractionFormScreen />;
    case "attraction":
      return <AttractionDetailScreen id={route.id} />;
    case "attraction-edit":
      return <AttractionFormScreen id={route.id} />;
    case "esim":
      return <EsimScreen />;
    case "esim-new":
      return <EsimFormScreen />;
    case "esim-edit":
      return <EsimFormScreen id={route.id} />;
    case "trip":
      return <TripScreen />;
    case "trip-day":
      return <TripDayScreen id={route.id} />;
    case "activity-new":
      return <ActivityFormScreen />;
    case "activity-edit":
      return <ActivityFormScreen id={route.id} />;
    case "checklist":
      return <ChecklistScreen />;
    case "settings":
      return <SettingsScreen />;
    case "trip-new":
      return <TripFormScreen />;
    case "trip-edit":
      return <TripFormScreen id={route.id} />;
    case "traveler-new":
      return <TravelerFormScreen />;
    case "traveler-edit":
      return <TravelerFormScreen id={route.id} />;
    default:
      return <EmptyState title="העמוד לא נמצא" body="חזרו למסך הבית." action={<Button onClick={() => navigate("/")}>בית</Button>} />;
  }
}

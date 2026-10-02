"use client";

import { CalendarDays, Folder, House, Plus, Search, Settings, Star, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { searchVault } from "@/lib/search";
import { Link, navigate, useRouter } from "@/lib/router";
import { showsNavigation, type AppRoute } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { useVault } from "./vault-provider";

const tabs = [
  { href: "/", label: "בית", icon: House, names: new Set(["home"]) },
  { href: "/documents", label: "מסמכים", icon: Folder, names: new Set(["documents", "document", "browse", "flights", "hotel", "insurance", "car", "attractions", "attraction", "esim"]) },
  { href: "/trip", label: "טיול", icon: CalendarDays, names: new Set(["trip", "trip-day", "checklist"]) },
  { href: "/favorites", label: "מועדפים", icon: Star, names: new Set(["favorites"]) },
  { href: "/settings", label: "הגדרות", icon: Settings, names: new Set(["settings"]) },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { route } = useRouter();
  const vault = useVault();
  const [query, setQuery] = useState("");
  const [online, setOnline] = useState(true);
  const showNav = showsNavigation(route);
  const addHref = fabHref(route);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || !vault.activeTrip) return [];
    return searchVault(
      {
        tripId: vault.activeTrip.id,
        documents: vault.documents,
        travelers: vault.travelers,
        flights: vault.flights,
        hotels: vault.hotels,
        attractions: vault.attractions,
        cars: vault.cars,
        insurances: vault.insurances,
        esims: vault.esims,
        activities: vault.activities,
        days: vault.days,
        checklist: vault.checklist,
      },
      query,
    );
  }, [query, vault]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-paper/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md">
        <label className="flex h-12 items-center gap-2 rounded-2xl bg-white px-3 shadow-card">
          <Search className="size-5 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש מסמך, כרטיס, כתובת…"
            className="h-full w-full bg-transparent text-base outline-none"
            aria-label="חיפוש"
          />
          {query ? (
            <button type="button" className="text-sm font-semibold text-muted" onClick={() => setQuery("")}>
              נקה
            </button>
          ) : null}
        </label>
      </header>
      {!online ? (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl bg-navy px-4 py-3 text-sm text-white">
          <WifiOff className="size-4" />
          אין חיבור. המסמכים שנשמרו במכשיר זמינים.
        </div>
      ) : null}
      <main className={cn("px-4", showNav ? "pb-36" : "pb-10")}>
        {query.trim() ? (
          <div className="space-y-2">
            {results.length ? results.map((result) => (
              <button
                key={`${result.kind}-${result.id}`}
                type="button"
                onClick={() => {
                  setQuery("");
                  navigate(result.href);
                }}
                className="block w-full rounded-2xl bg-white px-4 py-3 text-start shadow-card"
              >
                <span className="block font-semibold">{result.title}</span>
                <span className="mt-1 block text-sm text-muted">{result.subtitle}</span>
              </button>
            )) : <p className="rounded-3xl bg-white px-4 py-8 text-center text-muted">לא נמצא מסמך עבור “{query.trim()}”.</p>}
          </div>
        ) : children}
      </main>
      {showNav && addHref ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.15rem+env(safe-area-inset-bottom))] z-50 mx-auto flex w-full max-w-[430px] justify-end px-4">
          <Link href={addHref} className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-white shadow-lg">
            <Plus className="size-5" />
            Add Document
          </Link>
        </div>
      ) : null}
      {showNav ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <ul className="grid grid-cols-5">
            {tabs.map((tab) => {
              const active = tab.names.has(route.name);
              const Icon = tab.icon;
              return (
                <li key={tab.href}>
                  <Link href={tab.href} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-navy" : "text-muted")}>
                    <Icon className={cn("size-5", active && "fill-gold-soft")} />
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </>
  );
}

function fabHref(route: AppRoute): string | null {
  if (route.name === "settings" || route.name === "checklist" || route.name === "trip") return "/documents/new";
  if (route.name === "browse") return `/documents/new?category=${encodeURIComponent(route.category)}`;
  if (route.name === "flights") return "/documents/new?category=flights";
  if (route.name === "hotel") return "/documents/new?category=accommodation";
  if (route.name === "insurance") return "/documents/new?category=insurance";
  if (route.name === "car") return "/documents/new?category=car";
  if (route.name === "attractions" || route.name === "attraction") return "/documents/new?category=attractions";
  if (route.name === "esim") return "/documents/new?category=internet";
  if (route.name === "favorites" || route.name === "documents" || route.name === "home" || route.name === "document") return "/documents/new";
  return null;
}

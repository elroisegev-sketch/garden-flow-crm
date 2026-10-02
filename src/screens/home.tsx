"use client";

import { Car, Folder, Hotel, IdCard, Map, Plane, Shield, Smartphone, Ticket, TrainFront } from "lucide-react";
import { useState, type ReactNode } from "react";
import { formatIso, formatRange, tripPhase } from "@/lib/dates";
import { ownerLabel } from "@/lib/people";
import { Link, navigate } from "@/lib/router";
import type { TravelDocument } from "@/lib/types";
import { Chooser, Ltr, OfflineBadge, SectionTitle } from "@/components/ui";
import { useVault } from "@/components/vault-provider";

const quick = [
  { href: "/flights", label: "טיסות", icon: Plane },
  { href: "/browse/identity?type=passport", label: "דרכונים", icon: IdCard },
  { href: "/hotel", label: "מלון", icon: Hotel },
  { href: "/insurance", label: "ביטוח", icon: Shield },
  { href: "/attractions", label: "אטרקציות", icon: Ticket },
  { href: "/car", label: "רכב", icon: Car },
  { href: "/browse/transportation", label: "תחבורה", icon: TrainFront },
  { href: "/esim", label: "eSIM", icon: Smartphone },
  { href: "/documents", label: "מסמכים", icon: Folder },
  { href: "/trip", label: "מסלול", icon: Map },
  { href: "/documents", label: "הכל", icon: Folder },
];

export function HomeScreen() {
  const vault = useVault();
  const trip = vault.activeTrip;
  const [chooser, setChooser] = useState<{ title: string; options: { label: string; href: string }[] } | null>(null);
  if (!trip) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-card">
        <h1 className="text-2xl font-semibold">אין עדיין טיול</h1>
        <p className="mt-2 text-sm text-muted">צרו טיול ואז הוסיפו אליו מסמכים.</p>
        <Link href="/trips/new" className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">טיול חדש</Link>
      </div>
    );
  }
  const phase = tripPhase(trip.startDate, trip.endDate);
  const favoriteRank: Record<string, number> = { passport: 0, "boarding-pass": 1, "hotel-reservation": 2, "travel-insurance": 3, voucher: 4 };
  const favorites = vault.documents
    .filter((document) => document.favorite)
    .sort((a, b) => (favoriteRank[a.type] ?? 9) - (favoriteRank[b.type] ?? 9) || a.title.localeCompare(b.title, "en"));
  const done = vault.checklist.filter((item) => item.done).length;
  const passports = vault.documents.filter((document) => document.type === "passport");
  const today = formatIso(new Date());
  const upcoming = vault.flights.find((flight) => flight.date >= today) ?? vault.flights[0];
  const passes = vault.documents.filter((document) => upcoming?.boardingPassDocumentIds.includes(document.id));

  function openDocs(title: string, documents: TravelDocument[], fallback: string) {
    const ready = documents.filter((document) => document.fileId);
    if (ready.length === 1) navigate(`/present/${ready[0].id}`);
    else if (ready.length > 1) setChooser({ title, options: ready.map((document) => ({ label: document.title, href: `/present/${document.id}` })) });
    else navigate(fallback);
  }

  return (
    <div className="space-y-6 rise">
      <section className="rounded-[2rem] bg-navy p-6 text-white shadow-card" data-testid="trip-hero">
        <p className="text-3xl font-semibold tracking-tight">{trip.destination} {trip.flag}</p>
        <p className="mt-2 text-gold"><Ltr>{formatRange(trip.startDate, trip.endDate)}</Ltr></p>
        <p className="mt-4 text-lg">{trip.title}</p>
        <p className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold" data-testid="countdown">{phase.label}</p>
      </section>

      <section>
        <SectionTitle>Need it now</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <NeedCard label="Passport" detail={passports.length ? `${passports.length} במכשיר` : "להוספה"} onClick={() => openDocs("דרכון", passports, "/browse/identity?type=passport")} />
          <NeedCard label="Boarding Pass" detail={upcoming ? <Ltr>{`${upcoming.fromCode} → ${upcoming.toCode}`}</Ltr> : "טיסות"} onClick={() => openDocs("כרטיס עלייה", passes, "/flights")} />
          <NeedCard label="Hotel" detail={vault.hotels[0]?.name ?? "מלון"} onClick={() => navigate("/hotel")} />
          <NeedCard label="Insurance" detail={vault.insurances[0]?.company ?? "ביטוח"} onClick={() => navigate("/insurance")} />
          <NeedCard label="Car" detail={vault.cars[0]?.company ?? "רכב"} wide onClick={() => navigate("/car")} />
        </div>
      </section>

      {favorites.length ? (
        <section>
          <SectionTitle action={<Link href="/favorites" className="text-sm font-semibold text-navy">הכל</Link>}>מועדפים</SectionTitle>
          <div className="space-y-2">
            {favorites.map((document) => (
              <Link key={document.id} href={document.fileId ? `/present/${document.id}` : `/documents/${document.id}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-card">
                <span>
                  <span className="block font-semibold">{document.title}</span>
                  <span className="text-sm text-muted">{ownerLabel(vault.travelers, document.travelerId)}</span>
                </span>
                {document.offlineAvailable && document.fileId ? <OfflineBadge /> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle>גישה מהירה</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {quick.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className={`flex min-h-24 flex-col justify-between rounded-3xl bg-white p-4 shadow-card active:scale-[0.98] ${item.label === "הכל" ? "col-span-2" : ""}`}>
                <span className="grid size-10 place-items-center rounded-2xl bg-gold-soft text-navy"><Icon className="size-5" /></span>
                <span className="mt-3 font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <Link href="/checklist" className="block rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">צ׳קליסט לפני הטיסה</h2>
          <span className="text-sm text-muted">{done}/{vault.checklist.length}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-navy" style={{ width: `${vault.checklist.length ? (done / vault.checklist.length) * 100 : 0}%` }} />
        </div>
      </Link>
      {chooser ? <Chooser title={chooser.title} options={chooser.options} onClose={() => setChooser(null)} /> : null}
    </div>
  );
}

function NeedCard({ label, detail, onClick, wide = false }: { label: string; detail: ReactNode; onClick: () => void; wide?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-3xl bg-white p-4 text-start shadow-card active:scale-[0.98] ${wide ? "col-span-2" : ""}`}>
      <span className="block text-base font-semibold">{label}</span>
      <span className="mt-1 block truncate text-sm text-muted">{detail}</span>
    </button>
  );
}

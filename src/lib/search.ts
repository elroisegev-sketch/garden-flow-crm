import { categoryById, typeInfo } from "./categories";
import type {
  Attraction,
  CarRental,
  ChecklistItem,
  ESimPlan,
  Flight,
  Hotel,
  Insurance,
  TravelDocument,
  Traveler,
  TripActivity,
  TripDay,
} from "./types";

export interface SearchInput {
  tripId: string | null;
  documents: TravelDocument[];
  travelers: Traveler[];
  flights: Flight[];
  hotels: Hotel[];
  attractions: Attraction[];
  cars: CarRental[];
  insurances: Insurance[];
  esims: ESimPlan[];
  activities: TripActivity[];
  days: TripDay[];
  checklist: ChecklistItem[];
}

export interface SearchResult {
  id: string;
  kind: "document" | "flight" | "hotel" | "attraction" | "car" | "insurance" | "esim" | "activity" | "checklist";
  title: string;
  subtitle: string;
  href: string;
  score: number;
}

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/['’]/g, "")
    .trim();
}

function travelerName(travelers: Traveler[], id: string | null | undefined): string {
  if (!id) return "שנינו both";
  const traveler = travelers.find((item) => item.id === id);
  return traveler ? `${traveler.name} ${traveler.nameEn}` : "";
}

function score(title: string, query: string): number {
  const normalizedTitle = normalizeSearch(title);
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 3;
  if (normalizedTitle.includes(normalizedQuery)) return 2;
  return 1;
}

function matches(haystack: string, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return false;
  return normalizeSearch(haystack).includes(needle);
}

export function searchVault(input: SearchInput, query: string): SearchResult[] {
  const needle = query.trim();
  if (!needle) return [];
  const tripId = input.tripId;
  const results: SearchResult[] = [];

  for (const document of input.documents) {
    if (tripId && document.tripId !== tripId) continue;
    const category = categoryById(document.category);
    const type = typeInfo(document.category, document.type);
    const haystack = [
      document.title,
      document.notes,
      document.bookingNumber,
      document.category,
      document.type,
      category?.label,
      ...(category?.aliases ?? []),
      type?.label,
      type?.labelEn,
      ...(type?.aliases ?? []),
      travelerName(input.travelers, document.travelerId),
    ]
      .filter(Boolean)
      .join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({
      id: document.id,
      kind: "document",
      title: document.title,
      subtitle: [type?.label, travelerName(input.travelers, document.travelerId).split(" ")[0]].filter(Boolean).join(" · "),
      href: document.fileId ? `/present/${document.id}` : `/documents/${document.id}`,
      score: score(document.title, needle) + 1,
    });
  }

  for (const flight of input.flights) {
    if (tripId && flight.tripId !== tripId) continue;
    const haystack = [flight.airline, flight.flightNumber, flight.fromCode, flight.toCode, flight.fromCity, flight.toCity, flight.confirmationNumber, flight.notes, flight.baggage, "flight", "טיסה", "boarding"].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({
      id: flight.id,
      kind: "flight",
      title: `${flight.fromCode} → ${flight.toCode}`,
      subtitle: `${flight.airline} · ${flight.flightNumber}`,
      href: "/flights",
      score: score(`${flight.fromCode} ${flight.toCode} ${flight.flightNumber}`, needle),
    });
  }

  for (const hotel of input.hotels) {
    if (tripId && hotel.tripId !== tripId) continue;
    const haystack = [hotel.name, hotel.address, hotel.bookingNumber, hotel.room, hotel.notes, "hotel", "מלון"].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({ id: hotel.id, kind: "hotel", title: hotel.name, subtitle: hotel.address, href: "/hotel", score: score(hotel.name, needle) });
  }

  for (const attraction of input.attractions) {
    if (tripId && attraction.tripId !== tripId) continue;
    const haystack = [attraction.name, attraction.address, attraction.notes, "ticket", "אטרקציה"].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({
      id: attraction.id,
      kind: "attraction",
      title: attraction.name,
      subtitle: attraction.address,
      href: `/attractions/${attraction.id}`,
      score: score(attraction.name, needle),
    });
  }

  for (const car of input.cars) {
    if (tripId && car.tripId !== tripId) continue;
    const haystack = [car.company, car.car, car.reservationNumber, car.pickupAddress, car.returnAddress, car.notes, car.paymentNote, "car", "rental", "רכב", "voucher"].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({ id: car.id, kind: "car", title: car.company, subtitle: car.car, href: "/car", score: score(car.company, needle) });
  }

  for (const insurance of input.insurances) {
    if (tripId && insurance.tripId !== tripId) continue;
    const haystack = [insurance.company, insurance.policyNumber, insurance.notes, insurance.passportCardNote, "insurance", "ביטוח", "passportcard"].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({
      id: insurance.id,
      kind: "insurance",
      title: insurance.company,
      subtitle: insurance.policyNumber,
      href: "/insurance",
      score: score(insurance.company, needle),
    });
  }

  for (const esim of input.esims) {
    if (tripId && esim.tripId !== tripId) continue;
    const haystack = [esim.provider, esim.packageName, esim.notes, esim.activationSteps, "esim", "qr", "internet"].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({ id: esim.id, kind: "esim", title: esim.provider, subtitle: esim.packageName, href: "/esim", score: score(esim.provider, needle) });
  }

  for (const activity of input.activities) {
    if (tripId && activity.tripId !== tripId) continue;
    const day = input.days.find((item) => item.id === activity.dayId);
    const haystack = [activity.title, activity.note, activity.address, activity.time].join(" ");
    if (!matches(haystack, needle)) continue;
    results.push({
      id: activity.id,
      kind: "activity",
      title: activity.title,
      subtitle: [activity.time, day?.date].filter(Boolean).join(" · "),
      href: `/trip/${activity.dayId}`,
      score: score(activity.title, needle),
    });
  }

  for (const item of input.checklist) {
    if (tripId && item.tripId !== tripId) continue;
    if (!matches(item.title, needle)) continue;
    results.push({
      id: item.id,
      kind: "checklist",
      title: item.title,
      subtitle: "צ'קליסט",
      href: item.href ?? "/checklist",
      score: score(item.title, needle),
    });
  }

  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "he")).slice(0, 40);
}

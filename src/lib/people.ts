import type { Traveler } from "./types";

export function ownerLabel(travelers: Traveler[], travelerId: string | null): string {
  if (!travelerId) return "שנינו";
  return travelers.find((traveler) => traveler.id === travelerId)?.name ?? "שנינו";
}

export function seatFor(seats: { travelerId: string; seat: string }[], travelers: Traveler[], travelerId: string): string {
  const seat = seats.find((item) => item.travelerId === travelerId)?.seat;
  const name = travelers.find((traveler) => traveler.id === travelerId)?.nameEn ?? "";
  return seat ? `${name} · ${seat}` : name;
}

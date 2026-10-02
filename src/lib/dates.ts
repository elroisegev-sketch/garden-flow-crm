import type { IsoDate } from "./types";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const ENGLISH_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function parseIsoDate(iso: IsoDate): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatIso(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDot(iso: IsoDate): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

export function formatRange(start: IsoDate, end: IsoDate): string {
  return `${formatDot(start)} – ${formatDot(end)}`;
}

export function weekday(iso: IsoDate): { he: string; en: string } {
  const date = parseIsoDate(iso);
  return { he: HEBREW_DAYS[date.getDay()] ?? "", en: ENGLISH_DAYS[date.getDay()] ?? "" };
}

export function eachDate(start: IsoDate, end: IsoDate): IsoDate[] {
  const dates: IsoDate[] = [];
  const cursor = parseIsoDate(start);
  const last = parseIsoDate(end);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime()) || cursor > last) return dates;
  while (cursor <= last) {
    dates.push(formatIso(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export type TripPhase =
  | { kind: "upcoming"; days: number; label: string }
  | { kind: "active"; day: number; total: number; label: string }
  | { kind: "ended"; label: string };

export function tripPhase(start: IsoDate, end: IsoDate, now = new Date()): TripPhase {
  const today = startOfDay(now);
  const tripStart = parseIsoDate(start);
  const tripEnd = parseIsoDate(end);
  const total = daysBetween(tripStart, tripEnd) + 1;
  if (today < tripStart) {
    const days = daysBetween(today, tripStart);
    const label = days === 1 ? "עוד יום לטיסה" : `עוד ${days} ימים לטיסה`;
    return { kind: "upcoming", days, label };
  }
  if (today > tripEnd) return { kind: "ended", label: "הטיול הסתיים" };
  const day = daysBetween(tripStart, today) + 1;
  return { kind: "active", day, total, label: `יום ${day} מתוך ${total}` };
}

export function nowIso(): string {
  return new Date().toISOString();
}

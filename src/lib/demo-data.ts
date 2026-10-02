import { eachDate } from "./dates";
import type {
  Attraction,
  CarRental,
  ChecklistItem,
  DemoFileSpec,
  ESimPlan,
  Flight,
  Hotel,
  Insurance,
  TravelDocument,
  Traveler,
  Trip,
  TripActivity,
  TripDay,
} from "./types";

export const ELROI = "elroi";
export const LIOR = "lior";
export const VIENNA_TRIP = "trip-vienna-2026";
const STAMP = "2026-09-20T08:00:00.000Z";
const DEMO_NOTE = "נתון לדוגמה. ערכו אותו לפי המסמך האמיתי לפני הטיסה.";

export interface ViennaDemo {
  travelers: Traveler[];
  trip: Trip;
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
  fileSpecs: DemoFileSpec[];
}

interface ChecklistTemplate {
  key: string;
  section: string;
  title: string;
}

export const CHECKLIST_TEMPLATE: ChecklistTemplate[] = [
  { key: "pass-elroi", section: "documents", title: "Passport Elroi" },
  { key: "pass-lior", section: "documents", title: "Passport Lior" },
  { key: "id", section: "documents", title: "ID" },
  { key: "dl", section: "documents", title: "Driving License" },
  { key: "idl", section: "documents", title: "International Driving License" },
  { key: "checkin", section: "flight", title: "Check-in completed" },
  { key: "boarding", section: "flight", title: "Boarding passes downloaded" },
  { key: "flight-saved", section: "flight", title: "Flight reservation saved" },
  { key: "hotel-saved", section: "hotel", title: "Reservation downloaded" },
  { key: "hotel-address", section: "hotel", title: "Address saved" },
  { key: "policy", section: "insurance", title: "Insurance policy saved" },
  { key: "pcard", section: "insurance", title: "PassportCard details saved" },
  { key: "emergency-phone", section: "insurance", title: "Emergency phone saved" },
  { key: "esim-bought", section: "internet", title: "eSIM purchased" },
  { key: "esim-installed", section: "internet", title: "eSIM installed" },
  { key: "esim-steps", section: "internet", title: "Activation instructions saved" },
  { key: "transit", section: "transportation", title: "Vienna public transport tickets saved" },
  { key: "airport-transfer", section: "transportation", title: "Airport transportation planned" },
  { key: "car-saved", section: "car", title: "Car reservation saved" },
  { key: "voucher", section: "car", title: "Voucher downloaded" },
  { key: "car-idl", section: "car", title: "International license" },
  { key: "car-dl", section: "car", title: "Driver license" },
  { key: "schon", section: "attractions", title: "Schönbrunn tickets" },
  { key: "tuss", section: "attractions", title: "Madame Tussauds tickets" },
  { key: "wheel", section: "attractions", title: "Giant Ferris Wheel tickets" },
  { key: "other", section: "attractions", title: "Other reservations" },
];

export function buildChecklist(tripId: string, links: Record<string, string> = {}): ChecklistItem[] {
  return CHECKLIST_TEMPLATE.map((item, index) => ({
    id: `${tripId}-check-${item.key}`,
    tripId,
    section: item.section,
    title: item.title,
    done: false,
    sortOrder: index,
    href: links[item.key] ?? null,
  }));
}

export function buildEmptyDays(tripId: string, start: string, end: string): TripDay[] {
  return eachDate(start, end).map((date) => ({
    id: `${tripId}-day-${date}`,
    tripId,
    date,
    title: "",
    notes: "",
  }));
}

function traveler(id: string, name: string, nameEn: string, emoji: string): Traveler {
  return { id, name, nameEn, emoji, createdAt: STAMP };
}

function document(input: Omit<TravelDocument, "createdAt" | "updatedAt" | "thumbnailId"> & { thumbnailId?: string | null }): TravelDocument {
  return { thumbnailId: null, createdAt: STAMP, updatedAt: STAMP, ...input };
}

function file(spec: Omit<DemoFileSpec, "fileId"> & { id: string }): DemoFileSpec {
  return { fileId: `file-${spec.id}`, ...spec };
}

export function buildViennaDemo(): ViennaDemo {
  const travelers = [traveler(ELROI, "אלרואי", "Elroi", "👨"), traveler(LIOR, "ליאור", "Lior", "👩")];
  const trip: Trip = {
    id: VIENNA_TRIP,
    title: "הטיול של אלרואי וליאור",
    destination: "Vienna",
    country: "Austria",
    flag: "🇦🇹",
    startDate: "2026-10-04",
    endDate: "2026-10-08",
    travelerIds: [ELROI, LIOR],
    notes: "נתוני דמו שאפשר לערוך. החליפו כרטיסים, מלונות ומספרים בפרטים האמיתיים.",
    createdAt: STAMP,
    updatedAt: STAMP,
  };

  const specs = [
    file({ id: "pass-elroi", mime: "image/png", template: "passport", title: "Passport", kicker: "DEMO DOCUMENT", accent: "#14283a", lines: ["Elroi", "Expiry 18.06.2032", "Not a government document"] }),
    file({ id: "pass-lior", mime: "image/png", template: "passport", title: "Passport", kicker: "DEMO DOCUMENT", accent: "#14283a", lines: ["Lior", "Expiry 03.11.2031", "Not a government document"] }),
    file({ id: "id-elroi", mime: "image/png", template: "card", title: "National ID", kicker: "DEMO", accent: "#1d3e58", lines: ["Elroi", "Identity card"] }),
    file({ id: "id-lior", mime: "image/png", template: "card", title: "National ID", kicker: "DEMO", accent: "#1d3e58", lines: ["Lior", "Identity card"] }),
    file({ id: "dl-elroi", mime: "image/png", template: "card", title: "Driving License", kicker: "DEMO", accent: "#3f4d3a", lines: ["Elroi", "Replace with a photo of the real license"] }),
    file({ id: "dl-lior", mime: "image/png", template: "card", title: "Driving License", kicker: "DEMO", accent: "#3f4d3a", lines: ["Lior", "Replace with a photo of the real license"] }),
    file({ id: "idl-elroi", mime: "image/png", template: "card", title: "International License", kicker: "DEMO", accent: "#5c3b2e", lines: ["Elroi", "International driving permit"] }),
    file({ id: "idl-lior", mime: "image/png", template: "card", title: "International License", kicker: "DEMO", accent: "#5c3b2e", lines: ["Lior", "International driving permit"] }),
    file({ id: "flight-out", mime: "application/pdf", template: "pdf", title: "EL AL booking ZJERV7", kicker: "CURRENT", accent: "#14283a", lines: ["LY361 TLV to VIE", "04.10.2026  06:40-09:20", "Elroi 46K   Lior 46J", "LY364 VIE to TLV", "08.10.2026  21:35", "Lands 09.10.2026  02:00", "Elroi 39K   Lior 39J", "Terminal 3, 1PC, Economy Classic"] }),
    file({ id: "bp-elroi-out", mime: "image/png", template: "boarding", title: "Boarding Pass", kicker: "EL AL", accent: "#102033", lines: ["ELROI", "TLV → VIE", "04.10.2026", "LY 361", "06:40", "Seat 46K", "T3 · Board 06:00"] }),
    file({ id: "bp-lior-out", mime: "image/png", template: "boarding", title: "Boarding Pass", kicker: "EL AL", accent: "#102033", lines: ["LIOR", "TLV → VIE", "04.10.2026", "LY 361", "06:40", "Seat 46J", "T3 · Board 06:00"] }),
    file({ id: "flight-archive", mime: "application/pdf", template: "pdf", title: "Old return is not valid", kicker: "ARCHIVE", accent: "#746d64", lines: ["Do not use this itinerary", "An earlier ticket returned on 11.10.2026", "That flight was LY362 at 10:35", "The current return is LY364", "08.10.2026 at 21:35"] }),
    file({ id: "hotel", mime: "application/pdf", template: "pdf", title: "Hotel reservation", kicker: "DEMO", accent: "#14283a", lines: ["Hotel Vienna (demo)", "Kärntner Ring 16, 1010 Wien", "Check-in 04.10.2026 15:00", "Check-out 08.10.2026 11:00", "Booking DEMO-HT-2002"] }),
    file({ id: "insurance", mime: "application/pdf", template: "pdf", title: "Travel insurance", kicker: "DEMO", accent: "#14283a", lines: ["PassportCard", "Policy DEMO-PC-1001", "Elroi and Lior", "04.10.2026 - 08.10.2026", "Add the real emergency phone"] }),
    file({ id: "pcard", mime: "image/png", template: "card", title: "PassportCard", kicker: "DEMO", accent: "#7a1f33", lines: ["Policy DEMO-PC-1001", "Elroi + Lior", "Replace with the real card photo"] }),
    file({ id: "schon", mime: "image/png", template: "ticket", title: "Schönbrunn Palace", kicker: "2 TICKETS", accent: "#6d5a2c", lines: ["07.10.2026", "09:30", "Schönbrunner Schlossstrasse 47"] }),
    file({ id: "tuss", mime: "image/png", template: "ticket", title: "Madame Tussauds", kicker: "2 TICKETS", accent: "#6b2d4a", lines: ["05.10.2026", "10:30", "Riesenradplatz, 1020 Wien"] }),
    file({ id: "wheel", mime: "image/png", template: "ticket", title: "Giant Ferris Wheel", kicker: "2 TICKETS", accent: "#1f4d45", lines: ["05.10.2026", "12:30", "Riesenradplatz 1, 1020 Wien"] }),
    file({ id: "walk", mime: "image/png", template: "ticket", title: "Free Walking Tour", kicker: "MEETUP", accent: "#24344a", lines: ["05.10.2026", "16:00", "Stephansplatz, 1010 Wien"] }),
    file({ id: "car", mime: "application/pdf", template: "pdf", title: "Car rental voucher", kicker: "DEMO", accent: "#14283a", lines: ["Rental company (demo)", "Pickup 06.10.2026 08:00", "Return 06.10.2026 19:30", "Reservation DEMO-CAR-3003", "Do not store a full card number"] }),
    file({ id: "esim", mime: "image/png", template: "esim", title: "eSIM QR", kicker: "NOT A REAL ESIM", accent: "#14283a", lines: ["Airalo demo", "Austria 5GB", "Scan only the real QR from your provider"] }),
    file({ id: "transit", mime: "image/png", template: "ticket", title: "Vienna Transit", kicker: "TICKET", accent: "#9a3412", lines: ["Public transport", "04.10.2026 - 08.10.2026", "Replace with the real ticket"] }),
    file({ id: "tax", mime: "image/png", template: "card", title: "Tax Free", kicker: "DEMO", accent: "#3f3f46", lines: ["Sample receipt", "Replace with real Tax Free forms"] }),
    file({ id: "embassy", mime: "image/png", template: "card", title: "Israeli Embassy", kicker: "VIENNA", accent: "#14283a", lines: ["Anton-Frank-Gasse 20", "1180 Wien", "+43 1 47646587", "Consular phone, not 24h"] }),
  ];

  const specById = Object.fromEntries(specs.map((spec) => [spec.fileId.replace(/^file-/, ""), spec]));
  const linked = (id: string) => {
    const spec = specById[id];
    return { fileId: spec.fileId, fileType: spec.mime };
  };

  const documents: TravelDocument[] = [
    document({ id: "doc-pass-elroi", tripId: trip.id, title: "Passport – Elroi", type: "passport", category: "identity", travelerId: ELROI, ...linked("pass-elroi"), date: null, expiryDate: "2032-06-18", bookingNumber: null, notes: DEMO_NOTE, favorite: true, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-pass-lior", tripId: trip.id, title: "Passport – Lior", type: "passport", category: "identity", travelerId: LIOR, ...linked("pass-lior"), date: null, expiryDate: "2031-11-03", bookingNumber: null, notes: DEMO_NOTE, favorite: true, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-id-elroi", tripId: trip.id, title: "ID – Elroi", type: "id", category: "identity", travelerId: ELROI, ...linked("id-elroi"), date: null, expiryDate: null, bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-id-lior", tripId: trip.id, title: "ID – Lior", type: "id", category: "identity", travelerId: LIOR, ...linked("id-lior"), date: null, expiryDate: null, bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-dl-elroi", tripId: trip.id, title: "Driving License – Elroi", type: "driving-license", category: "identity", travelerId: ELROI, ...linked("dl-elroi"), date: null, expiryDate: null, bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-dl-lior", tripId: trip.id, title: "Driving License – Lior", type: "driving-license", category: "identity", travelerId: LIOR, ...linked("dl-lior"), date: null, expiryDate: null, bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-idl-elroi", tripId: trip.id, title: "International Driving License – Elroi", type: "international-license", category: "identity", travelerId: ELROI, ...linked("idl-elroi"), date: null, expiryDate: null, bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-idl-lior", tripId: trip.id, title: "International Driving License – Lior", type: "international-license", category: "identity", travelerId: LIOR, ...linked("idl-lior"), date: null, expiryDate: null, bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-flight-out", tripId: trip.id, title: "אישור הזמנה ZJERV7", type: "flight-reservation", category: "flights", travelerId: null, ...linked("flight-out"), date: "2026-10-04", expiryDate: null, bookingNumber: "ZJERV7", notes: "המסלול בתוקף מאישורי אל על.\nהלוך LY361 ב-04.10 בשעה 06:40, נחיתה 09:20. אלרואי 46K, ליאור 46J. כרטיסים 1142495313185 ו-1142495313186.\nחזור LY364 ב-08.10 בשעה 21:35, נחיתה ב-09.10 בשעה 02:00. אלרואי 39K, ליאור 39J.\nטרמינל 3, Economy Classic, מזוודה אחת לכל נוסע.\nזה סיכום לקריאה. הברקוד לשער נשאר בקובץ המקורי וב-Apple Wallet.", favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-bp-elroi-out", tripId: trip.id, title: "Boarding Pass – Elroi", type: "boarding-pass", category: "flights", travelerId: ELROI, ...linked("bp-elroi-out"), date: "2026-10-04", expiryDate: null, bookingNumber: "ZJERV7", notes: "LY361 · מושב 46K · עלייה 06:00 · Zone 5 · טרמינל 3.\nשער עדיין לא נקבע.\nהתצוגה כאן אינה ברקוד לשער. בשדה פותחים את ה-Wallet Pass המקורי.", favorite: true, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-bp-lior-out", tripId: trip.id, title: "Boarding Pass – Lior", type: "boarding-pass", category: "flights", travelerId: LIOR, ...linked("bp-lior-out"), date: "2026-10-04", expiryDate: null, bookingNumber: "ZJERV7", notes: "LY361 · מושב 46J · עלייה 06:00 · Zone 5 · טרמינל 3.\nשער עדיין לא נקבע.\nהתצוגה כאן אינה ברקוד לשער. בשדה פותחים את ה-Wallet Pass המקורי.", favorite: true, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-flight-archive", tripId: trip.id, title: "ארכיון — חזרה 11.10 אינה בתוקף", type: "flight-reservation", category: "flights", travelerId: null, ...linked("flight-archive"), date: "2026-10-11", expiryDate: null, bookingNumber: "ZJERV7", notes: "באישור מוקדם החזרה הייתה LY362 ב-11.10 בשעה 10:35. זה לא המסלול הנוכחי. החזרה בתוקף היא LY364 ב-08.10 בשעה 21:35.", favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-hotel", tripId: trip.id, title: "Hotel Reservation", type: "hotel-reservation", category: "accommodation", travelerId: null, ...linked("hotel"), date: "2026-10-04", expiryDate: null, bookingNumber: "DEMO-HT-2002", notes: DEMO_NOTE, favorite: true, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-insurance", tripId: trip.id, title: "Travel Insurance", type: "travel-insurance", category: "insurance", travelerId: null, ...linked("insurance"), date: "2026-10-04", expiryDate: "2026-10-08", bookingNumber: "DEMO-PC-1001", notes: DEMO_NOTE, favorite: true, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-pcard", tripId: trip.id, title: "PassportCard", type: "passportcard", category: "insurance", travelerId: null, ...linked("pcard"), date: null, expiryDate: null, bookingNumber: "DEMO-PC-1001", notes: "הוסיפו צילום של הכרטיס האמיתי. אין לשמור מספר אשראי.", favorite: false, offlineAvailable: true, sensitive: true }),
    document({ id: "doc-schon", tripId: trip.id, title: "Schönbrunn Palace", type: "schonbrunn", category: "attractions", travelerId: null, ...linked("schon"), date: "2026-10-07", expiryDate: null, bookingNumber: "DEMO-AT-4001", notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-tuss", tripId: trip.id, title: "Madame Tussauds", type: "tussauds", category: "attractions", travelerId: null, ...linked("tuss"), date: "2026-10-05", expiryDate: null, bookingNumber: "DEMO-AT-4002", notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-wheel", tripId: trip.id, title: "Vienna Giant Ferris Wheel", type: "ferris", category: "attractions", travelerId: null, ...linked("wheel"), date: "2026-10-05", expiryDate: null, bookingNumber: "DEMO-AT-4003", notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-walk", tripId: trip.id, title: "Free Walking Tour", type: "walking-tour", category: "attractions", travelerId: null, ...linked("walk"), date: "2026-10-05", expiryDate: null, bookingNumber: null, notes: "נקודת מפגש לדוגמה. עדכנו לפי ההזמנה.", favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-car", tripId: trip.id, title: "Car Voucher", type: "voucher", category: "car", travelerId: null, ...linked("car"), date: "2026-10-06", expiryDate: null, bookingNumber: "DEMO-CAR-3003", notes: "ואוצ'ר לדוגמה. אין לשמור מספר אשראי מלא או CVV.", favorite: true, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-esim", tripId: trip.id, title: "eSIM QR", type: "qr", category: "internet", travelerId: null, ...linked("esim"), date: null, expiryDate: null, bookingNumber: null, notes: "קוד QR לדוגמה. הוא לא מפעיל חבילה אמיתית.", favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-transit", tripId: trip.id, title: "Vienna Public Transport", type: "public-transport", category: "transportation", travelerId: null, ...linked("transit"), date: "2026-10-04", expiryDate: "2026-10-08", bookingNumber: null, notes: DEMO_NOTE, favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-tax", tripId: trip.id, title: "Tax Free sample", type: "tax-free", category: "shopping", travelerId: null, ...linked("tax"), date: null, expiryDate: null, bookingNumber: null, notes: "מקום שמור לקבלות ולטפסי Tax Free.", favorite: false, offlineAvailable: true, sensitive: false }),
    document({ id: "doc-embassy", tripId: trip.id, title: "Israeli Embassy Vienna", type: "embassy", category: "emergency", travelerId: null, ...linked("embassy"), date: null, expiryDate: null, bookingNumber: null, notes: "שגרירות ישראל בווינה\nAnton-Frank-Gasse 20, 1180 Wien\nטלפון קונסולרי: +43 1 47646587\nשעות מענה טלפוני: 12:30–14:30\nביקורים: א׳–ה׳ 09:00–12:00\nconsular@vienna.mfa.gov.il\nזה לא קו חירום 24 שעות. בחירום חייגו 112.", favorite: false, offlineAvailable: true, sensitive: false }),
  ];

  const flights: Flight[] = [
    {
      id: "flight-out",
      tripId: trip.id,
      direction: "outbound",
      fromCode: "TLV",
      toCode: "VIE",
      fromCity: "תל אביב",
      toCity: "וינה",
      date: "2026-10-04",
      airline: "El Al",
      flightNumber: "LY 361",
      departureTime: "06:40",
      arrivalTime: "09:20",
      arrivalDate: "2026-10-04",
      departureTerminal: "3",
      arrivalTerminal: "3",
      baggage: "מזוודה אחת (1PC) לכל נוסע",
      confirmationNumber: "ZJERV7",
      seats: [
        { travelerId: ELROI, seat: "46K" },
        { travelerId: LIOR, seat: "46J" },
      ],
      boardingPassDocumentIds: ["doc-bp-elroi-out", "doc-bp-lior-out"],
      reservationDocumentId: "doc-flight-out",
      notes: "Economy Classic. עלייה למטוס 06:00, Zone 5. השער עדיין לא נקבע. כרטיסי העלייה להלוך הונפקו.",
    },
    {
      id: "flight-return",
      tripId: trip.id,
      direction: "return",
      fromCode: "VIE",
      toCode: "TLV",
      fromCity: "וינה",
      toCity: "תל אביב",
      date: "2026-10-08",
      airline: "El Al",
      flightNumber: "LY 364",
      departureTime: "21:35",
      arrivalTime: "02:00",
      arrivalDate: "2026-10-09",
      departureTerminal: "3",
      arrivalTerminal: "3",
      baggage: "מזוודה אחת (1PC) לכל נוסע",
      confirmationNumber: "ZJERV7",
      seats: [
        { travelerId: ELROI, seat: "39K" },
        { travelerId: LIOR, seat: "39J" },
      ],
      boardingPassDocumentIds: [],
      reservationDocumentId: "doc-flight-out",
      notes: "הנחיתה היא למחרת, 09.10 בשעה 02:00. המושבים מאישור ההזמנה. כרטיס עלייה לחזור עדיין לא הונפק.",
    },
  ];

  const hotels: Hotel[] = [
    {
      id: "hotel-vienna",
      tripId: trip.id,
      name: "Hotel Vienna (דמו)",
      address: "Kärntner Ring 16, 1010 Wien",
      checkInDate: "2026-10-04",
      checkOutDate: "2026-10-08",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      bookingNumber: "DEMO-HT-2002",
      room: "חדר זוגי לדוגמה",
      phone: "",
      documentId: "doc-hotel",
      notes: "החליפו בשם המלון, בטלפון ובמספר ההזמנה האמיתיים. הכתובת היא נקודה לדוגמה במרכז וינה.",
    },
  ];

  const attractions: Attraction[] = [
    { id: "attr-schon", tripId: trip.id, name: "Schönbrunn Palace", date: "2026-10-07", time: "09:30", address: "Schönbrunner Schloßstraße 47, 1130 Wien", ticketCount: 2, documentId: "doc-schon", notes: DEMO_NOTE },
    { id: "attr-tuss", tripId: trip.id, name: "Madame Tussauds", date: "2026-10-05", time: "10:30", address: "Riesenradplatz, 1020 Wien", ticketCount: 2, documentId: "doc-tuss", notes: DEMO_NOTE },
    { id: "attr-wheel", tripId: trip.id, name: "Vienna Giant Ferris Wheel", date: "2026-10-05", time: "12:30", address: "Riesenradplatz 1, 1020 Wien", ticketCount: 2, documentId: "doc-wheel", notes: DEMO_NOTE },
    { id: "attr-walk", tripId: trip.id, name: "Free Walking Tour", date: "2026-10-05", time: "16:00", address: "Stephansplatz, 1010 Wien", ticketCount: 2, documentId: "doc-walk", notes: "נקודת מפגש לדוגמה." },
  ];

  const cars: CarRental[] = [
    {
      id: "car-vienna",
      tripId: trip.id,
      company: "השכרת רכב (דמו)",
      pickupDate: "2026-10-06",
      pickupTime: "08:00",
      pickupAddress: "Kärntner Ring 16, 1010 Wien",
      returnDate: "2026-10-06",
      returnTime: "19:30",
      returnAddress: "Kärntner Ring 16, 1010 Wien",
      car: "רכב בינוני לדוגמה",
      reservationNumber: "DEMO-CAR-3003",
      paymentNote: "פיקדון משלמים בדלפק. אין לשמור כאן מספר אשראי מלא או CVV.",
      voucherDocumentId: "doc-car",
      licenseDocumentIds: ["doc-dl-elroi", "doc-dl-lior", "doc-idl-elroi", "doc-idl-lior"],
      notes: "איסוף לדוגמה ביום של Lunzer See. עדכנו חברה, כתובת ושעות.",
    },
  ];

  const insurances: Insurance[] = [
    {
      id: "ins-vienna",
      tripId: trip.id,
      company: "PassportCard",
      policyNumber: "DEMO-PC-1001",
      travelerIds: [ELROI, LIOR],
      coverageStart: "2026-10-04",
      coverageEnd: "2026-10-08",
      emergencyPhone: "",
      passportCardNote: "הוסיפו את מספר הפוליסה האמיתי ואת הטלפון שמודפס על הכרטיס.",
      documentId: "doc-insurance",
      passportCardDocumentId: "doc-pcard",
      notes: DEMO_NOTE,
    },
  ];

  const esims: ESimPlan[] = [
    {
      id: "esim-vienna",
      tripId: trip.id,
      provider: "Airalo (דמו)",
      packageName: "Austria 5GB / 7 days",
      phoneNumber: "",
      activationSteps: "1. התקינו את ה-eSIM מה-QR של הספק עוד בארץ, כשיש Wi-Fi.\n2. השאירו את הקו כבוי עד הנחיתה.\n3. בנחיתה הפעילו את חבילת הנתונים וכבו גלישה בקו הישראלי.\n4. ה-QR שבאפליקציה הוא דמו ולא מפעיל חבילה.",
      documentId: "doc-esim",
      notes: DEMO_NOTE,
    },
  ];

  const days = buildEmptyDays(trip.id, trip.startDate, trip.endDate);
  const day = (iso: string) => `${trip.id}-day-${iso}`;
  const activity = (id: string, date: string, sortOrder: number, time: string, title: string, extra: Partial<TripActivity> = {}): TripActivity => ({
    id,
    tripId: trip.id,
    dayId: day(date),
    time,
    title,
    note: "",
    address: "",
    documentId: null,
    sortOrder,
    ...extra,
  });

  const activities: TripActivity[] = [
    activity("act-dep", "2026-10-04", 0, "06:40", "טיסה TLV → VIE", { note: "El Al · LY 361 · עלייה 06:00", documentId: "doc-bp-elroi-out" }),
    activity("act-land", "2026-10-04", 1, "09:20", "נחיתה בווינה", { address: "Vienna Airport, 1300 Schwechat" }),
    activity("act-checkin", "2026-10-04", 2, "15:00", "צ'ק-אין למלון", { address: "Kärntner Ring 16, 1010 Wien", documentId: "doc-hotel" }),
    activity("act-walk-night", "2026-10-04", 3, "18:30", "הליכה במרכז העיר", { address: "Stephansplatz, 1010 Wien" }),
    activity("act-breakfast-mon", "2026-10-05", 0, "09:00", "ארוחת בוקר"),
    activity("act-tuss", "2026-10-05", 1, "10:30", "Madame Tussauds", { address: "Riesenradplatz, 1020 Wien", documentId: "doc-tuss" }),
    activity("act-wheel", "2026-10-05", 2, "12:30", "Giant Ferris Wheel", { address: "Riesenradplatz 1, 1020 Wien", documentId: "doc-wheel" }),
    activity("act-tour", "2026-10-05", 3, "16:00", "Free Walking Tour", { address: "Stephansplatz, 1010 Wien", documentId: "doc-walk" }),
    activity("act-tue-breakfast", "2026-10-06", 0, "07:00", "Breakfast"),
    activity("act-tue-leave", "2026-10-06", 1, "08:15", "Pick up / leave Vienna", { note: "איסוף הרכב ויציאה ליום האגם", documentId: "doc-car", address: "Kärntner Ring 16, 1010 Wien" }),
    activity("act-lunz", "2026-10-06", 2, "10:00", "Lunzer See", { address: "Lunzer See, Lunz am See, Austria" }),
    activity("act-walk", "2026-10-06", 3, "", "Walk", { note: "הליכה סביב האגם" }),
    activity("act-picnic", "2026-10-06", 4, "", "Picnic"),
    activity("act-coffee", "2026-10-06", 5, "", "Coffee"),
    activity("act-return", "2026-10-06", 6, "", "Return Vienna", { address: "Kärntner Ring 16, 1010 Wien" }),
    activity("act-schon", "2026-10-07", 0, "09:30", "Schönbrunn Palace", { address: "Schönbrunner Schloßstraße 47, 1130 Wien", documentId: "doc-schon" }),
    activity("act-gardens", "2026-10-07", 1, "13:00", "גני הארמון"),
    activity("act-shop", "2026-10-07", 2, "16:00", "קניות / Tax Free", { documentId: "doc-tax" }),
    activity("act-dinner", "2026-10-07", 3, "19:00", "ארוחת ערב"),
    activity("act-checkout", "2026-10-08", 0, "11:00", "צ'ק-אאוט מהמלון", { documentId: "doc-hotel", address: "Kärntner Ring 16, 1010 Wien" }),
    activity("act-return-flight", "2026-10-08", 1, "21:35", "טיסה VIE → TLV", { note: "El Al · LY 364 · נחיתה 09.10 ב-02:00", documentId: "doc-flight-out", address: "Vienna Airport, 1300 Schwechat" }),
  ];

  const checklist = buildChecklist(trip.id, {
    "pass-elroi": "/present/doc-pass-elroi",
    "pass-lior": "/present/doc-pass-lior",
    id: "/browse/identity?type=id",
    dl: "/browse/identity?type=driving-license",
    idl: "/browse/identity?type=international-license",
    checkin: "/flights",
    boarding: "/flights",
    "flight-saved": "/present/doc-flight-out",
    "hotel-saved": "/present/doc-hotel",
    "hotel-address": "/hotel",
    policy: "/present/doc-insurance",
    pcard: "/present/doc-pcard",
    "emergency-phone": "/insurance",
    "esim-bought": "/esim",
    "esim-installed": "/esim",
    "esim-steps": "/esim",
    transit: "/present/doc-transit",
    "airport-transfer": "/browse/transportation",
    "car-saved": "/car",
    voucher: "/present/doc-car",
    "car-idl": "/present/doc-idl-elroi",
    "car-dl": "/present/doc-dl-elroi",
    schon: "/present/doc-schon",
    tuss: "/present/doc-tuss",
    wheel: "/present/doc-wheel",
    other: "/attractions",
  });

  return { travelers, trip, documents, flights, hotels, attractions, cars, insurances, esims, days, activities, checklist, fileSpecs: specs };
}

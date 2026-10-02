export interface DocType {
  id: string;
  label: string;
  labelEn: string;
  aliases: string[];
}

export interface DocCategory {
  id: string;
  label: string;
  aliases: string[];
  types: DocType[];
}

export const CATEGORIES: DocCategory[] = [
  {
    id: "identity",
    label: "מסמכי זהות",
    aliases: ["identity", "זהות", "מסמכים"],
    types: [
      { id: "passport", label: "דרכון", labelEn: "Passport", aliases: ["passport", "passports", "דרכון", "דרכונים"] },
      { id: "id", label: "תעודת זהות", labelEn: "ID", aliases: ["id", "תעודה", "תז"] },
      { id: "driving-license", label: "רישיון נהיגה", labelEn: "Driving License", aliases: ["license", "רישיון", "נהיגה", "driver"] },
      {
        id: "international-license",
        label: "רישיון נהיגה בינלאומי",
        labelEn: "International Driving License",
        aliases: ["international", "בינלאומי", "idl"],
      },
    ],
  },
  {
    id: "flights",
    label: "טיסות",
    aliases: ["flight", "flights", "טיסה", "boarding"],
    types: [
      { id: "flight-reservation", label: "אישור הזמנת טיסה", labelEn: "Flight Reservation", aliases: ["reservation", "הזמנה"] },
      { id: "boarding-pass", label: "כרטיס עלייה למטוס", labelEn: "Boarding Pass", aliases: ["boarding", "pass", "כרטיס עלייה"] },
      { id: "baggage", label: "מידע על כבודה", labelEn: "Baggage", aliases: ["baggage", "כבודה", "מזוודה"] },
      { id: "airport", label: "מידע על שדה התעופה", labelEn: "Airport", aliases: ["airport", "שדה", "terminal"] },
    ],
  },
  {
    id: "accommodation",
    label: "לינה",
    aliases: ["hotel", "מלון", "accommodation"],
    types: [
      { id: "hotel-reservation", label: "הזמנת מלון", labelEn: "Hotel Reservation", aliases: ["hotel", "מלון", "booking"] },
      { id: "hotel-address", label: "כתובת המלון", labelEn: "Hotel Address", aliases: ["address", "כתובת"] },
      { id: "booking-confirmation", label: "אישור הזמנה", labelEn: "Booking Confirmation", aliases: ["confirmation", "אישור"] },
    ],
  },
  {
    id: "insurance",
    label: "ביטוח",
    aliases: ["insurance", "ביטוח", "passportcard"],
    types: [
      { id: "travel-insurance", label: "ביטוח נסיעות", labelEn: "Travel Insurance", aliases: ["insurance", "ביטוח", "policy"] },
      { id: "passportcard", label: "PassportCard", labelEn: "PassportCard", aliases: ["passportcard", "פוליסה"] },
      { id: "policy-number", label: "מספר פוליסה", labelEn: "Policy Number", aliases: ["policy", "פוליסה"] },
      { id: "emergency-numbers", label: "מספרי חירום", labelEn: "Emergency Numbers", aliases: ["emergency", "חירום"] },
    ],
  },
  {
    id: "transportation",
    label: "תחבורה",
    aliases: ["transport", "תחבורה", "train", "ticket"],
    types: [
      { id: "public-transport", label: "כרטיס תחבורה ציבורית", labelEn: "Public Transport", aliases: ["transport", "רכבת", "אוטובוס", "vienna"] },
      { id: "airport-transfer", label: "העברה משדה התעופה", labelEn: "Airport Transfer", aliases: ["transfer", "העברה"] },
      { id: "train", label: "כרטיס רכבת", labelEn: "Train Ticket", aliases: ["train", "רכבת"] },
      { id: "transit-pass", label: "כרטיס נסיעה", labelEn: "Transit Pass", aliases: ["pass", "כרטיסיה"] },
    ],
  },
  {
    id: "car",
    label: "רכב",
    aliases: ["car", "rental", "רכב", "השכרה"],
    types: [
      { id: "car-reservation", label: "הזמנת רכב", labelEn: "Reservation", aliases: ["car", "rental", "רכב"] },
      { id: "voucher", label: "ואוצ'ר", labelEn: "Voucher", aliases: ["voucher", "שובר"] },
      { id: "rental-company", label: "חברת השכרה", labelEn: "Rental Company", aliases: ["sixt", "company"] },
      { id: "pickup-address", label: "כתובת איסוף", labelEn: "Pickup Address", aliases: ["pickup", "איסוף"] },
      { id: "return-address", label: "כתובת החזרה", labelEn: "Return Address", aliases: ["return", "החזרה"] },
    ],
  },
  {
    id: "attractions",
    label: "אטרקציות",
    aliases: ["attraction", "ticket", "אטרקציה", "כרטיס"],
    types: [
      { id: "schonbrunn", label: "Schönbrunn", labelEn: "Schönbrunn", aliases: ["schonbrunn", "schoenbrunn", "שנברון"] },
      { id: "tussauds", label: "Madame Tussauds", labelEn: "Madame Tussauds", aliases: ["tussauds", "מאדאם"] },
      { id: "ferris", label: "Vienna Giant Ferris Wheel", labelEn: "Ferris Wheel", aliases: ["ferris", "wheel", "ריזנראד", "גלגל"] },
      { id: "walking-tour", label: "Walking Tour", labelEn: "Walking Tour", aliases: ["walking", "tour", "סיור"] },
      { id: "other-attraction", label: "אטרקציה אחרת", labelEn: "Other", aliases: ["other", "אחר"] },
    ],
  },
  {
    id: "internet",
    label: "אינטרנט",
    aliases: ["internet", "esim", "sim"],
    types: [
      { id: "esim", label: "eSIM", labelEn: "eSIM", aliases: ["esim", "sim"] },
      { id: "qr", label: "קוד QR", labelEn: "QR Code", aliases: ["qr", "קוד"] },
      { id: "provider", label: "ספק", labelEn: "Provider", aliases: ["provider", "airalo", "ספק"] },
      { id: "package", label: "חבילה", labelEn: "Package", aliases: ["package", "חבילה", "gb"] },
      { id: "activation", label: "הוראות הפעלה", labelEn: "Activation", aliases: ["activation", "הפעלה"] },
    ],
  },
  {
    id: "shopping",
    label: "קניות / Tax Free",
    aliases: ["tax", "receipt", "קניות", "קבלה"],
    types: [
      { id: "receipt", label: "קבלה", labelEn: "Receipt", aliases: ["receipt", "קבלה"] },
      { id: "tax-free", label: "טופס Tax Free", labelEn: "Tax Free", aliases: ["tax", "taxfree", "פטור"] },
      { id: "purchase", label: "מסמך רכישה", labelEn: "Purchase", aliases: ["purchase", "רכישה"] },
    ],
  },
  {
    id: "trip",
    label: "הטיול",
    aliases: ["trip", "itinerary", "מסלול", "מפה"],
    types: [
      { id: "itinerary", label: "מסלול יומי", labelEn: "Itinerary", aliases: ["itinerary", "מסלול"] },
      { id: "map", label: "מפה", labelEn: "Map", aliases: ["map", "מפה"] },
      { id: "address", label: "כתובת", labelEn: "Address", aliases: ["address", "כתובת"] },
      { id: "screenshot", label: "צילום מסך", labelEn: "Screenshot", aliases: ["screenshot", "צילום"] },
      { id: "note", label: "הערה", labelEn: "Note", aliases: ["note", "הערה"] },
    ],
  },
  {
    id: "emergency",
    label: "חירום",
    aliases: ["emergency", "חירום", "embassy", "שגרירות"],
    types: [
      { id: "insurance-phone", label: "טלפון ביטוח", labelEn: "Insurance Phone", aliases: ["phone", "טלפון"] },
      { id: "embassy", label: "שגרירות ישראל", labelEn: "Israeli Embassy", aliases: ["embassy", "שגרירות", "israel"] },
      { id: "police", label: "משטרה", labelEn: "Police", aliases: ["police", "משטרה", "133"] },
      { id: "medical", label: "רפואה", labelEn: "Medical", aliases: ["medical", "אמבולנס", "144", "רופא"] },
      { id: "contact", label: "איש קשר", labelEn: "Contact", aliases: ["contact", "קשר"] },
    ],
  },
];

export const CHECKLIST_SECTIONS = [
  { id: "documents", label: "מסמכים" },
  { id: "flight", label: "טיסה" },
  { id: "hotel", label: "מלון" },
  { id: "insurance", label: "ביטוח" },
  { id: "internet", label: "אינטרנט" },
  { id: "transportation", label: "תחבורה" },
  { id: "car", label: "רכב" },
  { id: "attractions", label: "אטרקציות" },
] as const;

export function categoryById(id: string): DocCategory | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

export function typeInfo(categoryId: string, typeId: string): DocType | undefined {
  return categoryById(categoryId)?.types.find((type) => type.id === typeId);
}

export function typeLabel(categoryId: string, typeId: string): string {
  return typeInfo(categoryId, typeId)?.label ?? typeId;
}

export function sectionLabel(sectionId: string): string {
  return CHECKLIST_SECTIONS.find((section) => section.id === sectionId)?.label ?? sectionId;
}

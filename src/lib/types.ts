export type IsoDate = string;

export interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  flag: string;
  startDate: IsoDate;
  endDate: IsoDate;
  travelerIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Traveler {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  createdAt: string;
}

export interface VaultFile {
  id: string;
  mime: string;
  encrypted: boolean;
  ivB64: string | null;
  bytes: ArrayBuffer;
  createdAt: string;
}

export interface TravelDocument {
  id: string;
  tripId: string;
  title: string;
  type: string;
  category: string;
  travelerId: string | null;
  fileId: string | null;
  fileType: string | null;
  thumbnailId: string | null;
  date: IsoDate | null;
  expiryDate: IsoDate | null;
  bookingNumber: string | null;
  notes: string;
  favorite: boolean;
  offlineAvailable: boolean;
  sensitive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlightSeat {
  travelerId: string;
  seat: string;
}

export interface Flight {
  id: string;
  tripId: string;
  direction: "outbound" | "return";
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  date: IsoDate;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureTerminal: string;
  arrivalTerminal: string;
  baggage: string;
  confirmationNumber: string;
  seats: FlightSeat[];
  boardingPassDocumentIds: string[];
  reservationDocumentId: string | null;
  notes: string;
}

export interface Hotel {
  id: string;
  tripId: string;
  name: string;
  address: string;
  checkInDate: IsoDate;
  checkOutDate: IsoDate;
  checkInTime: string;
  checkOutTime: string;
  bookingNumber: string;
  room: string;
  phone: string;
  documentId: string | null;
  notes: string;
}

export interface Attraction {
  id: string;
  tripId: string;
  name: string;
  date: IsoDate | null;
  time: string;
  address: string;
  ticketCount: number;
  documentId: string | null;
  notes: string;
}

export interface CarRental {
  id: string;
  tripId: string;
  company: string;
  pickupDate: IsoDate;
  pickupTime: string;
  pickupAddress: string;
  returnDate: IsoDate;
  returnTime: string;
  returnAddress: string;
  car: string;
  reservationNumber: string;
  paymentNote: string;
  voucherDocumentId: string | null;
  licenseDocumentIds: string[];
  notes: string;
}

export interface Insurance {
  id: string;
  tripId: string;
  company: string;
  policyNumber: string;
  travelerIds: string[];
  coverageStart: IsoDate;
  coverageEnd: IsoDate;
  emergencyPhone: string;
  passportCardNote: string;
  documentId: string | null;
  passportCardDocumentId: string | null;
  notes: string;
}

export interface ESimPlan {
  id: string;
  tripId: string;
  provider: string;
  packageName: string;
  phoneNumber: string;
  activationSteps: string;
  documentId: string | null;
  notes: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  date: IsoDate;
  title: string;
  notes: string;
}

export interface TripActivity {
  id: string;
  tripId: string;
  dayId: string;
  time: string;
  title: string;
  note: string;
  address: string;
  documentId: string | null;
  sortOrder: number;
}

export interface ChecklistItem {
  id: string;
  tripId: string;
  section: string;
  title: string;
  done: boolean;
  sortOrder: number;
  href: string | null;
}

export interface SecuritySettings {
  id: "security";
  pinEnabled: boolean;
  pinLength: number;
  saltB64: string | null;
  wrappedKeyB64: string | null;
  wrappedKeyIvB64: string | null;
  kdfIterations: number;
  biometricEnabled: boolean;
  credentialIdB64: string | null;
  prfSaltB64: string | null;
  bioWrappedKeyB64: string | null;
  bioWrappedKeyIvB64: string | null;
  autoLockMinutes: number;
  hideSensitivePreviews: boolean;
  activeTripId: string | null;
  hintDismissed: boolean;
}

export interface DocumentInput {
  tripId: string;
  title: string;
  type: string;
  category: string;
  travelerId: string | null;
  date: string | null;
  expiryDate: string | null;
  bookingNumber: string | null;
  notes: string;
  favorite: boolean;
  offlineAvailable: boolean;
  sensitive: boolean;
}

export interface DemoFileSpec {
  fileId: string;
  mime: "image/png" | "application/pdf";
  template: "passport" | "card" | "boarding" | "ticket" | "esim" | "pdf";
  title: string;
  kicker: string;
  lines: string[];
  accent: string;
}

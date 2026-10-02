"use client";

import { useState } from "react";
import { formatDot, formatIso } from "@/lib/dates";
import { ownerLabel } from "@/lib/people";
import { Link, navigate } from "@/lib/router";
import { deleteFlight, saveFlight } from "@/lib/repository";
import type { Flight } from "@/lib/types";
import { Button, Card, ChoiceList, EmptyState, Facts, Field, FormScaffold, Ltr, ScreenHeader, SelectInput, TextArea, TextInput } from "@/components/ui";
import { useConfirm, useVault } from "@/components/vault-provider";

export function FlightsScreen() {
  const { flights, documents, travelers } = useVault();
  if (!flights.length) {
    return (
      <div className="space-y-4">
        <ScreenHeader title="טיסות" />
        <EmptyState title="אין טיסות" body="הוסיפו את טיסת ההלוך והחזור." action={<Button onClick={() => navigate("/flights/new")}>הוספת טיסה</Button>} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <ScreenHeader title="טיסות" action={<Link href="/flights/new" className="text-sm font-semibold text-navy">הוספה</Link>} />
      {flights.map((flight) => {
        const passes = documents.filter((document) => flight.boardingPassDocumentIds.includes(document.id));
        return (
          <Card key={flight.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-tight"><Ltr>{flight.fromCode} → {flight.toCode}</Ltr></p>
                <p className="mt-1 text-sm text-muted">{flight.direction === "return" ? "טיסת חזור" : "טיסת הלוך"}</p>
              </div>
              <Link href={`/flights/${flight.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link>
            </div>
            <Facts items={[
              { label: "Departure", value: formatDot(flight.date) },
              { label: "Airline", value: flight.airline },
              { label: "Flight Number", value: flight.flightNumber },
              { label: "Departure Time", value: flight.departureTime },
              { label: "Arrival", value: flight.arrivalDate && flight.arrivalDate !== flight.date ? `${formatDot(flight.arrivalDate)} ${flight.arrivalTime}` : flight.arrivalTime },
              { label: "Terminal", value: flight.departureTerminal },
              { label: "Seat", value: flight.seats.filter((seat) => seat.seat).map((seat) => `${ownerLabel(travelers, seat.travelerId)}\u2066${seat.seat}\u2069`).join(" · ") },
              { label: "Baggage", value: flight.baggage },
              { label: "Booking", value: flight.confirmationNumber },
            ]} />
            <div className="space-y-2">
              {passes.map((document) => (
                <Link key={document.id} href={`/present/${document.id}`} className="flex h-14 items-center justify-center rounded-2xl bg-navy font-semibold text-white">
                  <span dir="ltr">Open Boarding Pass · {ownerLabel(travelers, document.travelerId)}</span>
                </Link>
              ))}
              {!passes.length ? <p className="text-sm text-muted">{flight.direction === "return" ? "כרטיס עלייה לחזור עדיין לא הונפק. הפרטים כאן הם מאישור ההזמנה." : "צרפו כרטיסי עלייה בעריכת הטיסה."}</p> : null}
            </div>
            <div className="space-y-2">
              {documents.filter((document) => document.type === "flight-reservation" && document.bookingNumber === flight.confirmationNumber && !document.title.startsWith("ארכיון")).map((document) => (
                <Link key={document.id} href={`/present/${document.id}`} className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold shadow-card">{document.title}</Link>
              ))}
            </div>
            {flight.notes ? <p className="text-sm leading-6 text-muted">{flight.notes}</p> : null}
          </Card>
        );
      })}
    </div>
  );
}

export function FlightFormScreen({ id }: { id?: string }) {
  const { flights, activeTrip, travelers, documents } = useVault();
  const confirm = useConfirm();
  const existing = flights.find((flight) => flight.id === id);
  if (id && !existing) return <EmptyState title="הטיסה לא נמצאה" body="חזרו למסך הטיסות." />;
  if (!activeTrip && !existing) return <EmptyState title="אין טיול פעיל" body="צרו טיול לפני הוספת טיסה." />;
  const tripId = existing?.tripId ?? activeTrip!.id;
  const initial: Flight = existing ?? {
    id: crypto.randomUUID(),
    tripId,
    direction: "outbound",
    fromCode: "",
    toCode: "",
    fromCity: "",
    toCity: "",
    date: formatIso(new Date()),
    airline: "",
    flightNumber: "",
    departureTime: "",
    arrivalTime: "",
    arrivalDate: formatIso(new Date()),
    departureTerminal: "",
    arrivalTerminal: "",
    baggage: "",
    confirmationNumber: "",
    seats: travelers.map((traveler) => ({ travelerId: traveler.id, seat: "" })),
    boardingPassDocumentIds: [],
    reservationDocumentId: null,
    notes: "",
  };
  return <FlightEditor initial={initial} isNew={!existing} onDelete={existing ? async () => {
    if (await confirm("למחוק את הטיסה?")) {
      await deleteFlight(existing.id);
      navigate("/flights");
    }
  } : undefined} documents={documents.filter((document) => document.tripId === tripId).map((document) => ({ id: document.id, label: document.title }))} travelers={travelers} />;
}

function FlightEditor({
  initial,
  isNew,
  onDelete,
  documents,
  travelers,
}: {
  initial: Flight;
  isNew: boolean;
  onDelete?: () => Promise<void>;
  documents: { id: string; label: string }[];
  travelers: { id: string; name: string }[];
}) {
  const [flight, setFlight] = useStateFlight(initial);
  return (
    <FormScaffold
      title={isNew ? "טיסה חדשה" : "עריכת טיסה"}
      back="/flights"
      submitLabel="שמירה"
      onSubmit={async () => {
        await saveFlight(flight);
        navigate("/flights");
      }}
      footer={onDelete ? <Button variant="danger" onClick={() => void onDelete()}>מחיקה</Button> : null}
    >
      <Field label="כיוון">
        <SelectInput value={flight.direction} onChange={(event) => setFlight({ ...flight, direction: event.target.value as Flight["direction"] })}>
          <option value="outbound">הלוך</option>
          <option value="return">חזור</option>
        </SelectInput>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="מ"><TextInput value={flight.fromCode} onChange={(event) => setFlight({ ...flight, fromCode: event.target.value })} placeholder="TLV" /></Field>
        <Field label="אל"><TextInput value={flight.toCode} onChange={(event) => setFlight({ ...flight, toCode: event.target.value })} placeholder="VIE" /></Field>
        <Field label="עיר מוצא"><TextInput value={flight.fromCity} onChange={(event) => setFlight({ ...flight, fromCity: event.target.value })} /></Field>
        <Field label="עיר יעד"><TextInput value={flight.toCity} onChange={(event) => setFlight({ ...flight, toCity: event.target.value })} /></Field>
      </div>
      <Field label="תאריך"><TextInput type="date" value={flight.date} onChange={(event) => setFlight({ ...flight, date: event.target.value })} /></Field>
      <Field label="חברה"><TextInput value={flight.airline} onChange={(event) => setFlight({ ...flight, airline: event.target.value })} /></Field>
      <Field label="מספר טיסה"><TextInput value={flight.flightNumber} onChange={(event) => setFlight({ ...flight, flightNumber: event.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="המראה"><TextInput type="time" value={flight.departureTime} onChange={(event) => setFlight({ ...flight, departureTime: event.target.value })} /></Field>
        <Field label="נחיתה"><TextInput type="time" value={flight.arrivalTime} onChange={(event) => setFlight({ ...flight, arrivalTime: event.target.value })} /></Field>
        <Field label="תאריך נחיתה"><TextInput type="date" value={flight.arrivalDate || flight.date} onChange={(event) => setFlight({ ...flight, arrivalDate: event.target.value })} /></Field>
        <Field label="טרמינל יציאה"><TextInput value={flight.departureTerminal} onChange={(event) => setFlight({ ...flight, departureTerminal: event.target.value })} /></Field>
        <Field label="טרמינל הגעה"><TextInput value={flight.arrivalTerminal} onChange={(event) => setFlight({ ...flight, arrivalTerminal: event.target.value })} /></Field>
      </div>
      {travelers.map((traveler) => (
        <Field key={traveler.id} label={`מושב · ${traveler.name}`}>
          <TextInput value={flight.seats.find((seat) => seat.travelerId === traveler.id)?.seat ?? ""} onChange={(event) => {
            const seats = flight.seats.some((seat) => seat.travelerId === traveler.id) ? flight.seats.map((seat) => seat.travelerId === traveler.id ? { ...seat, seat: event.target.value } : seat) : [...flight.seats, { travelerId: traveler.id, seat: event.target.value }];
            setFlight({ ...flight, seats });
          }} />
        </Field>
      ))}
      <Field label="כבודה"><TextInput value={flight.baggage} onChange={(event) => setFlight({ ...flight, baggage: event.target.value })} /></Field>
      <Field label="מספר הזמנה"><TextInput value={flight.confirmationNumber} onChange={(event) => setFlight({ ...flight, confirmationNumber: event.target.value })} /></Field>
      <Field label="כרטיסי עלייה">
        <ChoiceList options={documents} value={flight.boardingPassDocumentIds} onChange={(boardingPassDocumentIds) => setFlight({ ...flight, boardingPassDocumentIds })} />
      </Field>
      <Field label="אישור הזמנה">
        <SelectInput value={flight.reservationDocumentId ?? ""} onChange={(event) => setFlight({ ...flight, reservationDocumentId: event.target.value || null })}>
          <option value="">ללא</option>
          {documents.map((document) => <option key={document.id} value={document.id}>{document.label}</option>)}
        </SelectInput>
      </Field>
      <Field label="הערות"><TextArea value={flight.notes} onChange={(event) => setFlight({ ...flight, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

function useStateFlight(initial: Flight) {
  return useState(initial);
}

"use client";

import { useState } from "react";
import { formatDot, formatIso } from "@/lib/dates";
import { mapsHref, telHref } from "@/lib/links";
import { ownerLabel } from "@/lib/people";
import { Link, navigate } from "@/lib/router";
import { deleteAttraction, deleteCar, deleteEsim, deleteHotel, deleteInsurance, saveAttraction, saveCar, saveEsim, saveHotel, saveInsurance } from "@/lib/repository";
import type { Attraction, CarRental, ESimPlan, Hotel, Insurance } from "@/lib/types";
import { Button, Card, ChoiceList, EmptyState, Facts, Field, FormScaffold, ScreenHeader, SelectInput, TextArea, TextInput } from "@/components/ui";
import { useConfirm, useVault } from "@/components/vault-provider";

function DocButton({ id, label }: { id: string | null; label: string }) {
  const { documents } = useVault();
  const document = documents.find((item) => item.id === id);
  if (!document) return null;
  return <Link href={document.fileId ? `/present/${document.id}` : `/documents/${document.id}`} className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold shadow-card">{label}</Link>;
}

export function HotelScreen() {
  const { hotels } = useVault();
  if (!hotels.length) return <div className="space-y-4"><ScreenHeader title="מלון" /><EmptyState title="אין מלון" body="הוסיפו את ההזמנה, הכתובת ומספר האישור." action={<Button onClick={() => navigate("/hotel/new")}>הוספת מלון</Button>} /></div>;
  return (
    <div className="space-y-4">
      <ScreenHeader title="מלון" action={<Link href="/hotel/new" className="text-sm font-semibold text-navy">הוספה</Link>} />
      {hotels.map((hotel) => (
        <Card key={hotel.id} className="space-y-3">
          <div className="flex items-start justify-between"><h2 className="text-2xl font-semibold">{hotel.name}</h2><Link href={`/hotel/${hotel.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link></div>
          <Facts items={[
            { label: "Address", value: hotel.address },
            { label: "Check-in", value: `${formatDot(hotel.checkInDate)} ${hotel.checkInTime}`.trim() },
            { label: "Check-out", value: `${formatDot(hotel.checkOutDate)} ${hotel.checkOutTime}`.trim() },
            { label: "Booking Number", value: hotel.bookingNumber },
            { label: "Room", value: hotel.room },
            { label: "Phone", value: hotel.phone || "לא הוזן" },
          ]} />
          {hotel.notes ? <p className="text-sm leading-6 text-muted">{hotel.notes}</p> : null}
          <DocButton id={hotel.documentId} label="View Reservation" />
          {hotel.address ? <a href={mapsHref(hotel.address)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">Open Address</a> : null}
          {hotel.phone ? <a href={telHref(hotel.phone)} className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold">התקשרות למלון</a> : null}
        </Card>
      ))}
    </div>
  );
}

export function HotelFormScreen({ id }: { id?: string }) {
  const { hotels, activeTrip, documents } = useVault();
  const confirm = useConfirm();
  const existing = hotels.find((hotel) => hotel.id === id);
  const tripId = existing?.tripId ?? activeTrip?.id ?? "";
  const [hotel, setHotel] = useState<Hotel>(existing ?? { id: crypto.randomUUID(), tripId, name: "", address: "", checkInDate: formatIso(new Date()), checkOutDate: formatIso(new Date()), checkInTime: "15:00", checkOutTime: "11:00", bookingNumber: "", room: "", phone: "", documentId: null, notes: "" });
  if (id && !existing) return <EmptyState title="המלון לא נמצא" body="חזרו למסך המלון." />;
  if (!tripId) return <EmptyState title="אין טיול פעיל" body="צרו טיול קודם." />;
  const options = documents.map((document) => ({ id: document.id, label: document.title }));
  return (
    <FormScaffold title={existing ? "עריכת מלון" : "מלון חדש"} back="/hotel" submitLabel="שמירה" onSubmit={async () => { await saveHotel(hotel); navigate("/hotel"); }} footer={existing ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את המלון?")) { await deleteHotel(existing.id); navigate("/hotel"); } }}>מחיקה</Button> : null}>
      <Field label="שם"><TextInput value={hotel.name} onChange={(event) => setHotel({ ...hotel, name: event.target.value })} /></Field>
      <Field label="כתובת"><TextInput value={hotel.address} onChange={(event) => setHotel({ ...hotel, address: event.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="צ׳ק-אין"><TextInput type="date" value={hotel.checkInDate} onChange={(event) => setHotel({ ...hotel, checkInDate: event.target.value })} /></Field>
        <Field label="שעה"><TextInput type="time" value={hotel.checkInTime} onChange={(event) => setHotel({ ...hotel, checkInTime: event.target.value })} /></Field>
        <Field label="צ׳ק-אאוט"><TextInput type="date" value={hotel.checkOutDate} onChange={(event) => setHotel({ ...hotel, checkOutDate: event.target.value })} /></Field>
        <Field label="שעה"><TextInput type="time" value={hotel.checkOutTime} onChange={(event) => setHotel({ ...hotel, checkOutTime: event.target.value })} /></Field>
      </div>
      <Field label="מספר הזמנה"><TextInput value={hotel.bookingNumber} onChange={(event) => setHotel({ ...hotel, bookingNumber: event.target.value })} /></Field>
      <Field label="חדר"><TextInput value={hotel.room} onChange={(event) => setHotel({ ...hotel, room: event.target.value })} /></Field>
      <Field label="טלפון"><TextInput value={hotel.phone} onChange={(event) => setHotel({ ...hotel, phone: event.target.value })} /></Field>
      <Field label="PDF הזמנה"><SelectInput value={hotel.documentId ?? ""} onChange={(event) => setHotel({ ...hotel, documentId: event.target.value || null })}><option value="">ללא</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</SelectInput></Field>
      <Field label="הערות"><TextArea value={hotel.notes} onChange={(event) => setHotel({ ...hotel, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

export function InsuranceScreen() {
  const { insurances, travelers, documents } = useVault();
  const embassy = documents.find((document) => document.type === "embassy");
  if (!insurances.length) return <div className="space-y-4"><ScreenHeader title="ביטוח" /><EmptyState title="אין ביטוח" body="הוסיפו פוליסה ומספר חירום." action={<Button onClick={() => navigate("/insurance/new")}>הוספת ביטוח</Button>} /></div>;
  return (
    <div className="space-y-4">
      <ScreenHeader title="ביטוח" action={<Link href="/insurance/new" className="text-sm font-semibold text-navy">הוספה</Link>} />
      {insurances.map((insurance) => (
        <Card key={insurance.id} className="space-y-3">
          <div className="flex items-start justify-between"><h2 className="text-2xl font-semibold">{insurance.company}</h2><Link href={`/insurance/${insurance.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link></div>
          <Facts items={[
            { label: "Policy Number", value: insurance.policyNumber },
            { label: "נוסעים", value: insurance.travelerIds.map((id) => ownerLabel(travelers, id)).join(" · ") },
            { label: "Coverage", value: `${formatDot(insurance.coverageStart)} – ${formatDot(insurance.coverageEnd)}` },
            { label: "Emergency Phone", value: insurance.emergencyPhone || "לא הוזן" },
          ]} />
          {insurance.emergencyPhone ? <a href={telHref(insurance.emergencyPhone)} className="flex h-16 items-center justify-center rounded-3xl bg-danger text-lg font-semibold text-white" dir="ltr">Emergency</a> : <Link href={`/insurance/${insurance.id}/edit`} className="flex h-16 items-center justify-center rounded-3xl bg-danger text-lg font-semibold text-white"><span dir="ltr">Emergency · הוסיפו מספר</span></Link>}
          <div className="grid grid-cols-2 gap-2">
            <a href="tel:112" className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold">112 חירום</a>
            <a href="tel:144" className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold">144 אמבולנס</a>
            <a href="tel:133" className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold">133 משטרה</a>
            <a href="tel:122" className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold">122 כיבוי</a>
          </div>
          <DocButton id={insurance.documentId} label="Insurance PDF" />
          <DocButton id={insurance.passportCardDocumentId} label="PassportCard" />
          {insurance.passportCardNote ? <p className="text-sm leading-6 text-muted">{insurance.passportCardNote}</p> : null}
          {embassy ? <DocButton id={embassy.id} label="שגרירות ישראל בווינה" /> : null}
        </Card>
      ))}
    </div>
  );
}

export function InsuranceFormScreen({ id }: { id?: string }) {
  const { insurances, activeTrip, travelers, documents } = useVault();
  const confirm = useConfirm();
  const existing = insurances.find((item) => item.id === id);
  const tripId = existing?.tripId ?? activeTrip?.id ?? "";
  const [insurance, setInsurance] = useState<Insurance>(existing ?? { id: crypto.randomUUID(), tripId, company: "", policyNumber: "", travelerIds: travelers.map((traveler) => traveler.id), coverageStart: formatIso(new Date()), coverageEnd: formatIso(new Date()), emergencyPhone: "", passportCardNote: "", documentId: null, passportCardDocumentId: null, notes: "" });
  if (id && !existing) return <EmptyState title="הביטוח לא נמצא" body="חזרו למסך הביטוח." />;
  if (!tripId) return <EmptyState title="אין טיול פעיל" body="צרו טיול קודם." />;
  const options = documents.map((document) => ({ id: document.id, label: document.title }));
  return (
    <FormScaffold title={existing ? "עריכת ביטוח" : "ביטוח חדש"} back="/insurance" submitLabel="שמירה" onSubmit={async () => { await saveInsurance(insurance); navigate("/insurance"); }} footer={existing ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את הביטוח?")) { await deleteInsurance(existing.id); navigate("/insurance"); } }}>מחיקה</Button> : null}>
      <Field label="חברה"><TextInput value={insurance.company} onChange={(event) => setInsurance({ ...insurance, company: event.target.value })} /></Field>
      <Field label="מספר פוליסה"><TextInput value={insurance.policyNumber} onChange={(event) => setInsurance({ ...insurance, policyNumber: event.target.value })} /></Field>
      <Field label="טלפון חירום"><TextInput value={insurance.emergencyPhone} onChange={(event) => setInsurance({ ...insurance, emergencyPhone: event.target.value })} placeholder="+972…" /></Field>
      <Field label="נוסעים"><ChoiceList options={travelers.map((traveler) => ({ id: traveler.id, label: traveler.name }))} value={insurance.travelerIds} onChange={(travelerIds) => setInsurance({ ...insurance, travelerIds })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="מתאריך"><TextInput type="date" value={insurance.coverageStart} onChange={(event) => setInsurance({ ...insurance, coverageStart: event.target.value })} /></Field>
        <Field label="עד"><TextInput type="date" value={insurance.coverageEnd} onChange={(event) => setInsurance({ ...insurance, coverageEnd: event.target.value })} /></Field>
      </div>
      <Field label="מסמך פוליסה"><SelectInput value={insurance.documentId ?? ""} onChange={(event) => setInsurance({ ...insurance, documentId: event.target.value || null })}><option value="">ללא</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</SelectInput></Field>
      <Field label="PassportCard"><SelectInput value={insurance.passportCardDocumentId ?? ""} onChange={(event) => setInsurance({ ...insurance, passportCardDocumentId: event.target.value || null })}><option value="">ללא</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</SelectInput></Field>
      <Field label="הערת PassportCard"><TextArea value={insurance.passportCardNote} onChange={(event) => setInsurance({ ...insurance, passportCardNote: event.target.value })} /></Field>
      <Field label="הערות"><TextArea value={insurance.notes} onChange={(event) => setInsurance({ ...insurance, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

export function CarScreen() {
  const { cars, documents } = useVault();
  if (!cars.length) return <div className="space-y-4"><ScreenHeader title="רכב" /><EmptyState title="אין השכרת רכב" body="ביום האיסוף כל המסמכים יופיעו כאן." action={<Button onClick={() => navigate("/car/new")}>הוספת רכב</Button>} /></div>;
  return (
    <div className="space-y-4">
      <ScreenHeader title="רכב" action={<Link href="/car/new" className="text-sm font-semibold text-navy">הוספה</Link>} />
      {cars.map((car) => {
        const licenses = documents.filter((document) => car.licenseDocumentIds.includes(document.id) || document.type === "driving-license" || document.type === "international-license" || document.type === "passport");
        const unique = [...new Map(licenses.map((document) => [document.id, document])).values()];
        return (
          <Card key={car.id} className="space-y-3">
            <div className="flex items-start justify-between"><h2 className="text-2xl font-semibold">{car.company}</h2><Link href={`/car/${car.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link></div>
            <Facts items={[
              { label: "Pickup", value: `${formatDot(car.pickupDate)} ${car.pickupTime}`.trim() },
              { label: "Pickup Address", value: car.pickupAddress },
              { label: "Return", value: `${formatDot(car.returnDate)} ${car.returnTime}`.trim() },
              { label: "Return Address", value: car.returnAddress },
              { label: "Car", value: car.car },
              { label: "Reservation", value: car.reservationNumber },
              { label: "Payment", value: car.paymentNote },
            ]} />
            <DocButton id={car.voucherDocumentId} label="Rental Voucher" />
            {car.pickupAddress ? <a href={mapsHref(car.pickupAddress)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">Open Address</a> : null}
            <div className="space-y-2">
              {unique.map((document) => <DocButton key={document.id} id={document.id} label={document.title} />)}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function CarFormScreen({ id }: { id?: string }) {
  const { cars, activeTrip, documents } = useVault();
  const confirm = useConfirm();
  const existing = cars.find((car) => car.id === id);
  const tripId = existing?.tripId ?? activeTrip?.id ?? "";
  const [car, setCar] = useState<CarRental>(existing ?? { id: crypto.randomUUID(), tripId, company: "", pickupDate: formatIso(new Date()), pickupTime: "08:00", pickupAddress: "", returnDate: formatIso(new Date()), returnTime: "19:00", returnAddress: "", car: "", reservationNumber: "", paymentNote: "", voucherDocumentId: null, licenseDocumentIds: [], notes: "" });
  if (id && !existing) return <EmptyState title="הרכב לא נמצא" body="חזרו למסך הרכב." />;
  if (!tripId) return <EmptyState title="אין טיול פעיל" body="צרו טיול קודם." />;
  const options = documents.map((document) => ({ id: document.id, label: document.title }));
  return (
    <FormScaffold title={existing ? "עריכת רכב" : "רכב חדש"} back="/car" submitLabel="שמירה" onSubmit={async () => { await saveCar(car); navigate("/car"); }} footer={existing ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את ההשכרה?")) { await deleteCar(existing.id); navigate("/car"); } }}>מחיקה</Button> : null}>
      <Field label="חברה"><TextInput value={car.company} onChange={(event) => setCar({ ...car, company: event.target.value })} /></Field>
      <Field label="רכב"><TextInput value={car.car} onChange={(event) => setCar({ ...car, car: event.target.value })} /></Field>
      <Field label="מספר הזמנה"><TextInput value={car.reservationNumber} onChange={(event) => setCar({ ...car, reservationNumber: event.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="איסוף"><TextInput type="date" value={car.pickupDate} onChange={(event) => setCar({ ...car, pickupDate: event.target.value })} /></Field>
        <Field label="שעה"><TextInput type="time" value={car.pickupTime} onChange={(event) => setCar({ ...car, pickupTime: event.target.value })} /></Field>
      </div>
      <Field label="כתובת איסוף"><TextInput value={car.pickupAddress} onChange={(event) => setCar({ ...car, pickupAddress: event.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="החזרה"><TextInput type="date" value={car.returnDate} onChange={(event) => setCar({ ...car, returnDate: event.target.value })} /></Field>
        <Field label="שעה"><TextInput type="time" value={car.returnTime} onChange={(event) => setCar({ ...car, returnTime: event.target.value })} /></Field>
      </div>
      <Field label="כתובת החזרה"><TextInput value={car.returnAddress} onChange={(event) => setCar({ ...car, returnAddress: event.target.value })} /></Field>
      <Field label="תשלום / פיקדון"><TextArea value={car.paymentNote} onChange={(event) => setCar({ ...car, paymentNote: event.target.value })} /></Field>
      <Field label="ואוצ׳ר"><SelectInput value={car.voucherDocumentId ?? ""} onChange={(event) => setCar({ ...car, voucherDocumentId: event.target.value || null })}><option value="">ללא</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</SelectInput></Field>
      <Field label="רישיונות ודרכונים"><ChoiceList options={options} value={car.licenseDocumentIds} onChange={(licenseDocumentIds) => setCar({ ...car, licenseDocumentIds })} /></Field>
      <Field label="הערות"><TextArea value={car.notes} onChange={(event) => setCar({ ...car, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

export function AttractionsScreen() {
  const { attractions } = useVault();
  return (
    <div className="space-y-4">
      <ScreenHeader title="אטרקציות" action={<Link href="/attractions/new" className="text-sm font-semibold text-navy">הוספה</Link>} />
      {attractions.length ? attractions.map((attraction) => (
        <Link key={attraction.id} href={`/attractions/${attraction.id}`} className="block rounded-3xl bg-white p-4 shadow-card">
          <h2 className="text-xl font-semibold">{attraction.name}</h2>
          <p className="mt-2 text-sm text-muted">{[attraction.date ? formatDot(attraction.date) : "", attraction.time, attraction.address].filter(Boolean).join(" · ")}</p>
          <p className="mt-3 font-semibold">{attraction.ticketCount} Tickets</p>
        </Link>
      )) : <EmptyState title="אין אטרקציות" body="הוסיפו כרטיסים, שעה וכתובת." />}
    </div>
  );
}

export function AttractionDetailScreen({ id }: { id: string }) {
  const { attractions } = useVault();
  const attraction = attractions.find((item) => item.id === id);
  if (!attraction) return <EmptyState title="האטרקציה לא נמצאה" body="חזרו לרשימה." />;
  return (
    <div className="space-y-4">
      <ScreenHeader title={attraction.name} action={<Link href={`/attractions/${attraction.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link>} />
      <Card>
        <Facts items={[
          { label: "Date", value: attraction.date ? formatDot(attraction.date) : "" },
          { label: "Time", value: attraction.time },
          { label: "Address", value: attraction.address },
          { label: "Tickets", value: String(attraction.ticketCount) },
        ]} />
        {attraction.notes ? <p className="mt-3 text-sm leading-6 text-muted">{attraction.notes}</p> : null}
      </Card>
      <DocButton id={attraction.documentId} label="Open Tickets" />
      {attraction.address ? <a href={mapsHref(attraction.address)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">Open Address</a> : null}
    </div>
  );
}

export function AttractionFormScreen({ id }: { id?: string }) {
  const { attractions, activeTrip, documents } = useVault();
  const confirm = useConfirm();
  const existing = attractions.find((item) => item.id === id);
  const tripId = existing?.tripId ?? activeTrip?.id ?? "";
  const [attraction, setAttraction] = useState<Attraction>(existing ?? { id: crypto.randomUUID(), tripId, name: "", date: formatIso(new Date()), time: "", address: "", ticketCount: 2, documentId: null, notes: "" });
  if (id && !existing) return <EmptyState title="האטרקציה לא נמצאה" body="חזרו לרשימה." />;
  if (!tripId) return <EmptyState title="אין טיול פעיל" body="צרו טיול קודם." />;
  return (
    <FormScaffold title={existing ? "עריכת אטרקציה" : "אטרקציה חדשה"} back="/attractions" submitLabel="שמירה" onSubmit={async () => { await saveAttraction(attraction); navigate(existing ? `/attractions/${existing.id}` : "/attractions"); }} footer={existing ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את האטרקציה?")) { await deleteAttraction(existing.id); navigate("/attractions"); } }}>מחיקה</Button> : null}>
      <Field label="שם"><TextInput value={attraction.name} onChange={(event) => setAttraction({ ...attraction, name: event.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="תאריך"><TextInput type="date" value={attraction.date ?? ""} onChange={(event) => setAttraction({ ...attraction, date: event.target.value || null })} /></Field>
        <Field label="שעה"><TextInput type="time" value={attraction.time} onChange={(event) => setAttraction({ ...attraction, time: event.target.value })} /></Field>
      </div>
      <Field label="כתובת"><TextInput value={attraction.address} onChange={(event) => setAttraction({ ...attraction, address: event.target.value })} /></Field>
      <Field label="כרטיסים"><TextInput type="number" min={0} value={attraction.ticketCount} onChange={(event) => setAttraction({ ...attraction, ticketCount: Number(event.target.value) })} /></Field>
      <Field label="כרטיס"><SelectInput value={attraction.documentId ?? ""} onChange={(event) => setAttraction({ ...attraction, documentId: event.target.value || null })}><option value="">ללא</option>{documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}</SelectInput></Field>
      <Field label="הערות"><TextArea value={attraction.notes} onChange={(event) => setAttraction({ ...attraction, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

export function EsimScreen() {
  const { esims } = useVault();
  if (!esims.length) return <div className="space-y-4"><ScreenHeader title="eSIM" /><EmptyState title="אין eSIM" body="שמרו ספק, חבילה ו-QR." action={<Button onClick={() => navigate("/esim/new")}>הוספת eSIM</Button>} /></div>;
  return (
    <div className="space-y-4">
      <ScreenHeader title="eSIM" action={<Link href="/esim/new" className="text-sm font-semibold text-navy">הוספה</Link>} />
      {esims.map((esim) => (
        <Card key={esim.id} className="space-y-3">
          <div className="flex items-start justify-between"><h2 className="text-2xl font-semibold">{esim.provider}</h2><Link href={`/esim/${esim.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link></div>
          <Facts items={[{ label: "Package", value: esim.packageName }, { label: "Phone", value: esim.phoneNumber }]} />
          {esim.activationSteps ? <p className="whitespace-pre-wrap text-sm leading-6">{esim.activationSteps}</p> : null}
          <DocButton id={esim.documentId} label="QR של ה-eSIM" />
        </Card>
      ))}
    </div>
  );
}

export function EsimFormScreen({ id }: { id?: string }) {
  const { esims, activeTrip, documents } = useVault();
  const confirm = useConfirm();
  const existing = esims.find((item) => item.id === id);
  const tripId = existing?.tripId ?? activeTrip?.id ?? "";
  const [esim, setEsim] = useState<ESimPlan>(existing ?? { id: crypto.randomUUID(), tripId, provider: "", packageName: "", phoneNumber: "", activationSteps: "", documentId: null, notes: "" });
  if (id && !existing) return <EmptyState title="ה-eSIM לא נמצא" body="חזרו למסך." />;
  if (!tripId) return <EmptyState title="אין טיול פעיל" body="צרו טיול קודם." />;
  return (
    <FormScaffold title={existing ? "עריכת eSIM" : "eSIM חדש"} back="/esim" submitLabel="שמירה" onSubmit={async () => { await saveEsim(esim); navigate("/esim"); }} footer={existing ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את ה-eSIM?")) { await deleteEsim(existing.id); navigate("/esim"); } }}>מחיקה</Button> : null}>
      <Field label="ספק"><TextInput value={esim.provider} onChange={(event) => setEsim({ ...esim, provider: event.target.value })} /></Field>
      <Field label="חבילה"><TextInput value={esim.packageName} onChange={(event) => setEsim({ ...esim, packageName: event.target.value })} /></Field>
      <Field label="מספר"><TextInput value={esim.phoneNumber} onChange={(event) => setEsim({ ...esim, phoneNumber: event.target.value })} /></Field>
      <Field label="הוראות הפעלה"><TextArea value={esim.activationSteps} onChange={(event) => setEsim({ ...esim, activationSteps: event.target.value })} /></Field>
      <Field label="QR"><SelectInput value={esim.documentId ?? ""} onChange={(event) => setEsim({ ...esim, documentId: event.target.value || null })}><option value="">ללא</option>{documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}</SelectInput></Field>
      <Field label="הערות"><TextArea value={esim.notes} onChange={(event) => setEsim({ ...esim, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

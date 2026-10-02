"use client";

import { useEffect, useState } from "react";
import { formatRange, formatIso } from "@/lib/dates";
import { platformAuthenticatorAvailable } from "@/lib/biometric";
import { Link, navigate } from "@/lib/router";
import { changePin, deleteTraveler, deleteTrip, disableBiometric, disablePin, enableBiometric, enablePin, lockVault, saveTraveler, saveTrip, setActiveTrip, updatePreferences } from "@/lib/repository";
import { resetDemo } from "@/lib/seed";
import type { Traveler, Trip } from "@/lib/types";
import { Button, Card, ChoiceList, Field, FormScaffold, Ltr, SelectInput, TextArea, TextInput } from "@/components/ui";
import { PinPad } from "@/components/pin-pad";
import { useConfirm, useVault } from "@/components/vault-provider";

export function SettingsScreen() {
  const vault = useVault();
  const confirm = useConfirm();
  const [storage, setStorage] = useState<string>("");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [mode, setMode] = useState<"idle" | "enable" | "confirm" | "change" | "disable">("idle");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPrompt | null>(null);

  useEffect(() => {
    navigator.storage?.estimate?.().then((estimate) => {
      if (estimate.usage) setStorage(`${(estimate.usage / 1024 / 1024).toFixed(1)} MB`);
    }).catch(() => undefined);
    platformAuthenticatorAvailable().then(setBioAvailable).catch(() => setBioAvailable(false));
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function finishPin(value: string) {
    setMessage(null);
    setPending(true);
    try {
      if (mode === "enable") {
        setFirstPin(value);
        setPin("");
        setMode("confirm");
      } else if (mode === "confirm") {
        if (value !== firstPin) throw new Error("הקודים לא תואמים.");
        await enablePin(value);
        vault.setUnlocked(true);
        setMode("idle");
        setMessage("הקוד פעיל והקבצים הוצפנו במכשיר.");
      } else if (mode === "change") {
        if (!firstPin) {
          setFirstPin(value);
          setPin("");
          setMessage("בחרו קוד חדש.");
        } else if (firstPin.length < 4 || value.length < 4) {
          throw new Error("הקוד קצר מדי.");
        } else {
          await changePin(firstPin, value);
          setMode("idle");
          setFirstPin("");
          setMessage("הקוד עודכן.");
        }
      } else if (mode === "disable") {
        await disablePin(value);
        vault.setUnlocked(true);
        setMode("idle");
        setMessage("הנעילה בוטלה. הקבצים נשארו במכשיר בלי הצפנה.");
      }
      setPin("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הפעולה נכשלה");
      setPin("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">הגדרות</h1>
      <Card className="space-y-3">
        <h2 className="font-semibold">טיולים</h2>
        {vault.trips.map((trip) => (
          <div key={trip.id} className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-3 py-3">
            <button type="button" className="min-w-0 text-start" onClick={() => void setActiveTrip(trip.id)}>
              <span className="block font-semibold">{trip.flag} {trip.destination}</span>
              <span className="text-sm text-muted"><Ltr>{formatRange(trip.startDate, trip.endDate)}</Ltr>{trip.id === vault.activeTrip?.id ? " · פעיל" : ""}</span>
            </button>
            <Link href={`/trips/${trip.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link>
          </div>
        ))}
        <Link href="/trips/new" className="flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">טיול חדש</Link>
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold">נוסעים</h2><Link href="/travelers/new" className="text-sm font-semibold text-navy">הוספה</Link></div>
        {vault.travelers.map((traveler) => (
          <div key={traveler.id} className="flex items-center justify-between">
            <span>{traveler.emoji} {traveler.name}</span>
            <span className="flex gap-3">
              <Link href={`/travelers/${traveler.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link>
              <button type="button" className="text-sm text-danger" onClick={async () => { if (await confirm("למחוק את הנוסע?")) await deleteTraveler(traveler.id).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "לא ניתן למחוק")); }}>מחיקה</button>
            </span>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-semibold">אבטחה</h2>
        <p className="text-sm leading-6 text-muted">אפשר לנעול את האפליקציה בקוד. כשהקוד פעיל, הקבצים מוצפנים במכשיר. אם שוכחים את הקוד אי אפשר לשחזר אותם.</p>
        {vault.settings.pinEnabled ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => { lockVault(); vault.setUnlocked(false); }}>נעילה עכשיו</Button>
            <Button variant="secondary" onClick={() => { setMode("change"); setFirstPin(""); setPin(""); setMessage(null); }}>החלפת קוד</Button>
            <Button variant="danger" onClick={() => { setMode("disable"); setPin(""); setMessage(null); }}>ביטול קוד</Button>
            {bioAvailable ? <Button variant="secondary" onClick={() => void (vault.settings.biometricEnabled ? disableBiometric() : enableBiometric().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Face ID נכשל")))}>{vault.settings.biometricEnabled ? "כיבוי Face ID" : "Face ID"}</Button> : null}
          </div>
        ) : <Button onClick={() => { setMode("enable"); setPin(""); setFirstPin(""); setMessage(null); }}>הפעלת קוד</Button>}
        {mode !== "idle" ? (
          <div className="relative z-[60] rounded-3xl bg-navy p-4 text-white">
            <p className="mb-4 text-center text-sm">{mode === "confirm" ? "הקלידו את הקוד שוב" : mode === "change" && !firstPin ? "הקוד הנוכחי" : mode === "change" ? "קוד חדש" : mode === "disable" ? "הקלידו את הקוד כדי לבטל" : "בחרו קוד בן 4–6 ספרות"}</p>
            <PinPad value={pin} onChange={setPin} onComplete={(value) => void finishPin(value)} />
            <button type="button" className="mt-3 w-full text-sm text-white/70" onClick={() => setMode("idle")}>ביטול</button>
            {pending ? <p className="mt-2 text-center text-sm">מצפינים את המסמכים…</p> : null}
          </div>
        ) : null}
        <Field label="נעילה אוטומטית">
          <SelectInput value={String(vault.settings.autoLockMinutes)} onChange={(event) => void updatePreferences({ autoLockMinutes: Number(event.target.value), hideSensitivePreviews: vault.settings.hideSensitivePreviews, hintDismissed: vault.settings.hintDismissed })}>
            <option value="0">מיד כשיוצאים מהאפליקציה</option>
            <option value="1">אחרי דקה</option>
            <option value="5">אחרי 5 דקות</option>
            <option value="15">אחרי 15 דקות</option>
          </SelectInput>
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm font-medium">
          הסתרת תצוגה של מסמכים רגישים
          <input type="checkbox" checked={vault.settings.hideSensitivePreviews} onChange={(event) => void updatePreferences({ hideSensitivePreviews: event.target.checked, autoLockMinutes: vault.settings.autoLockMinutes, hintDismissed: vault.settings.hintDismissed })} />
        </label>
        {message ? <p className="text-sm leading-6 text-navy">{message}</p> : null}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-semibold">התקנה ואופליין</h2>
        <p className="text-sm leading-6 text-muted">באייפון: שיתוף ← הוספה למסך הבית. פתחו את האפליקציה פעם אחת עם אינטרנט. אחר כך הדרכון, כרטיס העלייה, המלון, הביטוח והואוצ׳ר נפתחים גם בלי רשת.</p>
        {installEvent ? <Button onClick={() => void installEvent.prompt()}>התקנת Travel Vault</Button> : null}
        {storage ? <p className="text-sm text-muted">נפח משוער במכשיר: {storage}</p> : null}
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">פרטיות</h2>
        <p className="text-sm leading-6 text-muted">המסמכים נשארים במכשיר הזה ולא נשלחים לשרת. אין לשמור מספר אשראי מלא או CVV. האפליקציה תחסום טקסט שנראה כמו כרטיס אשראי.</p>
      </Card>
      {vault.activeTrip ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את הטיול הפעיל וכל המסמכים שלו מהמכשיר?")) await deleteTrip(vault.activeTrip!.id); }}>מחיקת הטיול הפעיל</Button> : null}
      <Button variant="secondary" onClick={async () => { if (await confirm("למחוק את כל הנתונים במכשיר ולטעון מחדש את טיול וינה לדוגמה?")) { await resetDemo(); window.location.reload(); } }}>שחזור נתוני הדמו</Button>
    </div>
  );
}

interface BeforeInstallPrompt extends Event {
  prompt: () => Promise<void>;
}

export function TripFormScreen({ id }: { id?: string }) {
  const { trips, travelers, activeTrip } = useVault();
  const existing = trips.find((trip) => trip.id === id);
  const [trip, setTrip] = useState<Trip>(existing ?? {
    id: crypto.randomUUID(),
    title: "",
    destination: "",
    country: "",
    flag: "✈️",
    startDate: formatIso(new Date()),
    endDate: formatIso(new Date()),
    travelerIds: travelers.map((traveler) => traveler.id),
    notes: "",
    createdAt: "",
    updatedAt: "",
  });
  if (id && !existing) return <p>הטיול לא נמצא.</p>;
  return (
    <FormScaffold title={existing ? "עריכת טיול" : "טיול חדש"} back="/settings" submitLabel="שמירה" onSubmit={async () => { await saveTrip(trip, !existing || trip.id === activeTrip?.id); navigate("/"); }}>
      <Field label="שם"><TextInput value={trip.title} onChange={(event) => setTrip({ ...trip, title: event.target.value })} placeholder="הטיול שלנו" /></Field>
      <Field label="יעד"><TextInput value={trip.destination} onChange={(event) => setTrip({ ...trip, destination: event.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="מדינה"><TextInput value={trip.country} onChange={(event) => setTrip({ ...trip, country: event.target.value })} /></Field>
        <Field label="דגל"><TextInput value={trip.flag} onChange={(event) => setTrip({ ...trip, flag: event.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="התחלה"><TextInput type="date" value={trip.startDate} onChange={(event) => setTrip({ ...trip, startDate: event.target.value })} /></Field>
        <Field label="סיום"><TextInput type="date" value={trip.endDate} onChange={(event) => setTrip({ ...trip, endDate: event.target.value })} /></Field>
      </div>
      <Field label="נוסעים"><ChoiceList options={travelers.map((traveler) => ({ id: traveler.id, label: `${traveler.emoji} ${traveler.name}` }))} value={trip.travelerIds} onChange={(travelerIds) => setTrip({ ...trip, travelerIds })} /></Field>
      <Field label="הערות"><TextArea value={trip.notes} onChange={(event) => setTrip({ ...trip, notes: event.target.value })} /></Field>
    </FormScaffold>
  );
}

export function TravelerFormScreen({ id }: { id?: string }) {
  const { travelers } = useVault();
  const existing = travelers.find((traveler) => traveler.id === id);
  const [traveler, setTraveler] = useState<Traveler>(existing ?? { id: crypto.randomUUID(), name: "", nameEn: "", emoji: "👤", createdAt: "" });
  return (
    <FormScaffold title={existing ? "עריכת נוסע" : "נוסע חדש"} back="/settings" submitLabel="שמירה" onSubmit={async () => { await saveTraveler({ ...traveler, createdAt: traveler.createdAt || new Date().toISOString() }); navigate("/settings"); }}>
      <Field label="שם"><TextInput value={traveler.name} onChange={(event) => setTraveler({ ...traveler, name: event.target.value })} /></Field>
      <Field label="שם באנגלית"><TextInput value={traveler.nameEn} onChange={(event) => setTraveler({ ...traveler, nameEn: event.target.value })} /></Field>
      <Field label="אימוג׳י"><TextInput value={traveler.emoji} onChange={(event) => setTraveler({ ...traveler, emoji: event.target.value })} /></Field>
    </FormScaffold>
  );
}

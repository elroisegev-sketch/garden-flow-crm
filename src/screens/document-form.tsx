"use client";

import { Camera, FileUp, ImagePlus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CATEGORIES, categoryById } from "@/lib/categories";
import { prepareUpload } from "@/lib/prepare-upload";
import { createDocument, updateDocument } from "@/lib/repository";
import type { TravelDocument } from "@/lib/types";
import { Field, FormScaffold, SelectInput, TextArea, TextInput, Toggle } from "@/components/ui";
import { useVault } from "@/components/vault-provider";

export function DocumentForm({
  existing,
  category = "identity",
  type,
  favorite = false,
  onSaved,
}: {
  existing?: TravelDocument;
  category?: string;
  type?: string;
  favorite?: boolean;
  onSaved: (id: string) => void;
}) {
  const { activeTrip, travelers } = useVault();
  const [form, setForm] = useState({
    title: existing?.title ?? "",
    category: existing?.category ?? category,
    type: existing?.type ?? type ?? categoryById(category)?.types[0]?.id ?? "note",
    travelerId: existing?.travelerId ?? "",
    date: existing?.date ?? "",
    expiryDate: existing?.expiryDate ?? "",
    bookingNumber: existing?.bookingNumber ?? "",
    notes: existing?.notes ?? "",
    favorite: existing?.favorite ?? favorite,
    offlineAvailable: existing?.offlineAvailable ?? true,
    sensitive: existing?.sensitive ?? (existing?.category ?? category) === "identity",
  });
  const [file, setFile] = useState<File | null>(null);
  const types = categoryById(form.category)?.types ?? [];

  function chooseCategory(next: string) {
    const nextTypes = categoryById(next)?.types ?? [];
    setForm((current) => ({
      ...current,
      category: next,
      type: nextTypes.some((item) => item.id === current.type) ? current.type : nextTypes[0]?.id ?? "note",
      sensitive: next === "identity" ? true : current.sensitive,
    }));
  }

  return (
    <FormScaffold
      title={existing ? "עריכת מסמך" : "מסמך חדש"}
      submitLabel={existing ? "שמירה" : "הוספה"}
      onSubmit={async () => {
        const tripId = existing?.tripId ?? activeTrip?.id;
        if (!tripId) throw new Error("צרו קודם טיול.");
        const blob = file ? await prepareUpload(file) : null;
        const input = {
          tripId,
          title: form.title,
          type: form.type,
          category: form.category,
          travelerId: form.travelerId || null,
          date: form.date || null,
          expiryDate: form.expiryDate || null,
          bookingNumber: form.bookingNumber || null,
          notes: form.notes,
          favorite: form.favorite,
          offlineAvailable: form.offlineAvailable,
          sensitive: form.sensitive,
        };
        if (existing) {
          await updateDocument(existing.id, input, blob);
          onSaved(existing.id);
        } else {
          onSaved(await createDocument(input, blob));
        }
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        <CameraButton onFile={setFile} />
        <FileButton icon={<ImagePlus className="size-5" />} label="תמונה" accept="image/*" onFile={setFile} />
        <FileButton icon={<FileUp className="size-5" />} label="PDF" accept="application/pdf" onFile={setFile} />
      </div>
      {file ? <p className="rounded-2xl bg-white px-4 py-3 text-sm">{file.name}</p> : existing?.fileId ? <p className="text-sm text-muted">הקובץ הקיים יישמר, אלא אם תבחרו קובץ חדש.</p> : null}
      <p className="text-sm leading-6 text-muted">הקובץ נשמר במכשיר. אין לצלם כרטיס אשראי ואין לרשום מספר מלא או CVV.</p>
      <Field label="שם">
        <TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Passport – Elroi" required />
      </Field>
      <Field label="קטגוריה">
        <SelectInput value={form.category} onChange={(event) => chooseCategory(event.target.value)}>
          {CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </SelectInput>
      </Field>
      <Field label="סוג">
        <SelectInput value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          {types.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </SelectInput>
      </Field>
      <Field label="בעלים">
        <SelectInput value={form.travelerId} onChange={(event) => setForm({ ...form, travelerId: event.target.value })}>
          <option value="">שנינו</option>
          {travelers.map((traveler) => <option key={traveler.id} value={traveler.id}>{traveler.emoji} {traveler.name}</option>)}
        </SelectInput>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="תאריך"><TextInput type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>
        <Field label="תוקף"><TextInput type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></Field>
      </div>
      <Field label="מספר הזמנה">
        <TextInput value={form.bookingNumber} onChange={(event) => setForm({ ...form, bookingNumber: event.target.value })} />
      </Field>
      <Field label="הערות">
        <TextArea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </Field>
      <Toggle checked={form.favorite} onChange={(favorite) => setForm({ ...form, favorite })} label="מועדף" />
      <Toggle checked={form.offlineAvailable} onChange={(offlineAvailable) => setForm({ ...form, offlineAvailable })} label="Available Offline" />
      <p className="-mt-2 text-sm text-muted">הקובץ נשמר במכשיר בכל מקרה. הסימון מציג שהוא מוכן לשימוש בלי רשת.</p>
      <Toggle checked={form.sensitive} onChange={(sensitive) => setForm({ ...form, sensitive })} label="הסתרת תצוגה מקדימה" />
    </FormScaffold>
  );
}

function CameraButton({ onFile }: { onFile: (file: File) => void }) {
  return (
    <label className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-sm font-medium shadow-card">
      <Camera className="size-5" />
      Take Photo
      <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => {
        const next = event.target.files?.[0];
        if (next) onFile(next);
        event.target.value = "";
      }} />
    </label>
  );
}

function FileButton({ icon, label, accept, onFile }: { icon: ReactNode; label: string; accept: string; onFile: (file: File) => void }) {
  return (
    <label className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-sm font-medium shadow-card">
      {icon}
      {label}
      <input type="file" accept={accept} className="sr-only" onChange={(event) => {
        const next = event.target.files?.[0];
        if (next) onFile(next);
        event.target.value = "";
      }} />
    </label>
  );
}

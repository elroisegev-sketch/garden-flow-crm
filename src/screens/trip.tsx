"use client";

import { useState } from "react";
import { CHECKLIST_SECTIONS, sectionLabel } from "@/lib/categories";
import { formatDot, weekday } from "@/lib/dates";
import { mapsHref } from "@/lib/links";
import { Link, navigate, useRouter } from "@/lib/router";
import { addChecklistItem, deleteActivity, deleteChecklistItem, moveActivity, saveActivity, setChecklistDone } from "@/lib/repository";
import type { TripActivity } from "@/lib/types";
import { Button, Card, EmptyState, Field, FormScaffold, Ltr, ScreenHeader, SelectInput, TextArea, TextInput } from "@/components/ui";
import { useConfirm, useVault } from "@/components/vault-provider";

export function TripScreen() {
  const { days, activities, activeTrip } = useVault();
  if (!activeTrip) return <EmptyState title="אין טיול" body="צרו טיול כדי לבנות מסלול." action={<Button onClick={() => navigate("/trips/new")}>טיול חדש</Button>} />;
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted">הטיול שלנו</p>
          <h1 className="text-3xl font-semibold">{activeTrip.destination}</h1>
        </div>
        <Link href="/checklist" className="text-sm font-semibold text-navy">צ׳קליסט</Link>
      </div>
      {days.map((day) => {
        const names = weekday(day.date);
        const count = activities.filter((activity) => activity.dayId === day.id).length;
        return (
          <Link key={day.id} href={`/trip/${day.id}`} className="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-card">
            <span>
              <span className="block text-lg font-semibold"><Ltr>{names.en} · {formatDot(day.date).slice(0, 5)}</Ltr></span>
              <span className="text-sm text-muted">יום {names.he}{count ? ` · ${count} פעילויות` : ""}</span>
            </span>
            <span className="text-muted">‹</span>
          </Link>
        );
      })}
    </div>
  );
}

export function TripDayScreen({ id }: { id: string }) {
  const { days, activities, documents } = useVault();
  const day = days.find((item) => item.id === id);
  if (!day) return <EmptyState title="היום לא נמצא" body="חזרו למסלול." />;
  const names = weekday(day.date);
  const items = activities.filter((activity) => activity.dayId === day.id);
  return (
    <div className="space-y-4">
      <ScreenHeader title={<Ltr>{names.en} · {formatDot(day.date).slice(0, 5)}</Ltr>} back="/trip" action={<Link href={`/activity/new?dayId=${day.id}`} className="text-sm font-semibold text-navy">הוספה</Link>} />
      <p className="text-sm text-muted">יום {names.he}</p>
      {items.length ? items.map((activity) => {
        const document = documents.find((item) => item.id === activity.documentId);
        return (
          <Card key={activity.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                {activity.time ? <p className="text-sm font-semibold text-gold"><Ltr>{activity.time}</Ltr></p> : null}
                <h2 className="text-xl font-semibold">{activity.title}</h2>
              </div>
              <Link href={`/activity/${activity.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link>
            </div>
            {activity.note ? <p className="text-sm leading-6 text-muted">{activity.note}</p> : null}
            {activity.address ? <a href={mapsHref(activity.address)} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-navy">{activity.address}</a> : null}
            {document ? <Link href={document.fileId ? `/present/${document.id}` : `/documents/${document.id}`} className="flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">{document.title}</Link> : null}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => void moveActivity(activity.id, -1)}>למעלה</Button>
              <Button variant="secondary" onClick={() => void moveActivity(activity.id, 1)}>למטה</Button>
            </div>
          </Card>
        );
      }) : <EmptyState title="היום עוד פנוי" body="הוסיפו ארוחה, נסיעה, כתובת או כרטיס." />}
    </div>
  );
}

export function ActivityFormScreen({ id }: { id?: string }) {
  const { activities, days, documents, activeTrip } = useVault();
  const { search } = useRouter();
  const confirm = useConfirm();
  const existing = activities.find((activity) => activity.id === id);
  const dayId = existing?.dayId ?? search.get("dayId") ?? "";
  const day = days.find((item) => item.id === dayId);
  const siblings = activities.filter((activity) => activity.dayId === dayId);
  const [activity, setActivity] = useState<TripActivity>(existing ?? {
    id: crypto.randomUUID(),
    tripId: activeTrip?.id ?? "",
    dayId,
    time: "",
    title: "",
    note: "",
    address: "",
    documentId: null,
    sortOrder: siblings.length,
  });
  if (!day || !activeTrip) return <EmptyState title="לא נבחר יום" body="חזרו למסלול ובחרו יום." />;
  return (
    <FormScaffold title={existing ? "עריכת פעילות" : "פעילות חדשה"} back={`/trip/${day.id}`} submitLabel="שמירה" onSubmit={async () => { await saveActivity(activity); navigate(`/trip/${day.id}`); }} footer={existing ? <Button variant="danger" onClick={async () => { if (await confirm("למחוק את הפעילות?")) { await deleteActivity(existing.id); navigate(`/trip/${day.id}`); } }}>מחיקה</Button> : null}>
      <Field label="שעה"><TextInput type="time" value={activity.time} onChange={(event) => setActivity({ ...activity, time: event.target.value })} /></Field>
      <Field label="שם"><TextInput value={activity.title} onChange={(event) => setActivity({ ...activity, title: event.target.value })} /></Field>
      <Field label="כתובת"><TextInput value={activity.address} onChange={(event) => setActivity({ ...activity, address: event.target.value })} /></Field>
      <Field label="הערה"><TextArea value={activity.note} onChange={(event) => setActivity({ ...activity, note: event.target.value })} /></Field>
      <Field label="מסמך / כרטיס">
        <SelectInput value={activity.documentId ?? ""} onChange={(event) => setActivity({ ...activity, documentId: event.target.value || null })}>
          <option value="">ללא</option>
          {documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}
        </SelectInput>
      </Field>
    </FormScaffold>
  );
}

export function ChecklistScreen() {
  const { checklist, activeTrip } = useVault();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<string>(CHECKLIST_SECTIONS[0].id);
  if (!activeTrip) return <EmptyState title="אין טיול" body="הצ׳קליסט שייך לטיול." />;
  const done = checklist.filter((item) => item.done).length;
  return (
    <div className="space-y-5">
      <ScreenHeader title="צ׳קליסט לפני הטיסה" />
      <p className="text-sm text-muted">{done} מתוך {checklist.length} הושלמו</p>
      {CHECKLIST_SECTIONS.map((group) => {
        const items = checklist.filter((item) => item.section === group.id);
        if (!items.length) return null;
        return (
          <section key={group.id} className="space-y-2">
            <h2 className="font-semibold">{group.label}</h2>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-card">
                <button type="button" aria-pressed={item.done} onClick={() => void setChecklistDone(item.id, !item.done)} className="grid size-11 shrink-0 place-items-center">
                  <span className={`grid size-6 place-items-center rounded-md border ${item.done ? "border-navy bg-navy text-white" : "border-line"}`}>{item.done ? "✓" : ""}</span>
                </button>
                {item.href ? <Link href={item.href} className={`flex-1 py-2 ${item.done ? "text-muted line-through" : "font-medium"}`}>{item.title}</Link> : <span className={`flex-1 py-2 ${item.done ? "text-muted line-through" : "font-medium"}`}>{item.title}</span>}
                <button type="button" className="px-2 text-sm text-muted" onClick={() => void deleteChecklistItem(item.id)} aria-label="מחיקה">✕</button>
              </div>
            ))}
          </section>
        );
      })}
      <form className="space-y-3 rounded-3xl bg-white p-4 shadow-card" onSubmit={async (event) => {
        event.preventDefault();
        await addChecklistItem(activeTrip.id, section, title);
        setTitle("");
      }}>
        <h2 className="font-semibold">פריט חדש</h2>
        <SelectInput value={section} onChange={(event) => setSection(event.target.value)}>
          {CHECKLIST_SECTIONS.map((group) => <option key={group.id} value={group.id}>{sectionLabel(group.id)}</option>)}
        </SelectInput>
        <TextInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="מה צריך לזכור?" />
        <Button type="submit">הוספה</Button>
      </form>
    </div>
  );
}

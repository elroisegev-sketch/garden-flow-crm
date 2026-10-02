"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, categoryById, typeLabel } from "@/lib/categories";
import { formatDot } from "@/lib/dates";
import { phonesIn, telHref } from "@/lib/links";
import { ownerLabel } from "@/lib/people";
import { Link, navigate, replaceHash, useRouter } from "@/lib/router";
import { deleteDocument, setFavorite, setOfflineAvailable } from "@/lib/repository";
import { DocumentCard, matchesPerson } from "@/components/document-card";
import { FileViewer } from "@/components/file-viewer";
import { Button, EmptyState, Facts, OfflineBadge, PersonFilter, ScreenHeader } from "@/components/ui";
import { useConfirm, useVault } from "@/components/vault-provider";
import { DocumentForm } from "./document-form";

export function DocumentsScreen({ category, favoritesOnly = false }: { category?: string; favoritesOnly?: boolean }) {
  const { documents, travelers } = useVault();
  const { search } = useRouter();
  const [person, setPerson] = useState("all");
  const [chip, setChip] = useState(category ?? "all");
  const type = search.get("type");
  const activeCategory = category ?? (chip === "all" ? undefined : chip);
  const filtered = useMemo(() => documents.filter((document) => {
    if (favoritesOnly && !document.favorite) return false;
    if (activeCategory && document.category !== activeCategory) return false;
    if (type && document.type !== type) return false;
    return matchesPerson(document, person);
  }), [documents, favoritesOnly, activeCategory, type, person]);
  const title = favoritesOnly ? "מועדפים" : category ? categoryById(category)?.label ?? "מסמכים" : "מסמכים";

  return (
    <div className="space-y-4">
      {category || favoritesOnly ? <ScreenHeader title={title} /> : <h1 className="text-3xl font-semibold">{title}</h1>}
      <PersonFilter value={person} travelers={travelers} onChange={setPerson} />
      {!category && !favoritesOnly ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={chip === "all"} onClick={() => setChip("all")}>הכל</FilterChip>
          {CATEGORIES.map((item) => (
            <FilterChip key={item.id} active={chip === item.id} onClick={() => setChip(item.id)}>{item.label}</FilterChip>
          ))}
        </div>
      ) : null}
      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((document) => <DocumentCard key={document.id} document={document} />)}
        </div>
      ) : (
        <EmptyState title="אין כאן מסמכים" body="הוסיפו תמונה, צילום מסך או PDF והם יישמרו במכשיר." action={<Button onClick={() => navigate(`/documents/new${activeCategory ? `?category=${activeCategory}` : ""}`)}>Add Document</Button>} />
      )}
    </div>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${active ? "bg-gold-soft text-navy" : "bg-white text-muted"}`}>{children}</button>;
}

export function DocumentScreen({ id }: { id: string }) {
  const { documents, travelers, settings } = useVault();
  const confirm = useConfirm();
  const document = documents.find((item) => item.id === id);
  const [revealed, setRevealed] = useState(false);
  if (!document) return <EmptyState title="המסמך לא נמצא" body="ייתכן שהוא נמחק." action={<Button onClick={() => navigate("/documents")}>למסמכים</Button>} />;
  const hidden = settings.hideSensitivePreviews && document.sensitive && !revealed;
  return (
    <div className="space-y-4">
      <ScreenHeader title={document.title} action={<Link href={`/documents/${document.id}/edit`} className="text-sm font-semibold text-navy">עריכה</Link>} />
      <section className="rounded-3xl bg-white p-4 shadow-card">
        <p className="text-sm text-muted">{typeLabel(document.category, document.type)}</p>
        <Facts items={[
          { label: "בעלים", value: ownerLabel(travelers, document.travelerId) },
          { label: "תאריך", value: document.date ? formatDot(document.date) : "" },
          { label: "תוקף", value: document.expiryDate ? formatDot(document.expiryDate) : "" },
          { label: "מספר הזמנה", value: document.bookingNumber ?? "" },
        ]} />
        {document.offlineAvailable && document.fileId ? <OfflineBadge /> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => void setFavorite(document.id, !document.favorite)}>{document.favorite ? "★ מועדף" : "☆ מועדף"}</Button>
          <Button variant="secondary" onClick={() => void setOfflineAvailable(document.id, !document.offlineAvailable)}>{document.offlineAvailable ? "אופליין" : "סמן אופליין"}</Button>
        </div>
      </section>
      {document.fileId && document.fileType ? (
        hidden ? (
          <Button onClick={() => setRevealed(true)}>הצגת מסמך רגיש</Button>
        ) : (
          <>
            <FileViewer fileId={document.fileId} mime={document.fileType} title={document.title} />
            <Link href={`/present/${document.id}`} className="flex h-12 items-center justify-center rounded-2xl bg-navy font-semibold text-white">מסך מלא</Link>
          </>
        )
      ) : <p className="rounded-2xl bg-white px-4 py-5 text-sm text-muted">אין קובץ מצורף. אפשר להוסיף בעריכה.</p>}
      {document.notes ? <section className="rounded-3xl bg-white p-4 shadow-card whitespace-pre-wrap leading-7">{document.notes}</section> : null}
      <div className="space-y-2">
        {phonesIn(document.notes).map((phone) => (
          <a key={phone} href={telHref(phone)} className="flex h-12 items-center justify-center rounded-2xl bg-white font-semibold shadow-card">התקשרות {phone}</a>
        ))}
      </div>
      <Button variant="danger" onClick={async () => {
        if (await confirm("למחוק את המסמך מהמכשיר?")) {
          await deleteDocument(document.id);
          navigate("/documents");
        }
      }}>מחיקת מסמך</Button>
    </div>
  );
}

export function DocumentCreateScreen() {
  const { search } = useRouter();
  return <DocumentForm category={search.get("category") ?? "identity"} type={search.get("type") ?? undefined} favorite={search.get("favorite") === "1"} onSaved={(id) => replaceHash(`/documents/${id}`)} />;
}

export function DocumentEditScreen({ id }: { id: string }) {
  const { documents } = useVault();
  const document = documents.find((item) => item.id === id);
  if (!document) return <EmptyState title="המסמך לא נמצא" body="חזרו לרשימה ובחרו מסמך אחר." />;
  return <DocumentForm existing={document} onSaved={() => navigate(`/documents/${id}`)} />;
}


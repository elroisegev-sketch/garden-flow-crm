"use client";

import { Star } from "lucide-react";
import { typeLabel } from "@/lib/categories";
import { formatDot } from "@/lib/dates";
import { ownerLabel } from "@/lib/people";
import { Link } from "@/lib/router";
import { setFavorite } from "@/lib/repository";
import type { TravelDocument } from "@/lib/types";
import { useVault } from "./vault-provider";
import { OfflineBadge } from "./ui";

export function DocumentCard({ document }: { document: TravelDocument }) {
  const { travelers } = useVault();
  return (
    <article className="rounded-3xl bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <Link href={`/documents/${document.id}`} className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{typeLabel(document.category, document.type)}</p>
          <h3 className="mt-1 text-lg font-semibold leading-6">{document.title}</h3>
        </Link>
        <button
          type="button"
          aria-label={document.favorite ? "הסרה ממועדפים" : "סימון כמועדף"}
          onClick={() => void setFavorite(document.id, !document.favorite)}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-paper"
        >
          <Star className={`size-5 ${document.favorite ? "fill-gold text-gold" : "text-muted"}`} />
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">
        {ownerLabel(travelers, document.travelerId)}
        {document.expiryDate ? ` · תוקף ${formatDot(document.expiryDate)}` : ""}
      </p>
      {document.offlineAvailable && document.fileId ? <div className="mt-2"><OfflineBadge /></div> : null}
      <Link href={document.fileId ? `/documents/${document.id}` : `/documents/${document.id}/edit`} className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-navy text-sm font-semibold text-white">
        {document.fileId ? "צפייה במסמך" : "השלמת מסמך"}
      </Link>
    </article>
  );
}

export function matchesPerson(document: TravelDocument, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "shared") return document.travelerId === null;
  return document.travelerId === filter;
}

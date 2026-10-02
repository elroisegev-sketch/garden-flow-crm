"use client";

import { goBack, navigate } from "@/lib/router";
import { FileViewer } from "@/components/file-viewer";
import { Button, EmptyState } from "@/components/ui";
import { useVault } from "@/components/vault-provider";

export function PresentScreen({ id }: { id: string }) {
  const { documents } = useVault();
  const document = documents.find((item) => item.id === id);
  if (!document?.fileId || !document.fileType) {
    return (
      <div className="px-4 pt-8">
        <EmptyState title="אין קובץ להצגה" body="אפשר לצרף תמונה או PDF בעריכת המסמך." action={<Button onClick={() => navigate(`/documents/${id}/edit`)}>עריכה</Button>} />
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-[430px] items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button type="button" onClick={() => goBack(`/documents/${id}`)} className="h-11 rounded-full px-3 text-sm font-semibold">סגירה</button>
        <h1 className="truncate px-3 text-sm font-semibold">{document.title}</h1>
        <span className="w-14" />
      </div>
      <div className="mx-auto min-h-0 w-full max-w-[430px] flex-1 overflow-auto px-3 py-4">
        <FileViewer fileId={document.fileId} mime={document.fileType} title={document.title} present />
      </div>
      <p className="pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs text-white/60">הגדילו את בהירות המסך לפני ההצגה בדלפק</p>
    </div>
  );
}

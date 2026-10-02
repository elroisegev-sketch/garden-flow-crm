"use client";

import { Download, Minus, Plus, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadFileBlob } from "@/lib/repository";
import { safeFileName } from "@/lib/links";

export function FileViewer({
  fileId,
  mime,
  title,
  present = false,
}: {
  fileId: string;
  mime: string;
  title: string;
  present?: boolean;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    loadFileBlob(fileId)
      .then((next) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(next);
        setBlob(next);
        setUrl(objectUrl);
        setLoadedId(fileId);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "לא ניתן לפתוח את הקובץ");
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  async function share() {
    if (!blob || !navigator.share) return;
    const file = new File([blob], safeFileName(title, mime), { type: mime });
    try {
      await navigator.share({ files: [file], title });
    } catch {
      // The user dismissed the share sheet.
    }
  }

  if (error) return <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-danger">{error}</p>;
  if (!url || !blob || loadedId !== fileId) return <div className="grid h-64 place-items-center rounded-3xl bg-white text-sm text-muted">טוענים את המסמך…</div>;

  const controls = (
    <div className="flex items-center justify-center gap-2">
      <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-ink" onClick={() => setScale((value) => Math.max(0.6, value - 0.25))} aria-label="הקטנה">
        <Minus className="size-4" />
      </button>
      <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-ink" onClick={() => setScale((value) => Math.min(4, value + 0.25))} aria-label="הגדלה">
        <Plus className="size-4" />
      </button>
      <a href={url} download={safeFileName(title, mime)} className="grid size-11 place-items-center rounded-full bg-white text-ink" aria-label="הורדה">
        <Download className="size-4" />
      </a>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-ink" onClick={() => void share()} aria-label="שיתוף">
          <Share2 className="size-4" />
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-3">
      {controls}
      <div className={present ? "overflow-auto" : "max-h-[70vh] overflow-auto rounded-3xl bg-white"}>
        {mime === "application/pdf" ? <PdfPages blob={blob} scale={scale} /> : (
          // Blob previews are created on device and cannot go through the image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className="mx-auto block max-w-none origin-top" style={{ width: `${scale * 100}%` }} />
        )}
      </div>
    </div>
  );
}

function PdfPages({ blob, scale }: { blob: Blob; scale: number }) {
  const holder = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const host = holder.current;
    async function run() {
      setRendering(true);
      setError(null);
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = new Uint8Array(await blob.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data }).promise;
      if (!host || cancelled) return;
      host.replaceChildren();
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: Math.max(scale, 1) * 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "mb-3 h-auto w-full rounded-2xl bg-white";
        await page.render({ canvas, viewport }).promise;
        if (cancelled) return;
        host.appendChild(canvas);
      }
      if (!cancelled) setRendering(false);
    }
    run().catch(() => {
      if (!cancelled) setError("לא ניתן להציג את ה-PDF. אפשר להוריד אותו מהכפתור למעלה.");
    });
    return () => {
      cancelled = true;
    };
  }, [blob, scale]);

  return (
    <div>
      {error ? <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm">{error}</p> : null}
      {rendering && !error ? <div className="grid h-40 place-items-center text-sm text-muted">מציגים PDF…</div> : null}
      <div ref={holder} />
    </div>
  );
}

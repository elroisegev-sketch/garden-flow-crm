"use client";

import { ChevronRight, X } from "lucide-react";
import { useState, type ButtonHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { goBack } from "@/lib/router";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "emergency" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-base font-semibold transition active:scale-[0.98] disabled:opacity-50",
        variant === "primary" && "bg-navy text-white",
        variant === "secondary" && "border border-line bg-white text-ink",
        variant === "ghost" && "bg-transparent text-navy",
        variant === "danger" && "border border-danger/20 bg-white text-danger",
        variant === "emergency" && "h-16 rounded-3xl bg-danger text-lg text-white",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

const controlClass = "h-12 w-full rounded-2xl border border-line bg-white px-4 text-base outline-none focus:border-navy";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-28 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-navy", props.className)} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlClass, props.className)} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 text-start">
      <span className="font-medium">{label}</span>
      <span className={cn("relative h-7 w-12 rounded-full transition", checked ? "bg-navy" : "bg-line")}>
        <span className={cn("absolute top-0.5 size-6 rounded-full bg-white transition", checked ? "start-0.5" : "end-0.5")} />
      </span>
    </button>
  );
}

export function ScreenHeader({ title, back = "/", action }: { title: ReactNode; back?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <button type="button" onClick={() => goBack(back)} className="grid size-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="חזרה">
        <ChevronRight className="size-5" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">{title}</h1>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl bg-white p-4 shadow-card", className)}>{children}</section>;
}

export function Ltr({ children }: { children: ReactNode }) {
  return <bdi dir="ltr">{children}</bdi>;
}

export function Facts({ items }: { items: Array<{ label: string; value: string }> }) {
  const visible = items.filter((item) => item.value.trim());
  if (!visible.length) return null;
  return (
    <dl className="divide-y divide-line">
      {visible.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 py-3">
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className="text-end font-medium">{/[\u0590-\u05FF]/.test(item.value) ? item.value : <Ltr>{item.value}</Ltr>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white px-5 py-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function OfflineBadge() {
  return <p className="text-sm font-semibold text-ok" dir="ltr">✓ Available Offline</p>;
}

export function PersonFilter({ value, travelers, onChange }: { value: string; travelers: { id: string; name: string }[]; onChange: (value: string) => void }) {
  const options = [{ id: "all", name: "הכל" }, ...travelers.map((traveler) => ({ id: traveler.id, name: traveler.name })), { id: "shared", name: "שנינו" }];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn("h-10 shrink-0 rounded-full px-4 text-sm font-semibold", value === option.id ? "bg-navy text-white" : "bg-white text-ink")}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}

export function ChoiceList({ options, value, onChange }: { options: { id: string; label: string }[]; value: string[]; onChange: (value: string[]) => void }) {
  if (!options.length) return <p className="text-sm text-muted">אין עדיין מסמכים לקישור. אפשר להוסיף אותם אחר כך.</p>;
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = value.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(selected ? value.filter((id) => id !== option.id) : [...value, option.id])}
            className={cn("flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 py-3 text-start", selected ? "border-navy bg-gold-soft" : "border-line bg-white")}
          >
            <span>{option.label}</span>
            <span className={cn("grid size-5 place-items-center rounded-full border text-xs", selected ? "border-navy bg-navy text-white" : "border-line")}>{selected ? "✓" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

export function FormScaffold({
  title,
  back,
  submitLabel,
  onSubmit,
  children,
  footer,
}: {
  title: string;
  back?: string;
  submitLabel: string;
  onSubmit: () => Promise<void>;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        try {
          await onSubmit();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "השמירה נכשלה");
        } finally {
          setPending(false);
        }
      }}
    >
      <ScreenHeader title={title} back={back} />
      {children}
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "שומרים…" : submitLabel}
      </Button>
      {footer}
    </form>
  );
}

export function Chooser({ title, options, onClose }: { title: string; options: { label: string; href: string }[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/40 p-4">
      <div className="w-full max-w-[430px] rounded-3xl bg-paper p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white" aria-label="סגירה">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-2">
          {options.map((option) => (
            <a key={option.href + option.label} href={`#${option.href}`} onClick={onClose} className="flex h-14 items-center rounded-2xl bg-white px-4 font-semibold shadow-card">
              {option.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

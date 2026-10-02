"use client";

import { Delete } from "lucide-react";
import { useEffect, useRef } from "react";

export function PinPad({
  value,
  maxLength = 6,
  completeLength,
  onChange,
  onComplete,
  error,
}: {
  value: string;
  maxLength?: number;
  completeLength?: number;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string | null;
}) {
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const current = valueRef.current;
      if (/^\d$/.test(event.key)) {
        if (current.length >= maxLength) return;
        const next = current + event.key;
        onChangeRef.current(next);
        if (completeLength && next.length === completeLength) onCompleteRef.current?.(next);
        return;
      }
      if (event.key === "Backspace") onChangeRef.current(current.slice(0, -1));
      if (event.key === "Enter" && current.length >= 4) onCompleteRef.current?.(current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completeLength, maxLength]);

  function press(digit: string) {
    if (value.length >= maxLength) return;
    const next = value + digit;
    onChange(next);
    if (completeLength && next.length === completeLength) onComplete?.(next);
  }

  return (
    <div className={error ? "shake" : undefined}>
      <div className="mb-6 flex justify-center gap-3" aria-label="קוד">
        {Array.from({ length: Math.max(value.length, completeLength ?? 4) }).map((_, index) => (
          <span key={index} className={`size-3 rounded-full ${index < value.length ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
      {error ? <p className="mb-4 text-center text-sm text-red-200">{error}</p> : null}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button key={digit} type="button" onClick={() => press(digit)} className="h-16 rounded-2xl bg-white/10 text-2xl font-semibold text-white">
            {digit}
          </button>
        ))}
        <button type="button" onClick={() => value.length >= 4 && onComplete?.(value)} className="h-16 rounded-2xl text-sm font-semibold text-white/80">
          אישור
        </button>
        <button type="button" onClick={() => press("0")} className="h-16 rounded-2xl bg-white/10 text-2xl font-semibold text-white">
          0
        </button>
        <button type="button" onClick={() => onChange(value.slice(0, -1))} className="grid h-16 place-items-center rounded-2xl text-white" aria-label="מחיקה">
          <Delete className="size-6" />
        </button>
      </div>
    </div>
  );
}

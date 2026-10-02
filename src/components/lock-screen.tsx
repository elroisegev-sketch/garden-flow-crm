"use client";

import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { unlockWithBiometric, unlockWithPin } from "@/lib/repository";
import { PinPad } from "./pin-pad";
import { useVault } from "./vault-provider";

export function LockScreen() {
  const { settings, setUnlocked } = useVault();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(value: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlockWithPin(value);
      setUnlocked(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "הקוד שגוי.");
      setPin("");
    } finally {
      setBusy(false);
    }
  }

  async function biometric() {
    setError(null);
    try {
      await unlockWithBiometric();
      setUnlocked(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Face ID לא זמין.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-navy px-6 pt-[max(3rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto w-full max-w-[430px] flex-1">
        <p className="text-center text-sm tracking-[0.2em] text-gold">TRAVEL VAULT</p>
        <h1 className="mt-3 text-center text-3xl font-semibold">הכספת נעולה</h1>
        <p className="mt-2 text-center text-sm text-white/70">המסמכים מוצפנים במכשיר.</p>
        {settings.biometricEnabled ? (
          <button type="button" onClick={() => void biometric()} className="mx-auto mt-8 flex h-14 items-center gap-2 rounded-full bg-white/10 px-5 font-semibold">
            <Fingerprint className="size-5" />
            Face ID / Touch ID
          </button>
        ) : null}
        <div className="mt-10">
          <PinPad value={pin} completeLength={settings.pinLength || 4} onChange={setPin} onComplete={(value) => void submit(value)} error={error} />
        </div>
      </div>
    </div>
  );
}

export function BootSplash({ error }: { error?: string | null }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div>
        <p className="text-sm tracking-[0.2em] text-gold">TRAVEL VAULT</p>
        <h1 className="mt-3 text-3xl font-semibold">ארנק הנסיעות</h1>
        <p className="mt-3 text-sm text-muted">{error ?? "מכינים את המסמכים במכשיר…"}</p>
      </div>
    </div>
  );
}

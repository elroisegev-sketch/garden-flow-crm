"use client";

import dynamic from "next/dynamic";
import { BootSplash } from "@/components/lock-screen";

const VaultApp = dynamic(() => import("@/components/vault-app").then((mod) => mod.VaultApp), {
  ssr: false,
  loading: () => <BootSplash />,
});

export default function Page() {
  return <VaultApp />;
}

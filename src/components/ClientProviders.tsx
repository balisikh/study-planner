"use client";

import { PlannerProvider } from "@/context/PlannerProvider";
import { AppShell } from "@/components/AppShell";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PlannerProvider>
      <AppShell>{children}</AppShell>
    </PlannerProvider>
  );
}

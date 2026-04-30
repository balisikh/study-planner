"use client";

import { useEffect, useState } from "react";
import { ClientProviders } from "@/components/ClientProviders";

export function ClientRoot({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ClientProviders>{children}</ClientProviders>;
}


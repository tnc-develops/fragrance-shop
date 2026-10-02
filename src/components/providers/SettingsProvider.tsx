"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { ShopSettings } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const SettingsContext = createContext<ShopSettings | null>(null);

export function SettingsProvider({ settings, children }: { settings: ShopSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): ShopSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

export function usePrice() {
  const settings = useSettings();
  return (amount: number) => formatPrice(amount, settings);
}

const noop = () => () => {};

/** False during SSR and the first client render; true once persisted client state is safe to show. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

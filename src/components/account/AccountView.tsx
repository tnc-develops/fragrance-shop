"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/toast";
import { useHydrated } from "@/components/providers/SettingsProvider";
import { AuthForms } from "./AuthForms";
import { AccountDashboard } from "./AccountDashboard";

/** Only same-site paths are honoured, so `?next=` can't be used as an open redirect. */
const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);

export function AccountView({ next }: { next?: string }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);

  if (!hydrated) return <div className="mx-auto h-80 max-w-md animate-pulse bg-mist" />;

  if (!token || !user) {
    return (
      <AuthForms
        onSuccess={() => {
          toast(`Welcome, ${useAuth.getState().user?.name.split(" ")[0] ?? ""}`);
          const target = safeNext(next);
          if (target) router.replace(target);
        }}
      />
    );
  }

  return <AccountDashboard user={user} token={token} />;
}

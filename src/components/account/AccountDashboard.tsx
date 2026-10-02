"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, LogOut } from "lucide-react";
import { api, ApiError, errorMessage } from "@/lib/api";
import type { Order, User } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/toast";
import { OrderRow } from "@/components/orders/OrderParts";

function Orders({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ items: Order[] }>("/orders/mine", { token })
      .then((res) => !cancelled && setOrders(res.items))
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) useAuth.getState().logout();
        setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) return <p className="text-sm text-espresso">{error}</p>;
  if (!orders) {
    return (
      <div className="flex justify-center py-12 text-taupe">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!orders.length) {
    return (
      <div className="border border-dashed border-sand py-14 text-center">
        <p className="font-serif text-2xl text-charcoal">No orders yet</p>
        <p className="mt-2 text-sm text-ink/60">When you place an order it will appear here.</p>
        <Link href="/shop" className="btn-primary mt-6">
          Start shopping
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </div>
  );
}

function ProfileForm({ user, token }: { user: User; token: string }) {
  const setUser = useAuth((s) => s.setUser);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await api<{ user: User }>("/auth/me", {
        method: "PATCH",
        token,
        body: { name: String(data.get("name")), phone: String(data.get("phone")) || null },
      });
      setUser(res.user);
      toast("Profile updated");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input id="name" name="name" required minLength={2} defaultValue={user.name} className="input" />
      </div>
      <div>
        <label htmlFor="acc-email" className="label">
          Email
        </label>
        <input id="acc-email" value={user.email} disabled className="input opacity-70" />
      </div>
      <div>
        <label htmlFor="phone" className="label">
          Phone
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} className="input" />
      </div>
      <button type="submit" disabled={busy} className="btn-outline w-full">
        {busy && <Loader2 size={14} className="animate-spin" />} Save details
      </button>
    </form>
  );
}

function PasswordForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      const res = await api<{ token: string }>("/auth/change-password", {
        method: "POST",
        token,
        body: { currentPassword: data.get("currentPassword"), newPassword: data.get("newPassword") },
      });
      const { user, setSession } = useAuth.getState();
      if (res.token && user) setSession(res.token, user);
      form.reset();
      toast("Password changed. You've been signed out on other devices.");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="label">
          Current password
        </label>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className="input" />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">
          New password
        </label>
        <input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      <button type="submit" disabled={busy} className="btn-outline w-full">
        {busy && <Loader2 size={14} className="animate-spin" />} Change password
      </button>
    </form>
  );
}

export function AccountDashboard({ user, token }: { user: User; token: string }) {
  const logout = useAuth((s) => s.logout);

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl text-charcoal">My orders</h2>
          <Link href="/track" className="text-xs text-ink/60 hover:text-gold">
            Track a guest order
          </Link>
        </div>
        <Orders token={token} />
      </section>

      <aside className="space-y-8">
        <div className="space-y-5 border border-sand bg-cream p-6">
          <div>
            <p className="eyebrow text-taupe">Signed in as</p>
            <p className="mt-1 font-serif text-2xl text-charcoal">{user.name}</p>
          </div>
          <ProfileForm user={user} token={token} />
        </div>
        <div className="space-y-5 border border-sand bg-cream p-6">
          <h3 className="eyebrow text-ink/70">Password</h3>
          <PasswordForm token={token} />
        </div>
        <button
          onClick={() => {
            logout();
            toast("You've been signed out");
          }}
          className="eyebrow flex items-center gap-2 text-ink/70 transition-colors hover:text-espresso"
        >
          <LogOut size={15} /> Sign out
        </button>
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { errorMessage } from "@/lib/api";
import { login, register } from "@/store/auth";

export function AuthForms({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(data.email, data.password);
      else await register({ name: data.name, email: data.email, password: data.password, phone: data.phone || undefined });
      onSuccess();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 grid grid-cols-2 border-b border-sand">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={clsx(
              "eyebrow -mb-px border-b-2 pb-4 transition-colors",
              mode === m ? "border-gold text-charcoal" : "border-transparent text-taupe hover:text-ink",
            )}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form key={mode} onSubmit={submit} className="space-y-5">
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input id="name" name="name" required minLength={2} autoComplete="name" className="input" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        {mode === "register" && (
          <div>
            <label htmlFor="phone" className="label">
              Phone (optional)
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" />
          </div>
        )}
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="input"
          />
          {mode === "register" && <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>}
        </div>

        {error && (
          <p role="alert" className="border border-espresso/30 bg-espresso/5 px-4 py-3 text-xs text-espresso">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <Loader2 size={15} className="animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

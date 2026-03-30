"use client";

import { useMemo, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(
    () => searchParams.get("callbackUrl") || "/dashboard",
    [searchParams]
  );
  const defaultSubdomain = useMemo(
    () => searchParams.get("tenant") || searchParams.get("subdomain") || "",
    [searchParams]
  );
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState(defaultSubdomain);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password || !subdomain) {
      setFormError("Email, password, and subdomain are required.");
      return;
    }

    startTransition(() => {
      void signIn("credentials", {
        email,
        password,
        subdomain: subdomain.trim().toLowerCase(),
        callbackUrl,
        redirect: true,
      });
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use one of the seeded accounts to log in. Subdomain is usually &quot;demo&quot;.
        </p>

        {(error || formError) && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError || (error === "tenant-session"
              ? "Your previous session was missing tenant context. Please sign in again."
              : error === "session-expired"
                ? "Your session expired and could not be refreshed. Please sign in again."
              : "Sign in failed. Please check your credentials.")}
          </div>
        )}

        {success === "password-reset" && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Password reset successful. Please sign in with your new password.
          </div>
        )}

        {success === "registered" && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Account created successfully. Please sign in.
          </div>
        )}

        {success === "joined" && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Invite accepted. Please sign in to enter the workspace.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="subdomain">
              Subdomain
            </label>
            <div className="mt-1 flex rounded-md">
              <input
                id="subdomain"
                type="text"
                autoComplete="organization"
                className="w-full rounded-l-md border border-slate-300 border-r-0 px-3 py-2 text-sm outline-none focus:border-slate-500"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
              <span className="flex items-center rounded-r-md border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                .fixapp.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/signup"
            className="text-slate-600 hover:text-slate-900 hover:underline"
          >
            Create an account
          </Link>
          <Link
            href="/forgot-password"
            className="text-slate-600 hover:text-slate-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Demo accounts:
          <ul className="mt-2 list-disc pl-5">
            <li>admin@fixapp.com / admin123</li>
            <li>owner@fixapp.com / owner123</li>
            <li>member@fixapp.com / member123</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { backendApi, type InvitePreview } from "@/lib/backend-api";

type Props = {
  token: string;
  invite: InvitePreview | null;
};

export default function JoinInviteClient({ token, invite }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [name, setName] = useState(invite?.inviteeName || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!invite) {
      setError("This invite could not be loaded.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await backendApi.acceptInvite({
          token,
          password,
          name: name.trim() || undefined,
        });

        const signInResult = await signIn("credentials", {
          email: result.email,
          password,
          subdomain: result.tenantSubdomain,
          callbackUrl: "/dashboard",
          redirect: false,
        });

        if (signInResult?.error) {
          router.push(`/login?success=joined&subdomain=${encodeURIComponent(result.tenantSubdomain)}`);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (acceptError) {
        setError(acceptError instanceof Error ? acceptError.message : "Unable to accept invite.");
      }
    });
  };

  if (!invite) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Invite unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            This invite may be invalid, expired, or revoked.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Join {invite.tenantName}</h1>
          <p className="text-sm text-slate-600">
            You were invited as {invite.roleName || "a team member"}.
          </p>
          <p className="text-sm text-slate-500">
            Invite email: <span className="font-medium text-slate-700">{invite.email}</span>
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Required for new accounts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Use your existing Fixapp password if you already have an account. Otherwise we&apos;ll create one for {invite.email}.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isPending ? "Joining team..." : "Accept invite"}
          </button>
        </form>
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginClient() {
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
    <AuthShell
      eyebrow="Sign in"
      title="Access your workspace"
      description="Sign in to manage RCAs, assets, and team workflows in your tenant."
      footer={(
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/signup"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Create an account
          </Link>
          <Link
            href="/forgot-password"
            className="font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
      )}
    >
        {(error || formError) && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError || (error === "tenant-session"
              ? "Your previous session was missing tenant context. Please sign in again."
              : error === "session-expired"
                ? "Your session expired and could not be refreshed. Please sign in again."
              : "Sign in failed. Please check your credentials.")}
          </div>
        )}

        {success === "password-reset" && (
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            Password reset successful. Please sign in with your new password.
          </div>
        )}

        {success === "registered" && (
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            Account created successfully. Please sign in.
          </div>
        )}

        {success === "joined" && (
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            Invite accepted. Please sign in to enter the workspace.
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">
              Subdomain
            </Label>
            <div className="flex rounded-md">
              <Input
                id="subdomain"
                type="text"
                autoComplete="organization"
                className="rounded-r-none border-r-0"
                placeholder="workspace"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
              <span className="flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                .fixapp.com
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
    </AuthShell>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSubdomain =
    searchParams.get("tenant") || searchParams.get("subdomain") || "";
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenantName: "",
    subdomain: defaultSubdomain,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.tenantName || !formData.subdomain) {
      setFormError("All fields are required.");
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            tenantName: formData.tenantName,
            subdomain: formData.subdomain,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setFormError(data.error || "Signup failed. Please try again.");
          return;
        }

        // Redirect to login with success message
        router.push("/login?success=registered");
      } catch (error) {
        setFormError("An error occurred. Please try again.");
      }
    });
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Set up your FixApp workspace"
      description="Create a tenant, claim your subdomain, and start organizing operational work in one place."
      footer={(
        <div className="text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      )}
    >
        {formError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="alex@company.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName">
              Organization Name
            </Label>
            <Input
              id="tenantName"
              name="tenantName"
              type="text"
              autoComplete="organization"
              placeholder="Northwind Manufacturing"
              value={formData.tenantName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">
              Subdomain
            </Label>
            <div className="flex rounded-md">
              <Input
                id="subdomain"
                name="subdomain"
                type="text"
                autoComplete="subdomain"
                placeholder="northwind"
                className="rounded-r-none border-r-0"
                value={formData.subdomain}
                onChange={handleChange}
              />
              <span className="flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                .fixapp.com
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This will be your unique URL (e.g., mycompany.fixapp.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
    </AuthShell>
  );
}

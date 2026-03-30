import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, signupTenant } from "@/lib/server/frontend-account";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { email, password, name, tenantName, subdomain } = body;
    
    if (!email || !password || !name || !tenantName || !subdomain) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 63) {
      return NextResponse.json(
        { error: "Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only" },
        { status: 400 }
      );
    }

    const result = await signupTenant({
      email,
      password,
      name,
      tenantName,
      subdomain,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json(
      { error: handled.message },
      { status: handled.status }
    );
  }
}

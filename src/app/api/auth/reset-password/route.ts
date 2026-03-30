import { NextRequest, NextResponse } from "next/server";
import {
  handleRouteError,
  resetPassword,
} from "@/lib/server/frontend-account";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password } = body;

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Token, email, and password are required" },
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

    const result = await resetPassword({ token, email, password });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json(
      { error: handled.message },
      { status: handled.status }
    );
  }
}

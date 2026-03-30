import { NextRequest, NextResponse } from "next/server";
import {
  handleRouteError,
  issuePasswordReset,
} from "@/lib/server/frontend-account";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const result = await issuePasswordReset(email);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json(
      { error: handled.message },
      { status: handled.status }
    );
  }
}

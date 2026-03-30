import { NextRequest, NextResponse } from "next/server";
import {
  acceptInviteRecord,
  handleRouteError,
} from "@/lib/server/frontend-account";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    const result = await acceptInviteRecord({
      token,
      password,
      name: typeof body.name === "string" ? body.name : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const handled = handleRouteError(error);
    return NextResponse.json({ error: handled.message }, { status: handled.status });
  }
}

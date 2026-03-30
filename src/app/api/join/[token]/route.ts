import { NextResponse } from "next/server";
import { getInvitePreviewRecord } from "@/lib/server/frontend-account";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { token } = await params;
  const invite = await getInvitePreviewRecord(token);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  return NextResponse.json(invite);
}

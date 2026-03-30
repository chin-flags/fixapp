import { getInvitePreviewRecord } from "@/lib/server/frontend-account";
import JoinInviteClient from "./JoinInviteClient";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function JoinInvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await getInvitePreviewRecord(token).catch(() => null);

  return <JoinInviteClient token={token} invite={invite} />;
}

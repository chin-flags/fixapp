import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import AssetsClient from "./AssetsClient";

export default async function AssetsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.accessToken) {
    redirect("/login?callbackUrl=/assets");
  }

  return <AssetsClient />;
}

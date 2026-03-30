import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { fetchTickets } from "@/lib/backend-api";
import TicketsClient from "./TicketsClient";

export default async function TicketsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tickets = await fetchTickets(session.user.accessToken);

  return (
    <TicketsClient tickets={tickets} />
  );
}

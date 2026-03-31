import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import {
  getRcaDetailForTenantUser,
} from "@/lib/server/operations-records";
import RcaAnalysisWorkspace from "../RcaAnalysisWorkspace";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RcaDiagramPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  if (!session.user.tenantId) {
    redirect("/login?callbackUrl=/rca");
  }

  const rca = await getRcaDetailForTenantUser(
    {
      id: session.user.id,
      tenantId: session.user.tenantId,
      role: session.user.role,
    },
    id,
  );

  if (!rca) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1800px] space-y-4">
        <div className="flex justify-end">
          <Link
            href={`/rca/${rca.id}`}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back to RCA
          </Link>
        </div>
        <RcaAnalysisWorkspace
          title={rca.title}
          description={rca.description}
          fishbones={rca.fishbones}
          brainstormingContributions={rca.brainstormingContributions}
          solutions={rca.solutions.map((solution) => ({
            id: solution.id,
            description: solution.description,
            status: solution.status,
            dueDate: solution.dueDate,
          }))}
          isExpanded
        />
      </div>
    </main>
  );
}

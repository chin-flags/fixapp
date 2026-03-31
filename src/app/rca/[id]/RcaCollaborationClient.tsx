"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { buildBackendProxyUrl } from "@/lib/backend-endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RcaAnalysisWorkspace from "./RcaAnalysisWorkspace";
import RcaTicketLinkManager from "./RcaTicketLinkManager";

type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantRoleId?: string | null;
  tenantRoleName?: string | null;
  responsibilityProfile?: Record<string, unknown> | null;
};

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
};

type TeamMember = {
  id: string;
  userId: string;
  addedAt: string;
  user: UserSummary;
};

type BrainstormingContribution = {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: UserSummary;
  attachments: Attachment[];
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  parentCommentId?: string | null;
  mentions?: string[] | null;
  author: UserSummary;
  attachments: Attachment[];
};

type SolutionApprovalEvent = {
  id: string;
  action: string;
  notes?: string | null;
  createdAt: string;
  actor: UserSummary;
};

type Solution = {
  id: string;
  description: string;
  assignedToId?: string | null;
  status: string;
  dueDate?: string | null;
  completedAt?: string | null;
  submittedForApprovalAt?: string | null;
  approvedAt?: string | null;
  approvedById?: string | null;
  updatedAt: string;
  assignedTo?: UserSummary | null;
  approvedBy?: UserSummary | null;
  attachments: Attachment[];
  approvalEvents: SolutionApprovalEvent[];
};

type FishboneCause = {
  id: string;
  category: string;
  cause: string;
  createdAt: string;
};

type RcaDetail = {
  id: string;
  rcaNumber: string;
  title: string;
  description: string;
  status: string;
  equipmentName?: string | null;
  location?: string | null;
  createdById: string;
  owner?: UserSummary | null;
  attachments: Attachment[];
  teamMembers: TeamMember[];
  brainstormingContributions: BrainstormingContribution[];
  comments: Comment[];
  fishbones: FishboneCause[];
  solutions: Solution[];
  availableTeamMembers: UserSummary[];
  maintenanceTicket?: {
    id: string;
    ticketNumber: string;
    equipmentName: string;
    location: string;
    status: string;
  } | null;
};

type TicketOption = {
  id: string;
  ticketNumber: string;
  equipmentName: string;
  location: string;
  issueDescription: string;
  requiresRca: boolean;
};

type Props = {
  initialRca: RcaDetail;
  accessToken: string;
  currentUserId: string;
  currentUserRole: string;
  tickets: TicketOption[];
  attachmentBaseUrl: string;
  canManageTicketLink?: boolean;
};

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderAttachmentSize(bytesText: string) {
  const bytes = Number(bytesText);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return bytesText;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSolutionStatus(status: string) {
  return status.replace(/_/g, " ");
}

function SolutionStatusBadge({ status }: { status: string }) {
  const statusClasses =
    status === "approved"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "submitted"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : status === "completed"
          ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : status === "blocked"
            ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            : "border-border bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClasses}`}>
      {formatSolutionStatus(status)}
    </span>
  );
}

function AttachmentList({
  attachments,
  attachmentBaseUrl,
}: {
  attachments: Attachment[];
  attachmentBaseUrl: string;
}) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={`${attachmentBaseUrl}${attachment.fileUrl}`}
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
        >
          <p className="font-medium text-foreground">{attachment.fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {attachment.fileType || "Attachment"} · {renderAttachmentSize(attachment.fileSize)}
          </p>
        </a>
      ))}
    </div>
  );
}

function SolutionCard({
  solution,
  people,
  canManageSolutions,
  canWorkSolution,
  canApproveSolution,
  isPending,
  onUpdate,
  onSubmit,
  onApprove,
}: {
  solution: Solution;
  people: UserSummary[];
  canManageSolutions: boolean;
  canWorkSolution: boolean;
  canApproveSolution: boolean;
  isPending: boolean;
  onUpdate: (solutionId: string, payload: Record<string, string | null>) => void;
  onSubmit: (solutionId: string) => void;
  onApprove: (solutionId: string) => void;
}) {
  const [description, setDescription] = useState(solution.description);
  const [assignedToId, setAssignedToId] = useState(solution.assignedToId ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(solution.dueDate));
  const [status, setStatus] = useState(
    ["pending", "in_progress", "blocked", "completed"].includes(solution.status)
      ? solution.status
      : "pending"
  );

  useEffect(() => {
    setDescription(solution.description);
    setAssignedToId(solution.assignedToId ?? "");
    setDueDate(toDateInputValue(solution.dueDate));
    setStatus(
      ["pending", "in_progress", "blocked", "completed"].includes(solution.status)
        ? solution.status
        : "pending"
    );
  }, [solution]);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SolutionStatusBadge status={solution.status} />
          <p className="text-sm text-muted-foreground">
            {solution.assignedTo
              ? `Assigned to ${solution.assignedTo.name}`
              : "Unassigned"}
            {solution.dueDate ? ` · Due ${formatDateTime(solution.dueDate)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageSolutions && solution.status === "completed" ? (
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => onSubmit(solution.id)}>
              Submit for Approval
            </Button>
          ) : null}
          {canApproveSolution && solution.status === "submitted" ? (
            <Button type="button" size="sm" disabled={isPending} onClick={() => onApprove(solution.id)}>
              Approve
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={!canManageSolutions || isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring disabled:bg-muted"
        />
        <select
          value={assignedToId}
          onChange={(event) => setAssignedToId(event.target.value)}
          disabled={!canManageSolutions || isPending}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring disabled:bg-muted"
        >
          <option value="">Unassigned</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={!canManageSolutions || isPending}
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={!canWorkSolution || isPending || solution.status === "submitted"}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring disabled:bg-muted"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
          <option value="completed">Completed</option>
        </select>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            onUpdate(solution.id, {
              description,
              assignedToId: assignedToId || null,
              dueDate: dueDate || null,
              status,
            })
          }
        >
          Save
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {solution.completedAt ? <span>Completed {formatDateTime(solution.completedAt)}</span> : null}
        {solution.submittedForApprovalAt ? (
          <span>Submitted {formatDateTime(solution.submittedForApprovalAt)}</span>
        ) : null}
        {solution.approvedAt ? (
          <span>
            Approved {formatDateTime(solution.approvedAt)}
            {solution.approvedBy ? ` by ${solution.approvedBy.name}` : ""}
          </span>
        ) : null}
      </div>

      {solution.approvalEvents.length ? (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Approval Trail</p>
          <div className="mt-2 space-y-2">
            {solution.approvalEvents.map((event) => (
              <div key={event.id} className="text-sm text-foreground">
                <span className="font-medium capitalize">{event.actor.name}</span>{" "}
                {formatSolutionStatus(event.action)} on {formatDateTime(event.createdAt)}
                {event.notes ? ` · ${event.notes}` : ""}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FishboneDiagram({ fishbones }: { fishbones: FishboneCause[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, FishboneCause[]>();

    for (const entry of fishbones) {
      const key = entry.category?.trim() || "Other";
      const current = map.get(key) ?? [];
      current.push(entry);
      map.set(key, current);
    }

    return [...map.entries()].sort((left, right) => left[0].localeCompare(right[0]));
  }, [fishbones]);

  if (!groups.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
        No fishbone causes have been captured yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex min-h-24 items-center justify-between gap-4 border-b border-border bg-muted/50 px-4 py-3">
          <div className="max-w-xs rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
            Effect: {groups.flatMap(([, causes]) => causes).length} contributing causes tied to this RCA
          </div>
          <div className="hidden h-px flex-1 bg-border md:block" />
          <div className="hidden text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground md:block">
            Fishbone
          </div>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {groups.map(([category, causes], index) => (
            <div
              key={category}
              className={cn("rounded-xl border px-4 py-4", 
                index % 2 === 0
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {category}
                </p>
              </div>
              <div className="mt-4 space-y-2">
                {causes.map((cause) => (
                  <div key={cause.id} className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground shadow-sm">
                    {cause.cause}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Categories are grouped from recorded fishbone causes for this investigation.
      </p>
    </div>
  );
}

export default function RcaCollaborationClient({
  initialRca,
  accessToken,
  currentUserId,
  currentUserRole,
  tickets,
  attachmentBaseUrl,
  canManageTicketLink,
}: Props) {
  const [rca, setRca] = useState(initialRca);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [brainstormTitle, setBrainstormTitle] = useState("");
  const [brainstormContent, setBrainstormContent] = useState("");
  const [brainstormFiles, setBrainstormFiles] = useState<File[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [solutionDescription, setSolutionDescription] = useState("");
  const [solutionAssignedToId, setSolutionAssignedToId] = useState("");
  const [solutionDueDate, setSolutionDueDate] = useState("");

  const canManageTeam =
    currentUserRole === "admin" ||
    currentUserRole === "country_leader" ||
    (currentUserRole === "rca_owner" && rca.owner?.id === currentUserId);
  const canManageSolutions = canManageTeam;
  const availableCandidates = useMemo(
    () => {
      const teamUserIds = new Set(rca.teamMembers.map((member) => member.user.id));
      return rca.availableTeamMembers.filter(
        (candidate) =>
          candidate.id !== rca.owner?.id &&
          candidate.id !== rca.createdById &&
          !teamUserIds.has(candidate.id)
      );
    },
    [rca.availableTeamMembers, rca.createdById, rca.owner?.id, rca.teamMembers]
  );
  const solutionPeople = useMemo(
    () =>
      [...rca.availableTeamMembers].sort((left, right) =>
        left.name.localeCompare(right.name)
      ),
    [rca.availableTeamMembers]
  );

  const replyLookup = useMemo(() => {
    const lookup = new Map<string, Comment[]>();
    for (const comment of rca.comments) {
      if (!comment.parentCommentId) {
        continue;
      }
      const current = lookup.get(comment.parentCommentId) ?? [];
      current.push(comment);
      lookup.set(comment.parentCommentId, current);
    }
    return lookup;
  }, [rca.comments]);

  const rootComments = useMemo(
    () => rca.comments.filter((comment) => !comment.parentCommentId),
    [rca.comments]
  );

  const runRequest = (work: () => Promise<RcaDetail>, successMessage: string, onSuccess?: () => void) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const updated = await work();
        setRca(updated);
        setSuccess(successMessage);
        onSuccess?.();
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
      }
    });
  };

  const parseResponse = async (response: Response) => {
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || payload.error || "Request failed.");
    }

    return (await response.json()) as RcaDetail;
  };

  const onAddTeamMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMemberId) {
      setError("Select a team member to add.");
      return;
    }

    runRequest(
      async () =>
        parseResponse(
          await fetch(`/api/rca/${rca.id}/team-members`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: selectedMemberId }),
          })
        ),
      "Team member added.",
      () => setSelectedMemberId("")
    );
  };

  const onRemoveTeamMember = (memberId: string) => {
    runRequest(
      async () =>
        parseResponse(
          await fetch(`/api/rca/${rca.id}/team-members/${memberId}/remove`, {
            method: "POST",
          })
        ),
      "Team member removed."
    );
  };

  const onAddBrainstorming = (event: React.FormEvent) => {
    event.preventDefault();
    if (!brainstormContent.trim()) {
      setError("Brainstorming content is required.");
      return;
    }

    runRequest(
      async () => {
        const formData = new FormData();
        if (brainstormTitle.trim()) {
          formData.append("title", brainstormTitle.trim());
        }
        formData.append("content", brainstormContent.trim());
        brainstormFiles.forEach((file) => formData.append("attachments", file));

        return parseResponse(
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/brainstorming`), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          })
        );
      },
      "Brainstorming note added.",
      () => {
        setBrainstormTitle("");
        setBrainstormContent("");
        setBrainstormFiles([]);
      }
    );
  };

  const onAddComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentContent.trim()) {
      setError("Comment content is required.");
      return;
    }

    runRequest(
      async () =>
        parseResponse(
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/comments`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              content: commentContent.trim(),
              parentCommentId: replyToId,
            }),
          })
        ),
      replyToId ? "Reply posted." : "Comment posted.",
      () => {
        setCommentContent("");
        setReplyToId(null);
      }
    );
  };

  const onAddSolution = (event: React.FormEvent) => {
    event.preventDefault();
    if (!solutionDescription.trim()) {
      setError("Solution description is required.");
      return;
    }

    runRequest(
      async () =>
        parseResponse(
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/solutions`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              description: solutionDescription.trim(),
              assignedToId: solutionAssignedToId || null,
              dueDate: solutionDueDate || null,
            }),
          })
        ),
      "Solution added.",
      () => {
        setSolutionDescription("");
        setSolutionAssignedToId("");
        setSolutionDueDate("");
      }
    );
  };

  const onUpdateSolution = (solutionId: string, payload: Record<string, string | null>) => {
    runRequest(
      async () =>
        parseResponse(
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/solutions/${solutionId}`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          })
        ),
      "Solution updated."
    );
  };

  const onSubmitSolution = (solutionId: string) => {
    runRequest(
      async () =>
        parseResponse(
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/solutions/${solutionId}/submit`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({}),
          })
        ),
      "Solution submitted for approval."
    );
  };

  const onApproveSolution = (solutionId: string) => {
    runRequest(
      async () =>
        parseResponse(
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/solutions/${solutionId}/approve`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({}),
          })
        ),
      "Solution approved."
    );
  };

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <Badge variant="outline" className="uppercase tracking-wide">
                  {rca.rcaNumber}
                </Badge>
                <CardTitle className="text-2xl">{rca.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Status: {rca.status}</p>
              </div>
              {rca.maintenanceTicket ? (
                <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">{rca.maintenanceTicket.ticketNumber}</p>
                  <p className="text-muted-foreground">
                    {rca.maintenanceTicket.equipmentName} · {rca.maintenanceTicket.location}
                  </p>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Description</p>
              <p className="mt-2 whitespace-pre-wrap">{rca.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-medium text-foreground">Equipment</p>
                <p className="mt-1">{rca.equipmentName || "Not specified"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="mt-1">{rca.location || "Not specified"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Owner</p>
                <p className="mt-1">
                  {rca.owner ? `${rca.owner.name} (${rca.owner.email})` : "Unassigned"}
                </p>
              </div>
            </div>

            {canManageTicketLink ? (
              <RcaTicketLinkManager
                rcaId={rca.id}
                currentTicketId={rca.maintenanceTicket?.id ?? null}
                tickets={tickets}
              />
            ) : null}

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">RCA Attachments</p>
                <Badge variant="secondary">{rca.attachments.length}</Badge>
              </div>
              <div className="mt-3">
                {rca.attachments.length ? (
                  <AttachmentList attachments={rca.attachments} attachmentBaseUrl={attachmentBaseUrl} />
                ) : (
                  <p className="text-muted-foreground">No RCA-level attachments yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Investigation Team</CardTitle>
              <Badge variant="secondary">{rca.teamMembers.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {canManageTeam ? (
              <form className="space-y-3" onSubmit={onAddTeamMember}>
                <div>
                  <label className="block text-sm font-medium text-foreground" htmlFor="team-member">
                    Add specialist or mentor
                  </label>
                  <select
                    id="team-member"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                    value={selectedMemberId}
                    onChange={(event) => setSelectedMemberId(event.target.value)}
                  >
                    <option value="">Select a person</option>
                    {availableCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={isPending || !availableCandidates.length}>
                  {isPending ? "Saving..." : "Add Team Member"}
                </Button>
              </form>
            ) : null}

            <div className="space-y-3">
              {rca.teamMembers.length ? (
                rca.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-xl border border-border px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{member.user.tenantRoleName || member.user.role}</Badge>
                          <Badge variant="secondary">Added {formatDateTime(member.addedAt)}</Badge>
                        </div>
                      </div>
                      {canManageTeam ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => onRemoveTeamMember(member.user.id)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No team members have been added yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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
        openDiagramHref={`/rca/${rca.id}/diagram`}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Discussion</CardTitle>
              <Badge variant="secondary">{rca.comments.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-3" onSubmit={onAddComment}>
              {replyToId ? (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
                  <span>Replying in thread</span>
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={() => setReplyToId(null)}
                  >
                    Clear
                  </button>
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="comment-content">
                  Comment
                </label>
                <textarea
                  id="comment-content"
                  rows={4}
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                  placeholder="Use @name@example.com for lightweight mentions."
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Posting..." : replyToId ? "Post Reply" : "Post Comment"}
              </Button>
            </form>

            <div className="space-y-4">
              {rootComments.length ? (
                rootComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyToId(comment.id)}
                      >
                        Reply
                      </Button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{comment.content}</p>
                    {comment.mentions?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {comment.mentions.map((mention) => (
                          <Badge key={mention} variant="outline">
                            @{mention}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    {replyLookup.get(comment.id)?.length ? (
                      <div className="mt-4 space-y-3 border-l border-border pl-4">
                        {replyLookup.get(comment.id)?.map((reply) => (
                          <div key={reply.id} className="rounded-lg bg-muted/50 px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-foreground">{reply.author.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(reply.createdAt)}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {reply.author.tenantRoleName || reply.author.role}
                              </Badge>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

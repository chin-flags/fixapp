"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { buildBackendProxyUrl } from "@/lib/backend-endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  ticketLinkManager?: React.ReactNode;
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "submitted"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : status === "completed"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : status === "blocked"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

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
          className="block rounded-lg border border-slate-200 px-3 py-2 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <p className="font-medium text-slate-900">{attachment.fileName}</p>
          <p className="mt-1 text-xs text-slate-500">
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
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SolutionStatusBadge status={solution.status} />
          <p className="text-sm text-slate-600">
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
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50"
        />
        <select
          value={assignedToId}
          onChange={(event) => setAssignedToId(event.target.value)}
          disabled={!canManageSolutions || isPending}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50"
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
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50"
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

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
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
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approval Trail</p>
          <div className="mt-2 space-y-2">
            {solution.approvalEvents.map((event) => (
              <div key={event.id} className="text-sm text-slate-700">
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

export default function RcaCollaborationClient({
  initialRca,
  accessToken,
  currentUserId,
  currentUserRole,
  tickets,
  attachmentBaseUrl,
  ticketLinkManager,
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
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/team-members`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
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
          await fetch(buildBackendProxyUrl(`/rcas/${rca.id}/team-members/${memberId}/remove`), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
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
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
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
                <p className="text-sm text-slate-600">Status: {rca.status}</p>
              </div>
              {rca.maintenanceTicket ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-900">{rca.maintenanceTicket.ticketNumber}</p>
                  <p className="text-slate-600">
                    {rca.maintenanceTicket.equipmentName} · {rca.maintenanceTicket.location}
                  </p>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-slate-700">
            <div>
              <p className="font-medium text-slate-900">Description</p>
              <p className="mt-2 whitespace-pre-wrap">{rca.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-medium text-slate-900">Equipment</p>
                <p className="mt-1">{rca.equipmentName || "Not specified"}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Location</p>
                <p className="mt-1">{rca.location || "Not specified"}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Owner</p>
                <p className="mt-1">
                  {rca.owner ? `${rca.owner.name} (${rca.owner.email})` : "Unassigned"}
                </p>
              </div>
            </div>

            {ticketLinkManager}

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">RCA Attachments</p>
                <Badge variant="secondary">{rca.attachments.length}</Badge>
              </div>
              <div className="mt-3">
                {rca.attachments.length ? (
                  <AttachmentList attachments={rca.attachments} attachmentBaseUrl={attachmentBaseUrl} />
                ) : (
                  <p className="text-slate-500">No RCA-level attachments yet.</p>
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
                  <label className="block text-sm font-medium text-slate-700" htmlFor="team-member">
                    Add specialist or mentor
                  </label>
                  <select
                    id="team-member"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                    className="rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{member.user.name}</p>
                        <p className="text-sm text-slate-600">{member.user.email}</p>
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
                <p className="text-sm text-slate-500">
                  No team members have been added yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Corrective Actions</CardTitle>
              <Badge variant="secondary">{rca.solutions.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {canManageSolutions ? (
              <form className="space-y-3 rounded-xl border border-slate-200 p-4" onSubmit={onAddSolution}>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="solution-description">
                    New solution
                  </label>
                  <textarea
                    id="solution-description"
                    rows={3}
                    value={solutionDescription}
                    onChange={(event) => setSolutionDescription(event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Describe the corrective action and expected result."
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="solution-assignee">
                      Assign to
                    </label>
                    <select
                      id="solution-assignee"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      value={solutionAssignedToId}
                      onChange={(event) => setSolutionAssignedToId(event.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {solutionPeople.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name} ({person.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="solution-due-date">
                      Due date
                    </label>
                    <Input
                      id="solution-due-date"
                      type="date"
                      value={solutionDueDate}
                      onChange={(event) => setSolutionDueDate(event.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? "Saving..." : "Add Solution"}
                    </Button>
                  </div>
                </div>
              </form>
            ) : null}

            <div className="space-y-4">
              {rca.solutions.length ? (
                rca.solutions.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    people={solutionPeople}
                    canManageSolutions={canManageSolutions}
                    canWorkSolution={canManageSolutions || solution.assignedToId === currentUserId}
                    canApproveSolution={
                      canManageSolutions && solution.assignedToId !== currentUserId
                    }
                    isPending={isPending}
                    onUpdate={onUpdateSolution}
                    onSubmit={onSubmitSolution}
                    onApprove={onApproveSolution}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No corrective actions defined yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Brainstorming</CardTitle>
              <Badge variant="secondary">{rca.brainstormingContributions.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-3" onSubmit={onAddBrainstorming}>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="brainstorm-title">
                  Title
                </label>
                <Input
                  id="brainstorm-title"
                  value={brainstormTitle}
                  onChange={(event) => setBrainstormTitle(event.target.value)}
                  placeholder="Observation, test, failure pattern..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="brainstorm-content">
                  Findings
                </label>
                <textarea
                  id="brainstorm-content"
                  rows={5}
                  value={brainstormContent}
                  onChange={(event) => setBrainstormContent(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Capture symptoms, hypotheses, evidence, and what to inspect next."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="brainstorm-files">
                  Attach supporting files
                </label>
                <input
                  id="brainstorm-files"
                  type="file"
                  multiple
                  className="mt-1 block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                  onChange={(event) => setBrainstormFiles(Array.from(event.target.files ?? []))}
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add Brainstorming Note"}
              </Button>
            </form>

            <div className="space-y-4">
              {rca.brainstormingContributions.length ? (
                rca.brainstormingContributions.map((contribution) => (
                  <div key={contribution.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {contribution.title || "Untitled contribution"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {contribution.author.name} · {formatDateTime(contribution.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {contribution.author.tenantRoleName || contribution.author.role}
                      </Badge>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      {contribution.content}
                    </p>
                    {contribution.attachments.length ? (
                      <div className="mt-3">
                        <AttachmentList
                          attachments={contribution.attachments}
                          attachmentBaseUrl={attachmentBaseUrl}
                        />
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No brainstorming contributions yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
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
                <label className="block text-sm font-medium text-slate-700" htmlFor="comment-content">
                  Comment
                </label>
                <textarea
                  id="comment-content"
                  rows={4}
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                  <div key={comment.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{comment.author.name}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
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
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>
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
                      <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                        {replyLookup.get(comment.id)?.map((reply) => (
                          <div key={reply.id} className="rounded-lg bg-slate-50 px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate-900">{reply.author.name}</p>
                                <p className="text-xs text-slate-500">
                                  {formatDateTime(reply.createdAt)}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {reply.author.tenantRoleName || reply.author.role}
                              </Badge>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No comments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

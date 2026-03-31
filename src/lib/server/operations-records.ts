import { and, asc, desc, eq, gte, ilike, isNull, lte, or } from "drizzle-orm";
import type { MaintenanceTicket, RCARow, RcaListFilters } from "@/lib/backend-api";
import { db } from "@/lib/db";
import {
  attachments,
  brainstormingContributions,
  comments,
  fishbones,
  maintenanceTickets,
  rcaTeamMembers,
  rcas,
  solutionApprovalEvents,
  solutions,
  users,
} from "@/lib/db/schema";
import { canViewAllRcas } from "@/lib/auth/permissions";

type TenantUser = {
  id: string;
  tenantId: string;
  role: string;
};

type OwnerOption = {
  id: string;
  name: string;
  email: string;
};

type AttachmentRecord = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
};

type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantRoleId?: string | null;
  tenantRoleName?: string | null;
  responsibilityProfile?: Record<string, unknown> | null;
};

export type RcaDetailRecord = {
  id: string;
  rcaNumber: string;
  title: string;
  description: string;
  status: string;
  equipmentName?: string | null;
  location?: string | null;
  createdById: string;
  owner?: UserSummary | null;
  attachments: AttachmentRecord[];
  teamMembers: {
    id: string;
    userId: string;
    addedAt: string;
    user: UserSummary;
  }[];
  brainstormingContributions: {
    id: string;
    title?: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: UserSummary;
    attachments: AttachmentRecord[];
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    parentCommentId?: string | null;
    mentions?: string[] | null;
    author: UserSummary;
    attachments: AttachmentRecord[];
  }[];
  fishbones: {
    id: string;
    category: string;
    cause: string;
    createdAt: string;
  }[];
  solutions: {
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
    attachments: AttachmentRecord[];
    approvalEvents: {
      id: string;
      action: string;
      notes?: string | null;
      createdAt: string;
      actor: UserSummary;
    }[];
  }[];
  availableTeamMembers: UserSummary[];
  maintenanceTicket?: {
    id: string;
    ticketNumber: string;
    equipmentName: string;
    location: string;
    status: string;
  } | null;
};

export type TicketListFilters = {
  q?: string;
  status?: string;
  priority?: string;
  requiresRca?: string;
};

export type TicketDetailRecord = {
  id: string;
  ticketNumber: string;
  equipmentName: string;
  location: string;
  issueDescription: string;
  priority?: string | null;
  impact?: string | null;
  impactScore?: number | null;
  requiresRca: boolean;
  rcaRequiredReason?: string | null;
  status: string;
  createdAt: string;
  rcas: {
    id: string;
    rcaNumber: string;
    title: string;
    status: string;
    createdAt: string;
  }[];
};

function getDb() {
  return db as any;
}

function buildCreatedToDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  date.setHours(23, 59, 59, 999);
  return date;
}

export async function listRcaOwnerOptions(tenantId: string): Promise<OwnerOption[]> {
  const rows = await getDb().query.users.findMany({
    where: and(eq(users.tenantId, tenantId), eq(users.isActive, true)),
    columns: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: [asc(users.name), asc(users.email)],
  });

  return rows as OwnerOption[];
}

export async function listTicketsForTenant(
  tenantId: string,
  filters: TicketListFilters = {},
): Promise<MaintenanceTicket[]> {
  const rows = await getDb().query.maintenanceTickets.findMany({
    where: and(
      eq(maintenanceTickets.tenantId, tenantId),
      filters.status ? eq(maintenanceTickets.status, filters.status) : undefined,
      filters.priority ? eq(maintenanceTickets.priority, filters.priority) : undefined,
      filters.requiresRca === "required"
        ? eq(maintenanceTickets.requiresRca, true)
        : filters.requiresRca === "not_required"
          ? eq(maintenanceTickets.requiresRca, false)
          : undefined,
      filters.q
        ? or(
            ilike(maintenanceTickets.ticketNumber, `%${filters.q}%`),
            ilike(maintenanceTickets.equipmentName, `%${filters.q}%`),
            ilike(maintenanceTickets.location, `%${filters.q}%`),
            ilike(maintenanceTickets.issueDescription, `%${filters.q}%`),
          )
        : undefined,
    ),
    with: {
      rcas: {
        columns: {
          id: true,
          rcaNumber: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: [desc(rcas.createdAt)],
      },
    },
    orderBy: [desc(maintenanceTickets.createdAt)],
  });

  return rows.map((ticket: any) => ({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    equipmentName: ticket.equipmentName,
    location: ticket.location,
    issueDescription: ticket.issueDescription,
    priority: ticket.priority,
    impact: ticket.impact,
    impactScore: ticket.impactScore,
    requiresRca: ticket.requiresRca,
    rcaRequiredReason: ticket.rcaRequiredReason,
    status: ticket.status,
    createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : String(ticket.createdAt),
    rcas: (ticket.rcas ?? []).map((rca: any) => ({
      id: rca.id,
      rcaNumber: rca.rcaNumber,
      title: rca.title,
      status: rca.status,
      createdAt: rca.createdAt instanceof Date ? rca.createdAt.toISOString() : String(rca.createdAt),
    })),
  }));
}

export async function listRcasForTenantUser(
  user: TenantUser,
  filters: RcaListFilters = {},
): Promise<RCARow[]> {
  const createdTo = buildCreatedToDate(filters.createdTo);
  const scopedToUser = !canViewAllRcas(user.role);

  const baseConditions = [
    eq(rcas.tenantId, user.tenantId),
    filters.status ? eq(rcas.status, filters.status) : undefined,
    filters.assignee === "unassigned"
      ? isNull(rcas.ownerId)
      : filters.assignee
        ? eq(rcas.ownerId, filters.assignee)
        : undefined,
    filters.location ? ilike(rcas.location, `%${filters.location}%`) : undefined,
    filters.equipment ? ilike(rcas.equipmentName, `%${filters.equipment}%`) : undefined,
    filters.createdFrom ? gte(rcas.createdAt, new Date(filters.createdFrom)) : undefined,
    createdTo ? lte(rcas.createdAt, createdTo) : undefined,
    filters.q
      ? or(
          ilike(rcas.rcaNumber, `%${filters.q}%`),
          ilike(rcas.title, `%${filters.q}%`),
          ilike(rcas.description, `%${filters.q}%`),
          ilike(rcas.equipmentName, `%${filters.q}%`),
          ilike(rcas.location, `%${filters.q}%`),
        )
      : undefined,
  ].filter(Boolean);

  const membershipRows = scopedToUser
    ? await getDb().query.rcaTeamMembers.findMany({
        where: eq(rcaTeamMembers.userId, user.id),
        columns: {
          rcaId: true,
        },
      })
    : [];

  const visibleIds = scopedToUser
    ? new Set<string>(membershipRows.map((row: { rcaId: string }) => row.rcaId))
    : null;

  const rows = await getDb().query.rcas.findMany({
    where: and(...baseConditions),
    with: {
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(rcas.createdAt)],
    limit: filters.limit ?? 100,
  });

  return rows
    .filter((rca: any) => {
      if (!scopedToUser) {
        return true;
      }

      return rca.ownerId === user.id || rca.createdById === user.id || visibleIds?.has(rca.id);
    })
    .map((rca: any) => ({
      id: rca.id,
      rcaNumber: rca.rcaNumber,
      title: rca.title,
      status: rca.status,
      createdAt: rca.createdAt,
      updatedAt: rca.updatedAt,
      equipmentName: rca.equipmentName,
      location: rca.location,
      owner: rca.owner
        ? {
            id: rca.owner.id,
            name: rca.owner.name,
            email: rca.owner.email,
          }
        : null,
    }));
}

export async function getTicketDetailForTenant(
  tenantId: string,
  ticketId: string,
): Promise<TicketDetailRecord | null> {
  const ticket = await getDb().query.maintenanceTickets.findFirst({
    where: and(eq(maintenanceTickets.id, ticketId), eq(maintenanceTickets.tenantId, tenantId)),
    with: {
      rcas: {
        columns: {
          id: true,
          rcaNumber: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: [desc(rcas.createdAt)],
      },
    },
  });

  if (!ticket) {
    return null;
  }

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    equipmentName: ticket.equipmentName,
    location: ticket.location,
    issueDescription: ticket.issueDescription,
    priority: ticket.priority,
    impact: ticket.impact,
    impactScore: ticket.impactScore,
    requiresRca: ticket.requiresRca,
    rcaRequiredReason: ticket.rcaRequiredReason,
    status: ticket.status,
    createdAt: toIsoString(ticket.createdAt),
    rcas: (ticket.rcas ?? []).map((rca: any) => ({
      id: rca.id,
      rcaNumber: rca.rcaNumber,
      title: rca.title,
      status: rca.status,
      createdAt: toIsoString(rca.createdAt),
    })),
  };
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toISOString();
}

function mapUserSummary(user: any): UserSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantRoleId: user.tenantRoleId ?? null,
    tenantRoleName: user.tenantRole?.name ?? null,
    responsibilityProfile: user.responsibilityProfile ?? null,
  };
}

function mapAttachment(attachment: any): AttachmentRecord {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    fileSize: attachment.fileSize,
    fileType: attachment.fileType,
  };
}

function isOptionalRcaCollaborationSchemaError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    ["42P01", "42703"].includes((error as { code?: string }).code ?? "")
  );
}

async function safeOptionalQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (isOptionalRcaCollaborationSchemaError(error)) {
      return fallback;
    }

    throw error;
  }
}

export async function getRcaDetailForTenantUser(
  user: TenantUser,
  rcaId: string,
): Promise<RcaDetailRecord | null> {
  const scopedToUser = !canViewAllRcas(user.role);
  const membershipRows = scopedToUser
    ? await getDb().query.rcaTeamMembers.findMany({
        where: eq(rcaTeamMembers.userId, user.id),
        columns: {
          rcaId: true,
        },
      })
    : [];
  const visibleIds = scopedToUser
    ? new Set<string>(membershipRows.map((row: { rcaId: string }) => row.rcaId))
    : null;

  const rca = await getDb().query.rcas.findFirst({
    where: and(eq(rcas.id, rcaId), eq(rcas.tenantId, user.tenantId)),
    with: {
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          tenantRoleId: true,
          responsibilityProfile: true,
        },
        with: {
          tenantRole: {
            columns: {
              name: true,
            },
          },
        },
      },
      maintenanceTicket: {
        columns: {
          id: true,
          ticketNumber: true,
          equipmentName: true,
          location: true,
          status: true,
        },
      },
    },
  });

  if (!rca) {
    return null;
  }

  if (scopedToUser && rca.ownerId !== user.id && rca.createdById !== user.id && !visibleIds?.has(rca.id)) {
    return null;
  }

  const [
    availableTeamMembers,
    rcaAttachments,
    teamMembers,
    brainstormingRows,
    commentRows,
    fishboneRows,
    solutionRows,
  ] = await Promise.all([
    getDb().query.users.findMany({
      where: and(eq(users.tenantId, user.tenantId), eq(users.isActive, true)),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantRoleId: true,
        responsibilityProfile: true,
      },
      with: {
        tenantRole: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: [asc(users.name), asc(users.email)],
    }),
    safeOptionalQuery(
      () =>
        getDb().query.attachments.findMany({
          where: and(
            eq(attachments.rcaId, rca.id),
            isNull(attachments.commentId),
            isNull(attachments.brainstormingContributionId),
            isNull(attachments.solutionId),
          ),
          columns: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            fileType: true,
          },
          orderBy: [asc(attachments.uploadedAt)],
        }),
      [],
    ),
    safeOptionalQuery(
      () =>
        getDb().query.rcaTeamMembers.findMany({
          where: eq(rcaTeamMembers.rcaId, rca.id),
          columns: {
            id: true,
            userId: true,
            addedAt: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantRoleId: true,
                responsibilityProfile: true,
              },
              with: {
                tenantRole: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: [asc(rcaTeamMembers.addedAt)],
        }),
      [],
    ),
    safeOptionalQuery(
      () =>
        getDb().query.brainstormingContributions.findMany({
          where: eq(brainstormingContributions.rcaId, rca.id),
          columns: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantRoleId: true,
                responsibilityProfile: true,
              },
              with: {
                tenantRole: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
            attachments: {
              columns: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileSize: true,
                fileType: true,
              },
              orderBy: [asc(attachments.uploadedAt)],
            },
          },
          orderBy: [desc(brainstormingContributions.createdAt)],
        }),
      [],
    ),
    safeOptionalQuery(
      () =>
        getDb().query.comments.findMany({
          where: eq(comments.rcaId, rca.id),
          columns: {
            id: true,
            content: true,
            createdAt: true,
            parentCommentId: true,
            mentions: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantRoleId: true,
                responsibilityProfile: true,
              },
              with: {
                tenantRole: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
            attachments: {
              columns: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileSize: true,
                fileType: true,
              },
              orderBy: [asc(attachments.uploadedAt)],
            },
          },
          orderBy: [asc(comments.createdAt)],
        }),
      [],
    ),
    safeOptionalQuery(
      () =>
        getDb().query.fishbones.findMany({
          where: eq(fishbones.rcaId, rca.id),
          columns: {
            id: true,
            category: true,
            cause: true,
            createdAt: true,
          },
          orderBy: [asc(fishbones.createdAt)],
        }),
      [],
    ),
    safeOptionalQuery(
      () =>
        getDb().query.solutions.findMany({
          where: eq(solutions.rcaId, rca.id),
          columns: {
            id: true,
            description: true,
            assignedToId: true,
            status: true,
            dueDate: true,
            completedAt: true,
            submittedForApprovalAt: true,
            approvedAt: true,
            approvedById: true,
            updatedAt: true,
          },
          with: {
            assignedTo: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantRoleId: true,
                responsibilityProfile: true,
              },
              with: {
                tenantRole: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
            approvedBy: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantRoleId: true,
                responsibilityProfile: true,
              },
              with: {
                tenantRole: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
            attachments: {
              columns: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileSize: true,
                fileType: true,
              },
              orderBy: [asc(attachments.uploadedAt)],
            },
            approvalEvents: {
              columns: {
                id: true,
                action: true,
                notes: true,
                createdAt: true,
              },
              with: {
                actor: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    tenantRoleId: true,
                    responsibilityProfile: true,
                  },
                  with: {
                    tenantRole: {
                      columns: {
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: [asc(solutionApprovalEvents.createdAt)],
            },
          },
          orderBy: [desc(solutions.updatedAt)],
        }),
      [],
    ),
  ]);

  return {
    id: rca.id,
    rcaNumber: rca.rcaNumber,
    title: rca.title,
    description: rca.description,
    status: rca.status,
    equipmentName: rca.equipmentName,
    location: rca.location,
    createdById: rca.createdById,
    owner: rca.owner ? mapUserSummary(rca.owner) : null,
    attachments: rcaAttachments.map(mapAttachment),
    teamMembers: teamMembers.map((member: any) => ({
      id: member.id,
      userId: member.userId,
      addedAt: toIsoString(member.addedAt),
      user: mapUserSummary(member.user),
    })),
    brainstormingContributions: brainstormingRows.map((contribution: any) => ({
      id: contribution.id,
      title: contribution.title,
      content: contribution.content,
      createdAt: toIsoString(contribution.createdAt),
      updatedAt: toIsoString(contribution.updatedAt),
      author: mapUserSummary(contribution.user),
      attachments: (contribution.attachments ?? []).map(mapAttachment),
    })),
    comments: commentRows.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      createdAt: toIsoString(comment.createdAt),
      parentCommentId: comment.parentCommentId,
      mentions: comment.mentions ?? null,
      author: mapUserSummary(comment.user),
      attachments: (comment.attachments ?? []).map(mapAttachment),
    })),
    fishbones: fishboneRows.map((fishbone: any) => ({
      id: fishbone.id,
      category: fishbone.category,
      cause: fishbone.cause,
      createdAt: toIsoString(fishbone.createdAt),
    })),
    solutions: solutionRows.map((solution: any) => ({
      id: solution.id,
      description: solution.description,
      assignedToId: solution.assignedToId,
      status: solution.status,
      dueDate: solution.dueDate ? toIsoString(solution.dueDate) : null,
      completedAt: solution.completedAt ? toIsoString(solution.completedAt) : null,
      submittedForApprovalAt: solution.submittedForApprovalAt
        ? toIsoString(solution.submittedForApprovalAt)
        : null,
      approvedAt: solution.approvedAt ? toIsoString(solution.approvedAt) : null,
      approvedById: solution.approvedById,
      updatedAt: toIsoString(solution.updatedAt),
      assignedTo: solution.assignedTo ? mapUserSummary(solution.assignedTo) : null,
      approvedBy: solution.approvedBy ? mapUserSummary(solution.approvedBy) : null,
      attachments: (solution.attachments ?? []).map(mapAttachment),
      approvalEvents: (solution.approvalEvents ?? []).map((event: any) => ({
        id: event.id,
        action: event.action,
        notes: event.notes,
        createdAt: toIsoString(event.createdAt),
        actor: mapUserSummary(event.actor),
      })),
    })),
    availableTeamMembers: availableTeamMembers.map(mapUserSummary),
    maintenanceTicket: rca.maintenanceTicket
      ? {
          id: rca.maintenanceTicket.id,
          ticketNumber: rca.maintenanceTicket.ticketNumber,
          equipmentName: rca.maintenanceTicket.equipmentName,
          location: rca.maintenanceTicket.location,
          status: rca.maintenanceTicket.status,
        }
      : null,
  };
}

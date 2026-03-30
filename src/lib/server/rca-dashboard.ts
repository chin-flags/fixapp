import postgres from "postgres";
import type { RcaDashboardSummary } from "@/lib/backend-api";

type DashboardUser = {
  id: string;
  tenantId: string;
  role: string;
};

type UserRow = {
  id: string;
  tenantId: string;
  role: string;
  responsibilityProfile: Record<string, unknown> | null;
};

type RcaRow = {
  id: string;
  rcaNumber: string;
  title: string;
  description: string | null;
  status: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  closedAt: Date | string | null;
  equipmentName: string | null;
  location: string | null;
  ownerId: string | null;
  owner: { id: string; name: string; email: string } | null;
};

type SolutionRow = {
  id: string;
  rcaId: string;
  status: string | null;
  dueDate: Date | string | null;
};

type TeamMemberRow = {
  rcaId: string;
  userId: string;
};

type CommentRow = {
  id: string;
  rcaId: string;
};

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL or POSTGRES_URL_NON_POOLING environment variable is not set");
}

const sql = postgres(connectionString);

function toDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start: Date | string | null | undefined, end: Date) {
  const from = toDate(start);
  if (!from) {
    return 0;
  }

  return Math.max(0, Math.floor((end.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function round1(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

function pickCountryFilter(profile: Record<string, unknown> | null | undefined) {
  if (!profile) {
    return null;
  }

  for (const key of ["country", "countryName", "countryCode", "region"]) {
    const value = profile[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  for (const key of ["countries", "regions", "locations"]) {
    const value = profile[key];
    if (Array.isArray(value)) {
      const first = value.find((entry) => typeof entry === "string" && entry.trim());
      if (typeof first === "string") {
        return first.trim();
      }
    }
  }

  return null;
}

function matchesCountry(location: string | null | undefined, countryFilter: string | null) {
  if (!countryFilter) {
    return true;
  }

  return (location || "").toLowerCase().includes(countryFilter.toLowerCase());
}

function buildFingerprint(rca: {
  equipmentName?: string | null;
  location?: string | null;
  description?: string | null;
}) {
  const equipment = (rca.equipmentName || "unknown-equipment").trim().toLowerCase();
  const location = (rca.location || "unknown-location").trim().toLowerCase();
  const keywords = (rca.description || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3)
    .slice(0, 5)
    .join(" ");

  return [equipment, location, keywords].filter(Boolean).join(" | ");
}

async function loadUser(sessionUser: DashboardUser) {
  const rows = await sql<UserRow[]>`
    select
      id,
      tenant_id as "tenantId",
      role,
      responsibility_profile as "responsibilityProfile"
    from users
    where id = ${sessionUser.id}
      and tenant_id = ${sessionUser.tenantId}
    limit 1
  `;

  return rows[0] ?? null;
}

async function loadTeamMemberships(userId: string) {
  return sql<TeamMemberRow[]>`
    select
      rca_id as "rcaId",
      user_id as "userId"
    from rca_team_members
    where user_id = ${userId}
  `;
}

async function loadVisibleRcas(
  tenantId: string,
  userId: string,
  scope: RcaDashboardSummary["scope"],
  teamRcaIds: string[],
) {
  if (scope === "owner") {
    return sql<RcaRow[]>`
      select
        r.id,
        r.rca_number as "rcaNumber",
        r.title,
        r.description,
        r.status,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.closed_at as "closedAt",
        r.equipment_name as "equipmentName",
        r.location,
        r.owner_id as "ownerId",
        case
          when u.id is null then null
          else json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        end as owner
      from rcas r
      left join users u on u.id = r.owner_id
      where r.tenant_id = ${tenantId}
        and r.owner_id = ${userId}
      order by r.updated_at desc, r.created_at desc
      limit 500
    `;
  }

  if (scope === "team") {
    if (teamRcaIds.length > 0) {
      return sql<RcaRow[]>`
        select
          r.id,
          r.rca_number as "rcaNumber",
          r.title,
          r.description,
          r.status,
          r.created_at as "createdAt",
          r.updated_at as "updatedAt",
          r.closed_at as "closedAt",
          r.equipment_name as "equipmentName",
          r.location,
          r.owner_id as "ownerId",
          case
            when u.id is null then null
            else json_build_object('id', u.id, 'name', u.name, 'email', u.email)
          end as owner
        from rcas r
        left join users u on u.id = r.owner_id
        where r.tenant_id = ${tenantId}
          and r.id in ${sql(teamRcaIds)}
        order by r.updated_at desc, r.created_at desc
        limit 500
      `;
    }

    return sql<RcaRow[]>`
      select
        r.id,
        r.rca_number as "rcaNumber",
        r.title,
        r.description,
        r.status,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.closed_at as "closedAt",
        r.equipment_name as "equipmentName",
        r.location,
        r.owner_id as "ownerId",
        case
          when u.id is null then null
          else json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        end as owner
      from rcas r
      left join users u on u.id = r.owner_id
      where r.tenant_id = ${tenantId}
        and r.created_by_id = ${userId}
      order by r.updated_at desc, r.created_at desc
      limit 500
    `;
  }

  if (scope === "personal") {
    return sql<RcaRow[]>`
      select
        r.id,
        r.rca_number as "rcaNumber",
        r.title,
        r.description,
        r.status,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.closed_at as "closedAt",
        r.equipment_name as "equipmentName",
        r.location,
        r.owner_id as "ownerId",
        case
          when u.id is null then null
          else json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        end as owner
      from rcas r
      left join users u on u.id = r.owner_id
      where r.tenant_id = ${tenantId}
        and r.created_by_id = ${userId}
      order by r.updated_at desc, r.created_at desc
      limit 500
    `;
  }

  return sql<RcaRow[]>`
    select
      r.id,
      r.rca_number as "rcaNumber",
      r.title,
      r.description,
      r.status,
      r.created_at as "createdAt",
      r.updated_at as "updatedAt",
      r.closed_at as "closedAt",
      r.equipment_name as "equipmentName",
      r.location,
      r.owner_id as "ownerId",
      case
        when u.id is null then null
        else json_build_object('id', u.id, 'name', u.name, 'email', u.email)
      end as owner
    from rcas r
    left join users u on u.id = r.owner_id
    where r.tenant_id = ${tenantId}
    order by r.updated_at desc, r.created_at desc
    limit 500
  `;
}

async function loadSolutions(rcaIds: string[]) {
  if (rcaIds.length === 0) {
    return [] as SolutionRow[];
  }

  return sql<SolutionRow[]>`
    select
      id,
      rca_id as "rcaId",
      status,
      due_date as "dueDate"
    from solutions
    where rca_id in ${sql(rcaIds)}
  `;
}

async function loadRcaTeamMembers(rcaIds: string[]) {
  if (rcaIds.length === 0) {
    return [] as TeamMemberRow[];
  }

  return sql<TeamMemberRow[]>`
    select
      rca_id as "rcaId",
      user_id as "userId"
    from rca_team_members
    where rca_id in ${sql(rcaIds)}
  `;
}

async function loadComments(rcaIds: string[]) {
  if (rcaIds.length === 0) {
    return [] as CommentRow[];
  }

  return sql<CommentRow[]>`
    select
      id,
      rca_id as "rcaId"
    from comments
    where rca_id in ${sql(rcaIds)}
  `;
}

export async function getRcaDashboardSummaryForUser(
  sessionUser: DashboardUser,
): Promise<RcaDashboardSummary | null> {
  const user = await loadUser(sessionUser);
  if (!user) {
    return null;
  }

  let scope: RcaDashboardSummary["scope"] = "personal";
  let scopeLabel = "My RCAs";
  const countryFilter = pickCountryFilter(user.responsibilityProfile);

  if (user.role === "admin") {
    scope = "global";
    scopeLabel = "Global RCA Dashboard";
  } else if (user.role === "country_leader") {
    scope = "country";
    scopeLabel = countryFilter ? `${countryFilter} RCA Dashboard` : "Country RCA Dashboard";
  } else if (user.role === "rca_owner") {
    scope = "owner";
    scopeLabel = "Owner RCA Dashboard";
  } else if (user.role === "team_member") {
    scope = "team";
    scopeLabel = "Team RCA Dashboard";
  }

  const teamMemberships =
    scope === "team" ? await loadTeamMemberships(user.id) : [];
  const visibleRcas = await loadVisibleRcas(
    user.tenantId,
    user.id,
    scope,
    teamMemberships.map((membership) => membership.rcaId),
  );

  const scopedRcas = visibleRcas.filter((rca) =>
    matchesCountry(rca.location, scope === "country" ? countryFilter : null),
  );
  const scopedRcaIds = scopedRcas.map((rca) => rca.id);

  const [scopedSolutions, scopedTeamMembers, scopedComments] = await Promise.all([
    loadSolutions(scopedRcaIds),
    loadRcaTeamMembers(scopedRcaIds),
    loadComments(scopedRcaIds),
  ]);

  const now = new Date();
  const openRcas = scopedRcas.filter((rca) =>
    ["open", "in_progress"].includes(String(rca.status || "").toLowerCase()),
  );
  const closedRcas = scopedRcas.filter(
    (rca) => String(rca.status || "").toLowerCase() === "closed",
  );
  const overdueSolutions = scopedSolutions.filter((solution) => {
    const dueDate = toDate(solution.dueDate);
    if (!dueDate) {
      return false;
    }

    return dueDate < now && !["completed", "approved"].includes(String(solution.status || "").toLowerCase());
  });
  const pendingApprovals = scopedSolutions.filter(
    (solution) => String(solution.status || "").toLowerCase() === "submitted",
  );

  const solutionCountByRca = new Map<string, number>();
  const pendingSolutionCountByRca = new Map<string, number>();
  for (const solution of scopedSolutions) {
    solutionCountByRca.set(
      solution.rcaId,
      (solutionCountByRca.get(solution.rcaId) ?? 0) + 1,
    );
    if (!["completed", "approved"].includes(String(solution.status || "").toLowerCase())) {
      pendingSolutionCountByRca.set(
        solution.rcaId,
        (pendingSolutionCountByRca.get(solution.rcaId) ?? 0) + 1,
      );
    }
  }

  const teamMemberCountByRca = new Map<string, number>();
  for (const member of scopedTeamMembers) {
    teamMemberCountByRca.set(
      member.rcaId,
      (teamMemberCountByRca.get(member.rcaId) ?? 0) + 1,
    );
  }

  const commentCountByRca = new Map<string, number>();
  for (const comment of scopedComments) {
    commentCountByRca.set(
      comment.rcaId,
      (commentCountByRca.get(comment.rcaId) ?? 0) + 1,
    );
  }

  const closedDurations = closedRcas
    .map((rca) => {
      const closedAt = toDate(rca.closedAt);
      return closedAt ? daysBetween(rca.createdAt, closedAt) : null;
    })
    .filter((value: number | null): value is number => value !== null);
  const openDurations = openRcas.map((rca) => daysBetween(rca.createdAt, now));

  const ageBuckets = [
    {
      label: "0-7 days",
      count: openRcas.filter((rca) => daysBetween(rca.createdAt, now) <= 7).length,
    },
    {
      label: "8-14 days",
      count: openRcas.filter((rca) => {
        const age = daysBetween(rca.createdAt, now);
        return age >= 8 && age <= 14;
      }).length,
    },
    {
      label: "15-30 days",
      count: openRcas.filter((rca) => {
        const age = daysBetween(rca.createdAt, now);
        return age >= 15 && age <= 30;
      }).length,
    },
    {
      label: "30+ days",
      count: openRcas.filter((rca) => daysBetween(rca.createdAt, now) > 30).length,
    },
  ];

  const throughputMap = new Map<string, { date: string; created: number; closed: number }>();
  const today = startOfUtcDay(now);
  for (let offset = 41; offset >= 0; offset -= 1) {
    const current = new Date(today);
    current.setUTCDate(today.getUTCDate() - offset);
    const key = current.toISOString().slice(0, 10);
    throughputMap.set(key, { date: key, created: 0, closed: 0 });
  }

  for (const rca of scopedRcas) {
    const createdAt = toDate(rca.createdAt);
    const closedAt = toDate(rca.closedAt);

    if (createdAt) {
      const createdKey = startOfUtcDay(createdAt).toISOString().slice(0, 10);
      const entry = throughputMap.get(createdKey);
      if (entry) {
        entry.created += 1;
      }
    }

    if (closedAt) {
      const closedKey = startOfUtcDay(closedAt).toISOString().slice(0, 10);
      const entry = throughputMap.get(closedKey);
      if (entry) {
        entry.closed += 1;
      }
    }
  }

  const statusCounts = scopedRcas.reduce((map, rca) => {
    const status = String(rca.status || "unknown").toLowerCase();
    map.set(status, (map.get(status) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const statusBreakdown: RcaDashboardSummary["statusBreakdown"] = Array.from(
    statusCounts.entries(),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const hotspotMap = new Map<string, { openCount: number; totalAge: number }>();
  for (const rca of openRcas) {
    const location = rca.location?.trim() || "Unspecified location";
    const current = hotspotMap.get(location) ?? { openCount: 0, totalAge: 0 };
    current.openCount += 1;
    current.totalAge += daysBetween(rca.createdAt, now);
    hotspotMap.set(location, current);
  }

  const hotspots = Array.from(hotspotMap.entries())
    .map(([location, value]) => ({
      location,
      openCount: value.openCount,
      avgAgeDays: round1(value.openCount ? value.totalAge / value.openCount : null),
    }))
    .sort((a, b) => b.openCount - a.openCount)
    .slice(0, 5);

  const repeatedMap = new Map<
    string,
    { count: number; latestCreatedAt: number; latestRcaNumber: string; location: string | null }
  >();

  for (const rca of scopedRcas) {
    const fingerprint = buildFingerprint(rca);
    const createdAt = toDate(rca.createdAt)?.getTime() ?? 0;
    const current = repeatedMap.get(fingerprint);

    if (!current) {
      repeatedMap.set(fingerprint, {
        count: 1,
        latestCreatedAt: createdAt,
        latestRcaNumber: rca.rcaNumber,
        location: rca.location ?? null,
      });
      continue;
    }

    current.count += 1;
    if (createdAt >= current.latestCreatedAt) {
      current.latestCreatedAt = createdAt;
      current.latestRcaNumber = rca.rcaNumber;
      current.location = rca.location ?? null;
    }
  }

  const repeatedIssues = Array.from(repeatedMap.entries())
    .filter(([, value]) => value.count > 1)
    .map(([fingerprint, value]) => ({
      fingerprint,
      count: value.count,
      latestRcaNumber: value.latestRcaNumber,
      location: value.location,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentRcas = scopedRcas.slice(0, 8).map((rca) => ({
    ...rca,
    ageDays: daysBetween(rca.createdAt, now),
    solutionCount: solutionCountByRca.get(rca.id) ?? 0,
    pendingSolutionCount: pendingSolutionCountByRca.get(rca.id) ?? 0,
    teamMemberCount: teamMemberCountByRca.get(rca.id) ?? 0,
    commentCount: commentCountByRca.get(rca.id) ?? 0,
  }));

  return {
    scope,
    scopeLabel,
    countryFilter,
    totals: {
      visibleRcas: scopedRcas.length,
      openRcas: openRcas.length,
      closedRcas: closedRcas.length,
      unassignedRcas: scopedRcas.filter((rca) => !rca.ownerId).length,
      overdueSolutions: overdueSolutions.length,
      pendingApprovals: pendingApprovals.length,
      avgResolutionDays: round1(
        closedDurations.length
          ? closedDurations.reduce((sum: number, value: number) => sum + value, 0) / closedDurations.length
          : null,
      ),
      avgOpenAgeDays: round1(
        openDurations.length
          ? openDurations.reduce((sum: number, value: number) => sum + value, 0) / openDurations.length
          : null,
      ),
    },
    bottlenecks: [
      {
        label: "Open > 14 days",
        count: openRcas.filter((rca) => daysBetween(rca.createdAt, now) > 14).length,
        description: "Investigations open longer than two weeks.",
      },
      {
        label: "Awaiting solution approval",
        count: pendingApprovals.length,
        description: "Solutions submitted and still waiting for approval.",
      },
      {
        label: "Overdue actions",
        count: overdueSolutions.length,
        description: "Corrective actions that are already past due.",
      },
      {
        label: "Unassigned RCAs",
        count: scopedRcas.filter((rca) => !rca.ownerId).length,
        description: "Records with no owner assigned yet.",
      },
    ].sort((a, b) => b.count - a.count),
    ageBuckets,
    throughput: Array.from(throughputMap.values()),
    statusBreakdown,
    hotspots,
    repeatedIssues,
    recentRcas,
  };
}

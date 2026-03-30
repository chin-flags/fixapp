import {
  buildBackendProxyUrl,
  EXTERNAL_BACKEND_URL,
} from "@/lib/backend-endpoints";

const BACKEND_URL = buildBackendProxyUrl("");

export { BACKEND_URL };

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  subdomain: string;
}

export interface TenantRoleRecord {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string | null;
  responsibilityTemplate?: Record<string, unknown> | null;
  policyContext?: Record<string, unknown> | null;
  isActive: boolean;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantInviteRecord {
  id: string;
  tenantId: string;
  email: string;
  inviteeName?: string | null;
  inviteToken: string;
  tenantRoleId?: string | null;
  responsibilityProfile?: Record<string, unknown> | null;
  status: string;
  deliveryMethod: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  acceptedByUserId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  inviteLink: string;
}

export interface TeamMemberRecord {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  tenantRoleId?: string | null;
  tenantRoleName?: string | null;
  responsibilityProfile?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvitePreview {
  tenantName: string;
  tenantSubdomain: string;
  email: string;
  inviteeName: string | null;
  roleName: string | null;
  status: string;
  expiresAt: string;
}

export interface LoginData {
  email: string;
  password: string;
  subdomain: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
}

class BackendApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("/api/")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        // Handle different error formats from NestJS
        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.map((m: any) => m.message || m).join(', ');
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error('Failed to parse error response');
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async signup(data: SignupData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(accessToken: string): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async fetchTenantRoles(accessToken: string): Promise<TenantRoleRecord[]> {
    return this.request<TenantRoleRecord[]>("/api/settings/roles", {
      cache: "no-store",
    });
  }

  async createTenantRole(
    accessToken: string,
    data: {
      name: string;
      description?: string;
      responsibilityTemplate?: Record<string, unknown>;
      policyContext?: Record<string, unknown>;
    },
  ): Promise<TenantRoleRecord> {
    return this.request<TenantRoleRecord>("/api/settings/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTenantRole(
    accessToken: string,
    roleId: string,
    data: {
      name?: string;
      description?: string;
      responsibilityTemplate?: Record<string, unknown> | null;
      policyContext?: Record<string, unknown> | null;
      isActive?: boolean;
    },
  ): Promise<TenantRoleRecord> {
    return this.request<TenantRoleRecord>(`/settings/roles/${roleId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  }

  async fetchTenantInvites(accessToken: string): Promise<TenantInviteRecord[]> {
    return this.request<TenantInviteRecord[]>("/api/settings/invites", {
      cache: "no-store",
    });
  }

  async createTenantInvite(
    accessToken: string,
    data: {
      email: string;
      inviteeName?: string;
      tenantRoleId?: string;
      responsibilityProfile?: Record<string, unknown>;
      deliveryMethod?: "link" | "email";
      expiresInDays?: string;
    },
  ): Promise<TenantInviteRecord> {
    return this.request<TenantInviteRecord>("/api/settings/invites", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async revokeTenantInvite(
    accessToken: string,
    inviteId: string,
  ): Promise<TenantInviteRecord> {
    return this.request<TenantInviteRecord>(`/api/settings/invites/${inviteId}/revoke`, {
      method: "POST",
    });
  }

  async fetchTeamMembers(accessToken: string): Promise<TeamMemberRecord[]> {
    return this.request<TeamMemberRecord[]>("/api/settings/team-members", {
      cache: "no-store",
    });
  }

  async updateTeamMember(
    accessToken: string,
    memberId: string,
    data: {
      tenantRoleId?: string | null;
      responsibilityProfile?: Record<string, unknown> | null;
      role?: string;
      isActive?: boolean;
    },
  ): Promise<TeamMemberRecord> {
    return this.request<TeamMemberRecord>(`/api/settings/team-members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async fetchInvitePreview(token: string): Promise<InvitePreview> {
    return this.request<InvitePreview>(`/api/join/${token}`, {
      cache: "no-store",
    });
  }

  async acceptInvite(data: {
    token: string;
    password: string;
    name?: string;
  }): Promise<{
    message: string;
    tenantSubdomain: string;
    email: string;
    isNewAccount: boolean;
  }> {
    return this.request("/api/join/accept", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const backendApi = new BackendApi();

// Server-side RCA fetching for Server Components using gRPC
export interface RCARow {
  id: string;
  rcaNumber: string;
  title: string;
  status: string | null;
  createdAt: Date | string | null;
  updatedAt?: Date | string | null;
  equipmentName?: string | null;
  location?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface RcaDashboardSummary {
  scope: "owner" | "team" | "country" | "global" | "personal";
  scopeLabel: string;
  countryFilter: string | null;
  totals: {
    visibleRcas: number;
    openRcas: number;
    closedRcas: number;
    unassignedRcas: number;
    overdueSolutions: number;
    pendingApprovals: number;
    avgResolutionDays: number | null;
    avgOpenAgeDays: number | null;
  };
  bottlenecks: {
    label: string;
    count: number;
    description: string;
  }[];
  ageBuckets: {
    label: string;
    count: number;
  }[];
  throughput: {
    date: string;
    created: number;
    closed: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
  }[];
  hotspots: {
    location: string;
    openCount: number;
    avgAgeDays: number | null;
  }[];
  repeatedIssues: {
    fingerprint: string;
    count: number;
    latestRcaNumber: string;
    location: string | null;
  }[];
  recentRcas: Array<
    RCARow & {
      ageDays: number;
      solutionCount: number;
      pendingSolutionCount: number;
      teamMemberCount: number;
      commentCount: number;
    }
  >;
}

export interface RcaListFilters {
  q?: string;
  status?: string;
  location?: string;
  equipment?: string;
  assignee?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  equipmentName: string;
  location: string;
  issueDescription: string;
  priority: string;
  impact: string;
  impactScore: number;
  requiresRca: boolean;
  rcaRequiredReason?: string | null;
  status: string;
  createdAt: string;
  rcas?: {
    id: string;
    rcaNumber: string;
    title: string;
    status: string;
    createdAt: string;
  }[];
}

export interface CreateTicketInput {
  equipmentName: string;
  location: string;
  issueDescription: string;
  priority: string;
  impact: string;
}

export interface TicketImpactConfig {
  priorityWeights: Record<string, number>;
  impactWeights: Record<string, number>;
  rcaThreshold: number;
  autoFlagCritical: boolean;
}

export type AssetNodePayload = {
  name: string;
  type: "country" | "plant" | "area" | "equipment";
  parentId?: string;
  location?: string;
  companyId?: string;
  photoUrl?: string;
};

export type AssetNodeUpdate = {
  name: string;
  location?: string;
  companyId?: string;
  photoUrl?: string;
};

export async function fetchRCAs(
  accessToken: string,
  tenantId: string,
  filters: RcaListFilters = {},
): Promise<RCARow[]> {
  try {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.location) params.set("location", filters.location);
    if (filters.equipment) params.set("equipment", filters.equipment);
    if (filters.assignee) params.set("assignee", filters.assignee);
    if (filters.createdFrom) params.set("createdFrom", filters.createdFrom);
    if (filters.createdTo) params.set("createdTo", filters.createdTo);
    if (filters.limit) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const response = await fetch(`${BACKEND_URL}/rcas${queryString ? `?${queryString}` : ""}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const rcas = await response.json();
    return rcas.map((rca: any) => ({
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
  } catch (error) {
    console.error('Failed to fetch RCAs via REST:', error);
    return [];
  }
}

export async function fetchRcaDashboardSummary(
  accessToken: string,
): Promise<RcaDashboardSummary | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/rcas/dashboard-summary`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch RCA dashboard summary:", error);
    return null;
  }
}

export async function fetchTickets(accessToken: string): Promise<MaintenanceTicket[]> {
  const response = await fetch(buildBackendProxyUrl("/tickets"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function createTicket(
  accessToken: string,
  data: CreateTicketInput,
): Promise<MaintenanceTicket | null> {
  const response = await fetch(buildBackendProxyUrl("/tickets"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function fetchTicketImpactConfig(accessToken: string): Promise<TicketImpactConfig> {
  const response = await fetch(buildBackendProxyUrl("/tickets/impact-config"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load impact scoring config.");
  }

  return response.json();
}

export async function fetchAssetHierarchy(accessToken: string) {
  void accessToken;
  const response = await fetch("/api/assets/hierarchy", { cache: "no-store" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to load asset hierarchy.");
  }

  return response.json();
}

export async function createAssetNode(accessToken: string, payload: AssetNodePayload) {
  void accessToken;
  const response = await fetch("/api/assets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.message || "Unable to create asset." };
  }

  return { success: true, message: "Asset created." };
}

export async function updateAssetNode(accessToken: string, id: string, payload: AssetNodeUpdate) {
  void accessToken;
  const response = await fetch(`/api/assets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.message || "Unable to update asset." };
  }

  return { success: true, message: "Asset updated." };
}

export async function deleteAssetNode(accessToken: string, id: string) {
  void accessToken;
  const response = await fetch(`/api/assets/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.message || "Unable to delete asset." };
  }

  return { success: true, message: "Asset deleted." };
}

export { EXTERNAL_BACKEND_URL };

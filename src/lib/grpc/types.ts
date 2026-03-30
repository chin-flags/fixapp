// Types matching fixapp.proto

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  subdomain: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
}

export interface Empty {}

export interface FindAllRcasRequest {
  tenantId: string;
  limit: number;
}

export interface FindByIdRequest {
  id: string;
  tenantId: string;
}

export interface CreateRcaRequest {
  tenantId: string;
  userId: string;
  title: string;
  description: string;
  equipmentName?: string;
  maintenanceTicketId?: string;
}

export interface Rca {
  id: string;
  rcaNumber: string;
  title: string;
  description: string;
  status: string;
  tenantId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface RcaList {
  rcas: Rca[];
}

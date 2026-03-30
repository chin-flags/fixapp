// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  RCA_OWNER: 'rca_owner',
  TEAM_MEMBER: 'team_member',
  OPERATOR: 'operator',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy (higher index = more permissions)
const roleHierarchy: Role[] = [
  ROLES.OPERATOR,
  ROLES.TEAM_MEMBER,
  ROLES.RCA_OWNER,
  ROLES.ADMIN,
];

/**
 * Check if user has required role or higher
 */
export function hasPermission(userRole: string, requiredRole: Role): boolean {
  const userLevel = roleHierarchy.indexOf(userRole as Role);
  const requiredLevel = roleHierarchy.indexOf(requiredRole);

  if (userLevel === -1 || requiredLevel === -1) {
    return false;
  }

  return userLevel >= requiredLevel;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === ROLES.ADMIN;
}

/**
 * Check if user is RCA Owner or higher
 */
export function canManageRcas(userRole: string): boolean {
  return hasPermission(userRole, ROLES.RCA_OWNER);
}

/**
 * Check if user can view all RCAs in tenant
 */
export function canViewAllRcas(userRole: string): boolean {
  return userRole === ROLES.ADMIN;
}

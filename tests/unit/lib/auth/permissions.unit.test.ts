import {
  ROLES,
  canManageRcas,
  canViewAllRcas,
  hasPermission,
  isAdmin,
} from "@/lib/auth/permissions";

describe("auth permissions", () => {
  it("applies the role hierarchy correctly", () => {
    expect(hasPermission(ROLES.ADMIN, ROLES.OPERATOR)).toBe(true);
    expect(hasPermission(ROLES.RCA_OWNER, ROLES.TEAM_MEMBER)).toBe(true);
    expect(hasPermission(ROLES.OPERATOR, ROLES.ADMIN)).toBe(false);
    expect(hasPermission("unknown", ROLES.OPERATOR)).toBe(false);
  });

  it("identifies admin and RCA management capabilities", () => {
    expect(isAdmin(ROLES.ADMIN)).toBe(true);
    expect(isAdmin(ROLES.RCA_OWNER)).toBe(false);
    expect(canManageRcas(ROLES.ADMIN)).toBe(true);
    expect(canManageRcas(ROLES.RCA_OWNER)).toBe(true);
    expect(canManageRcas(ROLES.TEAM_MEMBER)).toBe(false);
  });

  it("limits view-all RCA access to admins", () => {
    expect(canViewAllRcas(ROLES.ADMIN)).toBe(true);
    expect(canViewAllRcas(ROLES.RCA_OWNER)).toBe(false);
    expect(canViewAllRcas(ROLES.OPERATOR)).toBe(false);
  });
});

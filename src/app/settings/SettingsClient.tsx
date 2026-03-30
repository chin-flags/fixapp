"use client";

import { useMemo, useState, useTransition } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendApi, type TeamMemberRecord, type TenantInviteRecord, type TenantRoleRecord } from "@/lib/backend-api";

type Props = {
  userEmail: string;
  roles: TenantRoleRecord[];
  invites: TenantInviteRecord[];
  teamMembers: TeamMemberRecord[];
};

type InviteForm = {
  email: string;
  inviteeName: string;
  tenantRoleId: string;
  responsibilitiesText: string;
  expiresInDays: string;
};

export default function SettingsClient({
  userEmail,
  roles: initialRoles,
  invites: initialInvites,
  teamMembers: initialMembers,
}: Props) {
  const [roles, setRoles] = useState(initialRoles);
  const [invites, setInvites] = useState(initialInvites);
  const [teamMembers, setTeamMembers] = useState(initialMembers);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: "",
    inviteeName: "",
    tenantRoleId: "",
    responsibilitiesText: "",
    expiresInDays: "7",
  });

  const activeRoles = useMemo(
    () => roles.filter((role) => role.isActive),
    [roles]
  );

  const parseJsonField = (value: string): Record<string, unknown> | undefined => {
    if (!value.trim()) {
      return undefined;
    }
    return JSON.parse(value);
  };

  const onCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!roleName.trim()) {
      setError("Role name is required.");
      return;
    }

    startTransition(async () => {
      try {
        const created = await backendApi.createTenantRole("", {
          name: roleName.trim(),
          description: roleDescription.trim() || undefined,
        });
        setRoles((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        setRoleName("");
        setRoleDescription("");
        setIsRoleDialogOpen(false);
        setSuccess(`Role "${created.name}" created.`);
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : "Unable to create role.");
      }
    });
  };

  const onCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!inviteForm.email.trim()) {
      setError("Invite email is required.");
      return;
    }

    startTransition(async () => {
      try {
        const created = await backendApi.createTenantInvite("", {
          email: inviteForm.email.trim().toLowerCase(),
          inviteeName: inviteForm.inviteeName.trim() || undefined,
          tenantRoleId: inviteForm.tenantRoleId || undefined,
          responsibilityProfile: parseJsonField(inviteForm.responsibilitiesText),
          expiresInDays: inviteForm.expiresInDays,
          deliveryMethod: "link",
        });

        setInvites((prev) => [created, ...prev]);
        setInviteForm({
          email: "",
          inviteeName: "",
          tenantRoleId: "",
          responsibilitiesText: "",
          expiresInDays: "7",
        });
        setIsInviteDialogOpen(false);
        setSuccess(`Invite created for ${created.email}. Link copied below.`);
      } catch (inviteError) {
        setError(inviteError instanceof Error ? inviteError.message : "Unable to create invite.");
      }
    });
  };

  const onRevokeInvite = (inviteId: string) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const updated = await backendApi.revokeTenantInvite("", inviteId);
        setInvites((prev) => prev.map((invite) => (invite.id === inviteId ? { ...invite, ...updated } : invite)));
        setSuccess("Invite revoked.");
      } catch (revokeError) {
        setError(revokeError instanceof Error ? revokeError.message : "Unable to revoke invite.");
      }
    });
  };

  const onCopyLink = async (inviteLink: string) => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSuccess("Invite link copied.");
    } catch {
      setError("Unable to copy invite link.");
    }
  };

  const onUpdateMember = (
    memberId: string,
    updates: {
      role?: string;
      tenantRoleId?: string | null;
      isActive?: boolean;
    }
  ) => {
    setError(null);
    setSuccess(null);

    const current = teamMembers.find((member) => member.id === memberId);
    if (!current) {
      return;
    }

    startTransition(async () => {
      try {
        const updated = await backendApi.updateTeamMember("", memberId, {
          role: updates.role ?? current.role,
          tenantRoleId: updates.tenantRoleId ?? current.tenantRoleId ?? null,
          responsibilityProfile: current.responsibilityProfile ?? null,
          isActive: updates.isActive ?? current.isActive,
        });
        const nextRoleName =
          roles.find((role) => role.id === updated.tenantRoleId)?.name ?? null;

        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === memberId
              ? { ...member, ...updated, tenantRoleName: nextRoleName }
              : member
          )
        );
        setSuccess(`Updated ${updated.email}.`);
      } catch (memberError) {
        setError(memberError instanceof Error ? memberError.message : "Unable to update team member.");
      }
    });
  };

  return (
    <AppShell
      title="Settings"
      user={{ name: userEmail.split("@")[0], email: userEmail, role: "admin" }}
    >
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Add a reusable role for invitations and team member assignment.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateRole}>
            <div>
              <Label htmlFor="roleName">Role name</Label>
              <Input id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Engineer" />
            </div>
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Input
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Handles analysis and on-site investigations"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Create an invite link and optionally assign a custom role.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onCreateInvite}>
            <div>
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="engineer@company.com"
              />
            </div>
            <div>
              <Label htmlFor="inviteName">Name</Label>
              <Input
                id="inviteName"
                value={inviteForm.inviteeName}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, inviteeName: e.target.value }))}
                placeholder="Anika Perera"
              />
            </div>
            <div>
              <Label htmlFor="inviteRole">Custom role</Label>
              <select
                id="inviteRole"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={inviteForm.tenantRoleId}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, tenantRoleId: e.target.value }))}
              >
                <option value="">No custom role</option>
                {activeRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="inviteResponsibilities">Responsibilities JSON</Label>
              <textarea
                id="inviteResponsibilities"
                className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={inviteForm.responsibilitiesText}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, responsibilitiesText: e.target.value }))}
                placeholder='{"plant":"Puttalam","department":"Electrical"}'
              />
            </div>
            <div>
              <Label htmlFor="inviteExpiry">Expires in days</Label>
              <Input
                id="inviteExpiry"
                value={inviteForm.expiresInDays}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, expiresInDays: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Generate invite link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Custom Roles</CardTitle>
            </div>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(true)}>
              Create role
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom roles yet.</p>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="rounded-lg border border-border bg-card/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description || "No description yet."}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          role.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {role.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle>Invite Team Members</CardTitle>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              Invite members
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {invites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invites yet.</p>
              ) : (
                invites.map((invite) => (
                  <div key={invite.id} className="rounded-lg border border-border bg-card/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{invite.inviteeName || invite.email}</p>
                        <p className="text-sm text-muted-foreground">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">Status: {invite.status}</p>
                        <p className="break-all text-xs text-muted-foreground">{invite.inviteLink}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void onCopyLink(invite.inviteLink)}
                        >
                          Copy link
                        </Button>
                        {invite.status === "pending" && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => onRevokeInvite(invite.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members in this tenant yet.</p>
          ) : (
            teamMembers.map((member) => (
              <div key={member.id} className="grid gap-4 rounded-lg border border-border bg-card/70 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  value={member.role}
                  onChange={(e) => onUpdateMember(member.id, { role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="rca_owner">RCA Owner</option>
                  <option value="team_member">Team Member</option>
                  <option value="operator">Operator</option>
                </select>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  value={member.tenantRoleId || ""}
                  onChange={(e) => onUpdateMember(member.id, { tenantRoleId: e.target.value || null })}
                >
                  <option value="">No custom role</option>
                  {activeRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant={member.isActive ? "outline" : "default"}
                  onClick={() => onUpdateMember(member.id, { isActive: !member.isActive })}
                  className={
                    member.isActive
                      ? undefined
                      : "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
                  }
                >
                  {member.isActive ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

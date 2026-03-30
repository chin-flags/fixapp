import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  foreignKey,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 63 }).unique().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    supabaseUserId: uuid('supabase_user_id'),
    passwordHash: text('password_hash'),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    tenantRoleId: uuid('tenant_role_id'),
    responsibilityProfile: jsonb('responsibility_profile')
      .$type<Record<string, unknown> | null>()
      .default(null),
    isActive: boolean('is_active').default(true).notNull(),
    supabaseRefreshToken: text('supabase_refresh_token'),
    passwordResetToken: text('password_reset_token'),
    passwordResetExpires: timestamp('password_reset_expires'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantEmailUnique: uniqueIndex('users_tenant_email_unique').on(
      table.tenantId,
      table.email,
    ),
  }),
);

export const tenantRoles = pgTable(
  'tenant_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    responsibilityTemplate: jsonb('responsibility_template')
      .$type<Record<string, unknown> | null>()
      .default(null),
    policyContext: jsonb('policy_context')
      .$type<Record<string, unknown> | null>()
      .default(null),
    isActive: boolean('is_active').default(true).notNull(),
    createdById: uuid('created_by_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantSlugUnique: uniqueIndex('tenant_roles_tenant_slug_unique').on(
      table.tenantId,
      table.slug,
    ),
  }),
);

export const tenantInvites = pgTable(
  'tenant_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    inviteeName: varchar('invitee_name', { length: 255 }),
    inviteToken: varchar('invite_token', { length: 255 }).unique().notNull(),
    tenantRoleId: uuid('tenant_role_id').references(() => tenantRoles.id),
    responsibilityProfile: jsonb('responsibility_profile')
      .$type<Record<string, unknown> | null>()
      .default(null),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    deliveryMethod: varchar('delivery_method', { length: 20 })
      .default('link')
      .notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    revokedAt: timestamp('revoked_at'),
    acceptedByUserId: uuid('accepted_by_user_id').references(() => users.id),
    createdById: uuid('created_by_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantEmailTokenUnique: uniqueIndex('tenant_invites_tenant_email_token_unique').on(
      table.tenantId,
      table.email,
      table.inviteToken,
    ),
  }),
);

export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  equipmentName: varchar('equipment_name', { length: 255 }).notNull(),
  issueDescription: text('issue_description').notNull(),
  impact: varchar('impact', { length: 20 }).notNull(),
  impactScore: integer('impact_score').default(0).notNull(),
  requiresRca: boolean('requires_rca').default(false).notNull(),
  rcaRequiredReason: text('rca_required_reason'),
  status: varchar('status', { length: 20 }).default('open').notNull(),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    parentId: uuid('parent_id'),
    type: varchar('type', { length: 20 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 255 }),
    companyId: varchar('company_id', { length: 100 }),
    photoUrl: text('photo_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    parentReference: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
    tenantCompanyIdUnique: uniqueIndex('assets_tenant_company_id_unique').on(
      table.tenantId,
      table.companyId,
    ),
  }),
);

export const rcas = pgTable('rcas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  rcaNumber: varchar('rca_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  equipmentName: varchar('equipment_name', { length: 255 }),
  location: varchar('location', { length: 255 }),
  status: varchar('status', { length: 20 }).default('open').notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  maintenanceTicketId: uuid('maintenance_ticket_id').references(() => maintenanceTickets.id),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

export const rcaOwnerRoutes = pgTable('rca_owner_routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  locationPattern: varchar('location_pattern', { length: 255 }),
  equipmentPattern: varchar('equipment_pattern', { length: 255 }),
  priority: integer('priority').default(100).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rcaTeamMembers = pgTable('rca_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => ({
  rcaUserUnique: uniqueIndex('rca_team_members_rca_user_unique').on(
    table.rcaId,
    table.userId,
  ),
}));

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  parentCommentId: uuid('parent_comment_id'),
  content: text('content').notNull(),
  mentions: jsonb('mentions').$type<string[] | null>().default(null),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  parentCommentReference: foreignKey({
    columns: [table.parentCommentId],
    foreignColumns: [table.id],
  }),
}));

export const brainstormingContributions = pgTable(
  'brainstorming_contributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 255 }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

export const fishbones = pgTable('fishbones', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  cause: text('cause').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const solutions = pgTable('solutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  submittedForApprovalAt: timestamp('submitted_for_approval_at'),
  approvedAt: timestamp('approved_at'),
  approvedById: uuid('approved_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const solutionApprovalEvents = pgTable('solution_approval_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  solutionId: uuid('solution_id')
    .references(() => solutions.id, { onDelete: 'cascade' })
    .notNull(),
  actorId: uuid('actor_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 30 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  brainstormingContributionId: uuid('brainstorming_contribution_id').references(
    () => brainstormingContributions.id,
    { onDelete: 'cascade' },
  ),
  solutionId: uuid('solution_id').references(() => solutions.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: varchar('file_size', { length: 20 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  uploadedById: uuid('uploaded_by_id').references(() => users.id).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  tenantRole: one(tenantRoles, {
    fields: [users.tenantRoleId],
    references: [tenantRoles.id],
  }),
  ownedRcas: many(rcas, { relationName: 'owner' }),
  createdRcas: many(rcas, { relationName: 'creator' }),
  rcaOwnerRoutes: many(rcaOwnerRoutes),
  teamMemberships: many(rcaTeamMembers),
  comments: many(comments),
  createdTickets: many(maintenanceTickets),
  createdTenantRoles: many(tenantRoles),
  createdTenantInvites: many(tenantInvites, { relationName: 'invite_creator' }),
  acceptedTenantInvites: many(tenantInvites, {
    relationName: 'invite_acceptor',
  }),
  assignedSolutions: many(solutions, { relationName: 'solution_assignee' }),
  approvedSolutions: many(solutions, { relationName: 'solution_approver' }),
  solutionApprovalEvents: many(solutionApprovalEvents),
}));

export const tenantRolesRelations = relations(tenantRoles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [tenantRoles.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [tenantRoles.createdById],
    references: [users.id],
  }),
  assignedUsers: many(users),
  invites: many(tenantInvites),
}));

export const tenantInvitesRelations = relations(tenantInvites, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvites.tenantId],
    references: [tenants.id],
  }),
  tenantRole: one(tenantRoles, {
    fields: [tenantInvites.tenantRoleId],
    references: [tenantRoles.id],
  }),
  createdBy: one(users, {
    fields: [tenantInvites.createdById],
    references: [users.id],
    relationName: 'invite_creator',
  }),
  acceptedBy: one(users, {
    fields: [tenantInvites.acceptedByUserId],
    references: [users.id],
    relationName: 'invite_acceptor',
  }),
}));

export const rcasRelations = relations(rcas, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [rcas.tenantId],
    references: [tenants.id],
  }),
  owner: one(users, {
    fields: [rcas.ownerId],
    references: [users.id],
    relationName: 'owner',
  }),
  creator: one(users, {
    fields: [rcas.createdById],
    references: [users.id],
    relationName: 'creator',
  }),
  maintenanceTicket: one(maintenanceTickets, {
    fields: [rcas.maintenanceTicketId],
    references: [maintenanceTickets.id],
  }),
  teamMembers: many(rcaTeamMembers),
  comments: many(comments),
  brainstormingContributions: many(brainstormingContributions),
  fishbones: many(fishbones),
  solutions: many(solutions),
  attachments: many(attachments),
}));

export const solutionsRelations = relations(solutions, ({ one, many }) => ({
  rca: one(rcas, {
    fields: [solutions.rcaId],
    references: [rcas.id],
  }),
  assignedTo: one(users, {
    fields: [solutions.assignedToId],
    references: [users.id],
    relationName: 'solution_assignee',
  }),
  approvedBy: one(users, {
    fields: [solutions.approvedById],
    references: [users.id],
    relationName: 'solution_approver',
  }),
  attachments: many(attachments),
  approvalEvents: many(solutionApprovalEvents),
}));

export const solutionApprovalEventsRelations = relations(
  solutionApprovalEvents,
  ({ one }) => ({
    solution: one(solutions, {
      fields: [solutionApprovalEvents.solutionId],
      references: [solutions.id],
    }),
    actor: one(users, {
      fields: [solutionApprovalEvents.actorId],
      references: [users.id],
    }),
  }),
);

export const rcaTeamMembersRelations = relations(rcaTeamMembers, ({ one }) => ({
  rca: one(rcas, {
    fields: [rcaTeamMembers.rcaId],
    references: [rcas.id],
  }),
  user: one(users, {
    fields: [rcaTeamMembers.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  rca: one(rcas, {
    fields: [comments.rcaId],
    references: [rcas.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'comment_thread',
  }),
  replies: many(comments, { relationName: 'comment_thread' }),
  attachments: many(attachments),
}));

export const brainstormingContributionsRelations = relations(
  brainstormingContributions,
  ({ one, many }) => ({
    rca: one(rcas, {
      fields: [brainstormingContributions.rcaId],
      references: [rcas.id],
    }),
    user: one(users, {
      fields: [brainstormingContributions.userId],
      references: [users.id],
    }),
    attachments: many(attachments),
  }),
);

export const maintenanceTicketsRelations = relations(maintenanceTickets, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [maintenanceTickets.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [maintenanceTickets.createdById],
    references: [users.id],
  }),
  rcas: many(rcas),
}));

export const rcaOwnerRoutesRelations = relations(rcaOwnerRoutes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rcaOwnerRoutes.tenantId],
    references: [tenants.id],
  }),
  owner: one(users, {
    fields: [rcaOwnerRoutes.ownerId],
    references: [users.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [assets.tenantId],
    references: [tenants.id],
  }),
  parent: one(assets, {
    fields: [assets.parentId],
    references: [assets.id],
    relationName: 'parent_asset',
  }),
  children: many(assets, { relationName: 'parent_asset' }),
}));

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type MaintenanceTicket = typeof maintenanceTickets.$inferSelect;
export type TenantRole = typeof tenantRoles.$inferSelect;
export type TenantInvite = typeof tenantInvites.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Rca = typeof rcas.$inferSelect;
export type RcaOwnerRoute = typeof rcaOwnerRoutes.$inferSelect;
export type RcaTeamMember = typeof rcaTeamMembers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type BrainstormingContribution =
  typeof brainstormingContributions.$inferSelect;
export type Fishbone = typeof fishbones.$inferSelect;
export type Solution = typeof solutions.$inferSelect;
export type SolutionApprovalEvent = typeof solutionApprovalEvents.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;

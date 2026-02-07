import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// TENANTS
// ============================================================================

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 63 }).unique().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // admin, rca_owner, team_member, operator
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// MAINTENANCE TICKETS (CMMS)
// ============================================================================

export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull(),
  equipmentName: varchar('equipment_name', { length: 255 }).notNull(),
  issueDescription: text('issue_description').notNull(),
  impact: varchar('impact', { length: 20 }).notNull(), // low, medium, high
  status: varchar('status', { length: 20 }).default('open').notNull(), // open, closed
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// RCAs
// ============================================================================

export const rcas = pgTable('rcas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  rcaNumber: varchar('rca_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  equipmentName: varchar('equipment_name', { length: 255 }),
  status: varchar('status', { length: 20 }).default('open').notNull(), // open, in_progress, closed
  ownerId: uuid('owner_id').references(() => users.id),
  maintenanceTicketId: uuid('maintenance_ticket_id').references(() => maintenanceTickets.id),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
});

// ============================================================================
// RCA TEAM MEMBERS
// ============================================================================

export const rcaTeamMembers = pgTable('rca_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

// ============================================================================
// COMMENTS (BRAINSTORMING)
// ============================================================================

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// FISHBONE DIAGRAMS
// ============================================================================

export const fishbones = pgTable('fishbones', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // Man, Machine, Method, Material, Environment, Measurement
  cause: text('cause').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// SOLUTIONS
// ============================================================================

export const solutions = pgTable('solutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, in_progress, completed, approved
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  approvedAt: timestamp('approved_at'),
  approvedById: uuid('approved_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// ATTACHMENTS
// ============================================================================

export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  solutionId: uuid('solution_id').references(() => solutions.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(), // Vercel Blob URL
  fileSize: varchar('file_size', { length: 20 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  uploadedById: uuid('uploaded_by_id').references(() => users.id).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// ============================================================================
// RELATIONS (for Drizzle queries)
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  ownedRcas: many(rcas, { relationName: 'owner' }),
  createdRcas: many(rcas, { relationName: 'creator' }),
  teamMemberships: many(rcaTeamMembers),
  comments: many(comments),
  createdTickets: many(maintenanceTickets),
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
  fishbones: many(fishbones),
  solutions: many(solutions),
  attachments: many(attachments),
}));

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

// ============================================================================
// TYPES
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type MaintenanceTicket = typeof maintenanceTickets.$inferSelect;
export type Rca = typeof rcas.$inferSelect;
export type RcaTeamMember = typeof rcaTeamMembers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Fishbone = typeof fishbones.$inferSelect;
export type Solution = typeof solutions.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;

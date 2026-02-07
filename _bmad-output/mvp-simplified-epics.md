# fixapp - MVP Simplified Epics & Stories

**Last Updated:** 2025-02-07
**Total Epics:** 7 (instead of 12)
**Total Stories:** ~40 (instead of 120+)
**Timeline:** 6-8 weeks

---

## Epic Overview

| Epic | Stories | Effort | Priority | Dependencies |
|------|---------|--------|----------|--------------|
| **Epic 1: Project Foundation** | 5 | 1-2 weeks | P0 | None |
| **Epic 2: Authentication & Users** | 6 | 1 week | P0 | Epic 1 |
| **Epic 3: CMMS Tickets** | 4 | 3-4 days | P1 | Epic 2 |
| **Epic 4: RCA Management** | 10 | 2 weeks | P0 | Epic 2, 3 |
| **Epic 5: Collaboration** | 6 | 1 week | P1 | Epic 4 |
| **Epic 6: Solutions Workflow** | 6 | 1 week | P0 | Epic 4 |
| **Epic 7: Dashboard & Reports** | 5 | 1 week | P2 | Epic 4, 6 |

---

## Epic 1: Project Foundation

**Goal:** Set up Next.js project with Vercel, database, and core infrastructure

**Acceptance Criteria:**
- ✅ Next.js 15 app running locally
- ✅ Deployed to Vercel
- ✅ Vercel Postgres connected
- ✅ Drizzle ORM configured with migrations
- ✅ Basic UI components (Shadcn) installed

### Stories

#### Story 1.1: Initialize Next.js Project
**As a** developer
**I want** to set up a new Next.js 15 project
**So that** we have a foundation to build on

**Tasks:**
- [ ] Run `npx create-next-app@latest fixapp --typescript --tailwind --eslint --app`
- [ ] Configure TypeScript strict mode
- [ ] Set up ESLint and Prettier
- [ ] Create basic folder structure (`/components`, `/lib`, `/app`)
- [ ] Test dev server runs

**Acceptance Criteria:**
- Project runs on `localhost:3000`
- TypeScript compiles without errors
- ESLint configured

**Effort:** 2 hours

---

#### Story 1.2: Set Up Vercel Deployment
**As a** developer
**I want** to deploy the app to Vercel
**So that** we have a production environment

**Tasks:**
- [ ] Create Vercel account
- [ ] Connect GitHub repo
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Verify deployment works

**Acceptance Criteria:**
- App accessible at `fixapp.vercel.app`
- Automatic deployments on git push
- Environment variables configured

**Effort:** 1 hour

---

#### Story 1.3: Configure Vercel Postgres
**As a** developer
**I want** to set up Vercel Postgres
**So that** we can store data

**Tasks:**
- [ ] Create Vercel Postgres database
- [ ] Get connection string
- [ ] Add `DATABASE_URL` to environment variables
- [ ] Test connection from local dev

**Acceptance Criteria:**
- Database created in Vercel dashboard
- Connection string works locally
- Connection string works in production

**Effort:** 1 hour

---

#### Story 1.4: Set Up Drizzle ORM
**As a** developer
**I want** to configure Drizzle ORM
**So that** we can interact with the database

**Tasks:**
- [ ] Install Drizzle: `npm install drizzle-orm @vercel/postgres`
- [ ] Install Drizzle Kit: `npm install -D drizzle-kit`
- [ ] Create `lib/db/schema.ts` (empty for now)
- [ ] Create `lib/db/index.ts` (DB client)
- [ ] Create `drizzle.config.ts`
- [ ] Test basic query works

**Acceptance Criteria:**
- Drizzle client connects to Vercel Postgres
- Can execute basic queries
- Migrations system configured

**Effort:** 3 hours

---

#### Story 1.5: Install Shadcn UI Components
**As a** developer
**I want** to install Shadcn UI
**So that** we have consistent, accessible UI components

**Tasks:**
- [ ] Run `npx shadcn-ui@latest init`
- [ ] Install base components: `button`, `input`, `card`, `form`, `table`, `dialog`
- [ ] Configure Tailwind theme (colors, fonts)
- [ ] Create sample page to test components

**Acceptance Criteria:**
- Shadcn components render correctly
- Theme matches design system
- All base components installed

**Effort:** 2 hours

---

## Epic 2: Authentication & Users

**Goal:** Implement user authentication with NextAuth and basic user management

**Acceptance Criteria:**
- ✅ Users can sign up and log in
- ✅ JWT sessions working
- ✅ Password reset via email
- ✅ Role-based access control
- ✅ Admin can manage users

### Stories

#### Story 2.1: Create User Database Schema
**As a** developer
**I want** to define user tables in Drizzle
**So that** we can store user data

**Tasks:**
- [ ] Define `tenants` table in `schema.ts`
- [ ] Define `users` table with fields: id, tenantId, email, passwordHash, name, role, createdAt
- [ ] Create migration: `npm run db:push`
- [ ] Verify tables created in Vercel Postgres

**Schema:**
```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // admin, rca_owner, team_member, operator
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Acceptance Criteria:**
- Tables created in database
- Can insert test user via SQL

**Effort:** 2 hours

---

#### Story 2.2: Install and Configure NextAuth
**As a** developer
**I want** to set up NextAuth with email/password
**So that** users can log in

**Tasks:**
- [ ] Install NextAuth: `npm install next-auth@beta bcryptjs`
- [ ] Create `/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Credentials provider with bcrypt password verification
- [ ] Add JWT callback to include role and tenantId in session
- [ ] Create `/app/login/page.tsx` login page
- [ ] Test login flow

**Acceptance Criteria:**
- User can log in with email/password
- Session includes user role and tenantId
- JWT token expires after 7 days
- Protected routes redirect to login

**Effort:** 4 hours

---

#### Story 2.3: Create Sign-Up Flow
**As a** user
**I want** to create an account
**So that** I can use the system

**Tasks:**
- [ ] Create `/app/signup/page.tsx`
- [ ] Create signup form (email, password, name)
- [ ] Hash password with bcrypt
- [ ] Insert user into database (default role: operator)
- [ ] Auto-login after signup
- [ ] Add validation (email format, password strength)

**Acceptance Criteria:**
- New user can sign up
- Password is hashed
- User automatically logged in after signup
- Email must be unique

**Effort:** 3 hours

---

#### Story 2.4: Implement Password Reset
**As a** user
**I want** to reset my password if I forget it
**So that** I can regain access to my account

**Tasks:**
- [ ] Create password reset token table
- [ ] Create `/app/forgot-password/page.tsx`
- [ ] Generate reset token and send email (Resend)
- [ ] Create `/app/reset-password/[token]/page.tsx`
- [ ] Validate token and update password
- [ ] Expire token after use or 1 hour

**Acceptance Criteria:**
- User receives password reset email
- Token expires after 1 hour
- User can set new password
- Old password no longer works

**Effort:** 4 hours

---

#### Story 2.5: Create User Management (Admin)
**As an** admin
**I want** to manage users
**So that** I can add/edit/delete users and assign roles

**Tasks:**
- [ ] Create `/app/(dashboard)/admin/users/page.tsx`
- [ ] List all users in tenant (table view)
- [ ] Add "Create User" button → opens dialog
- [ ] Create user form (email, name, role)
- [ ] Edit user (change role, name)
- [ ] Delete user (with confirmation)
- [ ] Protect route (admin only)

**Acceptance Criteria:**
- Admin can view all users
- Admin can create new user (sends invite email)
- Admin can change user role
- Admin can delete user
- Non-admins cannot access this page

**Effort:** 5 hours

---

#### Story 2.6: Set Up Role-Based Middleware
**As a** developer
**I want** to protect routes based on user role
**So that** only authorized users can access certain pages

**Tasks:**
- [ ] Create `lib/auth/permissions.ts` with role hierarchy
- [ ] Create higher-order function `requireRole(role)`
- [ ] Protect admin routes
- [ ] Create 403 Forbidden page
- [ ] Test with different roles

**Acceptance Criteria:**
- `/admin/*` routes require admin role
- Non-admins see 403 error
- Unauthenticated users redirect to login

**Effort:** 3 hours

---

## Epic 3: CMMS Tickets

**Goal:** Implement basic maintenance ticket creation and management

**Acceptance Criteria:**
- ✅ Users can create maintenance tickets
- ✅ Tickets have equipment, description, impact level
- ✅ Users can view ticket list
- ✅ Tickets can be linked to RCAs

### Stories

#### Story 3.1: Create Ticket Database Schema
**As a** developer
**I want** to define ticket table
**So that** we can store maintenance tickets

**Tasks:**
- [ ] Define `maintenance_tickets` table in schema
- [ ] Run migration
- [ ] Test inserting sample ticket

**Schema:**
```typescript
export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull(),
  equipmentName: varchar('equipment_name', { length: 255 }).notNull(),
  issueDescription: text('issue_description').notNull(),
  impact: varchar('impact', { length: 20 }).notNull(), // low, medium, high
  status: varchar('status', { length: 20 }).notNull(), // open, closed
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Acceptance Criteria:**
- Table created
- Auto-increment ticket number implemented

**Effort:** 2 hours

---

#### Story 3.2: Create New Ticket Page
**As a** user
**I want** to create a maintenance ticket
**So that** I can report equipment issues

**Tasks:**
- [ ] Create `/app/(dashboard)/tickets/new/page.tsx`
- [ ] Create form: equipment name, issue description, impact level
- [ ] Auto-generate ticket number (MT-YYYY-###)
- [ ] Save to database
- [ ] Redirect to ticket list after creation
- [ ] Show success toast

**Acceptance Criteria:**
- Form validates required fields
- Ticket number auto-generated
- Ticket saved to database
- User sees success message

**Effort:** 4 hours

---

#### Story 3.3: View Ticket List
**As a** user
**I want** to see all maintenance tickets
**So that** I can track equipment issues

**Tasks:**
- [ ] Create `/app/(dashboard)/tickets/page.tsx`
- [ ] Fetch tickets from database (filtered by tenant)
- [ ] Display in table: ticket number, equipment, impact, status, created date
- [ ] Add filters: status (all, open, closed), impact level
- [ ] Add search by equipment name or ticket number
- [ ] Paginate results (50 per page)

**Acceptance Criteria:**
- Tickets displayed in table
- Filters work correctly
- Search works
- Only current tenant's tickets visible

**Effort:** 4 hours

---

#### Story 3.4: View Ticket Details
**As a** user
**I want** to see ticket details
**So that** I can understand the full context

**Tasks:**
- [ ] Create `/app/(dashboard)/tickets/[id]/page.tsx`
- [ ] Display full ticket information
- [ ] Show linked RCA (if exists)
- [ ] Add "Create RCA from this ticket" button
- [ ] Show created by user and timestamp

**Acceptance Criteria:**
- All ticket details visible
- Linked RCA shown (if exists)
- "Create RCA" button works

**Effort:** 3 hours

---

## Epic 4: RCA Management

**Goal:** Core RCA creation, editing, assignment, and status workflow

**Acceptance Criteria:**
- ✅ Users can create RCAs (manual or from ticket)
- ✅ RCA Owners can edit RCAs
- ✅ RCA Owners can assign team members
- ✅ RCA status workflow works (Open → In Progress → Closed)
- ✅ Admins can delete RCAs

### Stories

#### Story 4.1: Create RCA Database Schema
**Tasks:**
- [ ] Define `rcas` table
- [ ] Define `rca_team_members` junction table
- [ ] Run migration

**Effort:** 2 hours

---

#### Story 4.2: Create RCA (Manual)
**As an** RCA Owner
**I want** to create an RCA manually
**So that** I can start a root cause investigation

**Tasks:**
- [ ] Create `/app/(dashboard)/rcas/new/page.tsx`
- [ ] Form: title, description, equipment
- [ ] Auto-generate RCA number (RCA-YYYY-###)
- [ ] Set creator as owner by default
- [ ] Status defaults to "Open"
- [ ] Save to database

**Acceptance Criteria:**
- Form validates required fields
- RCA number auto-generated
- RCA saved successfully
- Redirects to RCA detail page

**Effort:** 4 hours

---

#### Story 4.3: Create RCA from Ticket
**As an** RCA Owner
**I want** to create an RCA from a maintenance ticket
**So that** equipment and description are pre-filled

**Tasks:**
- [ ] Add "Create RCA" button to ticket detail page
- [ ] Pre-fill RCA form with ticket data
- [ ] Link RCA to ticket (foreign key)
- [ ] Update ticket status to "RCA Created"

**Acceptance Criteria:**
- RCA form pre-populated
- RCA linked to ticket
- Ticket shows linked RCA

**Effort:** 3 hours

---

#### Story 4.4: View RCA List
**As a** user
**I want** to see RCAs based on my role
**So that** I can find relevant investigations

**Tasks:**
- [ ] Create `/app/(dashboard)/rcas/page.tsx`
- [ ] Fetch RCAs based on role:
  - Admin: all RCAs
  - RCA Owner: owned + team member of
  - Team Member: assigned RCAs
  - Operator: created RCAs
- [ ] Display in table: RCA number, title, status, owner, created date
- [ ] Filter by status
- [ ] Search by RCA number or title

**Acceptance Criteria:**
- Users see appropriate RCAs
- Filters and search work
- Table sortable by columns

**Effort:** 5 hours

---

#### Story 4.5: View RCA Details
**As a** user
**I want** to see full RCA details
**So that** I can understand the investigation

**Tasks:**
- [ ] Create `/app/(dashboard)/rcas/[id]/page.tsx`
- [ ] Display RCA information (title, description, status, owner)
- [ ] Show team members
- [ ] Show linked ticket
- [ ] Show comments (from Epic 5)
- [ ] Show fishbone diagram (from Epic 5)
- [ ] Show solutions (from Epic 6)

**Acceptance Criteria:**
- All RCA information visible
- Clean, organized layout
- Related data loaded

**Effort:** 4 hours

---

#### Story 4.6: Edit RCA
**As an** RCA Owner
**I want** to edit RCA details
**So that** I can update information

**Tasks:**
- [ ] Add "Edit" button to RCA detail page (owner only)
- [ ] Create edit form (title, description, equipment)
- [ ] Update database
- [ ] Show success message

**Acceptance Criteria:**
- Only owner sees Edit button
- Changes saved successfully
- Cannot edit RCA number

**Effort:** 3 hours

---

#### Story 4.7: Assign/Change RCA Owner
**As an** admin or RCA Owner
**I want** to assign or change the RCA owner
**So that** the right person is responsible

**Tasks:**
- [ ] Add "Change Owner" dropdown to RCA detail page
- [ ] Dropdown lists users with "rca_owner" role
- [ ] Update owner in database
- [ ] Send email notification to new owner
- [ ] Log change in history (optional)

**Acceptance Criteria:**
- Owner can be changed
- New owner receives email
- Only admin or current owner can change

**Effort:** 3 hours

---

#### Story 4.8: Add/Remove Team Members
**As an** RCA Owner
**I want** to add team members to RCA
**So that** they can collaborate

**Tasks:**
- [ ] Create "Team Members" section on RCA detail page
- [ ] Add multi-select to add members
- [ ] Save to `rca_team_members` table
- [ ] Send email notification to added members
- [ ] Add "Remove" button for each member

**Acceptance Criteria:**
- Owner can add multiple members
- Members receive email notification
- Owner can remove members
- Cannot add duplicate members

**Effort:** 4 hours

---

#### Story 4.9: Change RCA Status
**As an** RCA Owner
**I want** to change RCA status
**So that** I can track progress

**Tasks:**
- [ ] Add status dropdown (Open, In Progress, Closed)
- [ ] Validate: cannot close if unapproved solutions exist
- [ ] Update status in database
- [ ] Record closed timestamp if closing

**Acceptance Criteria:**
- Owner can change status
- Cannot close with unapproved solutions
- Closed date recorded

**Effort:** 2 hours

---

#### Story 4.10: Delete RCA (Admin Only)
**As an** admin
**I want** to delete RCAs
**So that** I can remove incorrect or duplicate entries

**Tasks:**
- [ ] Add "Delete" button (admin only)
- [ ] Show confirmation dialog
- [ ] Delete RCA and related data (cascade)
- [ ] Redirect to RCA list

**Acceptance Criteria:**
- Only admin sees Delete button
- Confirmation required
- RCA and related data deleted
- Cannot delete if linked to ticket (unlink first)

**Effort:** 2 hours

---

## Epic 5: Collaboration

**Goal:** Enable team collaboration via comments, file uploads, and fishbone diagrams

**Acceptance Criteria:**
- ✅ Team members can add comments
- ✅ Users can upload files
- ✅ RCA Owner can create fishbone diagram
- ✅ Files stored in Vercel Blob

### Stories

#### Story 5.1: Create Comment Schema
**Tasks:**
- [ ] Define `comments` table
- [ ] Define `attachments` table
- [ ] Run migration

**Effort:** 1 hour

---

#### Story 5.2: Add Comments to RCA
**As a** team member
**I want** to add comments to RCA
**So that** I can share observations

**Tasks:**
- [ ] Create comments section on RCA detail page
- [ ] Add comment form (textarea)
- [ ] Save comment to database
- [ ] Display comments (author, timestamp, content)
- [ ] Order by newest first

**Acceptance Criteria:**
- Team members can add comments
- Comments display correctly
- Cannot edit/delete comments (MVP simplification)

**Effort:** 4 hours

---

#### Story 5.3: Set Up Vercel Blob Storage
**As a** developer
**I want** to configure Vercel Blob
**So that** we can store uploaded files

**Tasks:**
- [ ] Install `@vercel/blob`
- [ ] Create Blob store in Vercel dashboard
- [ ] Get read/write token
- [ ] Add to environment variables
- [ ] Test upload locally

**Acceptance Criteria:**
- Vercel Blob configured
- Can upload test file
- File URL accessible

**Effort:** 1 hour

---

#### Story 5.4: Upload Files to Comments
**As a** user
**I want** to attach files to comments
**So that** I can share evidence

**Tasks:**
- [ ] Add file input to comment form
- [ ] Create `/app/api/upload/route.ts`
- [ ] Upload file to Vercel Blob
- [ ] Save attachment metadata to database
- [ ] Display attachments (images inline, files as links)
- [ ] Limit: 10MB, formats: JPG, PNG, PDF, XLSX, DOCX

**Acceptance Criteria:**
- Files upload successfully
- Images display inline
- Documents downloadable
- File size validated

**Effort:** 5 hours

---

#### Story 5.5: Upload Files to RCA (General)
**As a** user
**I want** to upload files directly to RCA
**So that** I can attach general documentation

**Tasks:**
- [ ] Add "Attachments" section to RCA detail page
- [ ] Reuse upload API from Story 5.4
- [ ] Save with `rca_id` instead of `comment_id`
- [ ] Display general attachments separately

**Acceptance Criteria:**
- Files can be attached to RCA
- Separate from comment attachments

**Effort:** 2 hours

---

#### Story 5.6: Create Simple Fishbone Diagram
**As an** RCA Owner
**I want** to create fishbone entries
**So that** I can analyze root causes

**Tasks:**
- [ ] Define `fishbones` table
- [ ] Create "Fishbone" section on RCA detail page
- [ ] Add form: category (dropdown), cause (text)
- [ ] Save entries to database
- [ ] Display grouped by category (not visual diagram)
- [ ] Add delete entry button

**Categories:** Man, Machine, Method, Material, Environment, Measurement

**Acceptance Criteria:**
- Owner can add fishbone entries
- Entries grouped by category
- Owner can delete entries
- Not a visual diagram (list view for MVP)

**Effort:** 4 hours

---

## Epic 6: Solutions Workflow

**Goal:** Track solutions from creation to approval

**Acceptance Criteria:**
- ✅ RCA Owner can create solutions
- ✅ Solutions can be assigned to team members
- ✅ Assigned users can update status
- ✅ RCA Owner can approve solutions
- ✅ RCA cannot close with unapproved solutions

### Stories

#### Story 6.1: Create Solution Schema
**Tasks:**
- [ ] Define `solutions` table
- [ ] Run migration

**Effort:** 1 hour

---

#### Story 6.2: Add Solutions to RCA
**As an** RCA Owner
**I want** to define solutions
**So that** corrective actions are tracked

**Tasks:**
- [ ] Create "Solutions" section on RCA detail page
- [ ] Add form: description, assigned to (dropdown), due date
- [ ] Status defaults to "Pending"
- [ ] Save to database
- [ ] Send email to assigned user

**Acceptance Criteria:**
- Owner can create solutions
- Solutions saved successfully
- Assigned user receives email

**Effort:** 4 hours

---

#### Story 6.3: View Solutions
**As a** user
**I want** to see solutions for RCA
**So that** I know what actions are planned

**Tasks:**
- [ ] Display solutions in table on RCA detail page
- [ ] Columns: description, assigned to, status, due date
- [ ] Color-code by status (pending, in progress, completed, approved)
- [ ] Show overdue solutions (past due date)

**Acceptance Criteria:**
- Solutions displayed clearly
- Status colors help visibility
- Overdue solutions highlighted

**Effort:** 3 hours

---

#### Story 6.4: Update Solution Status
**As a** team member
**I want** to update my assigned solution status
**So that** owner knows progress

**Tasks:**
- [ ] Add status dropdown on solution row (assigned user only)
- [ ] Statuses: Pending → In Progress → Completed
- [ ] Update database
- [ ] Notify owner when marked completed

**Acceptance Criteria:**
- Assigned user can update status
- Cannot update others' solutions
- Owner notified when completed

**Effort:** 3 hours

---

#### Story 6.5: Attach Evidence to Solution
**As a** team member
**I want** to attach files when completing solution
**So that** I can provide evidence

**Tasks:**
- [ ] Add file upload to solution row
- [ ] Reuse Vercel Blob upload
- [ ] Save with `solution_id`
- [ ] Display attachments

**Acceptance Criteria:**
- Files can be attached to solutions
- Evidence visible to owner

**Effort:** 2 hours

---

#### Story 6.6: Approve Solutions
**As an** RCA Owner
**I want** to approve completed solutions
**So that** I can verify corrective actions

**Tasks:**
- [ ] Add "Approve" button for completed solutions (owner only)
- [ ] Update status: Completed → Approved
- [ ] Record approval timestamp and approver
- [ ] Show approved solutions with checkmark
- [ ] Notify assigned user of approval

**Acceptance Criteria:**
- Owner can approve completed solutions
- Approval recorded
- User notified

**Effort:** 3 hours

---

## Epic 7: Dashboard & Reports

**Goal:** Provide role-based dashboards and basic export functionality

**Acceptance Criteria:**
- ✅ Users see role-appropriate dashboard
- ✅ RCA list can be exported to CSV
- ✅ Simple PDF report can be generated

### Stories

#### Story 7.1: Create Admin Dashboard
**As an** admin
**I want** to see overall RCA statistics
**So that** I can track progress

**Tasks:**
- [ ] Create `/app/(dashboard)/page.tsx`
- [ ] Query counts: total RCAs, open, in progress, closed
- [ ] Show recent RCAs (last 10)
- [ ] Add links to RCA list

**Acceptance Criteria:**
- Counts accurate
- Recent RCAs displayed
- Links work

**Effort:** 3 hours

---

#### Story 7.2: Create RCA Owner Dashboard
**As an** RCA Owner
**I want** to see my RCAs and pending actions
**So that** I know what needs attention

**Tasks:**
- [ ] Create dashboard for rca_owner role
- [ ] Show: my owned RCAs, pending approvals count
- [ ] List overdue solutions
- [ ] Quick links to RCAs needing action

**Acceptance Criteria:**
- Owner sees relevant RCAs
- Pending actions highlighted

**Effort:** 3 hours

---

#### Story 7.3: Create Team Member Dashboard
**As a** team member
**I want** to see my assigned work
**So that** I know what to do

**Tasks:**
- [ ] Create dashboard for team_member role
- [ ] Show: assigned RCAs, my pending solutions
- [ ] List solutions due soon
- [ ] Quick links to solutions

**Acceptance Criteria:**
- Member sees assigned work
- Due dates visible

**Effort:** 2 hours

---

#### Story 7.4: Export RCA List to CSV
**As a** user
**I want** to export RCA list to CSV
**So that** I can analyze in Excel

**Tasks:**
- [ ] Add "Export CSV" button to RCA list page
- [ ] Create `/app/api/export/rcas/route.ts`
- [ ] Query RCAs (respect current filters)
- [ ] Generate CSV: RCA number, title, status, owner, created date, closed date
- [ ] Return as downloadable file

**Acceptance Criteria:**
- CSV file downloads
- Includes current filters
- Opens correctly in Excel

**Effort:** 3 hours

---

#### Story 7.5: Generate Simple PDF Report
**As an** RCA Owner
**I want** to generate a PDF report for RCA
**So that** I can share with management

**Tasks:**
- [ ] Install PDF library: `npm install jspdf` or `@react-pdf/renderer`
- [ ] Create `/app/api/reports/rca/[id]/route.ts`
- [ ] Generate PDF with: RCA details, team members, comments (text), fishbone (list), solutions
- [ ] Basic formatting (no advanced design)
- [ ] Return as download

**Acceptance Criteria:**
- PDF generated successfully
- All RCA information included
- Readable formatting

**Effort:** 5 hours

---

## Summary

**Total Effort Estimate:**
- Epic 1: 9 hours (~1-2 weeks with setup)
- Epic 2: 21 hours (~1 week)
- Epic 3: 13 hours (~3-4 days)
- Epic 4: 29 hours (~2 weeks)
- Epic 5: 17 hours (~1 week)
- Epic 6: 16 hours (~1 week)
- Epic 7: 16 hours (~1 week)

**Total: ~120 hours = 6-8 weeks** (accounting for testing, debugging, polish)

---

## Implementation Order

**Week 1-2:** Epic 1 + Epic 2
**Week 3:** Epic 3
**Week 4-5:** Epic 4
**Week 5:** Epic 5
**Week 6:** Epic 6
**Week 7:** Epic 7
**Week 8:** Testing, bug fixes, deployment

---

## Notes

- All stories are MVP-focused (no over-engineering)
- Deferring: AI, Office 365 SSO, WebSockets, job queues, complex analytics
- Focus: Get core workflow working end-to-end
- Can iterate based on user feedback after launch

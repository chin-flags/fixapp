# fixapp - MVP Product Requirements (Simplified)

**Last Updated:** 2025-02-07
**Target Launch:** 6-8 weeks from start
**Deployment:** Vercel

---

## Executive Summary

**fixapp MVP** is a simplified Root Cause Analysis (RCA) workflow management tool for manufacturing teams. This MVP focuses on **core RCA workflow** without complex enterprise features, AI, or advanced integrations.

### The Problem (Simplified)

Manufacturing teams track RCAs in spreadsheets or slow legacy systems. They need a fast, simple tool to:
- Create and track RCAs
- Collaborate on root cause analysis
- Assign and track solutions
- Get basic visibility

### The Solution (MVP)

A web application where:
- Operators create maintenance tickets and RCAs in under 2 minutes
- RCA Owners coordinate investigations with their teams
- Team members collaborate via comments and fishbone diagrams
- Admins get simple dashboards and exports

### What's OUT of MVP

❌ AI-powered solution suggestions
❌ Office 365 SSO (email/password only)
❌ Real-time WebSocket updates (simple refresh)
❌ Advanced multi-tenancy (simple tenant_id)
❌ Mobile push notifications (email only)
❌ Job queues (async functions)
❌ Complex analytics (basic counts only)
❌ SAP integration

---

## MVP Features (25 instead of 76)

### 1. Authentication & Users (4 features)

**F1.1: User Registration**
- Users can sign up with email and password
- Password requirements: min 8 chars, 1 uppercase, 1 number
- Email verification (optional for MVP)

**F1.2: User Login**
- Users log in with email/password
- JWT-based session (7 days)
- Password reset via email

**F1.3: User Roles**
- 4 roles: Admin, RCA Owner, Team Member, Operator
- Role assigned during user creation (Admin only)
- Role determines permissions

**F1.4: User Profile**
- Users can view and edit their profile
- Change name, email (with verification)
- Change password

---

### 2. CMMS Tickets (3 features)

**F2.1: Create Maintenance Ticket**
- Operators create tickets with:
  - Equipment name (text input)
  - Issue description (textarea)
  - Impact level (dropdown: Low, Medium, High)
- Auto-generated ticket number (e.g., MT-2024-001)

**F2.2: View Ticket List**
- Users see list of tickets
- Filter by status (Open, Closed)
- Filter by impact level
- Search by equipment name or ticket number

**F2.3: Link Ticket to RCA**
- When creating RCA, select linked ticket (optional)
- Ticket shows linked RCA
- RCA pre-fills equipment name from ticket

---

### 3. RCA Management (8 features)

**F3.1: Create RCA**
- Create RCA manually or from maintenance ticket
- Required fields:
  - Title (text)
  - Description (textarea)
  - Equipment (pre-filled from ticket if linked)
- Auto-generated RCA number (e.g., RCA-2024-001)
- Status defaults to "Open"

**F3.2: View RCA List**
- Users see RCAs based on role:
  - Admin: All RCAs
  - RCA Owner: RCAs they own or are team member of
  - Team Member: RCAs they're assigned to
  - Operator: RCAs they created
- Filter by status (Open, In Progress, Closed)
- Search by RCA number, title, equipment

**F3.3: View RCA Details**
- Full RCA information displayed:
  - Title, description, equipment, status
  - Owner and team members
  - Linked maintenance ticket
  - Comments
  - Fishbone diagram
  - Solutions
  - Attachments

**F3.4: Edit RCA**
- RCA Owner can edit:
  - Title, description
  - Equipment
- Cannot change RCA number or creation date

**F3.5: Assign RCA Owner**
- Admin or current RCA Owner can:
  - Assign/reassign RCA Owner (dropdown of users with RCA Owner role)
- New owner receives email notification

**F3.6: Add Team Members**
- RCA Owner can:
  - Add team members (multi-select from users)
  - Remove team members
- Team members receive email notification when added

**F3.7: Change RCA Status**
- RCA Owner can update status:
  - Open → In Progress (when investigation starts)
  - In Progress → Closed (when all solutions approved)
- Cannot close RCA if unapproved solutions exist

**F3.8: Delete RCA**
- Admin only
- Confirmation required
- Cannot delete if linked to maintenance ticket (unlink first)

---

### 4. Collaboration (3 features)

**F4.1: Add Comments**
- All team members can add comments to RCA
- Comment fields:
  - Text content (textarea, required)
  - Optional file attachment
- Comments show author and timestamp
- Cannot edit/delete comments (MVP simplification)

**F4.2: Upload Attachments**
- Users can upload files to:
  - RCA (general attachments)
  - Comments
  - Solutions
- Supported formats: JPG, PNG, PDF, XLSX, DOCX
- Max file size: 10MB per file
- Files stored in Vercel Blob

**F4.3: Fishbone Diagram (Simple)**
- RCA Owner creates fishbone entries:
  - Category (dropdown: Man, Machine, Method, Material, Environment, Measurement)
  - Cause (text input)
- Display as grouped list (not visual diagram for MVP)
- Can add/delete fishbone entries

---

### 5. Solutions (4 features)

**F5.1: Add Solutions**
- RCA Owner defines solutions:
  - Description (textarea)
  - Assigned to (dropdown of team members)
  - Due date (date picker, optional)
- Status defaults to "Pending"

**F5.2: Assign Solutions**
- RCA Owner can assign/reassign solutions
- Assigned user receives email notification
- Due date can be set/updated

**F5.3: Update Solution Status**
- Assigned user can update status:
  - Pending → In Progress
  - In Progress → Completed
- Can attach evidence when marking Completed

**F5.4: Approve Solutions**
- RCA Owner can:
  - Review completed solutions
  - Approve (status: Completed → Approved)
  - Reject with comment (Completed → In Progress)
- Only approved solutions allow RCA closure

---

### 6. Dashboard & Reports (3 features)

**F6.1: Simple Dashboard**
- Role-specific home page showing:
  - **Admin:**
    - Total RCAs (count by status)
    - Recent RCAs (last 10)
  - **RCA Owner:**
    - My RCAs (owned RCAs with pending actions)
    - Pending approvals count
  - **Team Member:**
    - My assigned RCAs
    - My pending solutions (count)
  - **Operator:**
    - My submitted tickets/RCAs

**F6.2: Export RCA List (CSV)**
- Users can export RCA list to CSV
- Includes: RCA number, title, status, owner, created date, closed date
- Filtered by current view (respects status filters)

**F6.3: RCA Report (Simple PDF)**
- RCA Owner can generate PDF report for single RCA
- Includes:
  - RCA details
  - Team members
  - Comments (text only)
  - Fishbone entries (text list)
  - Solutions with status
- Basic formatting (no advanced design)

---

## User Roles & Permissions

| Feature | Admin | RCA Owner | Team Member | Operator |
|---------|-------|-----------|-------------|----------|
| **Tickets** |
| Create ticket | ✓ | ✓ | ✓ | ✓ |
| View all tickets | ✓ | ✓ | ✓ | ✓ |
| **RCAs** |
| Create RCA | ✓ | ✓ | ✗ | ✗ |
| View all RCAs | ✓ | ✗ | ✗ | ✗ |
| View assigned RCAs | ✓ | ✓ | ✓ | Own only |
| Edit RCA | ✓ | Own only | ✗ | ✗ |
| Assign owner | ✓ | Own only | ✗ | ✗ |
| Add team members | ✓ | Own only | ✗ | ✗ |
| Change status | ✓ | Own only | ✗ | ✗ |
| Delete RCA | ✓ | ✗ | ✗ | ✗ |
| **Collaboration** |
| Add comments | ✓ | ✓ | ✓ | ✗ |
| Upload files | ✓ | ✓ | ✓ | ✓ |
| Create fishbone | ✓ | Own RCA | ✗ | ✗ |
| **Solutions** |
| Add solutions | ✓ | Own RCA | ✗ | ✗ |
| Update solution status | ✓ | ✓ | Assigned only | ✗ |
| Approve solutions | ✓ | Own RCA | ✗ | ✗ |
| **Reports** |
| View dashboard | ✓ | ✓ | ✓ | ✓ |
| Export CSV | ✓ | ✓ | ✗ | ✗ |
| Generate PDF | ✓ | Own RCA | ✗ | ✗ |
| **Users** |
| Manage users | ✓ | ✗ | ✗ | ✗ |
| Assign roles | ✓ | ✗ | ✗ | ✗ |

---

## Non-Functional Requirements (Simplified)

### Performance
- Page load: < 3 seconds (relaxed from 2 seconds)
- API response: < 1 second for CRUD operations
- File upload: Support up to 10MB files

### Security
- Passwords hashed with bcrypt
- JWT tokens with 7-day expiry
- HTTPS enforced (Vercel default)
- Input validation on all forms
- SQL injection prevented (Drizzle ORM)

### Scalability (MVP)
- Support 1 tenant initially
- Support 50 users
- Support 500 RCAs
- Can scale horizontally on Vercel

### Usability
- Mobile-responsive design
- Touch-friendly on tablets
- Minimal clicks (RCA creation in 2 minutes)
- Clear error messages

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- No IE11 support

---

## Success Criteria (MVP)

### User Success
- Operator creates ticket + RCA in under 2 minutes
- RCA Owner coordinates investigation without emails
- Team members contribute via simple comments
- Admin exports RCA list to Excel/CSV for reporting

### Technical Success
- Zero data loss
- 99% uptime (Vercel SLA)
- All CRUD operations working
- Email notifications sent reliably

### Business Success
- 1 organization using the system daily
- 10+ RCAs created and closed
- Positive user feedback vs. spreadsheets

---

## Out of Scope (Post-MVP)

The following are **explicitly not in MVP** and will be considered for V2:

### Advanced Features
- AI-powered solution suggestions
- Cross-location pattern detection
- Predictive analytics

### Enterprise Features
- Office 365 SSO
- SAML authentication
- Multi-factor authentication
- Advanced audit logging
- SOC 2 compliance

### Integrations
- SAP integration
- External CMMS integration
- Webhook APIs

### Advanced UX
- Real-time WebSocket updates
- Mobile push notifications
- Drag-and-drop fishbone diagrams
- Advanced visualizations
- Custom branding per tenant

### Infrastructure
- Job queues (Bull/Redis)
- Separate AI/ML service
- Row-Level Security
- Dedicated databases per tenant
- Kubernetes deployment

---

## Technology Constraints (MVP)

### Must Use
- Next.js 15 (App Router)
- Vercel (deployment)
- Vercel Postgres (database)
- NextAuth.js (authentication)
- Drizzle ORM (database access)

### Cannot Use
- Docker (not needed for Vercel)
- NestJS (use Next.js API routes)
- TypeORM (use Drizzle)
- Bull/Redis (not needed for MVP scale)
- Socket.io (not needed for MVP)
- AWS services (use Vercel equivalents)

---

## Data Model (Core Entities)

```
Tenant
├── Users (email, password, role)
├── Maintenance Tickets
│   └── RCAs (many-to-one)
└── RCAs
    ├── Team Members (many-to-many with Users)
    ├── Comments
    │   └── Attachments
    ├── Fishbone Entries
    └── Solutions
        └── Attachments
```

---

## User Journeys (Simplified)

### Journey 1: Operator Creates RCA
1. Operator logs in
2. Clicks "New Ticket" from dashboard
3. Fills equipment, description, impact → Save (30 seconds)
4. System prompts: "Create RCA for this ticket?"
5. Operator clicks "Yes" → RCA created with pre-filled data (10 seconds)
6. RCA auto-assigned to appropriate owner
7. Operator receives confirmation

**Total time: 1 minute**

### Journey 2: RCA Owner Manages Investigation
1. RCA Owner receives email: "New RCA assigned"
2. Logs in, sees RCA on dashboard
3. Adds 3 team members (multi-select dropdown)
4. Team members receive email notifications
5. Views comments from team (investigation notes)
6. Creates fishbone entries (categories + causes)
7. Defines 3 solutions, assigns to team members
8. Team members complete solutions
9. RCA Owner approves solutions
10. Closes RCA

**Total time: Managed over 2-3 days without chaos**

### Journey 3: Admin Reviews Progress
1. Admin logs in
2. Dashboard shows: 10 open RCAs, 25 closed RCAs
3. Clicks "Export CSV" to get list for weekly report
4. Opens in Excel, creates pivot table
5. Presents to management

**Total time: 5 minutes to prepare report**

---

## MVP Timeline

**Week 1-2: Foundation**
- Project setup (Next.js, Vercel, Drizzle)
- Authentication (NextAuth with email/password)
- User management (CRUD users, roles)
- Database schema

**Week 3-4: Core RCA**
- CMMS tickets (create, view, list)
- RCA creation (manual + from ticket)
- RCA management (edit, assign owner, team members)
- Status workflow

**Week 5: Collaboration**
- Comments system
- File uploads (Vercel Blob)
- Simple fishbone diagram

**Week 6: Solutions**
- Solution creation and assignment
- Status tracking
- Approval workflow

**Week 7: Dashboard & Reports**
- Role-based dashboards
- CSV export
- Simple PDF report

**Week 8: Polish & Deploy**
- Testing
- Bug fixes
- Deploy to production
- User training

---

## Conclusion

This MVP delivers **core RCA workflow** without enterprise complexity:

✅ 25 features instead of 76
✅ 6-8 weeks instead of 20-30 weeks
✅ Simple tech stack (Next.js + Vercel)
✅ $0-50/month cost
✅ Production-ready on Vercel

**Ship fast. Learn fast. Iterate based on real usage.**

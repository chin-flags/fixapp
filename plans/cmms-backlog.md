# CMMS Internal Ticket Backlog

This backlog breaks the CMMS expansion into internal tickets so we can track implementation as we move forward. Status values: `Planned`, `In Progress`, `Blocked`, `Done`.

## Phase 1: Core CMMS Ticketing and RCA Hooks

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-1 | CMMS ticket model + CRUD | Create corrective maintenance tickets with equipment, issue, priority, status | FR1, FR66, FR70 | P0 | Done |
| CMMS-2 | Impact scoring + RCA flagging | Impact criteria config and auto-flag for RCA | FR2, FR67, FR68 | P0 | Done |
| CMMS-3 | Create RCA from flagged ticket | Pre-filled RCA creation flow | FR3 | P0 | Done |
| CMMS-4 | Manual RCA creation enhancements | Minimal required fields and prefill support | FR4 | P1 | Done |
| CMMS-5 | RCA attachments on creation | File uploads during RCA creation | FR5 | P1 | Done |
| CMMS-6 | Auto-assign RCA owner | Equipment/location routing rules | FR6 | P1 | Done |
| CMMS-7 | RCA list views by role | Owner and operator views | FR7, FR37 | P1 | Done |
| CMMS-8 | RCA search and filters | Status, location, equipment, date, assignees | FR12 | P1 | Done |
| CMMS-9 | RCA to ticket linking | Link corrective actions and RCA | FR69, FR71 | P1 | Done |

## Phase 2: Collaboration + Analysis Tools

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-10 | RCA team management | Add/remove team members, mentoring | FR8, FR16 | P1 | In Progress |
| CMMS-11 | Brainstorming contributions | Notes + file uploads | FR13, FR14 | P1 | In Progress |
| CMMS-12 | RCA comments | Threaded comments and mentions | FR15, FR50 | P1 | In Progress |
| CMMS-13 | Fishbone diagrams | Create/edit fishbone | FR18, FR19 | P1 | Planned |
| CMMS-14 | Fishbone auto-suggestions | Pre-populate from brainstorming | FR20 | P2 | Planned |
| CMMS-15 | Root cause + solutions | Create root causes and corrective actions | FR21, FR22 | P1 | Planned |
| CMMS-16 | Solution assignment + status | Assign, update status, evidence | FR23, FR24, FR25 | P1 | Planned |

## Phase 3: Approvals + Notifications

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-17 | Approval workflow | Submit and approve solutions | FR33, FR34, FR36 | P1 | Done |
| CMMS-18 | Approval audit trail | Track approvals + timestamps | FR35 | P1 | Done |
| CMMS-19 | Notifications core | Email notifications for assignment, approvals, comments | FR17, FR46, FR47, FR49, FR50 | P1 | In Progress |
| CMMS-20 | Reminders | Due date reminders and overdue alerts | FR48, FR44 | P2 | Planned |

## Phase 4: Dashboards + Visibility

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-21 | Role-based dashboards | Owner/team/country/global views | FR38, FR39, FR40, FR41 | P1 | In Progress |
| CMMS-22 | Metrics + bottleneck detection | Time to resolution, phase aging | FR42, FR43 | P2 | In Progress |
| CMMS-23 | Pattern detection | Similar issue clustering | FR45 | P2 | In Progress |

**Phase 4 progress notes:**
- Added a role-aware RCA dashboard summary endpoint and replaced the placeholder dashboard with real visibility views.
- Current dashboard slice includes scope-based totals, throughput trend, open-age buckets, bottleneck signals, hotspot locations, and early repeated-issue clustering.
- Remaining work is to harden country/global scoping, deepen the phase-aging and bottleneck model, and evolve pattern detection beyond heuristic clustering.

## Phase 5: AI and Cross-Tenant Learning

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-24 | RCA similarity matching | Match symptoms to past cases | FR26, FR27 | P2 | Planned |
| CMMS-25 | AI solution suggestions | Suggestions + acceptance feedback | FR28, FR29, FR30 | P2 | Planned |
| CMMS-26 | Cross-tenant learning controls | Manual linking + isolation | FR31, FR32 | P2 | Planned |

## Phase 6: Reporting + Integrations

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-27 | PDF RCA reports | Charts and timeline | FR53, FR56, FR57 | P2 | Planned |
| CMMS-28 | Excel export | Filtering and analytics export | FR54, FR55 | P2 | Planned |
| CMMS-29 | Data migration tooling | Import + validation | FR72, FR73 | P2 | Planned |
| CMMS-30 | Public API + webhooks | Integrations, webhooks | FR74, FR75 | P3 | Planned |
| CMMS-31 | SAP integration | External SAP API integration | FR76 | P3 | Planned |

## Phase 7: User and Tenant Management

| ID | Title | Scope | FRs | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| CMMS-32 | User management UI | Admin create/manage users | FR58 | P1 | Planned |
| CMMS-33 | Role management | Role assignment & enforcement | FR59, FR61 | P1 | Planned |
| CMMS-34 | Org hierarchy | Country/plant/team structure | FR60 | P2 | Planned |
| CMMS-35 | Audit logging | Action audit trail | FR64 | P1 | Planned |
| CMMS-36 | Tenant settings | Branding, workflow rules | FR65 | P2 | Planned |
| CMMS-37 | Office 365 SSO | SAML/OAuth integration | FR62 | P3 | Planned |
| CMMS-38 | Azure AD provisioning | SCIM/automation | FR63 | P3 | Planned |
| CMMS-39 | Team onboarding and invites | Post-signup admin invites team members, assigns custom tenant-defined roles (e.g. Engineer, Plant Manager), manages role settings in app settings, supports shareable join links first with email invites later, allows both new account creation and existing accounts joining the tenant via invite, and captures both responsibility metadata and future policy-system compatible permissions | FR58, FR59, FR61, FR65 | P1 | In Progress |
| CMMS-40 | Tenant custom role model | Persist tenant-defined roles, descriptions, lifecycle state, and responsibility templates with policy-system ready structure | FR58, FR59, FR61, FR65 | P1 | In Progress |
| CMMS-41 | Person-specific invite model | Create one-link-per-person invite records with recipient identity, intended role, responsibilities, expiry, and revocation state | FR58, FR59, FR65 | P1 | In Progress |
| CMMS-42 | Invite acceptance flow | Support invite acceptance for both new accounts and existing accounts joining the tenant | FR58, FR59, FR61 | P1 | Done |
| CMMS-43 | Settings roles and invites UI | Add Settings screens for custom role management, invite creation, invite status, and link revocation | FR58, FR59, FR65 | P1 | Done |
| CMMS-44 | Team member role management | Let admins update joined users' roles and responsibilities after onboarding | FR58, FR59, FR61 | P1 | Done |
| CMMS-45 | Invite delivery and audit trail | Support share/copy link workflows now, email delivery later, and audit invite/role lifecycle events | FR58, FR64, FR65 | P2 | Planned |

### CMMS-39: Team Onboarding and Invites

**Goal:** Enable tenant admins to onboard their team immediately after signup by creating custom roles, sharing invite links, assigning responsibilities, and evolving toward policy-based permissions without reworking the model later.

**Scope:**
- Add a Settings area where admins can define and manage tenant-specific roles such as Engineer, Plant Manager, Supervisor, or Reliability Lead.
- Allow admins to assign both a role and responsibility metadata to invited users.
- Support shareable invite links as the primary onboarding path.
- Support email invites as a secondary delivery format using the same invite flow.
- Allow invite recipients to either create a new account or join the tenant with an existing account.
- Allow admins to edit roles and responsibilities after a user has joined.
- Design role and permission storage so a future policy system can replace or augment simple role-based access without breaking tenant data.

**Acceptance Criteria:**
- A newly signed-up admin can open Settings and create custom tenant roles.
- A role can include a display name, description, and responsibility metadata.
- An admin can generate a person-specific shareable invite link for a selected role.
- An admin can optionally send the same invite through email later without changing the underlying invite model.
- A recipient using an invite link can either create a new account or join with an existing account.
- Joining via invite links the user to the correct tenant and assigns the intended role and responsibilities.
- Admins can update a team member's role and responsibilities after they join.
- Admins can deactivate or revoke invite links.
- The system records invite status such as pending, accepted, expired, or revoked.
- Each invite link is issued for one intended person and cannot be reused for multiple team members.
- The permission model supports custom tenant roles now and is structured so policy-based permissions can be introduced later.

**Primary Flows:**
1. Admin signs up and lands in the app.
2. Admin opens Settings and configures custom roles for their tenant.
3. Admin creates an invite for a role and copies a shareable join link.
4. Recipient opens the link and either signs up or signs in with an existing account.
5. System attaches the recipient to the tenant with the assigned role and responsibilities.
6. Admin later edits that user's role, responsibilities, or access rules from Settings.

**Sub-Tasks:**
- Define tenant role model for custom role names, descriptions, and lifecycle state.
- Define responsibility metadata model for department, plant, team, approver, or similar assignments.
- Define invite model covering token/link generation, intended recipient identity, expiry, status, inviter, intended role, and intended responsibilities.
- Design join flow for both new-account and existing-account acceptance.
- Add Settings UI for role management and invite management.
- Add admin UI for team member role/responsibility reassignment.
- Add audit trail events for invite creation, acceptance, revocation, and role changes.
- Document extension points for future policy-based permissions.

**Notes / Future Considerations:**
- Keep tenant-defined role labels separate from internal authorization primitives.
- Prefer modeling permissions as attachable capabilities or policies later, rather than hard-coding behavior to role names like Engineer or Plant Manager.
- Invite links should be one-per-person, controlled, and revocable by default.

**Implementation Breakdown:**
- `CMMS-40` establishes the tenant custom role and responsibility model.
- `CMMS-41` introduces the invite entity and person-specific link lifecycle.
- `CMMS-42` implements the recipient join flow for both new and existing users.
- `CMMS-43` adds the Settings experience for roles and invites.
- `CMMS-44` covers post-join admin management of roles and responsibilities.
- `CMMS-45` covers delivery options and auditability around invites and role changes.

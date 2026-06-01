# FixApp Testing Strategy

## Objective

Build a test suite that gives high confidence across the whole app without over-indexing on brittle UI-only tests. The app is a Next.js 15 frontend with server-side data access, route handlers, tenant-scoped auth, and several feature-heavy workflows. A good strategy here is a layered test pyramid:

- Fast unit tests for pure logic and state transitions
- Integration tests for route handlers, server modules, and database-backed workflows
- Targeted browser E2E tests for the highest-value user journeys

The goal is not "100% coverage". The goal is confidence in tenant isolation, auth, workflow correctness, and regression detection.

## Current State

The repo currently has no active test setup wired in `package.json`, even though the README references `test` commands. The app surface already includes several risk-heavy areas:

- Credentials auth and password reset
- Tenant signup, invites, and team management
- Asset hierarchy CRUD
- Ticket and RCA workflows
- RCA collaboration and approval flows
- Dashboard aggregations
- A backend proxy route that still forwards some requests to an external service

That means we should start with infrastructure and high-risk business workflows first, not with broad snapshot coverage.

## Testing Principles

1. Test business behavior close to where it lives.
2. Keep pure logic tests fast and numerous.
3. Use real database integration for tenant-scoped server logic.
4. Use browser E2E only for critical journeys that cross auth, routing, forms, and persistence.
5. Prefer deterministic fixtures over shared mutable seed data.
6. Explicitly test failure paths, authorization checks, and multi-tenant isolation.

## Recommended Stack

### Core tools

- `vitest` for unit and integration tests
- `@testing-library/react` and `@testing-library/user-event` for client components
- `jsdom` for component test environment
- `playwright` for browser E2E
- `testcontainers` or a dedicated Docker Postgres for integration/E2E database runs

### Why this stack

- `vitest` fits the current TypeScript/Next setup well and is faster to iterate with than standing up Jest from scratch.
- Testing Library is the right fit for the existing client-heavy forms and interaction flows.
- Playwright is the best choice for validating auth, navigation, and form workflows end to end.
- Real Postgres-backed integration tests matter because much of the app behavior depends on Drizzle queries, route handlers, and tenant scoping.

## Test Pyramid

Target distribution:

- `60-70%` unit tests
- `20-30%` integration tests
- `10-15%` E2E tests

This app should not lean mostly on E2E. Too much behavior lives in server modules and route handlers where integration tests will be cheaper and more stable.

## Suite Structure

Recommended layout:

```text
tests/
  unit/
    lib/
    hooks/
    components/
  integration/
    api/
    server/
    auth/
  e2e/
    auth/
    settings/
    assets/
    tickets/
    rca/
  fixtures/
    factories/
    seeds/
  helpers/
    db/
    auth/
    render/
```

Recommended naming:

- `*.unit.test.ts`
- `*.int.test.ts`
- `*.e2e.spec.ts`

## What to Test

## 1. Unit Tests

Unit tests should focus on pure logic, transformations, formatting, permission checks, and state rules.

### Priority unit targets

- `src/lib/auth/permissions.ts`
  - role hierarchy
  - `hasPermission`
  - `isAdmin`
  - `canManageRcas`
  - `canViewAllRcas`
- `src/lib/server/frontend-assets.ts`
  - `buildAssetHierarchy`
  - child grouping and ordering assumptions
- `src/lib/server/frontend-account.ts`
  - role slug creation behavior
  - date serialization helpers
  - base URL and link generation helpers
- `src/app/rca/[id]/RcaCollaborationClient.tsx`
  - date formatting helpers
  - attachment size formatting
  - solution status formatting
- `src/components/assets/AssetExplorerPicker.tsx`
  - tree search helpers like `findExplorerNodeById`
- Any filtering/counting logic inside RCA, ticket, asset, and dashboard screens that can be extracted cleanly

### Expectations

- These tests should be fast and isolated.
- No database access.
- No network.
- Minimal mocking.

## 2. Component Tests

Component tests should verify user-visible behavior for client components with meaningful interaction logic.

### Priority component targets

- Auth forms
  - `src/app/login/LoginClient.tsx`
  - `src/app/signup/SignupClient.tsx`
  - `src/app/forgot-password/ForgotPasswordClient.tsx`
  - `src/app/reset-password/ResetPasswordClient.tsx`
- Asset management
  - `src/app/assets/AssetsClient.tsx`
  - `src/components/assets/AddAssetForm.tsx`
  - `src/components/assets/AssetTree.tsx`
  - `src/components/assets/AssetTreeNode.tsx`
- Settings
  - `src/app/settings/SettingsClient.tsx`
- RCA screens
  - `src/app/rca/RcaFilters.tsx`
  - `src/app/tickets/TicketFilters.tsx`
  - selective interaction-heavy parts of `RcaCollaborationClient`

### What component tests should verify

- Validation and required field behavior
- Loading, success, and error states
- Disabled states during pending submissions
- Dialog open/close flows
- Table/filter UI behavior
- Local optimistic or post-submit state updates
- Clipboard and other browser API fallbacks where used

### Mocking guidance

- Mock `next-auth/react` session state in client tests.
- Mock `backendApi` or fetch wrappers at the module boundary.
- Mock `navigator.clipboard` where needed.
- Avoid mocking child components unless they are visually heavy and irrelevant to the behavior under test.

## 3. Integration Tests

Integration tests are the most important layer for this app. They should exercise route handlers and server modules against a real test database.

### Primary integration targets

#### Auth and account flows

- `src/lib/auth/config.ts`
  - valid credentials login
  - rejected login for missing subdomain
  - rejected login for inactive tenant
  - rejected login for inactive user
  - rejected login for wrong password
- `src/lib/server/frontend-account.ts`
  - `signupTenant`
  - `issuePasswordReset`
  - `resetPassword`
  - `listTenantRoles`
  - role slug uniqueness
- Routes:
  - `src/app/api/auth/signup/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/reset-password/route.ts`

#### Settings, invites, and team management

- `src/app/api/settings/roles/route.ts`
- `src/app/api/settings/invites/route.ts`
- `src/app/api/settings/invites/[inviteId]/revoke/route.ts`
- `src/app/api/settings/team-members/route.ts`
- `src/app/api/settings/team-members/[memberId]/route.ts`
- `src/app/api/join/[token]/route.ts`
- `src/app/api/join/accept/route.ts`

Test cases:

- admin-only access enforcement
- invite creation and retrieval
- invite revocation
- expired invite handling
- accepting invite as new or existing user
- correct tenant assignment on acceptance
- role/responsibility persistence
- prevention of cross-tenant access and updates

#### Asset management

- `src/lib/server/frontend-assets.ts`
- `src/app/api/assets/route.ts`
- `src/app/api/assets/[id]/route.ts`
- `src/app/api/assets/hierarchy/route.ts`

Test cases:

- create asset under tenant
- update asset only within tenant scope
- delete leaf node succeeds
- delete parent with children fails
- hierarchy output shape is correct
- company ID uniqueness is respected
- unauthorized requests fail cleanly

#### Ticket and RCA data access

- `src/lib/server/operations-records.ts`
- page loader dependencies for ticket and RCA pages

Test cases:

- RCA list filtering by status, assignee, location, equipment, date
- role-based RCA visibility
- ticket list filtering and linked RCA mapping
- RCA owner option listing
- RCA detail record shape
- team member add/remove workflow
- solution approval status transitions
- attachment associations
- empty-state behavior

#### Dashboard aggregation

- `src/lib/server/rca-dashboard.ts`

Test cases:

- correct counts by scope
- throughput and aging buckets
- bottleneck metrics
- repeated issue grouping
- tenant scope enforcement

#### Backend proxy route

- `src/app/api/backend/[...path]/route.ts`

Test cases:

- forwards allowed headers only
- preserves method and query string
- passes through body for non-GET requests
- returns `503` fallback when upstream is unavailable

This route should be tested with mocked `fetch`, not a real upstream service.

## 4. End-to-End Tests

E2E should cover only critical user journeys that prove the app works as a system.

### Required E2E flows

1. Tenant signup and first login
2. Forgot password and reset password
3. Admin creates a custom role, creates an invite, copies the invite link, and invited user joins
4. Admin updates a team member role or activation state
5. Asset hierarchy CRUD
6. Ticket list filtering and ticket detail view
7. Create RCA from ticket or standalone RCA creation
8. RCA detail collaboration basics
   - add team member
   - add note or comment
   - add/edit solution
   - submit and approve solution
9. Dashboard renders tenant-scoped metrics from seeded data

### E2E guidance

- Use seeded, deterministic tenants and users.
- Keep tests independent.
- Avoid deep UI assertions on styling or exact copy unless it matters.
- Prefer stable selectors like `getByRole`, `getByLabelText`, and explicit `data-testid` only where semantics are insufficient.

## Multi-Tenant Test Data Strategy

This app is tenant-scoped almost everywhere, so fixture design matters.

### Required baseline fixtures

- `tenantA`
  - active admin
  - RCA owner
  - operator
- `tenantB`
  - active admin
  - standard member
- assets with parent-child hierarchy
- tickets in multiple statuses and priorities
- RCAs with different owners, states, linked tickets, comments, fishbones, and solutions
- active, expired, accepted, and revoked invites

### Rules

- Every integration suite should create its own tenant-scoped records or use isolated fixture builders.
- Do not rely on one shared mutable global seed for all tests.
- Always include at least one cross-tenant record to verify isolation.

## Environment Strategy

### Unit and component tests

- Run in-process with `vitest`
- No real database
- No network

### Integration tests

- Run against a real Postgres test database
- Reset database between files or suites
- Apply schema before test execution
- Seed only the minimum data needed per suite

### E2E tests

- Start the app against a dedicated test database
- Seed deterministic scenario data before the suite
- Use a separate `AUTH_SECRET` and test app URL

## Mocking Boundaries

Use mocks at the edges, not in the middle of the business logic.

### Mock these

- `next-auth/react` in client component tests
- `fetch` for the backend proxy route and isolated client-side API wrappers
- browser-only APIs like clipboard
- time where expiration logic matters

### Do not mock these in integration tests

- Drizzle queries
- route handlers under test
- tenant authorization logic
- server-side data mappers and aggregators

If those are mocked, the most important regressions in this app will be missed.

## CI Gates

Recommended pipeline:

1. Typecheck
2. Unit and component tests
3. Integration tests with Postgres
4. Build
5. Playwright smoke suite on main flows

Recommended merge gate:

- unit/component tests required on every PR
- integration tests required on every PR
- smoke E2E required on every PR
- fuller E2E suite can run on `main`, nightly, or before release until runtime is under control

## Coverage Priorities

Treat these as P0 regression surfaces:

- auth correctness
- tenant isolation
- invite lifecycle
- asset hierarchy integrity
- RCA visibility by role
- RCA collaboration and approval state transitions
- dashboard aggregation correctness

Treat these as P1:

- presentational UI states
- non-critical layout rendering
- reusable UI primitives from `src/components/ui`

Do not spend early effort snapshot-testing generic UI primitives unless they carry app-specific behavior.

## Rollout Plan

### Phase 0: Test Infrastructure

- add `vitest`, Testing Library, `jsdom`, and Playwright
- add `test`, `test:unit`, `test:integration`, and `test:e2e` scripts
- add shared test helpers and fixture builders
- wire a test database lifecycle

### Phase 1: Fast Confidence

- unit tests for permissions, helpers, and hierarchy builders
- component tests for auth forms and settings dialogs

### Phase 2: Server Confidence

- integration tests for auth, invites, team management, assets, and proxy route

### Phase 3: Workflow Confidence

- integration and E2E tests for tickets, RCA lists, RCA details, and solution approvals

### Phase 4: Reporting Confidence

- dashboard integration tests
- smoke E2E dashboard validation

## Suggested Initial Backlog

If we want the first high-value batch, start with these:

1. Permission helper unit tests
2. Asset hierarchy builder unit tests
3. Auth route and account service integration tests
4. Invite lifecycle integration tests
5. Asset CRUD integration tests
6. Signup/login/password reset E2E
7. Settings invite flow E2E

That sequence gives early protection around the highest-risk flows with relatively manageable setup cost.

## Risks and Watchouts

- The current app mixes frontend-owned routes with some still-proxied backend functionality. Tests should make that boundary explicit.
- Large client components like `RcaCollaborationClient` and `RcaAnalysisWorkspace` will become hard to test if more logic stays embedded in component bodies. As test work begins, extract pure helpers and action modules where needed.
- Some README commands are already out of sync with `package.json`. Test setup should include a small documentation cleanup pass so developer onboarding stays accurate.

## Definition of Done

The testing strategy is in good shape when:

- every critical domain has unit or integration coverage
- every critical user journey has at least one E2E path
- tenant isolation is explicitly tested in server flows
- auth and invite flows are covered for both success and failure
- CI blocks merges on meaningful regressions
- adding new features follows an established test pattern instead of starting from zero

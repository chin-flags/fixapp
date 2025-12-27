---
stepsCompleted: [1, 2]
currentStep: 2
inputDocuments:
  - '_bmad-output/prd.md'
  - '_bmad-output/architecture.md'
  - '_bmad-output/ux-design-specification.md'
lastUpdated: '2025-12-23'
totalEpics: 12
---

# fixapp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for fixapp, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**RCA Lifecycle Management (FR1-FR12):**
- FR1: Plant Operators can create corrective maintenance tickets in the internal CMMS
- FR2: System can flag corrective maintenance tickets that require RCA based on impact criteria
- FR3: Plant Operators can create RCA records from flagged maintenance tickets (pre-filled with equipment and issue data)
- FR4: Plant Operators can create RCA records manually with minimal required fields (issue description, location, equipment)
- FR5: Plant Operators can attach photos and files to RCA records during creation
- FR6: System can auto-assign RCA records to appropriate RCA Owners based on equipment type and location
- FR7: RCA Owners can view all RCAs assigned to them with current status
- FR8: RCA Owners can add team members (engineers, specialists) to RCA investigations
- FR9: System can suggest relevant team members based on equipment type, fault codes, and past participation
- FR10: RCA Owners can close RCA records after all solutions are approved and implemented
- FR11: Global Administrators can delete RCA records with audit trail
- FR12: Users can search and filter RCAs by status, location, equipment, date range, and assigned personnel

**Collaborative Investigation (FR13-FR17):**
- FR13: Team Members can contribute observations and findings to RCA brainstorming sessions
- FR14: Team Members can attach files (logs, photos, documents) to brainstorming contributions
- FR15: Users can comment on RCA records for collaboration and mentoring
- FR16: Country Leaders can add team members to RCAs for mentoring purposes
- FR17: System can send notifications when users are added to RCA teams

**Root Cause Analysis Tools (FR18-FR25):**
- FR18: RCA Owners can create fishbone (Ishikawa) diagrams for root cause analysis
- FR19: RCA Owners can edit and update fishbone diagrams throughout the investigation
- FR20: System can pre-populate fishbone diagram categories based on brainstorming content
- FR21: RCA Owners can identify root causes from analysis
- FR22: RCA Owners can define corrective action solutions for identified root causes
- FR23: RCA Owners can assign solutions to team members with due dates
- FR24: Team Members can update status of assigned solutions (in progress, completed, blocked)
- FR25: Team Members can attach evidence (photos, documents) to completed solutions

**AI-Powered Intelligence (FR26-FR32):**
- FR26: System can analyze historical RCA patterns to suggest relevant solutions
- FR27: System can match current RCA symptoms with similar past cases across locations
- FR28: Engineers can view AI-suggested solutions with context (equipment type, success rate, originating location)
- FR29: Engineers can accept or reject AI suggestions with feedback comments
- FR30: System can learn from engineer feedback to improve future suggestions
- FR31: Global Administrators can manually link related RCAs across locations for AI learning
- FR32: System can maintain tenant data isolation while enabling cross-tenant AI learning improvements

**Approval & Verification Workflow (FR33-FR36):**
- FR33: RCA Owners can submit completed solutions for approval
- FR34: RCA Owners can approve solutions assigned to their team members
- FR35: System can track approval history with timestamps and approver identity
- FR36: System can prevent RCA closure until all solutions are approved and marked complete

**Dashboards & Visibility (FR37-FR45):**
- FR37: Plant Operators can view their own submitted RCAs and corrective maintenance tickets
- FR38: RCA Owners can view dashboard showing pending approvals and overdue actions
- FR39: Team Members can view dashboard showing RCAs assigned to them and actions due
- FR40: Country Leaders can view all RCAs within their country with status summaries by plant
- FR41: Global Administrators can view all RCAs across all locations with filtering by country/plant
- FR42: System can display metrics including open vs closed RCAs, time to resolution, and common root causes
- FR43: System can identify and flag bottlenecks (RCAs stuck in specific phases for extended periods)
- FR44: System can identify and flag overdue actions with owner notifications
- FR45: System can detect patterns and clusters of similar issues across locations

**Notifications & Reminders (FR46-FR52):**
- FR46: System can send email notifications when users are assigned to RCAs
- FR47: System can send email notifications when solutions are assigned to users
- FR48: System can send reminders for actions approaching due dates
- FR49: System can send notifications when solutions are approved
- FR50: System can send notifications for comments and mentions
- FR51: System can send mobile push notifications for time-sensitive updates
- FR52: Users can configure notification preferences (email, push, frequency)

**Reporting & Export (FR53-FR57):**
- FR53: RCA Owners can generate professional PDF reports including fishbone diagrams, timeline, and actions
- FR54: Users can export RCA data to Excel with filtering by location, date range, and status
- FR55: Global Administrators can export cross-location analytics to Excel for executive reporting
- FR56: System can include data visualizations in exported reports (charts, trend graphs)
- FR57: Users can share RCA reports via links or file attachments

**User & Tenant Management (FR58-FR65):**
- FR58: Global Administrators can create and manage user accounts within their tenant
- FR59: Global Administrators can assign roles to users (Plant Operator, Team Member, RCA Owner, Country Leader, Global Admin)
- FR60: Global Administrators can configure organizational hierarchy (countries, plants, teams)
- FR61: System can enforce hierarchical visibility based on user role and location
- FR62: Users can authenticate via Office 365 SSO (SAML/OAuth)
- FR63: System can provision and de-provision users from Azure AD
- FR64: System can maintain complete audit logs of all user actions for compliance
- FR65: Tenant Administrators can configure tenant-specific settings (branding, workflow rules, notification policies)

**Corrective Maintenance / Internal CMMS (FR66-FR71):**
- FR66: Plant Operators can create corrective maintenance tickets with equipment, issue description, and priority
- FR67: System can assign impact levels to maintenance tickets based on configurable criteria
- FR68: System can automatically flag high-impact tickets as requiring RCA
- FR69: Maintenance supervisors can link corrective actions from RCAs to maintenance tickets
- FR70: System can track maintenance ticket status and completion
- FR71: Users can view linked RCAs from maintenance tickets and vice versa

**Data Migration & Integration (FR72-FR76):**
- FR72: System can import historical RCA records from existing databases during tenant onboarding
- FR73: System can validate data integrity after migration
- FR74: System can provide RESTful API for third-party integrations (Post-MVP)
- FR75: System can send webhook notifications for RCA lifecycle events (created, completed, overdue) (Post-MVP)
- FR76: System can integrate with external SAP systems via API (Post-MVP)

### Non-Functional Requirements

**Performance (NFR-P1 to NFR-P9):**
- NFR-P1: Web pages load in under 2 seconds on desktop and mobile
- NFR-P2: API responses complete within 500ms for 95th percentile requests
- NFR-P3: Dashboard data refreshes without full page reload
- NFR-P4: Real-time collaboration updates appear within 1 second
- NFR-P5: System supports 1,000+ concurrent users per tenant without degradation
- NFR-P6: RCA creation completes in under 90 seconds (including photo upload)
- NFR-P7: Excel export generation completes within 10 seconds for datasets up to 10,000 records
- NFR-P8: Mobile interface optimized for plant floor usage (low bandwidth tolerance)
- NFR-P9: AI suggestion generation completes within 3 seconds of request

**Security (NFR-S1 to NFR-S14):**
- NFR-S1: All data encrypted at rest using AES-256
- NFR-S2: All data encrypted in transit using TLS 1.3
- NFR-S3: Complete tenant data isolation - no cross-tenant data leakage
- NFR-S4: AI learning maintains tenant privacy (patterns learned without exposing proprietary data)
- NFR-S5: Multi-factor authentication (MFA) supported for sensitive roles
- NFR-S6: Hierarchical permission model enforced (country leaders cannot access other countries' data)
- NFR-S7: Session management with secure timeout and revocation
- NFR-S8: Office 365 SSO integration via SAML 2.0 or OAuth 2.0
- NFR-S9: Role-based access control (RBAC) enforced at data and API level
- NFR-S10: Admin-only deletion with immutable audit trail
- NFR-S11: Configurable password complexity requirements per tenant
- NFR-S12: API authentication via OAuth 2.0 or API keys
- NFR-S13: Rate limiting to prevent abuse (configurable per tenant)
- NFR-S14: Input validation and sanitization to prevent injection attacks

**Scalability (NFR-SC1 to NFR-SC11):**
- NFR-SC1: System scales horizontally to support user growth without architectural changes
- NFR-SC2: Support 100 total users in Year 1 without performance degradation
- NFR-SC3: Support 5,000 total users across tenants by Year 3
- NFR-SC4: Support 50,000 total users across tenants by Year 5
- NFR-SC5: Database performance maintained as RCA records grow from 500 to 1M+ records
- NFR-SC6: Search and query performance maintained through data partitioning and indexing strategies
- NFR-SC7: Hierarchical data access optimized for multi-location queries
- NFR-SC8: Support 3 tenants in Year 1
- NFR-SC9: Support 50+ tenants by Year 3
- NFR-SC10: Support 500+ tenants by Year 5
- NFR-SC11: Tenant provisioning completes within 1 hour for standard deployments

**Reliability & Availability (NFR-R1 to NFR-R9):**
- NFR-R1: System maintains 99.5% uptime SLA
- NFR-R2: Planned maintenance windows communicated 48 hours in advance
- NFR-R3: Zero data loss during RCA creation and updates
- NFR-R4: Automated daily backups with point-in-time recovery capability
- NFR-R5: Recovery Point Objective (RPO) < 1 hour
- NFR-R6: Recovery Time Objective (RTO) < 4 hours
- NFR-R7: Backup retention period configurable per tenant (minimum 30 days)
- NFR-R8: System gracefully handles partial failures (e.g., AI suggestions unavailable doesn't block RCA creation)
- NFR-R9: Real-time features degrade gracefully to polling if WebSocket connection fails

**Compliance & Audit (NFR-C1 to NFR-C12):**
- NFR-C1: Comprehensive audit logs capture all user actions (create, edit, delete, view, approve)
- NFR-C2: Audit logs include: user identity, action, timestamp, IP address
- NFR-C3: Immutable audit trail prevents tampering
- NFR-C4: Audit log retention configurable per tenant (minimum 1 year, up to 7 years)
- NFR-C5: Architecture designed for SOC 2 Type II certification
- NFR-C6: GDPR compliance framework implemented (data privacy, right to deletion, data portability)
- NFR-C7: Personal data minimization (collect only necessary information)
- NFR-C8: User consent management for AI learning features
- NFR-C9: Support for regional data hosting (EU, US, APAC)
- NFR-C10: Tenant data remains in configured region
- NFR-C11: Tenant data isolation verified through automated testing
- NFR-C12: AI suggestion source verification prevents proprietary information exposure

**Usability (NFR-U1 to NFR-U9):**
- NFR-U1: Plant operators complete RCA creation in under 2 minutes
- NFR-U2: Minimal form fields with smart defaults reduce data entry
- NFR-U3: Mobile interface usable with gloves or in harsh plant environments
- NFR-U4: Action-oriented dashboards show relevant information without scrolling
- NFR-U5: New users create their first RCA without training or documentation
- NFR-U6: Contextual help available for complex features (fishbone diagrams, AI suggestions)
- NFR-U7: Intuitive navigation - users find key features within 3 clicks
- NFR-U8: Responsive design works seamlessly on desktop, tablet, and mobile devices
- NFR-U9: Touch targets sized appropriately for mobile use (minimum 44x44 pixels)

**Maintainability (NFR-M1 to NFR-M11):**
- NFR-M1: Modular architecture enables feature additions without core rewrites
- NFR-M2: Comprehensive automated test coverage (unit, integration, end-to-end)
- NFR-M3: CI/CD pipeline enables multiple deployments per day
- NFR-M4: Zero-downtime deployments using blue-green strategy
- NFR-M5: Feature flags enable gradual rollout and quick rollback
- NFR-M6: Containerized architecture (Docker/Kubernetes) ensures consistent deployments
- NFR-M7: Application performance monitoring (APM) tracks system health
- NFR-M8: Real-time error tracking and alerting notifies team of issues
- NFR-M9: Usage analytics provide product insights for decision-making
- NFR-M10: API documentation kept current with code changes
- NFR-M11: System architecture diagrams maintained and accessible

**Integration (NFR-I1 to NFR-I10):**
- NFR-I1: RESTful API follows industry standards (HTTP methods, status codes, JSON)
- NFR-I2: API versioning prevents breaking changes for integrators
- NFR-I3: Comprehensive API documentation with examples and use cases
- NFR-I4: API rate limits configurable per integration partner
- NFR-I5: Webhook delivery guaranteed with retry mechanism (Post-MVP)
- NFR-I6: Webhook failure notifications alert tenant administrators
- NFR-I7: Webhook payload includes all necessary context for external systems
- NFR-I8: Data migration tooling validates data integrity before and after migration
- NFR-I9: Migration process documented with rollback procedures
- NFR-I10: Historical RCA records searchable immediately after migration

### Additional Requirements

**Architecture & Infrastructure:**

**Technology Stack:**
- Frontend: Next.js 15 with TypeScript, App Router, Tailwind CSS + Shadcn UI
- Backend: NestJS with TypeScript, REST API architecture
- Database: PostgreSQL with TypeORM
- Multi-tenancy: Hybrid approach (Shared DB with Row-Level Security + Dedicated DB option for enterprise)
- Authentication: Multi-provider with Passport.js (Office 365 SSO via SAML/OAuth)
- Real-time: WebSockets with Socket.io
- Job Queue: Bull + Redis
- AI/ML: Separate Python service communicating via REST API
- Cloud Platform: AWS
- Containerization: Docker
- Monorepo: Turborepo

**Starter Template:**
- Initialize with standard Next.js and NestJS CLIs
- Set up Turborepo monorepo structure
- Configure TypeScript strict mode throughout
- Establish shared types package for frontend/backend type safety

**Multi-Tenancy Architecture:**
- Tenant identification via subdomain + custom domain support
- Row-Level Security (RLS) policies in PostgreSQL for shared database tenants
- Dedicated database instances for enterprise custom deployments
- Tenant context middleware injecting tenant_id into every request
- Abstraction layer routing queries to correct database connection
- Automated tenant isolation testing to prevent cross-tenant data leakage

**Authentication & Authorization:**
- Hierarchical RBAC with 5 roles: Plant Operator, Team Member, RCA Owner, Country Leader, Global Administrator
- Permission inheritance through organizational hierarchy (Global → Country → Plant → Team)
- Office 365 SSO integration (primary authentication method for MVP)
- JWT tokens with refresh token rotation
- MFA support for Global Administrator and Country Leader roles
- Session management with secure timeout (30 min inactivity, 8 hour absolute)
- RBAC guards enforcing permissions at controller level
- Hierarchical data scoping filters (country leaders see only their region, etc.)

**Real-Time Communication:**
- WebSocket gateway using Socket.io from MVP
- Real-time dashboard updates without page refresh
- Collaborative brainstorming with live updates
- Notification delivery via WebSocket for immediate updates
- Connection management with reconnection logic
- Graceful degradation to polling if WebSocket fails

**File Storage:**
- AWS S3 for photo/document attachments
- Presigned URLs for secure upload/download
- File size limits: 10MB per photo, 25MB per document
- Supported formats: Images (JPG, PNG, HEIC), Documents (PDF, XLSX, DOCX)
- Automatic image optimization and thumbnail generation
- Tenant-scoped S3 buckets or folder prefixes

**Email Service:**
- AWS SES for transactional emails
- Email templates for notifications (assignment, approval, overdue reminders)
- Rate limiting to prevent spam
- Bounce and complaint handling
- Unsubscribe management per notification type

**Job Queue & Background Processing:**
- Bull queues with Redis for background tasks
- Job types: Email sending, PDF generation, Excel export, AI suggestion generation, data migration
- Job scheduling for periodic tasks (daily overdue reminders, weekly analytics)
- Retry logic with exponential backoff
- Job monitoring and failure alerting

**Caching Strategy:**
- Redis for session storage, rate limiting, and frequently accessed data
- Dashboard metric caching with 5-minute TTL
- User profile and permissions caching with cache invalidation on updates
- Query result caching for expensive hierarchical queries

**Document Generation:**
- Server-side PDF generation for RCA reports with fishbone diagrams
- Excel export using exceljs library
- Template-based report formatting
- Asynchronous generation via job queue for large exports
- Pre-signed S3 URLs for download

**Audit Logging:**
- Comprehensive audit trail for all CRUD operations
- Immutable append-only audit log table
- Captured data: user_id, tenant_id, action, entity_type, entity_id, timestamp, IP address, user agent
- Separate audit database or table partitioning for performance
- Retention policy enforcement per tenant configuration (1-7 years)

**Monitoring & Observability:**
- AWS CloudWatch for infrastructure metrics and logs
- Sentry for error tracking and alerting
- Application Performance Monitoring (APM) for request tracing
- Custom business metrics (RCA creation rate, time to resolution, AI suggestion acceptance)
- Operational dashboards for system health

**CI/CD Pipeline:**
- GitHub Actions for automated builds and deployments
- Multi-stage pipeline: Lint → Test → Build → Deploy
- Automated testing (unit, integration, E2E with Playwright)
- Blue-green deployment strategy for zero downtime
- Feature flags for gradual rollout
- Automated database migrations with rollback capability

**Security Measures:**
- Data encryption at rest (AES-256) and in transit (TLS 1.3)
- Helmet.js for security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on all API endpoints (configurable per tenant)
- Input validation and sanitization using class-validator
- SQL injection prevention via parameterized queries (TypeORM)
- CORS configuration for frontend-backend communication
- API key authentication for AI service integration
- Environment variable management with validation

**UX Design Implementation:**
- Shadcn UI component library with Radix UI primitives
- Tailwind CSS utility-first styling
- Color palette: Neutral grays (#18181B primary, #FAFAFA background) with Emerald green accent (#10B981)
- Typography: Inter font family with responsive type scale
- Mobile-first responsive design with touch targets ≥44px
- WCAG AA accessibility compliance (4.5:1 contrast ratios)
- High contrast mode for bright manufacturing environments
- Progressive disclosure for complex forms
- Auto-save drafts every 10 seconds
- Optimistic UI updates with rollback on failure
- Toast notifications for confirmations (2-second display)
- Inline validation with specific error messages

### FR Coverage Map

**Epic 1 (Foundation):** Infrastructure foundation for all NFRs - NFR-S1-S14, NFR-SC1-SC11, NFR-M1-M11, NFR-C1-C12, NFR-P1-P9, NFR-R1-R9

**Epic 2 (Authentication & Tenant Management):** FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65

**Epic 3 (Internal CMMS):** FR66, FR67, FR68, FR69, FR70, FR71, FR2

**Epic 4 (Core RCA Lifecycle):** FR1, FR3, FR4, FR5, FR6, FR7, FR10, FR11, FR12

**Epic 5 (Collaborative Investigation):** FR8, FR9, FR13, FR14, FR15, FR16, FR17

**Epic 6 (Root Cause Analysis Tools):** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25

**Epic 7 (Approval Workflow):** FR33, FR34, FR35, FR36

**Epic 8 (Role-Based Dashboards):** FR37, FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45

**Epic 9 (Notifications System):** FR46, FR47, FR48, FR49, FR50, FR51, FR52

**Epic 10 (AI-Powered Intelligence):** FR26, FR27, FR28, FR29, FR30, FR31, FR32

**Epic 11 (Reporting & Export):** FR53, FR54, FR55, FR56, FR57

**Epic 12 (Data Migration):** FR72, FR73, NFR-I8, NFR-I9, NFR-I10

**Post-MVP:** FR74, FR75, FR76 (RESTful API for third-party integrations, webhooks, SAP integration)

## Epic List

### Epic 1: Project Foundation & Multi-Tenant Infrastructure
Development team can initialize the project with complete multi-tenant architecture, authentication framework, and production-ready AWS Free Tier infrastructure.

**FRs covered:** Foundation for all NFRs - NFR-S1-S14 (Security), NFR-SC1-SC11 (Scalability), NFR-M1-M11 (Maintainability), NFR-C1-C12 (Compliance), NFR-P1-P9 (Performance), NFR-R1-R9 (Reliability)

#### Story 1.1: Project Initialization & Monorepo Setup
As a Development Team, I want a properly initialized Turborepo monorepo with Next.js 15 frontend and NestJS backend, so that we have a production-ready foundation for building the multi-tenant fixapp SaaS platform with strict TypeScript, shared types, and modern tooling.

**Acceptance Criteria:**
- Turborepo workspace created with apps/ and packages/ directories
- Next.js 15 initialized with TypeScript, App Router, Tailwind CSS, and ESLint
- NestJS initialized with TypeScript, TypeORM, and PostgreSQL support
- Shared packages for types and ESLint configuration
- Strict TypeScript mode enabled across all packages
- Development environment runs both apps successfully (turbo dev)
- Production builds work with turbo cache
- Code quality tools (ESLint, Prettier) configured
- Git repository initialized with proper .gitignore
- Documentation created with setup instructions

**Complexity:** M

#### Story 1.2: PostgreSQL Database & TypeORM Configuration
As a Development Team, I want PostgreSQL database configured with TypeORM and multi-tenant row-level security foundation, so that we can store application data with tenant isolation from day one.

**Acceptance Criteria:**
- PostgreSQL database running locally via Docker Compose
- TypeORM configured in NestJS with connection management
- Database migrations system initialized
- Base entity classes created with tenant_id, created_at, updated_at, deleted_at
- Snake_case naming enforced for all database objects
- Migration scripts validated and executable
- Database connection pooling configured
- Environment variable management for database credentials

**Complexity:** M

#### Story 1.3: Multi-Tenancy Foundation & Tenant Context
As a Development Team, I want tenant identification and context injection middleware, so that all database queries automatically scope to the correct tenant and prevent data leakage.

**Acceptance Criteria:**
- Tenant identification via subdomain extraction
- Tenant context middleware injects tenant_id into every request
- TypeORM query interceptor adds tenant_id filtering automatically
- Tenants table created with schema: id, name, subdomain, status, settings
- Tenant isolation testing framework initialized
- Request context includes authenticated tenant
- Error thrown if tenant not found or inactive

**Complexity:** L

#### Story 1.4: Authentication Framework & JWT Infrastructure
As a Development Team, I want Passport.js authentication framework with JWT token generation, so that we can authenticate users and secure API endpoints.

**Acceptance Criteria:**
- Passport.js configured in NestJS
- JWT strategy implemented with access/refresh tokens
- Auth module created with login/logout/refresh endpoints
- Users table created with tenant_id, email, password_hash, role, status
- Bcrypt password hashing (10 rounds)
- JwtAuthGuard created for protecting routes
- JWT tokens include: user_id, tenant_id, role, location_scope
- Token expiration: access (30 min), refresh (7 days)

**Complexity:** L

#### Story 1.5: Security Infrastructure (Encryption, Headers, Rate Limiting)
As a Development Team, I want comprehensive security infrastructure including Helmet.js security headers, rate limiting, and input validation, so that the application meets NFR-S1-S14 security requirements.

**Acceptance Criteria:**
- Helmet.js configured with CSP, HSTS, X-Frame-Options headers
- Rate limiting implemented using @nestjs/throttler with Redis
- CORS configured for frontend-backend communication
- Input validation using class-validator on all DTOs
- SQL injection prevention via TypeORM parameterized queries
- Environment variable validation on startup
- TLS 1.3 enforced in production configuration
- Security headers verified in API responses

**Complexity:** M

#### Story 1.6: Real-Time Infrastructure (WebSockets & Socket.io)
As a Development Team, I want WebSocket infrastructure using Socket.io, so that we can implement real-time collaboration and live dashboard updates.

**Acceptance Criteria:**
- Socket.io gateway configured in NestJS
- WebSocket authentication using JWT tokens
- Tenant-scoped rooms (users only join their tenant's room)
- Connection management with reconnection logic
- Graceful degradation to polling if WebSocket fails
- Heartbeat/ping-pong for connection health
- WebSocket connected users tracked in Redis
- Basic real-time event emission tested

**Complexity:** M

#### Story 1.7: File Storage (AWS S3 Integration)
As a Development Team, I want AWS S3 file storage with presigned URLs, so that users can upload photos and documents securely.

**Acceptance Criteria:**
- AWS S3 bucket created (or LocalStack for local dev)
- S3 client configured with AWS SDK
- Presigned URL generation for uploads (10 min expiry)
- Presigned URL generation for downloads (1 hour expiry)
- File size limits enforced: 10MB photos, 25MB documents
- Supported formats validated: JPG, PNG, HEIC, PDF, XLSX, DOCX
- Tenant-scoped S3 folder prefixes (tenant_id/)
- File metadata stored in database (files table)

**Complexity:** M

#### Story 1.8: Job Queue System (Bull & Redis)
As a Development Team, I want Bull job queue with Redis backing, so that we can process background tasks like email sending and PDF generation asynchronously.

**Acceptance Criteria:**
- Redis running locally via Docker Compose
- Bull queue configured in NestJS
- Job queue module created with processors
- Job types defined: email, pdf-generation, excel-export
- Retry logic with exponential backoff configured
- Job monitoring endpoint showing queue health
- Failed job handling and dead letter queue
- Queue dashboard accessible for debugging

**Complexity:** M

#### Story 1.9: Email Service (AWS SES Setup)
As a Development Team, I want AWS SES email service configured with templates, so that we can send transactional emails for notifications.

**Acceptance Criteria:**
- AWS SES configured (or LocalStack/Ethereal for local dev)
- Email service module created in NestJS
- Email templates created for: assignment, approval, overdue reminder
- Email sending queued via Bull (not synchronous)
- Bounce and complaint handling configured
- Rate limiting to prevent spam (per tenant limits)
- Email preview in development mode
- Email sending tested end-to-end

**Complexity:** M

#### Story 1.10: Caching Layer (Redis for Sessions & Data)
As a Development Team, I want Redis caching for sessions, user profiles, and frequently accessed data, so that we meet NFR-P2 (API responses <500ms).

**Acceptance Criteria:**
- Redis connection configured in NestJS
- Session storage using connect-redis
- Cache module created with get/set/delete operations
- Dashboard metrics cached with 5-minute TTL
- User profile and permissions cached with invalidation
- Query result caching for expensive hierarchical queries
- Cache keys include tenant_id prefix
- Cache hit/miss metrics tracked

**Complexity:** M

#### Story 1.11: Monitoring & Logging (CloudWatch, Sentry, APM)
As a Development Team, I want comprehensive monitoring with AWS CloudWatch and Sentry, so that we can track errors, performance, and system health in production.

**Acceptance Criteria:**
- Sentry SDK configured for error tracking in both apps
- Structured logging using Winston or Pino
- Log format includes: timestamp, level, message, tenant_id, user_id, request_id
- CloudWatch logs configured for production deployment
- APM metrics collected: API latency, error rate, throughput
- Custom business metrics: RCA creation rate, time to resolution
- Error grouping and deduplication in Sentry
- Alert rules configured for critical errors

**Complexity:** M

#### Story 1.12: CI/CD Pipeline (GitHub Actions, Testing, Deployment)
As a Development Team, I want automated CI/CD pipeline with testing and deployment, so that we can deploy multiple times per day with confidence.

**Acceptance Criteria:**
- GitHub Actions workflow created: lint → test → build → deploy
- Automated testing runs on every PR
- Frontend and backend tested in parallel
- Build artifacts cached for faster pipelines
- Docker images built and pushed to registry
- Blue-green deployment strategy configured
- Feature flags support for gradual rollout
- Deployment to staging environment successful

**Complexity:** L

### Epic 2: User Authentication & Tenant Management
Global Administrators can provision tenants, manage users, configure organizational hierarchies, and users can authenticate securely via Office 365 SSO.

**FRs covered:** FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65

### Epic 3: Internal CMMS - Corrective Maintenance Management
Plant Operators can create and manage corrective maintenance tickets, with high-impact tickets automatically flagged for RCA investigation.

**FRs covered:** FR66, FR67, FR68, FR69, FR70, FR71, FR2

### Epic 4: Core RCA Lifecycle Management
Users can create RCA records (from maintenance tickets or manually), auto-assign to RCA Owners, search/filter RCAs, and administrators can manage RCA lifecycle with full audit trails.

**FRs covered:** FR1, FR3, FR4, FR5, FR6, FR7, FR10, FR11, FR12

### Epic 5: Collaborative Investigation & Team Management
RCA Owners can build investigation teams, and Team Members can contribute observations, attach files, and collaborate through comments for effective root cause analysis.

**FRs covered:** FR8, FR9, FR13, FR14, FR15, FR16, FR17

### Epic 6: Root Cause Analysis Tools
RCA Owners can create and edit fishbone diagrams, identify root causes, define corrective action solutions, and assign solutions to team members with due dates.

**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25

### Epic 7: Approval Workflow & RCA Closure
RCA Owners can approve completed solutions, track approval history, and close RCAs once all solutions are approved and implemented.

**FRs covered:** FR33, FR34, FR35, FR36

### Epic 8: Role-Based Dashboards & Visibility
All user types can view role-appropriate dashboards showing their relevant RCAs, pending actions, and key metrics with hierarchical data scoping.

**FRs covered:** FR37, FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45

### Epic 9: Notifications & Reminders System
Users receive timely email and push notifications for assignments, approvals, overdue actions, and comments, with configurable preferences.

**FRs covered:** FR46, FR47, FR48, FR49, FR50, FR51, FR52

### Epic 10: AI-Powered Solution Intelligence
Engineers receive contextual AI-powered solution suggestions based on historical RCA patterns across locations, can provide feedback to improve suggestions, and Global Admins can manually link related RCAs for AI learning.

**FRs covered:** FR26, FR27, FR28, FR29, FR30, FR31, FR32

### Epic 11: Reporting & Data Export
Users can generate professional PDF reports with fishbone diagrams and export RCA data to Excel for custom analysis and executive reporting.

**FRs covered:** FR53, FR54, FR55, FR56, FR57

### Epic 12: Data Migration & Historical RCA Import
Tenant administrators can import existing RCA databases during onboarding with data integrity validation, making historical records searchable immediately.

**FRs covered:** FR72, FR73, NFR-I8, NFR-I9, NFR-I10

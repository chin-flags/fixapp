---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - '_bmad-output/prd.md'
  - '_bmad-output/ux-design-specification.md'
workflowType: 'architecture'
lastStep: 5
project_name: 'fixapp'
user_name: 'Chinthakaweerakkody'
date: '2025-12-22'
technicalPreferences:
  frontend: 'Next.js 15'
  backend: 'NestJS'
  language: 'TypeScript'
  database: 'PostgreSQL'
  cloud: 'AWS'
  containerization: 'Docker'
  apiStyle: 'REST'
  styling: 'Tailwind CSS + Shadcn UI'
  multiTenancy: 'Hybrid (Shared DB + Dedicated option)'
  authentication: 'Multi-provider (Passport.js)'
  realtime: 'WebSockets (Socket.io)'
  jobQueue: 'Bull + Redis'
  aiService: 'Separate Python service'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

fixapp requires 76 functional requirements spanning the complete RCA lifecycle:

**RCA Lifecycle Management (FR1-FR12):** Core workflow including creating corrective maintenance tickets, automatic RCA flagging for high-impact issues, manual RCA creation with minimal fields, RCA Owner assignment with team collaboration, and admin-controlled deletion with audit trails. Architectural implication: State machine workflow with role-based transitions.

**Collaborative Investigation (FR13-FR17):** Team member brainstorming, file attachments, commenting, and mentoring capabilities. Architectural implication: Real-time collaborative features requiring WebSocket connections and conflict resolution.

**Root Cause Analysis Tools (FR18-FR25):** Fishbone diagram creation/editing, root cause identification, solution assignment with tracking, and evidence attachment. Architectural implication: Complex client-side visualization components with persistent state management.

**AI-Powered Intelligence (FR26-FR32):** Historical pattern analysis, cross-location solution matching, contextual suggestions with feedback loops, manual cross-linking, and privacy-preserving cross-tenant learning. Architectural implication: Separate ML service with pattern recognition, vector embeddings, and continuous learning pipeline.

**Approval & Verification Workflow (FR33-FR36):** Solution submission, approval tracking, and RCA closure validation. Architectural implication: State-dependent business logic with notification triggers.

**Dashboards & Visibility (FR37-FR45):** Role-specific dashboards with hierarchical data scoping, metrics visualization, bottleneck detection, and pattern clustering. Architectural implication: Complex query optimization with tenant-scoped data access and real-time aggregations.

**Notifications & Reminders (FR46-FR52):** Multi-channel notifications (email, push) with user-configurable preferences. Architectural implication: Event-driven architecture with notification service and delivery tracking.

**Reporting & Export (FR53-FR57):** PDF generation with diagrams, Excel export with filtering, cross-location analytics. Architectural implication: Server-side document generation with template engine and data transformation.

**User & Tenant Management (FR58-FR65):** User provisioning, role assignment, organizational hierarchy configuration, Office 365 SSO, and comprehensive audit logging. Architectural implication: Identity management with SAML/OAuth integration and hierarchical RBAC enforcement.

**Corrective Maintenance / CMMS (FR66-FR71):** Internal maintenance ticket system with bidirectional RCA linking. Architectural implication: Domain model with aggregate roots for tickets and RCAs with relationship tracking.

**Data Migration & Integration (FR72-FR76):** Historical data import, validation, RESTful API, webhooks, and future SAP integration. Architectural implication: ETL pipeline, API gateway, and integration layer with external systems.

**Non-Functional Requirements:**

**Performance (NFR-P1 to NFR-P9):**
- Page loads <2 seconds desktop/mobile
- API responses <500ms (95th percentile)
- Real-time collaboration updates <1 second
- 1,000+ concurrent users per tenant
- RCA creation <90 seconds including photo upload
- Mobile optimization for low bandwidth plant floor usage

**Security (NFR-S1 to NFR-S14):**
- Data encryption at rest (AES-256) and in transit (TLS 1.3)
- Complete tenant data isolation with no cross-tenant leakage
- AI learning maintains tenant privacy while improving globally
- Multi-factor authentication for sensitive roles
- Hierarchical permission enforcement (country leaders cannot access other countries)
- Office 365 SSO via SAML/OAuth
- API authentication via OAuth 2.0 with rate limiting

**Scalability (NFR-SC1 to NFR-SC11):**
- Horizontal scaling without architectural changes
- Year 1: 3 tenants, ~100 users, 500 RCAs
- Year 3: 50 tenants, 5,000 users, 50,000 RCAs
- Year 5: 500 tenants, 50,000 users, 1M+ RCAs
- Database partitioning and indexing for multi-location queries

**Reliability & Availability (NFR-R1 to NFR-R9):**
- 99.5% uptime SLA
- Zero data loss during operations
- RPO <1 hour, RTO <4 hours
- Automated daily backups with point-in-time recovery
- Graceful degradation (AI unavailable doesn't block RCA creation)

**Compliance & Audit (NFR-C1 to NFR-C12):**
- Comprehensive audit logs (user, action, timestamp, IP)
- Immutable audit trail with 1-7 year retention
- SOC 2 Type II, GDPR, ISO 27001 readiness
- Regional data hosting support (EU, US, APAC)
- Automated tenant isolation testing

**Usability (NFR-U1 to NFR-U9):**
- <2 minute RCA creation for operators
- Intuitive navigation (key features within 3 clicks)
- Mobile usable with gloves in harsh plant environments
- New users create first RCA without training
- WCAG AA accessibility compliance

**Scale & Complexity:**

- **Primary domain:** Full-stack SaaS B2B Platform (responsive web + mobile + backend services + AI/ML)
- **Complexity level:** Enterprise/High
- **Estimated architectural components:** 25-30 major components including:
  - Frontend: Multi-platform responsive web application (desktop + tablet + mobile)
  - Backend: API services, business logic layer, workflow engine
  - Data: Multi-tenant database with hierarchical scoping, caching layer
  - AI/ML: Knowledge base service, pattern recognition, learning pipeline
  - Integrations: SSO (Office 365), CMMS (internal), future SAP, webhooks
  - Infrastructure: Real-time messaging (WebSockets), notification service, document generation, job scheduling
  - Security: Authentication, authorization (RBAC), audit logging, encryption

### Technical Constraints & Dependencies

**Known Constraints:**

1. **Multi-tenancy from Day 1:** Architecture must support complete tenant isolation with both shared infrastructure (standard SaaS) and dedicated deployment (enterprise custom) models
2. **Office 365 ecosystem integration:** SSO authentication, potential SharePoint document integration, familiar interaction patterns
3. **Data migration requirements:** Must import existing RCA databases during tenant onboarding with validation
4. **Hierarchical permission model:** Global → Country → Plant → Team with strict data scoping enforcement
5. **Mobile plant floor usage:** Touch-first interfaces for gloved hands, high contrast for bright environments, offline resilience
6. **AI cold start problem:** System must remain fully functional without AI - AI is accelerator, not dependency
7. **Performance SLA:** <2 second page loads non-negotiable for adoption - slow equals broken
8. **Regulatory compliance:** Architecture designed for SOC 2, GDPR, ISO 27001 certification path

**Known Dependencies:**

1. **Office 365 SSO:** SAML 2.0 or OAuth 2.0 integration for enterprise authentication
2. **Cloud hosting platform:** AWS, Azure, or GCP supporting global deployment with regional data residency
3. **Real-time infrastructure:** WebSocket support for collaboration and live updates
4. **Document generation:** PDF/Excel export capabilities with diagram rendering
5. **AI/ML infrastructure:** Python-based ML services for knowledge base pattern recognition
6. **Monitoring & observability:** APM, error tracking, usage analytics, infrastructure monitoring

### Cross-Cutting Concerns Identified

**1. Multi-tenancy & Data Isolation (CRITICAL):**
- Tenant identification in every query
- Row-level security enforcement
- Shared vs. dedicated database deployment models
- AI learning across tenants while maintaining privacy boundaries
- Automated tenant isolation testing

**2. Authentication & Authorization (CRITICAL):**
- Role-Based Access Control (RBAC) with 5 distinct roles
- Hierarchical data scoping (Global → Country → Plant → Team)
- Office 365 SSO integration
- Session management and MFA for sensitive roles
- API authentication (OAuth 2.0, API keys, rate limiting)

**3. Real-time Updates & Collaboration:**
- WebSocket connections for live dashboard updates
- Collaborative brainstorming with conflict resolution
- Push notifications for mobile devices
- Optimistic UI updates with rollback on failure

**4. AI/ML Inference & Learning:**
- Pattern recognition across historical RCA data
- Contextual solution suggestions during analysis phase
- Human-in-the-loop validation feedback
- Continuous learning pipeline
- Cross-tenant learning with privacy preservation

**5. Audit Logging & Compliance:**
- Every action logged (create, read, update, delete, approve)
- Immutable audit trail with 1-7 year retention
- User, timestamp, IP address, action details
- Compliance reporting for SOC 2, GDPR, ISO 27001

**6. Performance Optimization:**
- Query optimization for hierarchical data access
- Caching strategy for dashboards and user profiles
- Database partitioning for large multi-location tenants
- Progressive loading (critical actions first, analytics later)
- CDN for static assets, image optimization

**7. Document Generation:**
- Server-side PDF generation with fishbone diagrams
- Excel export with filtering and data transformation
- Professional formatting for executive reporting
- Template engine for consistent outputs

**8. Offline Resilience & Connectivity:**
- View-only access to recent RCAs when offline
- Draft auto-save with sync when connectivity returns
- Progressive loading prioritizing critical actions
- Network error handling with retry logic

**9. Accessibility (WCAG AA):**
- Color contrast compliance (4.5:1 for text)
- Keyboard navigation with visible focus states
- Screen reader optimization with semantic HTML
- Touch target minimums (44x44px)
- High contrast mode for plant floor environments

**10. Observability & Monitoring:**
- Application performance monitoring (APM)
- Real-time error tracking and alerting
- Usage analytics for product insights
- Infrastructure health monitoring
- Custom operational dashboards

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack SaaS B2B Platform** with:
- Frontend: Next.js 15 (responsive web application)
- Backend: NestJS (REST API services)
- Monorepo: Turborepo for workspace management
- Infrastructure: Docker + AWS deployment

### Technical Stack Confirmed

**User Preferences:**
- **Frontend Framework:** Next.js 15 with TypeScript
- **Backend Framework:** NestJS with TypeScript
- **API Architecture:** REST (not GraphQL or tRPC)
- **Infrastructure:** Docker containerization
- **Cloud Platform:** AWS
- **Database:** PostgreSQL (implied for multi-tenant SaaS)
- **Styling:** Tailwind CSS + Shadcn UI (from UX specification)

### Starter Options Considered

**Full-Stack Monorepo Options:**
1. **Next.js + NestJS Turborepo templates** - Community templates combining both frameworks
2. **SaaS Boilerplates** - Pre-built multi-tenant starters (ixartz/SaaS-Boilerplate)
3. **Individual framework initialization** - Standard Next.js + NestJS separately

**Evaluation Criteria:**
- Production-readiness for enterprise SaaS
- Multi-tenancy architecture support
- TypeScript throughout
- Docker deployment capabilities
- Architectural flexibility for custom requirements (AI/ML, real-time, complex RBAC)

### Selected Approach: Individual Framework Initialization with Custom Architecture

**Rationale for Selection:**

Your project requires sophisticated architectural patterns (multi-tenancy with hierarchical permissions, AI/ML services, real-time collaboration, Office 365 SSO, audit logging) that exceed generic starter templates. Starting with standard framework tools provides maximum architectural flexibility while maintaining best practices.

**Frontend Initialization:**

```bash
npx create-next-app@latest fixapp-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Backend Initialization:**

```bash
npx @nestjs/cli@latest new fixapp-backend
cd fixapp-backend
npm install @nestjs/typeorm typeorm pg
npm install --save-dev @types/node
```

**Monorepo Setup:**

```bash
# Initialize Turborepo
npx create-turbo@latest fixapp
# Move generated apps into Turborepo structure
```

**Architectural Decisions Provided by Starters:**

**Language & Runtime:**
- **TypeScript 5.x** throughout frontend and backend for type safety
- **Node.js 20+** runtime (minimum for Next.js 15)
- **Strict TypeScript configuration** enforcing type checks

**Frontend Stack (Next.js 15):**
- **App Router** (default) for modern React Server Components
- **Tailwind CSS** for utility-first styling
- **Shadcn UI components** (to be added) matching UX specification
- **ESLint + Prettier** for code quality
- **Turbopack** for fast development builds
- **Import aliases** (@/* pattern for clean imports)

**Backend Stack (NestJS):**
- **Modular architecture** with controllers, services, modules pattern
- **Dependency injection** built-in for testability
- **TypeORM** for PostgreSQL database access with multi-tenant support
- **JWT authentication** foundation (to be extended for Office 365 SSO)
- **REST API** with decorators for clean endpoint definitions
- **Swagger/OpenAPI** support for API documentation
- **Exception filters** for error handling
- **Guards & Interceptors** for cross-cutting concerns

**Build Tooling:**
- **Next.js 15 Turbopack** for frontend development and production builds
- **NestJS CLI** for backend module generation and build optimization
- **Turborepo** for monorepo build orchestration and caching
- **Docker multi-stage builds** for optimized production images

**Testing Framework:**
- **Frontend:** Jest + React Testing Library (Next.js default)
- **Backend:** Jest + Supertest (NestJS default)
- **E2E:** Playwright or Cypress (to be added based on testing strategy)

**Code Organization:**
- **Monorepo structure:**
  ```
  fixapp/
  ├── apps/
  │   ├── frontend/        # Next.js application
  │   ├── backend/         # NestJS API
  │   └── ai-service/      # Python ML service (separate)
  ├── packages/
  │   ├── shared-types/    # Shared TypeScript interfaces
  │   ├── ui-components/   # Shared React components
  │   └── eslint-config/   # Shared ESLint configuration
  ├── infrastructure/
  │   ├── docker/          # Docker configurations
  │   └── terraform/       # AWS infrastructure as code
  └── turbo.json           # Turborepo configuration
  ```

- **Frontend (Next.js) structure:**
  ```
  frontend/src/
  ├── app/                 # App Router pages
  ├── components/          # React components
  ├── lib/                 # Utilities and helpers
  ├── hooks/               # Custom React hooks
  ├── types/               # TypeScript type definitions
  └── styles/              # Global styles
  ```

- **Backend (NestJS) structure:**
  ```
  backend/src/
  ├── modules/             # Feature modules
  │   ├── auth/            # Authentication module
  │   ├── rca/             # RCA management module
  │   ├── users/           # User management
  │   └── tenants/         # Multi-tenancy module
  ├── common/              # Shared code
  │   ├── guards/          # Auth guards
  │   ├── interceptors/    # HTTP interceptors
  │   ├── filters/         # Exception filters
  │   └── decorators/      # Custom decorators
  ├── database/            # Database configuration
  └── config/              # Application configuration
  ```

**Development Experience:**
- **Hot reloading:** Next.js Fast Refresh and NestJS watch mode
- **Type safety:** Shared types between frontend and backend via monorepo
- **API documentation:** Auto-generated Swagger UI at `/api/docs`
- **Environment management:** .env files with validation
- **Database migrations:** TypeORM migrations for schema versioning
- **Docker development:** docker-compose for local PostgreSQL, Redis, etc.

**Additional Architecture Patterns (to be implemented):**

Beyond starter defaults, fixapp requires:
1. **Multi-tenancy middleware** - Tenant context injection in every request
2. **Hierarchical RBAC** - Custom guards for Global→Country→Plant→Team scoping
3. **WebSocket gateway** - Real-time collaboration features
4. **Event-driven architecture** - For notifications and audit logging
5. **AI/ML service integration** - Separate Python service communicating via REST/gRPC
6. **Document generation service** - PDF/Excel generation microservice
7. **File upload handling** - AWS S3 integration for attachments
8. **Email service** - AWS SES or third-party integration
9. **Job scheduling** - Bull queues with Redis for background tasks

**Note:** Project initialization using these commands should be the first implementation story in the Epics & Stories phase.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Multi-tenancy database architecture (Hybrid approach: Shared DB with RLS + Dedicated DB option)
- Authentication provider architecture (Multi-provider with Passport.js)
- Real-time communication (WebSockets with Socket.io from MVP)
- Database ORM (TypeORM with PostgreSQL)
- API architecture (REST with OpenAPI/Swagger)
- Tenant identification (Subdomain + Custom domain hybrid)

**Important Decisions (Shape Architecture):**
- Job queue system (Bull + Redis)
- AI/ML service integration (Separate Python service via REST)
- File storage (AWS S3 with presigned URLs)
- Email service (AWS SES)
- Caching strategy (Redis for dashboards, sessions, rate limiting)
- CI/CD pipeline (GitHub Actions)
- Monitoring (CloudWatch + Sentry)

**Deferred Decisions (Post-MVP):**
- Additional auth providers (Google, Okta, SAML) - architecture supports, implement as needed
- Admin UI for tenant auth configuration - start with database configuration
- WebSocket horizontal scaling - start single instance, add load balancing as needed
- Advanced caching strategies - implement as performance demands
- GPU acceleration for AI/ML - evaluate based on model complexity

### Data Architecture

**Database Strategy: Hybrid Multi-Tenancy**

**Decision:** Implement both shared database and database-per-tenant approaches based on customer tier.

**Implementation:**

**Standard SaaS Tenants (Default):**
- Shared PostgreSQL database with Row-Level Security (RLS)
- `tenant_id` UUID column on all tenant-scoped tables
- PostgreSQL RLS policies enforce automatic tenant filtering at database level
- Cost-efficient for majority of customers (Year 1: 3 tenants, Year 3: 50+ tenants)
- Example RLS policy:
  ```sql
  CREATE POLICY tenant_isolation ON rcas
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
  ```

**Enterprise Custom Tenants:**
- Dedicated PostgreSQL database instance per tenant
- Complete data isolation at database level
- Supports data residency requirements (EU, US, APAC per NFR-C9)
- Custom hosting configurations (on-premise option for highly sensitive customers)
- Separate connection pools per enterprise tenant

**Data Access Abstraction Layer:**
```typescript
// All database queries go through tenant-aware repository
@Injectable()
export class TenantAwareRepository<T> {
  constructor(
    private dataSource: DataSource,
    private tenantContext: TenantContextService
  ) {}

  // Automatically injects tenant_id for shared DB
  // Routes to correct database connection for dedicated tenants
  async find(options: FindOptions<T>): Promise<T[]> {
    const tenant = this.tenantContext.getCurrentTenant();
    const connection = await this.getConnectionForTenant(tenant);

    if (tenant.deploymentType === 'shared') {
      // Set RLS context for shared database
      await connection.query(
        `SET app.current_tenant = '${tenant.id}'`
      );
    }
    // Query executes against appropriate database
    return connection.getRepository(T).find(options);
  }
}
```

**Migration Strategy:**
- **Shared database:** Single migration for schema changes
- **Dedicated databases:** Migration scripts run against each tenant database
- Migration versioning tracked per database
- Rollback procedures for failed migrations

**Rationale:**
- Supports both standard SaaS and enterprise deployment models from PRD
- Start simple with shared DB for initial tenants, scale to dedicated as enterprise base grows
- Meets compliance requirements for enterprise customers (SOC 2, GDPR, ISO 27001 readiness)
- Transparent to application code via abstraction layer
- Automated tenant isolation testing prevents cross-tenant data leakage (NFR-C11)

**Affects:** All backend modules, database migrations, data access patterns, deployment infrastructure

---

**ORM Choice: TypeORM**

**Decision:** Use TypeORM (provided by NestJS starter) for PostgreSQL data access.

**Technology:** TypeORM 0.3.x with pg (PostgreSQL driver)

**Configuration:**
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false, // Never use in production
  logging: process.env.NODE_ENV === 'development'
})
```

**Rationale:**
- Native NestJS integration via @nestjs/typeorm
- Good multi-tenancy support with QueryBuilder and raw SQL when needed
- Supports both Active Record and Data Mapper patterns (we'll use Data Mapper for better testability)
- Mature migration system for schema versioning across tenants
- Row-Level Security compatible (can execute SET statements for RLS context)
- Already included in NestJS starter - no additional complexity

**Implementation Pattern:**
- Data Mapper pattern (repositories) for better testability and separation of concerns
- Entity classes with TypeScript decorators
- Migration files for all schema changes
- Separate migration strategy for shared vs. dedicated tenant databases

**Affects:** All data models, repositories, database migrations, testing strategy

---

**Caching Strategy: Redis**

**Decision:** Redis for application caching, session storage, and job queue backend.

**Technology:** Redis 7.x (AWS ElastiCache or self-hosted via Docker)

**Use Cases:**

1. **Dashboard data caching** (NFR-P1, NFR-P2)
   - Cache aggregated metrics queries (open vs closed RCAs, time to resolution)
   - TTL: 60 seconds for dashboards
   - Invalidate on RCA status changes

2. **User session storage**
   - JWT refresh tokens (7-day expiration)
   - Active session tracking
   - Session revocation on logout

3. **Rate limiting counters** (NFR-S13)
   - API request counting per user/tenant
   - Sliding window rate limiting
   - Prevents abuse and DoS attacks

4. **Bull queue backend**
   - Job persistence for email, PDF generation, AI inference
   - Job status tracking and retry logic

5. **Real-time presence data**
   - WebSocket connection tracking
   - Active users in RCA investigations
   - TTL-based cleanup for disconnected users

**Cache Patterns:**

```typescript
// Cache-aside pattern for dashboard metrics
@Injectable()
export class DashboardService {
  async getMetrics(tenantId: string): Promise<Metrics> {
    const cacheKey = `metrics:${tenantId}`;

    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Cache miss - query database
    const metrics = await this.computeMetrics(tenantId);

    // Store in cache with 60s TTL
    await this.redis.setex(cacheKey, 60, JSON.stringify(metrics));

    return metrics;
  }

  // Invalidate on data mutations
  async invalidateMetricsCache(tenantId: string) {
    await this.redis.del(`metrics:${tenantId}`);
  }
}
```

**Rationale:**
- Performance requirement: <2 second page loads (NFR-P1), <500ms API responses (NFR-P2)
- Support 1,000+ concurrent users per tenant (NFR-P5)
- Essential for job queue and session management
- Reduces database load for frequently accessed data (dashboard metrics)

**Affects:** Dashboard queries, authentication module, notification system, job queue, rate limiting

---

**File Storage: AWS S3**

**Decision:** AWS S3 for all file uploads (photos, documents, attachments).

**Technology:** AWS S3 with presigned URLs for secure direct uploads

**Implementation:**

**Bucket Structure:**
- Tenant-scoped prefixes: `fixapp-files/{tenant_id}/{rca_id}/{file_id}.jpg`
- Separate buckets for dev/staging/production environments
- Versioning enabled for audit compliance

**Upload Flow (Presigned URLs):**
```typescript
// Backend generates presigned URL
@Post('rcas/:id/upload-url')
async getUploadUrl(@Param('id') rcaId: string) {
  const key = `${tenantId}/${rcaId}/${uuidv4()}.jpg`;

  const presignedUrl = await this.s3.getSignedUrlPromise('putObject', {
    Bucket: 'fixapp-files',
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: 'image/jpeg'
  });

  return { uploadUrl: presignedUrl, fileKey: key };
}

// Frontend uploads directly to S3
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/jpeg' }
});
```

**Features:**
- **Image optimization:** Automatic thumbnail generation (Lambda trigger)
- **Lifecycle policies:** Archive to Glacier after 90 days for cost optimization
- **CDN integration:** CloudFront for global low-latency access
- **Encryption:** Server-side encryption (SSE-S3) at rest (NFR-S1)
- **Access control:** Presigned URLs expire after 5 minutes, tenant-scoped access

**Rationale:**
- Plant operators attach photos to RCA records (FR5)
- Scalable, durable (99.999999999% durability), cost-effective storage
- Direct browser-to-S3 upload reduces backend load
- Integrates with CloudFront CDN for global manufacturing operations
- Supports compliance requirements (encryption at rest, audit logs)

**Affects:** RCA creation, file upload module, frontend upload components, image display

---

### Authentication & Security

**Multi-Provider Authentication Architecture**

**Decision:** Implement tenant-configurable authentication with multiple provider support.

**Technology:** Passport.js with NestJS integration (@nestjs/passport)

**Supported Providers (MVP):**

1. **Office 365 / Azure AD** (OAuth 2.0)
   - Package: passport-azure-ad
   - Strategy: OIDCStrategy
   - Use case: Primary for manufacturing enterprises

2. **Email/Password** (Local strategy)
   - Package: passport-local
   - Password hashing: bcrypt (10 rounds)
   - Use case: Fallback when SSO not available

**Post-MVP Providers (Architecture Supports):**
- Google Workspace (passport-google-oauth20)
- Okta (passport-okta-oauth)
- Generic SAML 2.0 (passport-saml)
- Magic Link (custom passwordless for plant floor operators)

**Tenant Auth Configuration Model:**

```typescript
// Stored in tenant_auth_config table
interface TenantAuthConfig {
  tenant_id: string;
  primary_provider: 'azure-ad' | 'email' | 'google' | 'okta' | 'saml';
  providers: AuthProviderConfig[];
  allow_email_fallback: boolean;
  mfa_required: boolean;
  session_duration_seconds: number;
  password_policy?: PasswordPolicy; // For email/password tenants
}

interface AuthProviderConfig {
  type: string;
  enabled: boolean;
  config: {
    // Provider-specific configuration
    client_id?: string;
    client_secret?: string; // Encrypted in database
    tenant_id?: string; // For Azure AD
    redirect_uri?: string;
  };
}
```

**Authentication Flow:**

1. User accesses tenant URL (subdomain identifies tenant)
2. Backend loads tenant auth configuration from database
3. Login page displays auth options configured for that tenant
4. User selects provider (or auto-redirects if only one enabled)
5. Passport delegates to appropriate strategy
6. On success, issue JWT with claims: `tenant_id`, `user_id`, `role`, `location_scope`
7. Every subsequent API request validates JWT and enforces RBAC

**Implementation:**

```typescript
// Dynamic strategy loading based on tenant config
@Injectable()
export class DynamicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId; // From tenant middleware

    // Load tenant auth config
    const config = await this.tenantAuthService.getConfig(tenantId);

    // Load appropriate Passport strategy
    const strategy = this.getStrategyForProvider(config.primary_provider);

    return strategy.authenticate(request);
  }
}
```

**Rationale:**
- Super admin can configure per-tenant authentication (user requirement)
- Enterprise customers can use their existing identity providers
- Architecture supports adding providers without code changes (just new Passport strategies)
- Office 365 common in manufacturing organizations (PRD context)
- Flexible for different customer security requirements

**Affects:** Auth module, tenant configuration, login UI, all API endpoints, user onboarding

---

**Tenant Identification: Hybrid Subdomain + Custom Domain**

**Decision:** Support both subdomain and custom domain tenant identification.

**Standard SaaS Tenants:**
- Subdomain: `acmecorp.fixapp.com`, `vietnam-cement.fixapp.com`
- SSL wildcard certificate: `*.fixapp.com` (AWS Certificate Manager)
- Tenant identified from subdomain in middleware
- Professional, cost-efficient for standard tier

**Enterprise Tenants:**
- Custom domain: `rca.acmecorp.com`, `fixes.vietnamcement.vn`
- Tenant mapping stored in database: `custom_domains` table
- SSL certificate per custom domain (AWS Certificate Manager auto-provisioning)
- White-label experience for enterprise customers

**Tenant Identification Middleware:**

```typescript
// Runs before all other middleware
@Injectable()
export class TenantIdentificationMiddleware implements NestMiddleware {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const hostname = req.hostname;

    let tenantId: string;

    if (hostname.endsWith('.fixapp.com')) {
      // Subdomain tenant
      const subdomain = hostname.split('.')[0];
      tenantId = await this.tenantService.getBySubdomain(subdomain);
    } else {
      // Custom domain tenant
      tenantId = await this.tenantService.getByCustomDomain(hostname);
    }

    if (!tenantId) {
      throw new NotFoundException('Tenant not found');
    }

    // Attach to request for downstream use
    req.tenantId = tenantId;
    req.tenant = await this.tenantService.getById(tenantId);

    this.logger.log(`Request for tenant: ${tenantId}`);
    next();
  }
}
```

**DNS Configuration:**
- Subdomain: Wildcard A record `*.fixapp.com → Load Balancer IP`
- Custom domain: Customer creates CNAME `rca.acmecorp.com → fixapp.com`

**Rationale:**
- Professional subdomain access for standard tiers (Year 1-3: most customers)
- White-label custom domains for enterprise customers (competitive advantage)
- Clear tenant separation and branding
- Scales to 500+ tenants by Year 5 (NFR-SC10)

**Affects:** Routing, SSL configuration, tenant middleware, DNS setup, customer onboarding

---

**Session Management & JWT Strategy**

**Decision:** JWT-based authentication with refresh tokens stored in Redis.

**Technology:**
- @nestjs/jwt for JWT generation/validation
- Redis for refresh token storage
- HttpOnly cookies for secure token delivery

**Token Strategy:**

**Access Token (Short-lived):**
- Lifetime: 15 minutes
- Storage: Frontend memory (React state)
- Claims:
  ```json
  {
    "sub": "user-uuid",
    "tenant_id": "tenant-uuid",
    "role": "rca_owner",
    "location_scope": {
      "type": "plant",
      "id": "plant-uuid"
    },
    "iat": 1703260800,
    "exp": 1703261700
  }
  ```

**Refresh Token (Long-lived):**
- Lifetime: 7 days (configurable per tenant)
- Storage: Redis + HttpOnly cookie (XSS protection)
- One-time use (rotated on each refresh)
- Revocable (blacklist in Redis on logout)

**Token Flow:**

```typescript
// Login - issue both tokens
@Post('auth/login')
async login(@Body() credentials: LoginDto) {
  const user = await this.authService.validateUser(credentials);

  const accessToken = this.jwtService.sign({
    sub: user.id,
    tenant_id: user.tenant_id,
    role: user.role,
    location_scope: user.location_scope
  }, { expiresIn: '15m' });

  const refreshToken = uuidv4();
  await this.redis.setex(
    `refresh:${refreshToken}`,
    7 * 24 * 60 * 60, // 7 days
    JSON.stringify({ user_id: user.id, tenant_id: user.tenant_id })
  );

  // Set HttpOnly cookie for refresh token
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return { access_token: accessToken };
}

// Refresh - rotate tokens
@Post('auth/refresh')
async refresh(@Req() req: Request) {
  const oldRefreshToken = req.cookies.refresh_token;

  // Validate and consume old refresh token
  const data = await this.redis.get(`refresh:${oldRefreshToken}`);
  if (!data) throw new UnauthorizedException();

  // Delete old token (one-time use)
  await this.redis.del(`refresh:${oldRefreshToken}`);

  // Issue new tokens
  const { user_id, tenant_id } = JSON.parse(data);
  const user = await this.userService.getById(user_id);

  // ... issue new access + refresh tokens
}

// Logout - revoke refresh token
@Post('auth/logout')
async logout(@Req() req: Request) {
  const refreshToken = req.cookies.refresh_token;
  await this.redis.del(`refresh:${refreshToken}`);
  res.clearCookie('refresh_token');
}
```

**Security Measures:**
- Access tokens in memory only (not localStorage - XSS protection)
- Refresh tokens in HttpOnly cookies (not accessible to JavaScript)
- Token rotation on each refresh (limits impact of stolen refresh token)
- Blacklist in Redis for immediate revocation
- HTTPS only in production (secure flag on cookies)

**Rationale:**
- Stateless authentication scales horizontally (NFR-SC1)
- Secure against XSS and CSRF attacks (NFR-S security requirements)
- Supports multi-factor authentication (future enhancement)
- Per-tenant session duration configuration (enterprise flexibility)
- Short access token lifetime limits damage from token theft

**Affects:** Auth module, API guards, frontend auth handling, session management

---

**Hierarchical RBAC Implementation**

**Decision:** Custom NestJS guards enforcing Global→Country→Plant→Team hierarchical permissions.

**Role Hierarchy (from PRD):**

1. **Global Administrator**
   - Sees: All locations globally
   - Can: Manage all RCAs, users, tenants, configure tenant auth
   - Scope: `{type: 'global'}`

2. **Country Leader**
   - Sees: Assigned country only (e.g., Sri Lanka with 4 plants)
   - Can: View all RCAs in country, comment/mentor, add team members
   - Cannot: Access other countries, delete RCAs
   - Scope: `{type: 'country', id: 'country-uuid'}`

3. **RCA Owner**
   - Sees: Assigned plant only + own RCAs
   - Can: Create/edit own RCAs, assign solutions, approve team member work
   - Cannot: Access other plants, delete RCAs
   - Scope: `{type: 'plant', id: 'plant-uuid'}`

4. **Team Member/Engineer**
   - Sees: Assigned RCAs only + own plant RCAs
   - Can: Contribute brainstorming, update assigned actions
   - Cannot: Edit RCA metadata, approve solutions
   - Scope: `{type: 'plant', id: 'plant-uuid'}`

5. **Plant Operator**
   - Sees: Own submissions only
   - Can: Create RCAs from maintenance tickets
   - Cannot: Edit after submission, view other operators' RCAs
   - Scope: `{type: 'plant', id: 'plant-uuid'}`

**RBAC Guard Implementation:**

```typescript
@Injectable()
export class HierarchicalRBACGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JWT
    const requestedResource = this.getResourceScope(request);

    return this.checkHierarchicalAccess(
      user.role,
      user.location_scope,
      requestedResource
    );
  }

  private checkHierarchicalAccess(
    role: UserRole,
    userScope: LocationScope,
    resourceScope: LocationScope
  ): boolean {
    // Global admins can access everything
    if (userScope.type === 'global') return true;

    // Country leaders can access their country
    if (userScope.type === 'country') {
      return resourceScope.country_id === userScope.id;
    }

    // Plant-level users can only access their plant
    if (userScope.type === 'plant') {
      return resourceScope.plant_id === userScope.id;
    }

    return false;
  }
}

// Usage on controllers
@Controller('rcas')
@UseGuards(JwtAuthGuard, HierarchicalRBACGuard)
export class RcaController {
  @Get()
  async findAll(@Req() req: Request) {
    // Query automatically scoped by user's location_scope
    return this.rcaService.findAll(req.user.location_scope);
  }
}
```

**Data Scoping at Query Level:**

```typescript
// RCA repository automatically scopes queries
@Injectable()
export class RcaRepository {
  async findAll(locationScope: LocationScope): Promise<Rca[]> {
    const queryBuilder = this.repository.createQueryBuilder('rca');

    if (locationScope.type === 'country') {
      queryBuilder.where('rca.country_id = :countryId', {
        countryId: locationScope.id
      });
    } else if (locationScope.type === 'plant') {
      queryBuilder.where('rca.plant_id = :plantId', {
        plantId: locationScope.id
      });
    }
    // Global scope - no filter

    return queryBuilder.getMany();
  }
}
```

**Permission Matrix (from PRD FR table):**

| Role | Create RCA | View RCAs | Edit RCA | Add Team | Approve | Delete | Cross-Location |
|------|------------|-----------|----------|----------|---------|--------|----------------|
| Plant Operator | ✓ | Own only | Own only | ✗ | ✗ | ✗ | ✗ |
| Team Member | ✓ | Plant | Brainstorm | ✗ | ✗ | ✗ | ✗ |
| RCA Owner | ✓ | Plant | Own RCAs | ✓ | ✓ | ✗ | ✗ |
| Country Leader | ✓ | Country | Comment | Suggest | ✗ | ✗ | Own country |
| Global Admin | ✓ | All | All | ✓ | ✗ | ✓ | All |

**Rationale:**
- Core requirement from PRD: hierarchical visibility (NFR-S6)
- Security-critical: prevent cross-location data leakage (NFR-S3)
- Supports complex organizational structures (multinational with country/plant hierarchy)
- Defense in depth: enforced at API guard layer AND database query layer
- Meets compliance requirements (audit who accessed what data)

**Affects:** All API endpoints, guards, database queries, frontend routing, dashboard visibility

---

### Real-Time Communication & Event Architecture

**WebSocket Implementation: Socket.io from MVP**

**Decision:** Implement WebSockets from MVP using Socket.io with NestJS WebSocket gateway.

**Technology:** Socket.io 4.x with @nestjs/websockets

**Use Cases:**

1. **Dashboard live updates** (NFR-P3)
   - RCA status changes broadcast to all users viewing that RCA
   - Action completions update dashboards in real-time
   - No manual page refresh needed

2. **Collaborative brainstorming** (FR13-FR17)
   - Team members see new observations appear instantly
   - Real-time contribution from multiple engineers
   - Presence indicators (who's currently viewing)

3. **Push notifications** (FR46-FR52)
   - Assignment alerts ("You've been assigned RCA-2847")
   - Approval requests ("3 pending approvals")
   - Overdue action reminders

4. **Real-time presence tracking**
   - Show active users in RCA investigation
   - "Rajesh is viewing this RCA"
   - Connection status indicators

**WebSocket Gateway Implementation:**

```typescript
@WebSocketGateway({
  cors: { origin: '*' }, // Configure properly in production
  namespace: '/rca'
})
export class RcaGateway {
  @WebSocketServer()
  server: Server;

  // Authenticate WebSocket connections
  afterInit() {
    this.server.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await this.authService.verifyJWT(token);
        socket.data.user = user;
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    });
  }

  // User joins RCA room
  @SubscribeMessage('join-rca')
  handleJoinRca(
    @ConnectedSocket() client: Socket,
    @MessageBody() rcaId: string
  ) {
    // Verify user has access to this RCA
    const hasAccess = this.rbacService.canAccessRca(
      client.data.user,
      rcaId
    );

    if (!hasAccess) {
      client.emit('error', 'Unauthorized');
      return;
    }

    // Join tenant + RCA specific room
    const roomName = `tenant:${client.data.user.tenant_id}:rca:${rcaId}`;
    client.join(roomName);

    // Notify others of new presence
    client.to(roomName).emit('user-joined', {
      user: client.data.user.name,
      timestamp: Date.now()
    });
  }

  // Broadcast RCA update to all users in room
  emitRcaUpdate(tenantId: string, rcaId: string, update: any) {
    const roomName = `tenant:${tenantId}:rca:${rcaId}`;
    this.server.to(roomName).emit('rca-updated', update);
  }

  // Broadcast notification to specific user
  emitUserNotification(tenantId: string, userId: string, notification: any) {
    const roomName = `tenant:${tenantId}:user:${userId}`;
    this.server.to(roomName).emit('notification', notification);
  }
}
```

**Connection Management:**
- Authenticate WebSocket connections with JWT from handshake
- Tenant-scoped rooms (users only join their tenant's rooms)
- Automatic reconnection on disconnect (Socket.io built-in)
- Heartbeat/ping-pong for connection health monitoring
- Connection limits per user (prevent connection spam)

**Frontend Integration:**

```typescript
// React hook for WebSocket connection
function useRcaWebSocket(rcaId: string) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io('wss://api.fixapp.com/rca', {
      auth: { token: user.accessToken }
    });

    newSocket.emit('join-rca', rcaId);

    newSocket.on('rca-updated', (update) => {
      // Update local state with real-time changes
      updateRcaState(update);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [rcaId]);

  return socket;
}
```

**Rationale:**
- NFR-P4 requirement: real-time collaboration updates <1 second
- Better UX for collaborative brainstorming (FR13-FR17) - team sees contributions instantly
- Socket.io provides automatic fallbacks (long-polling if WebSocket unavailable)
- Room-based broadcasting simplifies multi-user scenarios (only broadcast to relevant users)
- Essential for "action-oriented" UX vision from UX spec (immediate feedback)

**Affects:** Backend WebSocket gateway, frontend real-time hooks, dashboard updates, collaboration features, notification system

---

**Event-Driven Architecture: Message Queue**

**Decision:** Bull + Redis for background job processing and event-driven workflows.

**Technology:**
- Bull 4.x (job queue library)
- Redis 7.x (queue backend)
- @nestjs/bull for NestJS integration

**Queue Use Cases:**

1. **Email notifications** (FR46-FR52)
   - Assignment emails: "You've been assigned RCA-2847"
   - Approval notifications: "Anika completed action - pending your approval"
   - Overdue reminders: "2 actions overdue - need your attention"
   - Async processing prevents blocking API requests

2. **Audit logging** (NFR-C1 to NFR-C4)
   - Every user action logged asynchronously
   - Immutable audit trail writes
   - High-volume logging without impacting API performance

3. **AI suggestion generation** (FR26-FR32)
   - Async ML inference (can take 2-5 seconds)
   - Pattern analysis across historical RCAs
   - User gets immediate response, suggestions appear when ready

4. **PDF/Excel generation** (FR53-FR57)
   - Generate fishbone diagram PDFs
   - Export RCA data to Excel
   - Heavy processing offloaded to background workers

5. **Data migration** (FR72-FR73)
   - Async tenant onboarding
   - Import historical RCA databases
   - Progress tracking and error handling

**Queue Architecture:**

```typescript
// Queue producer (from controllers/services)
@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    @InjectQueue('emails') private emailQueue: Queue
  ) {}

  async sendAssignmentNotification(userId: string, rcaId: string) {
    // Add job to queue (non-blocking)
    await this.notificationQueue.add('assignment', {
      userId,
      rcaId,
      type: 'rca_assigned',
      timestamp: Date.now()
    }, {
      attempts: 3, // Retry up to 3 times
      backoff: { type: 'exponential', delay: 2000 }
    });

    // Also send email
    await this.emailQueue.add('assignment-email', {
      userId,
      rcaId
    });
  }
}

// Queue consumer (background worker)
@Processor('notifications')
export class NotificationProcessor {
  @Process('assignment')
  async handleAssignment(job: Job) {
    const { userId, rcaId } = job.data;

    // Send push notification via WebSocket
    this.wsGateway.emitUserNotification(userId, {
      type: 'assignment',
      rca_id: rcaId,
      message: 'You have been assigned to RCA-' + rcaId
    });

    // Log completion
    console.log(`Notification sent to user ${userId}`);
  }

  @OnQueueFailed()
  async handleFailed(job: Job, err: Error) {
    // Move to dead letter queue after max retries
    console.error(`Job ${job.id} failed:`, err);
    await this.deadLetterQueue.add('failed-notification', job.data);
  }
}
```

**Job Retry Strategy:**
- Exponential backoff for failed jobs (2s, 4s, 8s delays)
- Max 3 retry attempts per job
- Dead letter queue for permanently failed jobs
- Job status tracking: `pending → active → completed/failed`
- Manual retry capability from admin dashboard

**Queue Management:**
- Separate queues by priority: `critical`, `normal`, `low`
- Rate limiting: Max jobs per second to prevent Redis overload
- Queue monitoring: Bull Board dashboard (dev/staging environments)
- Graceful shutdown: Wait for active jobs to complete

**Rationale:**
- Async processing prevents blocking API requests (NFR-P2: <500ms API responses)
- Reliable delivery with retry mechanisms (critical for emails, audit logs)
- Essential for email notifications, audit logging, document generation
- Scales horizontally (multiple worker instances)
- Decouples services (RCA service doesn't know about email implementation)

**Affects:** Notification system, audit logging, document generation, AI service integration, data migration

---

### API & Communication Patterns

**API Architecture: REST**

**Decision:** RESTful API with OpenAPI/Swagger documentation.

**Technology:**
- NestJS REST controllers with decorators
- @nestjs/swagger for auto-generated API documentation
- class-validator for request DTO validation
- class-transformer for response serialization

**API Design Standards:**

**Resource-based URLs:**
```
GET    /api/v1/rcas                    # List RCAs (tenant-scoped)
POST   /api/v1/rcas                    # Create RCA
GET    /api/v1/rcas/:id                # Get RCA details
PATCH  /api/v1/rcas/:id                # Update RCA
DELETE /api/v1/rcas/:id                # Delete RCA (admin only)

GET    /api/v1/rcas/:id/solutions      # List solutions for RCA
POST   /api/v1/rcas/:id/solutions      # Create solution
PATCH  /api/v1/solutions/:id/approve   # Approve solution

GET    /api/v1/users                   # List users (tenant-scoped)
GET    /api/v1/dashboards/metrics      # Get dashboard metrics
```

**HTTP Verbs:**
- GET: Retrieve resources (idempotent, cacheable)
- POST: Create new resources
- PUT: Replace entire resource
- PATCH: Partial update
- DELETE: Remove resource (admin only with audit)

**Tenant Scoping:**
- Tenant from JWT (not URL) - prevents URL manipulation
- All queries automatically scoped by tenant_id
- No cross-tenant access possible

**Pagination (Cursor-based):**
```typescript
// Request
GET /api/v1/rcas?limit=20&cursor=eyJpZCI6MTIzfQ==

// Response
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTQzfQ==",
    "has_more": true,
    "total": 156 // Optional
  }
}
```

**Filtering & Sorting:**
```
GET /api/v1/rcas?status=pending&plant_id=123&sort=-created_at
```

**API Documentation (Swagger):**

```typescript
@ApiTags('RCA Management')
@Controller('api/v1/rcas')
export class RcaController {
  @Get()
  @ApiOperation({ summary: 'List all RCAs for current user' })
  @ApiQuery({ name: 'status', required: false, enum: RcaStatus })
  @ApiQuery({ name: 'plant_id', required: false, type: String })
  @ApiResponse({ status: 200, type: [RcaDto] })
  async findAll(@Query() query: FindRcasDto, @Req() req: Request) {
    return this.rcaService.findAll(req.user.location_scope, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new RCA' })
  @ApiBody({ type: CreateRcaDto })
  @ApiResponse({ status: 201, type: RcaDto })
  async create(@Body() createDto: CreateRcaDto, @Req() req: Request) {
    return this.rcaService.create(req.user.tenant_id, createDto);
  }
}
```

**Auto-generated Swagger UI available at:** `/api/docs`

**Error Handling (Standardized):**

```typescript
// All errors follow this structure
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "issue_description",
      "message": "Must be at least 10 characters",
      "value": "Short"
    }
  ],
  "timestamp": "2025-12-22T10:30:00.000Z",
  "path": "/api/v1/rcas",
  "request_id": "uuid-1234" // For tracking in logs
}

// HTTP status codes
200 OK              - Successful GET
201 Created         - Successful POST
204 No Content      - Successful DELETE
400 Bad Request     - Validation error
401 Unauthorized    - Missing/invalid token
403 Forbidden       - RBAC permission denied
404 Not Found       - Resource doesn't exist
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
```

**API Versioning:**
- Version in URL: `/api/v1/` (current)
- Future breaking changes: `/api/v2/`
- Supports multiple versions simultaneously during migration

**Rationale:**
- User preference: REST (not GraphQL or tRPC)
- Industry standard, well-understood by all developers
- Excellent tooling (Swagger, Postman, Bruno)
- Supports future external integrations (webhooks, SAP integration)
- RESTful design scales well with caching strategies

**Affects:** All backend controllers, frontend API client, external integrations, API documentation

---

**Rate Limiting & API Security**

**Decision:** Redis-based rate limiting with tenant-specific quotas and comprehensive API security.

**Technology:** @nestjs/throttler with Redis storage adapter

**Rate Limits:**

**Authenticated Users (per user):**
- Standard tenants: 1,000 requests/hour
- Enterprise tenants: Configurable per contract (5,000-10,000 req/hour)
- Burst allowance: Up to 50 requests in 10 seconds

**Unauthenticated (per IP):**
- Login endpoint: 10 attempts/hour (prevent brute force)
- Signup endpoint: 5 attempts/hour (prevent spam)
- Public endpoints: 100 requests/hour

**Tenant-level Quotas:**
- Prevent single tenant from abusing shared infrastructure
- Standard tier: 10,000 requests/hour across all tenant users
- Enterprise tier: Unlimited (dedicated resources)

**Implementation:**

```typescript
// Global rate limiter
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.user) {
      // Authenticated: track by user ID
      return `user:${req.user.id}`;
    } else {
      // Unauthenticated: track by IP
      return `ip:${req.ip}`;
    }
  }

  protected async getLimit(req: Record<string, any>): Promise<number> {
    if (req.user?.tenant?.tier === 'enterprise') {
      return 10000; // Enterprise limit
    }
    return req.user ? 1000 : 100; // Standard or unauthenticated
  }
}

// Apply to all routes
@UseGuards(CustomThrottlerGuard)
@Controller()
export class AppController {}

// Override for specific endpoints
@Throttle(10, 3600) // 10 requests per hour
@Post('auth/login')
async login(@Body() credentials: LoginDto) {}
```

**Rate Limit Response:**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1703260800
Retry-After: 300

{
  "statusCode": 429,
  "message": "Too many requests. Please try again in 5 minutes.",
  "retryAfter": 300
}
```

**Additional Security Measures:**

1. **Helmet.js** - HTTP security headers
   ```typescript
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"]
       }
     },
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true
     }
   }));
   ```

2. **CORS Configuration** - Tenant-specific origins
   ```typescript
   app.enableCors({
     origin: (origin, callback) => {
       // Allow subdomain and custom domains for tenant
       const allowedOrigins = await getAllowedOriginsForTenant(origin);
       callback(null, allowedOrigins.includes(origin));
     },
     credentials: true
   });
   ```

3. **Request Size Limits**
   - JSON body: 1MB max
   - File uploads: 10MB max (via presigned URLs to S3)
   - Query string: 5KB max

4. **SQL Injection Protection**
   - TypeORM parameterized queries (never string concatenation)
   - Input validation with class-validator
   - Sanitization of user inputs

5. **XSS Protection**
   - Content Security Policy (CSP) headers
   - Sanitize HTML in user-generated content
   - HttpOnly cookies for refresh tokens

**Rationale:**
- Prevent abuse and DoS attacks (NFR-S13: rate limiting)
- Fair resource allocation across tenants (multi-tenancy requirement)
- Enterprise SLA protection (prevent noisy neighbor problem)
- Compliance with security best practices (OWASP Top 10)
- Layered security approach (defense in depth)

**Affects:** API gateway, authentication, all endpoints, tenant configuration

---

### AI/ML Service Integration

**AI Service Architecture: Separate Python Service**

**Decision:** Separate Python-based AI/ML service communicating with NestJS backend via REST API.

**Technology Stack:**

**Python Service:**
- Python 3.11+ with FastAPI (async web framework)
- ML libraries:
  - scikit-learn (pattern recognition, clustering)
  - transformers (NLP for RCA text analysis)
  - pandas (data manipulation)
  - numpy (numerical operations)
- Vector database: PostgreSQL with pgvector extension (or Pinecone for managed option)
- Containerized: Separate Docker container

**Service Responsibilities:**

1. **Historical RCA pattern analysis** (FR26-FR27)
   - Analyze symptoms, equipment types, root causes across historical RCAs
   - Build pattern library from successful solutions
   - Cluster similar failure modes

2. **Solution suggestion generation** (FR28)
   - Match current RCA symptoms with historical patterns
   - Rank suggestions by similarity score and success rate
   - Provide context (which plant, when, success metrics)

3. **Cross-location pattern detection** (FR31)
   - Identify when multiple plants experience similar issues
   - Global admins can see patterns across countries
   - Privacy-preserving (pattern-based, not raw data exposure)

4. **Feedback learning loop** (FR30)
   - Engineers accept/reject suggestions with comments
   - System learns from feedback to improve future suggestions
   - Continuous model improvement

**Communication Pattern (REST API):**

```typescript
// NestJS backend calls AI service
@Injectable()
export class AiSuggestionService {
  constructor(private httpService: HttpService) {}

  async getSuggestions(rcaId: string): Promise<AiSuggestion[]> {
    const rca = await this.rcaRepository.findOne(rcaId);

    // Call Python AI service via HTTP
    const response = await this.httpService.axiosRef.post(
      'http://ai-service:8000/api/v1/suggest',
      {
        symptoms: rca.issue_description,
        equipment_type: rca.equipment_type,
        location: rca.plant_id,
        tenant_id: rca.tenant_id, // Tenant-scoped learning
        historical_context: {
          plant_history: await this.getPlantHistory(rca.plant_id),
          similar_equipment: await this.getSimilarEquipmentFailures(rca.equipment_type)
        }
      },
      {
        timeout: 5000, // 5 second timeout
        headers: {
          'Authorization': `Bearer ${this.aiServiceToken}`,
          'X-Request-ID': uuidv4()
        }
      }
    );

    return response.data.suggestions;
  }

  async submitFeedback(suggestionId: string, feedback: AiFeedback) {
    // Send feedback to AI service for learning
    await this.httpService.axiosRef.post(
      'http://ai-service:8000/api/v1/feedback',
      {
        suggestion_id: suggestionId,
        accepted: feedback.accepted,
        engineer_comment: feedback.comment,
        outcome: feedback.outcome // Did it solve the problem?
      }
    );
  }
}
```

**Python FastAPI Service:**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

class SuggestionRequest(BaseModel):
    symptoms: str
    equipment_type: str
    tenant_id: str
    historical_context: dict

class AiSuggestion(BaseModel):
    id: str
    solution_text: str
    similarity_score: float
    source_rca_id: str
    success_rate: float
    context: dict

@app.post("/api/v1/suggest")
async def get_suggestions(request: SuggestionRequest) -> list[AiSuggestion]:
    # 1. Vectorize current RCA symptoms
    current_vector = vectorize_text(request.symptoms)

    # 2. Query vector database for similar historical patterns
    similar_patterns = await vector_db.similarity_search(
        current_vector,
        tenant_id=request.tenant_id,
        equipment_type=request.equipment_type,
        limit=10
    )

    # 3. Rank by similarity + success rate
    ranked_suggestions = rank_suggestions(similar_patterns)

    # 4. Return top 5 suggestions
    return ranked_suggestions[:5]

@app.post("/api/v1/feedback")
async def submit_feedback(feedback: FeedbackData):
    # Store feedback for model retraining
    await feedback_store.save(feedback)

    # Trigger model update if threshold reached
    if await should_retrain():
        await retrain_model()

    return {"status": "feedback_received"}
```

**Vector Database (pgvector):**

```sql
-- Store RCA embeddings for similarity search
CREATE TABLE rca_embeddings (
    id UUID PRIMARY KEY,
    rca_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    embedding VECTOR(768), -- Text embedding dimension
    equipment_type VARCHAR(100),
    success_rate FLOAT,
    created_at TIMESTAMP
);

-- Create index for fast similarity search
CREATE INDEX ON rca_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Similarity search query
SELECT rca_id, solution_text,
       1 - (embedding <=> query_embedding) AS similarity
FROM rca_embeddings
WHERE tenant_id = $1
  AND equipment_type = $2
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

**Deployment:**
- Separate Docker container: `fixapp-ai-service`
- Independent scaling: Scale AI service separately based on inference load
- Optional GPU support: Add NVIDIA GPU for advanced models (post-MVP)
- Health checks: `/health` endpoint for container orchestration

**Rationale:**
- Python is industry standard for ML/AI workloads
- Separation of concerns: business logic (NestJS) vs. ML inference (Python)
- Independent scaling: AI inference is CPU/GPU intensive, scales separately
- NestJS team doesn't need Python expertise for main application
- Flexibility to use best ML libraries (scikit-learn, transformers, TensorFlow)

**Affects:** AI suggestion features, knowledge base, pattern detection, database schema

---

**Privacy-Preserving Cross-Tenant Learning**

**Decision:** AI learns patterns across all tenants while maintaining strict data isolation and privacy.

**Implementation Strategy:**

**Shared ML Models:**
- Train pattern recognition models on anonymized data from all tenants
- Model learns: "VRM + voltage drop symptom → regulator replacement (95% success)"
- Model does NOT store: Which tenant, which plant, specific RCA IDs

**Tenant-Specific Context:**
- Suggestions filtered by tenant's historical data first
- Cross-tenant patterns shown as generic insights
- Admin-controlled: Tenants can opt-out of cross-tenant learning

**Privacy Guarantees:**

1. **Never expose raw data from other tenants**
   - No tenant sees another tenant's RCA details
   - Patterns abstracted: equipment type, symptom category, solution type

2. **Suggestions reference patterns, not specific cases**
   ```json
   // Good suggestion (privacy-preserving)
   {
     "solution": "Replace voltage regulator, implement monitoring",
     "confidence": 0.95,
     "context": "Similar VRM voltage issues resolved with this approach",
     "pattern_frequency": 12 // How many times this pattern succeeded
   }

   // BAD - exposes other tenant data (NEVER do this)
   {
     "solution": "Vietnam Cement Plant used this on RCA-V2103",
     "rca_reference": "RCA-V2103"
   }
   ```

3. **Admin-controlled cross-tenant learning**
   ```typescript
   // Tenant configuration
   interface TenantConfig {
     ai_settings: {
       enable_cross_tenant_learning: boolean; // Default: true
       share_anonymized_patterns: boolean;    // Default: true
       suggestion_sources: 'own_data_only' | 'cross_tenant_patterns';
     }
   }
   ```

4. **Audit trail of suggestions**
   - Log which patterns generated suggestions
   - Track suggestion acceptance/rejection
   - Privacy review: Ensure no tenant data leakage

**Example Flow:**

```
1. Vietnam plant solves VRM voltage issue (RCA-V2103)
   - Solution: Replace voltage regulator + implement monitoring
   - Outcome: Successful, prevented 2 more shutdowns

2. Pattern stored in AI knowledge base (anonymized):
   {
     equipment: 'VRM',
     symptom_category: 'voltage_drop_under_load',
     solution_category: 'regulator_replacement + monitoring',
     success_rate: 0.95,
     sample_size: 3 // How many times this worked
   }

3. India plant faces similar VRM issue (3 months later)
   - AI service detects pattern match (similarity score: 0.93)
   - Suggestion generated: "Similar VRM voltage issues resolved
     with regulator replacement + monitoring (95% success rate,
     validated across 3 cases)"
   - NO mention of Vietnam, RCA-V2103, or any specific tenant

4. Indian engineer sees suggestion, reviews context, accepts it
   - Feedback logged: Accepted, outcome successful
   - Pattern confidence increases (sample_size: 3 → 4, success_rate: 0.95 → 0.96)
```

**Rationale:**
- Core innovation from PRD: organizational learning across locations
- Maintains tenant privacy and security (critical for enterprise customers)
- Competitive advantage: AI improves with scale (more tenants = better suggestions)
- Builds trust: Transparent about what data is shared (anonymized patterns only)
- Compliance-friendly: No PII or proprietary data shared across tenants

**Affects:** AI service, knowledge base, suggestion UI, tenant configuration, privacy policy

---

### Infrastructure & Deployment

**Cloud Platform: AWS**

**Decision:** AWS as primary cloud provider with following services.

**Compute:**
- **Amazon ECS (Elastic Container Service) with Fargate**
  - Serverless container orchestration
  - No EC2 instance management
  - Auto-scaling based on CPU/memory (NFR-SC1: horizontal scaling)
  - Separate task definitions: frontend, backend, AI service

**Database:**
- **Amazon RDS for PostgreSQL**
  - Multi-AZ deployment for high availability (99.5% uptime - NFR-R1)
  - Automated backups with point-in-time recovery (NFR-R4, NFR-R5)
  - Separate RDS instances for enterprise dedicated tenants
  - Read replicas for analytics queries (offload from primary)

- **Amazon ElastiCache for Redis**
  - Managed Redis cluster
  - Automatic failover
  - Used for: caching, sessions, Bull queues

**Storage:**
- **Amazon S3**
  - File storage for RCA attachments (photos, documents)
  - Versioning enabled (audit compliance)
  - Lifecycle policies: Archive to Glacier after 90 days
  - Encryption at rest (SSE-S3, NFR-S1)

- **Amazon CloudFront** (CDN)
  - Global content delivery for static assets
  - Low-latency access for manufacturing plants worldwide
  - SSL/TLS termination

**Email:**
- **Amazon SES (Simple Email Service)**
  - Transactional emails (notifications, assignments, approvals)
  - High deliverability, low cost
  - Bounce/complaint handling

**Networking:**
- **Application Load Balancer (ALB)**
  - Traffic distribution across ECS tasks
  - SSL/TLS termination
  - Path-based routing: `/api/*` → backend, `/*` → frontend

- **Amazon VPC**
  - Private subnets for database and backend
  - Public subnets for load balancer
  - NAT Gateway for outbound internet from private subnets

**Security:**
- **AWS Certificate Manager (ACM)**
  - Free SSL/TLS certificates
  - Wildcard cert for `*.fixapp.com`
  - Auto-renewal

- **AWS Secrets Manager**
  - Store credentials, API keys, JWT secrets
  - Automatic rotation for database passwords
  - Encrypted at rest

- **AWS WAF (Web Application Firewall)**
  - DDoS protection
  - SQL injection / XSS rule sets
  - Rate limiting at edge

**Monitoring:**
- **Amazon CloudWatch**
  - Logs: ECS container logs aggregation
  - Metrics: CPU, memory, request count, error rates
  - Alarms: Auto-scaling triggers, error rate alerts
  - Dashboards: Operational health visualization

- **AWS X-Ray** (Optional)
  - Distributed tracing
  - Performance bottleneck identification

**Infrastructure as Code:**
- **Terraform** for AWS resource provisioning
  - Version-controlled infrastructure
  - Environment parity (dev, staging, production)
  - Disaster recovery (recreate infrastructure from code)

**Cost Optimization:**
- ECS Fargate Spot for non-critical workloads (70% cost savings)
- RDS Reserved Instances for production (40% savings)
- S3 Intelligent-Tiering for automatic cost optimization
- CloudWatch log retention: 7 days (reduce storage costs)

**Rationale:**
- User preference: AWS
- Comprehensive service ecosystem (compute, database, storage, email, monitoring)
- Multi-region support for data residency (NFR-C9: EU, US, APAC)
- Enterprise-grade reliability (99.5% uptime SLA - NFR-R1)
- Scales from 3 tenants (Year 1) to 500+ tenants (Year 5)
- Cost-effective with Reserved Instances and Spot pricing

**Affects:** All deployment, infrastructure as code, DevOps processes, cost budgeting

---

**CI/CD Pipeline: GitHub Actions**

**Decision:** GitHub Actions for continuous integration and deployment.

**Pipeline Stages:**

**1. Pull Request Build (Runs on every PR):**
```yaml
# .github/workflows/pr-build.yml
name: PR Build
on: pull_request

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint        # ESLint + Prettier
      - run: npm run type-check  # TypeScript
      - run: npm run test        # Jest unit tests

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker-compose up -d  # Spin up test DB
      - run: npm run test:e2e      # Integration tests
```

**2. Merge to Main (Auto-deploy to Staging):**
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Build Docker images
      - name: Build frontend
        run: docker build -t fixapp-frontend:${{ github.sha }} ./apps/frontend

      - name: Build backend
        run: docker build -t fixapp-backend:${{ github.sha }} ./apps/backend

      # Push to Amazon ECR
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin
          docker push fixapp-frontend:${{ github.sha }}
          docker push fixapp-backend:${{ github.sha }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      # Run database migrations
      - name: Run migrations
        run: npm run migration:run

      # Update ECS task definition
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster fixapp-staging \
            --service backend \
            --force-new-deployment
```

**3. Production Deployment (Manual Approval):**
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production
on:
  workflow_dispatch:  # Manual trigger
    inputs:
      version:
        description: 'Docker image tag to deploy'
        required: true

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Run migrations (production)
        run: npm run migration:run --env=production

      - name: Blue-Green deployment
        run: |
          # Deploy to "green" environment
          aws ecs update-service --cluster fixapp-prod --service backend-green

          # Health check
          ./scripts/health-check.sh fixapp-prod-green

          # Switch traffic from blue to green
          aws elbv2 modify-listener --listener-arn $LISTENER_ARN \
            --default-actions TargetGroupArn=$GREEN_TARGET_GROUP

          # Keep blue running for 10 minutes (rollback capability)
          sleep 600

          # Scale down blue
          aws ecs update-service --cluster fixapp-prod --service backend-blue --desired-count 0
```

**Deployment Strategy:**
- **Blue-Green Deployment** for zero-downtime (NFR-M4)
- **Database migrations** run before deployment
- **Rollback capability:** Previous Docker image available
- **Health checks:** Wait for new tasks to pass health checks before switching traffic
- **Gradual rollout:** Deploy to 10% traffic first, then 100% (canary deployment)

**Rationale:**
- GitHub-native (assuming GitHub for code hosting)
- Free for open source, affordable for private repos ($4/month for 3,000 minutes)
- Excellent Docker and AWS integration (official actions available)
- Familiar to most developers (YAML-based, similar to GitLab CI, CircleCI)
- Supports manual approval gates for production

**Affects:** Development workflow, deployment process, testing, release management

---

**Monitoring & Observability**

**Decision:** AWS CloudWatch + Sentry for comprehensive monitoring and error tracking.

**Monitoring Stack:**

**1. AWS CloudWatch:**

**Infrastructure Metrics:**
- ECS task CPU/memory utilization
- RDS database connections, IOPS, storage
- Load balancer request count, latency, error rate
- Auto-scaling triggers based on metrics

**Application Logs:**
- Structured JSON logs from ECS containers
- Aggregated in CloudWatch Logs
- Log groups: `/ecs/fixapp-backend`, `/ecs/fixapp-frontend`, `/ecs/fixapp-ai`
- Log retention: 7 days (cost optimization)

**Custom Metrics:**
- RCA creation rate (business metric)
- API endpoint latency (performance metric)
- WebSocket connection count (real-time metric)
- Queue job processing time (background job metric)

**Dashboards:**
- Operational health: Request rate, error rate, latency (P50, P95, P99)
- Business metrics: RCAs created/closed per day, active users
- Infrastructure: CPU/memory usage, database connections

**Alarms:**
- Error rate > 1% (5-minute window) → SNS alert
- API latency P95 > 1 second → SNS alert
- Database CPU > 80% → SNS alert
- ECS task failure → SNS alert

**2. Sentry (Error Tracking):**

**Real-time Error Monitoring:**
```typescript
// Initialize Sentry in NestJS
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of requests traced
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ]
});

// Capture errors with context
try {
  await this.rcaService.create(rcaData);
} catch (error) {
  Sentry.captureException(error, {
    tags: { tenant_id: req.user.tenant_id },
    user: { id: req.user.id, role: req.user.role },
    extra: { rca_data: rcaData }
  });
  throw error;
}
```

**Features:**
- Real-time error notifications (Slack, email)
- Error grouping and deduplication
- Stack traces with source maps
- User context (which tenant, which user affected)
- Performance monitoring (transaction traces)
- Release tracking (which deployment introduced error)

**3. Structured Logging:**

```typescript
// Winston logger with JSON format
import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  log(message: string, context?: any) {
    super.log({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      tenant_id: context?.tenant_id,
      user_id: context?.user_id,
      request_id: context?.request_id,
      ...context
    });
  }
}

// Usage
this.logger.log('RCA created', {
  tenant_id: rca.tenant_id,
  rca_id: rca.id,
  user_id: req.user.id,
  request_id: req.id
});
```

**Log Levels:**
- **ERROR:** Application errors, exceptions
- **WARN:** Deprecations, potential issues
- **INFO:** Business events (RCA created, user login)
- **DEBUG:** Detailed debugging info (dev only)

**4. Audit Logging (Separate from Application Logs):**

```typescript
// Immutable audit trail
@Injectable()
export class AuditLogService {
  async log(event: AuditEvent) {
    await this.auditRepository.save({
      tenant_id: event.tenant_id,
      user_id: event.user_id,
      action: event.action, // CREATE_RCA, APPROVE_SOLUTION, DELETE_RCA
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      timestamp: new Date(),
      metadata: event.metadata
    });
  }
}

// Audit table is append-only (no updates/deletes)
```

**Audit log retention:** 1-7 years (configurable per tenant for compliance - NFR-C4)

**5. Alerting Strategy:**

**Critical Alerts (Immediate Response):**
- Production errors > 10/minute → PagerDuty (on-call engineer)
- Database down → PagerDuty
- API error rate > 5% → PagerDuty

**Warning Alerts (Review within 1 hour):**
- API latency P95 > 1 second → Slack channel
- Queue job failures > 10/hour → Slack channel
- Disk space > 80% → Email

**Info Alerts (Review daily):**
- New deployment completed → Slack channel
- Daily metrics summary → Email

**Rationale:**
- NFR-M7 to NFR-M9: APM, error tracking, usage analytics required
- CloudWatch native integration with AWS services (no extra agents)
- Sentry best-in-class for error tracking with context
- Structured logging enables efficient debugging (search by tenant_id, user_id, request_id)
- Audit logs support compliance (SOC 2, GDPR, ISO 27001)
- Alerting prevents issues from going unnoticed

**Affects:** Backend logging, error handling, DevOps processes, on-call rotation

---

### Decision Impact Analysis

**Implementation Sequence:**

**Phase 1: Foundation (Sprint 1-2) - Weeks 1-4**
1. Monorepo setup with Turborepo
2. TypeORM + PostgreSQL connection with multi-tenancy middleware
3. Basic JWT authentication (email/password)
4. Docker development environment (docker-compose)
5. Redis setup (caching + queues)

**Phase 2: Core Services (Sprint 3-4) - Weeks 5-8**
6. Passport.js multi-provider architecture
7. Office 365 OAuth integration
8. Tenant identification middleware (subdomain support)
9. Hierarchical RBAC guards
10. Bull queue setup for background jobs
11. AWS S3 file upload integration

**Phase 3: Real-Time Features (Sprint 5) - Weeks 9-10**
12. Socket.io WebSocket gateway
13. WebSocket authentication and tenant rooms
14. Real-time RCA updates
15. Dashboard live refresh

**Phase 4: AI Integration (Sprint 6-7) - Weeks 11-14**
16. Python FastAPI service scaffold
17. REST communication between NestJS ↔ Python
18. Basic pattern matching algorithm
19. Suggestion API endpoints
20. Feedback loop implementation

**Phase 5: Infrastructure & Production (Sprint 8-9) - Weeks 15-18**
21. AWS infrastructure setup (Terraform)
22. ECS Fargate deployment configuration
23. GitHub Actions CI/CD pipeline
24. CloudWatch + Sentry monitoring
25. Staging environment setup
26. Production deployment with blue-green strategy

**Cross-Component Dependencies:**

**Multi-tenancy affects everything:**
- Database queries must include tenant_id filtering
- Authentication JWT must contain tenant_id claim
- API responses automatically scoped by tenant
- WebSocket rooms scoped by tenant
- Caching keys include tenant_id prefix
- Audit logs track tenant_id for every action
- **Critical:** Automated tests must verify tenant isolation (NFR-C11)

**Authentication enables authorization:**
- RBAC guards depend on JWT claims (role, location_scope) from auth module
- WebSocket connections must authenticate before joining rooms
- API endpoints protected by JwtAuthGuard + HierarchicalRBACGuard
- Session management (refresh tokens) requires Redis

**WebSocket depends on authentication:**
- Must validate JWT token during WebSocket handshake
- Tenant and user identity required to join correct rooms
- Presence tracking tied to authenticated user sessions

**AI service depends on data access:**
- Needs historical RCA data for pattern learning
- Requires tenant-scoped queries (no cross-tenant data leakage)
- Feedback loop writes back to RCA database

**Queue system enables async features:**
- Email notifications use Bull queue
- Audit logging uses queue for async writes
- Document generation (PDF/Excel) offloaded to queue workers
- AI suggestion generation triggered via queue

**Monitoring affects debugging:**
- Structured logs with tenant_id, user_id, request_id enable efficient troubleshooting
- Sentry error context shows which tenant/user affected
- Audit logs provide compliance trail for security investigations
- CloudWatch dashboards show tenant-specific metrics

**Deployment dependencies:**
- Database migrations must run before new code deployment
- Blue-green deployment requires health checks to pass
- Rollback depends on previous Docker images being available
- Environment variables synced across ECS tasks (Secrets Manager)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 15 areas where AI agents could make different implementation choices without explicit patterns.

These patterns ensure that multiple AI agents working on different features produce compatible, consistent code that integrates seamlessly.

---

### Naming Patterns

#### Database Naming Conventions

**MANDATORY PATTERN:** All database objects use `snake_case` naming.

**Tables:**
- Format: `snake_case` plural nouns
- Examples: `rcas`, `users`, `audit_logs`, `tenant_auth_configs`, `rca_solutions`
- **CRITICAL:** All tenant-scoped tables MUST include `tenant_id UUID NOT NULL` column

**Columns:**
- Format: `snake_case`
- Examples: `tenant_id`, `created_at`, `issue_description`, `rca_owner_id`
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft deletes)
- Foreign keys: `{referenced_table_singular}_id` → `user_id`, `plant_id`, `country_id`

**Indexes:**
- Format: `idx_{table}_{columns}` (underscore-separated column names)
- Examples: `idx_rcas_tenant_id`, `idx_users_email`, `idx_rcas_tenant_id_status`
- Unique indexes: `uniq_{table}_{columns}`
- Full-text indexes: `fts_{table}_{columns}`

**Constraints:**
- Primary key: `{table}_pkey` (PostgreSQL default)
- Foreign key: `fk_{table}_{referenced_table}` → `fk_rcas_users`
- Check constraint: `chk_{table}_{condition}` → `chk_rcas_status_valid`

**Enums:**
- Format: `snake_case` singular
- Examples: `rca_status`, `user_role`, `solution_approval_status`

**Example:**
```sql
-- Correct database naming
CREATE TABLE rcas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rca_owner_id UUID NOT NULL,
    issue_description TEXT NOT NULL,
    equipment_type VARCHAR(100),
    status rca_status NOT NULL DEFAULT 'investigation',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rcas_tenants FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_rcas_users FOREIGN KEY (rca_owner_id) REFERENCES users(id),
    CONSTRAINT chk_rcas_description_length CHECK (length(issue_description) >= 10)
);

CREATE INDEX idx_rcas_tenant_id ON rcas(tenant_id);
CREATE INDEX idx_rcas_tenant_id_status ON rcas(tenant_id, status);
CREATE INDEX idx_rcas_created_at ON rcas(created_at DESC);
```

**Rationale:** PostgreSQL convention, TypeORM default, clear separation from TypeScript camelCase.

---

#### API Naming Conventions

**MANDATORY PATTERN:** RESTful APIs use plural resource names with kebab-case for multi-word resources.

**Endpoint Structure:**
- Base: `/api/v{version}/{resource}`
- Version: `/api/v1/` (current)
- Resources: **Plural nouns** in kebab-case → `/rcas`, `/audit-logs`, `/tenant-configs`
- Nested resources: `/rcas/:id/solutions`, `/users/:id/permissions`

**Route Parameters:**
- Format: `:paramName` (camelCase)
- Examples: `:id`, `:rcaId`, `:userId`
- UUID pattern: All IDs are UUIDs (not integers)

**Query Parameters:**
- Format: `snake_case`
- Examples: `?plant_id=123&status=pending&sort=-created_at`
- Pagination: `?limit=20&cursor=base64_encoded`
- Sorting: `?sort=field_name` (ascending) or `?sort=-field_name` (descending)
- Filtering: `?{field_name}={value}`

**HTTP Headers:**
- Standard headers: `Content-Type`, `Authorization`
- Custom headers: `X-Kebab-Case` format → `X-Request-ID`, `X-Tenant-ID`
- Never use `tenant_id` in URL (always from JWT)

**HTTP Verbs Usage:**
```
GET    /api/v1/rcas              # List RCAs (tenant-scoped, paginated)
POST   /api/v1/rcas              # Create new RCA
GET    /api/v1/rcas/:id          # Get specific RCA
PATCH  /api/v1/rcas/:id          # Partial update RCA
PUT    /api/v1/rcas/:id          # Full replace RCA (rarely used)
DELETE /api/v1/rcas/:id          # Delete RCA (admin only, with audit)

GET    /api/v1/rcas/:id/solutions           # List solutions for RCA
POST   /api/v1/rcas/:id/solutions           # Create solution for RCA
PATCH  /api/v1/solutions/:id                # Update solution
PATCH  /api/v1/solutions/:id/approve        # Approve solution (action endpoint)
```

**Action Endpoints:**
- Format: `PATCH /resource/:id/{action}` (not POST to `/resource/:id/{action}`)
- Examples: `PATCH /solutions/:id/approve`, `PATCH /rcas/:id/close`, `PATCH /users/:id/activate`

**Rationale:** Industry standard REST conventions, clear resource hierarchy, semantic HTTP verbs.

---

#### Code Naming Conventions (TypeScript)

**MANDATORY PATTERN:** Consistent naming across frontend and backend TypeScript code.

**File Naming:**

**Backend (NestJS):**
- Controllers: `{resource}.controller.ts` → `rca.controller.ts`, `auth.controller.ts`
- Services: `{resource}.service.ts` → `rca.service.ts`, `tenant.service.ts`
- Repositories: `{resource}.repository.ts` → `rca.repository.ts`
- Entities: `{resource}.entity.ts` → `rca.entity.ts`, `user.entity.ts`
- DTOs: `{action}-{resource}.dto.ts` → `create-rca.dto.ts`, `update-user.dto.ts`
- Guards: `{purpose}.guard.ts` → `jwt-auth.guard.ts`, `hierarchical-rbac.guard.ts`
- Interceptors: `{purpose}.interceptor.ts` → `logging.interceptor.ts`, `tenant-context.interceptor.ts`
- Middlewares: `{purpose}.middleware.ts` → `tenant-identification.middleware.ts`
- Pipes: `{purpose}.pipe.ts` → `validation.pipe.ts`
- Filters: `{purpose}.filter.ts` → `http-exception.filter.ts`
- Decorators: `{purpose}.decorator.ts` → `current-user.decorator.ts`
- Modules: `{resource}.module.ts` → `rca.module.ts`, `auth.module.ts`
- Tests: `{file-name}.spec.ts` → `rca.service.spec.ts` (co-located with source)

**Frontend (Next.js):**
- Pages: `kebab-case` → `dashboard.tsx`, `rca-details.tsx` (in `/app` directory)
- Components: `PascalCase.tsx` → `RcaCard.tsx`, `DashboardMetrics.tsx`, `UserAvatar.tsx`
- Hooks: `use-kebab-case.ts` → `use-rca-data.ts`, `use-auth.ts`, `use-websocket.ts`
- Utilities: `kebab-case.ts` → `format-date.ts`, `api-client.ts`
- Types: `{resource}.types.ts` → `rca.types.ts`, `user.types.ts`
- API routes (if used): `route.ts` in App Router structure

**Class Naming:**
- Classes: `PascalCase` → `RcaController`, `TenantAwareRepository`, `WebSocketGateway`
- Abstract classes: `Abstract{Name}` → `AbstractRepository`, `AbstractService`
- Interfaces: `PascalCase` (no `I` prefix) → `RcaDto`, `TenantConfig`, `AuthProvider`
- Types: `PascalCase` → `LocationScope`, `RcaStatus`, `UserRole`
- Enums: `PascalCase` → `RcaStatus`, `UserRole`, `DeploymentType`

**Function/Method Naming:**
- Functions: `camelCase` with verb prefix
- CRUD operations: `create`, `findAll`, `findOne`, `update`, `remove`
- Boolean getters: `is`, `has`, `can` prefix → `isAuthenticated()`, `hasPermission()`, `canAccessRca()`
- Async functions: No special prefix (TypeScript `async` keyword is clear)

**Variable Naming:**
- Variables: `camelCase` → `userId`, `tenantConfig`, `rcaData`
- Constants (module-level): `UPPER_SNAKE_CASE` → `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`, `JWT_EXPIRY`
- React state: `camelCase` → `const [isLoading, setIsLoading] = useState(false)`
- Boolean variables: `is`, `has`, `should` prefix → `isLoading`, `hasError`, `shouldRetry`

**Example:**
```typescript
// Backend: rca.controller.ts
@Controller('api/v1/rcas')
export class RcaController {
  constructor(private readonly rcaService: RcaService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query() query: FindRcasDto
  ): Promise<PaginatedResponse<RcaDto>> {
    return this.rcaService.findAll(req.user.location_scope, query);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() createDto: CreateRcaDto
  ): Promise<RcaDto> {
    return this.rcaService.create(req.user.tenant_id, createDto);
  }

  @Patch(':id/close')
  async closeRca(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<RcaDto> {
    return this.rcaService.closeRca(id, req.user.id);
  }
}

// Frontend: RcaCard.tsx
export function RcaCard({ rca, onStatusChange }: RcaCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const canEditRca = useMemo(() =>
    user.role === 'rca_owner' && rca.rca_owner_id === user.id,
    [user, rca]
  );

  const handleStatusChange = async (newStatus: RcaStatus) => {
    setIsLoading(true);
    try {
      await updateRcaStatus(rca.id, newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      showError('Failed to update RCA status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      {/* ... */}
    </Card>
  );
}
```

**Rationale:** Follows TypeScript/JavaScript community conventions, NestJS best practices, Next.js App Router conventions.

---

### Structure Patterns

#### Project Organization

**MANDATORY PATTERN:** Monorepo with feature-based organization.

**Monorepo Structure:**
```
fixapp/
├── apps/
│   ├── frontend/              # Next.js application
│   ├── backend/               # NestJS API
│   └── ai-service/            # Python ML service (separate repo or subdir)
├── packages/
│   ├── shared-types/          # Shared TypeScript interfaces/types
│   ├── ui-components/         # Shared React components (Shadcn UI wrappers)
│   └── eslint-config/         # Shared ESLint configuration
├── infrastructure/
│   ├── docker/                # Docker configurations
│   │   ├── docker-compose.yml
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── ai-service.Dockerfile
│   └── terraform/             # AWS infrastructure as code
│       ├── modules/
│       ├── environments/
│       └── main.tf
├── .github/
│   └── workflows/             # CI/CD pipelines
├── docs/                      # Project documentation
├── turbo.json                 # Turborepo configuration
├── package.json               # Root package.json
└── README.md
```

**Backend (NestJS) Structure:**
```
apps/backend/src/
├── modules/                   # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/        # Passport strategies
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── azure-ad.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── hierarchical-rbac.guard.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── refresh-token.dto.ts
│   ├── rca/                   # RCA domain module
│   │   ├── rca.controller.ts
│   │   ├── rca.service.ts
│   │   ├── rca.repository.ts
│   │   ├── rca.module.ts
│   │   ├── entities/
│   │   │   └── rca.entity.ts
│   │   ├── dto/
│   │   │   ├── create-rca.dto.ts
│   │   │   ├── update-rca.dto.ts
│   │   │   └── find-rcas.dto.ts
│   │   └── rca.service.spec.ts
│   ├── tenants/
│   ├── users/
│   ├── solutions/
│   ├── notifications/
│   ├── ai-suggestions/
│   └── audit-logs/
├── common/                    # Shared code across modules
│   ├── guards/
│   │   └── tenant-context.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── tenant-context.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── decorators/
│   │   ├── tenant-id.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── middleware/
│   │   └── tenant-identification.middleware.ts
│   └── utils/
│       ├── pagination.util.ts
│       └── date.util.ts
├── database/                  # Database configuration
│   ├── migrations/            # TypeORM migrations
│   ├── seeds/                 # Database seeds
│   └── database.module.ts
├── config/                    # Application configuration
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── aws.config.ts
├── websockets/                # WebSocket gateways
│   ├── rca.gateway.ts
│   └── notification.gateway.ts
├── main.ts                    # Application entry point
└── app.module.ts              # Root module
```

**Frontend (Next.js App Router) Structure:**
```
apps/frontend/src/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Route group for auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/           # Route group for authenticated pages
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── rcas/
│   │   │   ├── page.tsx                  # List RCAs
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx              # RCA details
│   │   │   └── create/
│   │   │       └── page.tsx              # Create RCA
│   │   ├── reports/
│   │   └── layout.tsx         # Shared layout with nav
│   ├── api/                   # API routes (if needed)
│   │   └── webhook/
│   │       └── route.ts
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home/landing page
│   └── globals.css
├── components/                # React components
│   ├── ui/                    # Shadcn UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── rca/                   # RCA-specific components
│   │   ├── RcaCard.tsx
│   │   ├── RcaList.tsx
│   │   ├── RcaStatusBadge.tsx
│   │   └── FishboneDiagram.tsx
│   ├── dashboard/
│   │   ├── DashboardMetrics.tsx
│   │   └── MetricCard.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── ErrorBoundary.tsx
│       ├── LoadingSpinner.tsx
│       └── Pagination.tsx
├── hooks/                     # Custom React hooks
│   ├── use-auth.ts
│   ├── use-rca-data.ts
│   ├── use-websocket.ts
│   └── use-debounce.ts
├── lib/                       # Utilities and helpers
│   ├── api-client.ts          # Axios/fetch wrapper
│   ├── websocket-client.ts
│   ├── format-date.ts
│   └── cn.ts                  # Tailwind class merger
├── types/                     # TypeScript type definitions
│   ├── rca.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── contexts/                  # React contexts
│   ├── AuthContext.tsx
│   └── TenantContext.tsx
└── styles/
    └── globals.css
```

**Test Organization:**
- **Unit tests:** Co-located with source files → `rca.service.spec.ts` next to `rca.service.ts`
- **Integration tests:** `test/integration/` directory at app root
- **E2E tests:** `test/e2e/` directory at app root
- **Test utilities:** `test/utils/` for shared test helpers, fixtures, mocks

**Rationale:** Feature-based organization improves maintainability, clear separation of concerns, follows NestJS and Next.js best practices.

---

#### File Structure Patterns

**Configuration Files (Root):**
```
fixapp/
├── .env.example               # Environment variable template
├── .env.development           # Dev environment (gitignored)
├── .env.test                  # Test environment
├── .env.production            # Production (AWS Secrets Manager in prod)
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── tsconfig.json              # Base TypeScript config
├── turbo.json                 # Turborepo pipeline config
├── package.json               # Root dependencies
└── .gitignore
```

**Documentation:**
```
docs/
├── architecture.md            # This file
├── api/
│   ├── rest-api.md            # API documentation
│   └── websocket-api.md
├── deployment/
│   ├── aws-setup.md
│   └── ci-cd.md
└── development/
    ├── getting-started.md
    ├── testing.md
    └── contributing.md
```

**Static Assets:**
- Frontend static files: `apps/frontend/public/`
- Images: `public/images/`
- Icons: `public/icons/` (or use icon library like lucide-react)
- Fonts: `public/fonts/` (if custom fonts needed)

---

### Format Patterns

#### API Response Formats

**MANDATORY PATTERN:** All API responses follow consistent structure.

**Success Response (Single Resource):**
```typescript
{
  "data": {
    "id": "uuid-123",
    "tenant_id": "uuid-456",
    "issue_description": "VRM voltage dropping under load",
    "status": "investigation",
    "created_at": "2025-12-22T10:30:00.000Z",
    "updated_at": "2025-12-22T10:30:00.000Z"
  }
}
```

**Success Response (Collection with Pagination):**
```typescript
{
  "data": [
    { "id": "uuid-1", ... },
    { "id": "uuid-2", ... }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "has_more": true,
    "next_cursor": "eyJpZCI6IjIwIn0="  // Base64 encoded cursor
  }
}
```

**Error Response (Standard):**
```typescript
{
  "statusCode": 400,                     // HTTP status code
  "message": "Validation failed",        // User-friendly message
  "errors": [                            // Optional detailed errors
    {
      "field": "issue_description",
      "message": "Must be at least 10 characters",
      "value": "Short"
    }
  ],
  "timestamp": "2025-12-22T10:30:00.000Z",
  "path": "/api/v1/rcas",
  "request_id": "uuid-1234"              // For tracing in logs
}
```

**Error Response (Unauthorized):**
```typescript
{
  "statusCode": 401,
  "message": "Unauthorized",
  "timestamp": "2025-12-22T10:30:00.000Z",
  "path": "/api/v1/rcas",
  "request_id": "uuid-1234"
}
```

**Error Response (Forbidden - RBAC):**
```typescript
{
  "statusCode": 403,
  "message": "Insufficient permissions to access this resource",
  "errors": [
    {
      "required_role": "rca_owner",
      "user_role": "team_member",
      "resource": "rca-uuid-123"
    }
  ],
  "timestamp": "2025-12-22T10:30:00.000Z",
  "path": "/api/v1/rcas/uuid-123",
  "request_id": "uuid-1234"
}
```

**HTTP Status Code Usage:**
- `200 OK` - Successful GET, PATCH, PUT
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE (no response body)
- `400 Bad Request` - Validation error, malformed request
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - RBAC permission denied
- `404 Not Found` - Resource doesn't exist or user doesn't have access
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Semantic validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error (logged to Sentry)

**NestJS Implementation:**
```typescript
// Success response DTO
export class ResponseDto<T> {
  data: T;
  meta?: PaginationMeta;
}

// Error response (handled by global exception filter)
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      request_id: request.id
    };

    response.status(status).json(errorResponse);
  }
}
```

**Rationale:** Consistent structure makes frontend error handling predictable, supports debugging with request_id, clear validation errors.

---

#### Data Exchange Formats

**MANDATORY PATTERN:** Consistent data formats across API and database boundaries.

**Date/Time Format:**
- **API (JSON):** ISO 8601 strings in UTC → `"2025-12-22T10:30:00.000Z"`
- **Database:** PostgreSQL `TIMESTAMP` type (stored as UTC)
- **Frontend:** Parse to `Date` objects, display in user's local timezone
- **Never use:** Unix timestamps in API responses (use ISO strings)

**JSON Field Naming:**
- **API responses:** `snake_case` (matches database columns)
- **Frontend (internal state):** Can transform to `camelCase` if preferred, but API uses `snake_case`
- **Reasoning:** Direct mapping from database to API reduces transformation logic

**Example:**
```typescript
// API Response (snake_case)
{
  "data": {
    "id": "uuid-123",
    "tenant_id": "uuid-456",
    "issue_description": "VRM voltage issue",
    "rca_owner_id": "uuid-789",
    "created_at": "2025-12-22T10:30:00.000Z",
    "updated_at": "2025-12-22T10:30:00.000Z"
  }
}

// Frontend can transform to camelCase if desired
interface Rca {
  id: string;
  tenantId: string;
  issueDescription: string;
  rcaOwnerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transformation function
function mapRcaFromApi(apiRca: any): Rca {
  return {
    id: apiRca.id,
    tenantId: apiRca.tenant_id,
    issueDescription: apiRca.issue_description,
    rcaOwnerId: apiRca.rca_owner_id,
    createdAt: new Date(apiRca.created_at),
    updatedAt: new Date(apiRca.updated_at)
  };
}
```

**Boolean Representation:**
- JSON: `true` / `false` (not `1`/`0` or `"true"`/`"false"`)
- Database: PostgreSQL `BOOLEAN` type

**Null Handling:**
- Use `null` for missing/unknown values (not empty strings or `undefined` in JSON)
- Nullable fields clearly marked in TypeScript types: `field?: string` or `field: string | null`

**Array vs Object for Single Items:**
- Collection endpoints return arrays even if single item: `{"data": [item]}`
- Single resource endpoints return object: `{"data": item}`

**UUID Format:**
- All IDs are UUIDs (v4)
- String representation with hyphens: `"550e8400-e29b-41d4-a716-446655440000"`
- Database type: `UUID` (PostgreSQL native)

---

### Communication Patterns

#### Event System Patterns

**MANDATORY PATTERN:** Consistent event naming and payload structure for WebSocket and message queues.

**Event Naming Convention:**
- Format: `{domain}.{action}` (dot-separated, lowercase)
- Examples: `rca.created`, `rca.updated`, `rca.deleted`, `solution.approved`, `user.assigned`
- WebSocket events: Same naming convention
- Bull queue job names: Same naming convention

**Event Payload Structure:**
```typescript
interface DomainEvent<T = any> {
  event: string;                    // Event name: "rca.created"
  tenant_id: string;                // Tenant context
  timestamp: string;                // ISO 8601 timestamp
  user_id?: string;                 // User who triggered event
  data: T;                          // Event-specific payload
  metadata?: Record<string, any>;   // Optional metadata
}

// Example: RCA created event
{
  "event": "rca.created",
  "tenant_id": "uuid-123",
  "timestamp": "2025-12-22T10:30:00.000Z",
  "user_id": "uuid-456",
  "data": {
    "rca_id": "uuid-789",
    "rca_owner_id": "uuid-456",
    "issue_description": "VRM voltage issue",
    "plant_id": "uuid-111"
  },
  "metadata": {
    "source": "web",
    "ip_address": "192.168.1.100"
  }
}
```

**WebSocket Event Patterns:**

**Client → Server Events:**
- `join-room` - Join a specific room (e.g., RCA room)
- `leave-room` - Leave a room
- `{domain}.subscribe` - Subscribe to domain events
- `{domain}.action` - Perform action (e.g., `rca.update`)

**Server → Client Events:**
- `{domain}.{action}` - Domain events (e.g., `rca.updated`)
- `notification` - User-specific notifications
- `presence.joined` - User joined room
- `presence.left` - User left room
- `error` - Error occurred

**Example WebSocket Implementation:**
```typescript
// Backend: RCA Gateway
@WebSocketGateway({ namespace: '/rca' })
export class RcaGateway {
  @SubscribeMessage('join-rca')
  handleJoinRca(client: Socket, rcaId: string) {
    const roomName = `tenant:${client.data.user.tenant_id}:rca:${rcaId}`;
    client.join(roomName);

    // Notify others
    client.to(roomName).emit('presence.joined', {
      user_id: client.data.user.id,
      user_name: client.data.user.name,
      timestamp: new Date().toISOString()
    });
  }

  // Emit event to all users in RCA room
  emitRcaUpdate(tenantId: string, rcaId: string, data: any) {
    const event: DomainEvent = {
      event: 'rca.updated',
      tenant_id: tenantId,
      timestamp: new Date().toISOString(),
      data
    };

    this.server
      .to(`tenant:${tenantId}:rca:${rcaId}`)
      .emit('rca.updated', event);
  }
}

// Frontend: React hook
function useRcaWebSocket(rcaId: string) {
  const socket = useSocket('/rca');

  useEffect(() => {
    socket.emit('join-rca', rcaId);

    socket.on('rca.updated', (event: DomainEvent<RcaUpdateData>) => {
      console.log('RCA updated:', event.data);
      // Update local state
    });

    return () => {
      socket.emit('leave-rca', rcaId);
    };
  }, [rcaId]);
}
```

**Bull Queue Job Patterns:**
```typescript
// Queue producer
await this.notificationQueue.add('rca.assigned', {
  tenant_id: rca.tenant_id,
  user_id: assignedUserId,
  rca_id: rca.id,
  timestamp: new Date().toISOString()
});

// Queue consumer
@Processor('notifications')
export class NotificationProcessor {
  @Process('rca.assigned')
  async handleRcaAssigned(job: Job<RcaAssignedEvent>) {
    const { user_id, rca_id } = job.data;
    await this.sendEmail(user_id, `You've been assigned to RCA ${rca_id}`);
  }
}
```

**Rationale:** Consistent naming enables easy filtering, debugging, and auditing. Structured payloads ensure all events have context (tenant, user, timestamp).

---

#### State Management Patterns

**MANDATORY PATTERN:** React state management with consistent patterns.

**Local Component State:**
- Use `useState` for UI-specific state (loading, modal open/closed, form inputs)
- Naming: Prefix boolean state with `is`, `has`, `should`
- Example: `const [isLoading, setIsLoading] = useState(false)`

**Server State (API Data):**
- Use React Query or SWR for server data caching (recommended: React Query)
- Cache keys: Array format with consistent naming → `['rcas', { plant_id: '123', status: 'pending' }]`
- Mutations: Optimistic updates with automatic rollback on error

**Global State (if needed):**
- Use React Context for auth, tenant, theme
- Keep contexts focused (separate auth context, tenant context, not one giant context)
- Avoid prop drilling by using context for truly global state

**Example Patterns:**
```typescript
// Server state with React Query
function useRcas(plantId: string, status?: RcaStatus) {
  return useQuery({
    queryKey: ['rcas', { plant_id: plantId, status }],
    queryFn: () => fetchRcas({ plant_id: plantId, status }),
    staleTime: 60000 // 1 minute
  });
}

// Mutation with optimistic update
function useUpdateRcaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RcaStatus }) =>
      updateRcaStatus(id, status),

    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rcas'] });

      // Snapshot previous value
      const previousRcas = queryClient.getQueryData(['rcas']);

      // Optimistically update
      queryClient.setQueryData(['rcas'], (old: any) => {
        return old.map((rca: any) =>
          rca.id === id ? { ...rca, status } : rca
        );
      });

      return { previousRcas };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['rcas'], context?.previousRcas);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['rcas'] });
    }
  });
}

// Global context (Auth)
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Rationale:** React Query handles server state caching, reducing boilerplate and improving UX with optimistic updates. Context for global concerns only.

---

### Process Patterns

#### Error Handling Patterns

**MANDATORY PATTERN:** Consistent error handling across backend and frontend.

**Backend Error Handling:**

**Global Exception Filter:**
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let errors = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;
      errors = (exceptionResponse as any).errors;
    } else if (exception instanceof Error) {
      message = exception.message;
      // Log to Sentry
      Sentry.captureException(exception, {
        tags: { tenant_id: request.user?.tenant_id },
        user: { id: request.user?.id }
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      request_id: request.id
    });
  }
}
```

**Custom Exceptions:**
```typescript
// Domain-specific exceptions
export class RcaNotFoundException extends NotFoundException {
  constructor(rcaId: string) {
    super(`RCA with ID ${rcaId} not found or you don't have access`);
  }
}

export class InsufficientPermissionsException extends ForbiddenException {
  constructor(requiredRole: string, userRole: string) {
    super({
      message: 'Insufficient permissions',
      errors: [{ required_role: requiredRole, user_role: userRole }]
    });
  }
}

// Usage
if (!rca) {
  throw new RcaNotFoundException(rcaId);
}

if (!this.canApprove(user, solution)) {
  throw new InsufficientPermissionsException('rca_owner', user.role);
}
```

**Frontend Error Handling:**

**Global Error Boundary:**
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: { react: errorInfo }
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**API Error Handling:**
```typescript
// Axios interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - attempt refresh
      return refreshTokenAndRetry(error.config);
    }

    if (error.response?.status === 403) {
      // Insufficient permissions - show error toast
      toast.error('You don\'t have permission to perform this action');
    }

    if (error.response?.status === 422) {
      // Validation error - return errors for form display
      return Promise.reject(error.response.data.errors);
    }

    // Generic error handling
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);

    // Log to Sentry if unexpected
    if (error.response?.status >= 500) {
      Sentry.captureException(error);
    }

    return Promise.reject(error);
  }
);
```

**User-Facing Error Messages:**
- Show user-friendly messages, not stack traces
- Validation errors: Display next to form fields
- Network errors: "Unable to connect. Please check your connection."
- Permission errors: "You don't have permission to perform this action."
- Generic errors: "Something went wrong. Please try again."

**Logging vs User Errors:**
- Log all errors to Sentry with context (tenant_id, user_id, request_id)
- Show user-friendly messages in UI
- Never expose internal error details (database errors, stack traces) to users

**Rationale:** Consistent error handling improves debugging, provides better UX with actionable error messages, security through not exposing internals.

---

#### Loading State Patterns

**MANDATORY PATTERN:** Consistent loading state management across the application.

**Loading State Naming:**
- Boolean: `isLoading` (not `loading` or `isLoaded`)
- Async status: `status: 'idle' | 'loading' | 'success' | 'error'`

**Global Loading States:**
- Full-page loader: Only for initial app load or route transitions
- Component: `<LoadingSpinner />` with consistent styling

**Local Loading States:**
- Button loading: Show spinner in button, disable while loading
- Form submission: Disable form, show loading indicator
- Data fetching: Show skeleton loaders for better UX

**Example Patterns:**
```typescript
// Button with loading state
function SubmitButton({ onClick, isLoading, children }: Props) {
  return (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </Button>
  );
}

// Form with loading state
function RcaForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateRcaDto) => {
    setIsLoading(true);
    try {
      await createRca(data);
      toast.success('RCA created successfully');
      router.push('/dashboard/rcas');
    } catch (error) {
      toast.error('Failed to create RCA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <SubmitButton isLoading={isLoading}>Create RCA</SubmitButton>
    </form>
  );
}

// Data loading with skeleton
function RcaList() {
  const { data: rcas, isLoading } = useRcas(plantId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rcas.map(rca => <RcaCard key={rca.id} rca={rca} />)}
    </div>
  );
}
```

**Loading UI Hierarchy:**
1. **Skeleton loaders** (best UX) - Use for data fetching
2. **Spinners** - Use for actions (button clicks, form submissions)
3. **Progress bars** - Use for file uploads, long operations
4. **Full-page loaders** - Use sparingly (initial app load only)

**Rationale:** Consistent loading states improve perceived performance, reduce confusion about what's happening.

---

### Enforcement Guidelines

**All AI Agents MUST:**

1. **Follow naming conventions exactly:**
   - Database: `snake_case` for tables, columns, indexes
   - API: Plural resources, `snake_case` query params
   - Code: `camelCase` for variables/functions, `PascalCase` for classes/components

2. **Use consistent file organization:**
   - Backend: Feature modules in `modules/`, shared code in `common/`
   - Frontend: Components in `components/`, pages in `app/`, hooks in `hooks/`
   - Tests: Co-located `*.spec.ts` files for unit tests

3. **Follow API response formats:**
   - Always wrap responses in `{ "data": ... }` structure
   - Use standard error response format with `statusCode`, `message`, `errors[]`
   - Include `request_id` in all error responses

4. **Use ISO 8601 timestamps:**
   - All dates in API responses as ISO strings: `"2025-12-22T10:30:00.000Z"`
   - Never use Unix timestamps in API

5. **Include `tenant_id` in all tenant-scoped operations:**
   - Every database query for tenant data MUST filter by `tenant_id`
   - Every WebSocket room MUST include tenant in room name
   - Every event MUST include `tenant_id` in payload

6. **Follow error handling patterns:**
   - Use global exception filter for consistent error responses
   - Log errors to Sentry with context (tenant_id, user_id)
   - Show user-friendly error messages in UI

7. **Use consistent loading states:**
   - Boolean: `isLoading` (not `loading`)
   - Show skeleton loaders for data fetching
   - Disable buttons/forms during submission

8. **Follow event naming:**
   - Format: `{domain}.{action}` → `rca.created`, `user.assigned`
   - Include tenant_id, timestamp, user_id in all events

**Pattern Verification:**

- **ESLint rules:** Enforce naming conventions, code style
- **TypeScript strict mode:** Catch type errors early
- **Code reviews:** Verify patterns are followed before merging
- **Automated tests:** Test tenant isolation, API response formats

**Pattern Violations:**

- Document pattern violations in PR comments
- Update patterns document if legitimate exception found
- Refactor code to match patterns before merging

**Updating Patterns:**

- Patterns can evolve as project grows
- Major pattern changes require team discussion
- Update this document and notify all developers
- Provide migration guide for existing code

---

### Pattern Examples

**Good Examples:**

**✅ Correct Database Naming:**
```sql
CREATE TABLE rcas (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    issue_description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rcas_tenant_id ON rcas(tenant_id);
```

**✅ Correct API Endpoint:**
```typescript
@Get('api/v1/rcas')
async findAll(@Query() query: FindRcasDto): Promise<ResponseDto<RcaDto[]>> {
  return { data: await this.rcaService.findAll(query) };
}
```

**✅ Correct Component Naming:**
```typescript
// File: RcaCard.tsx
export function RcaCard({ rca }: RcaCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  // ...
}
```

**✅ Correct Error Handling:**
```typescript
try {
  await this.rcaService.create(createDto);
} catch (error) {
  if (error instanceof RcaNotFoundException) {
    throw new NotFoundException('RCA not found');
  }
  Sentry.captureException(error);
  throw new InternalServerErrorException('Failed to create RCA');
}
```

**✅ Correct Event Naming:**
```typescript
this.eventEmitter.emit('rca.created', {
  event: 'rca.created',
  tenant_id: rca.tenant_id,
  timestamp: new Date().toISOString(),
  data: { rca_id: rca.id }
});
```

---

**Anti-Patterns (AVOID):**

**❌ Wrong Database Naming:**
```sql
-- WRONG: camelCase in database
CREATE TABLE RCAs (
    Id UUID PRIMARY KEY,
    TenantId UUID NOT NULL,
    IssueDescription TEXT
);

-- WRONG: Missing tenant_id filter
SELECT * FROM rcas WHERE id = $1;  -- No tenant_id check!
```

**❌ Wrong API Endpoint:**
```typescript
// WRONG: Singular resource, inconsistent response
@Get('api/v1/rca')
async findAll(): Promise<RcaDto[]> {
  return this.rcaService.findAll();  // No { data: ... } wrapper
}

// WRONG: tenant_id in URL
@Get('api/v1/tenants/:tenantId/rcas')  // tenant from JWT, not URL!
```

**❌ Wrong Component Naming:**
```typescript
// WRONG: kebab-case component file
// File: rca-card.tsx
export function rca_card({ rca }) {  // Wrong function name too
  const [loading, setLoading] = useState(false);  // Should be isLoading
}
```

**❌ Wrong Error Handling:**
```typescript
// WRONG: Exposing internal errors to user
catch (error) {
  res.status(500).json({ error: error.stack });  // Never expose stack!
}

// WRONG: Not logging errors
catch (error) {
  toast.error('Error occurred');  // Logged nowhere!
}
```

**❌ Wrong Event Naming:**
```typescript
// WRONG: Inconsistent event naming
this.eventEmitter.emit('RcaCreated', data);  // Should be 'rca.created'
this.eventEmitter.emit('USER_ASSIGNED', data);  // Should be 'user.assigned'

// WRONG: Missing tenant context
this.eventEmitter.emit('rca.created', { rca_id: id });  // Missing tenant_id!
```

---

**Summary:**

These implementation patterns ensure that **all AI agents and developers** working on fixapp produce **consistent, compatible code** that integrates seamlessly. By following these patterns, we prevent:

- Database query conflicts (inconsistent table/column names)
- API integration issues (different response formats)
- Frontend bugs (inconsistent prop naming, state management)
- Security issues (missing tenant_id filtering)
- Debugging nightmares (inconsistent error logging, event naming)

**The patterns are mandatory** and will be enforced through code reviews, ESLint rules, and automated testing.

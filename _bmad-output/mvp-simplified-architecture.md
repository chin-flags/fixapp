# fixapp - Simplified MVP Architecture (Vercel Edition)

**Last Updated:** 2025-02-07
**Status:** Recommended Simplified Approach
**Deployment Target:** Vercel (Zero Docker, Zero DevOps Complexity)

---

## Executive Summary

This document presents a radically simplified architecture for fixapp MVP, optimized for Vercel deployment. **Goal: Ship working MVP in 6-8 weeks instead of 20-30 weeks.**

### Key Simplifications

| Aspect | Complex Approach (Original) | Simplified MVP (This Doc) |
|--------|---------------------------|---------------------------|
| **Backend** | Separate NestJS + Docker | Next.js API Routes only |
| **Database** | Self-hosted PostgreSQL + RLS | Vercel Postgres (Neon) |
| **File Storage** | AWS S3 + presigned URLs | Vercel Blob Storage |
| **Email** | AWS SES + templates | Resend (or SendGrid) |
| **Real-time** | WebSockets (Socket.io) | ❌ Deferred (polling if needed) |
| **Job Queues** | Bull + Redis | ❌ Deferred (async functions) |
| **AI/ML** | Separate Python service | ❌ Deferred to V2 |
| **Multi-tenancy** | RLS + dedicated DBs | Simple tenant_id column |
| **Auth** | Office 365 SSO + MFA | Next-Auth with email/password |
| **Deployment** | Docker + AWS ECS | `vercel deploy` (done!) |
| **Caching** | Redis + complex strategy | Vercel Edge Cache |
| **Features** | 76 functional requirements | 25 core features |

---

## Technology Stack

### Frontend & Backend (Single Next.js App)

```json
{
  "framework": "Next.js 15 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + Shadcn UI",
  "forms": "React Hook Form + Zod",
  "state": "TanStack Query (React Query)",
  "auth": "NextAuth.js v5 (Auth.js)",
  "deployment": "Vercel"
}
```

### Database & Storage

```json
{
  "database": "Vercel Postgres (powered by Neon)",
  "orm": "Drizzle ORM (lighter than TypeORM)",
  "fileStorage": "Vercel Blob Storage",
  "email": "Resend (or SendGrid)"
}
```

### Why This Stack?

**Next.js Only (No Separate Backend):**
- ✅ Next.js API routes handle all backend logic
- ✅ Server Actions for mutations (modern, type-safe)
- ✅ Single codebase = easier maintenance
- ✅ Vercel-native = zero deployment config
- ✅ Automatic API routes, no NestJS complexity

**Vercel Postgres (Neon):**
- ✅ Managed PostgreSQL (no setup)
- ✅ Serverless-friendly (connection pooling built-in)
- ✅ Free tier for MVP (generous limits)
- ✅ Auto-scaling
- ✅ No Docker, no manual DB management

**Drizzle ORM:**
- ✅ Much lighter than TypeORM
- ✅ TypeScript-first (better DX)
- ✅ SQL-like syntax (easier to learn)
- ✅ Great Vercel integration
- ✅ Built-in migrations

**Vercel Blob Storage:**
- ✅ Dead simple file uploads
- ✅ No presigned URLs complexity
- ✅ Integrated with Next.js
- ✅ Free tier available

**NextAuth.js:**
- ✅ Industry standard for Next.js
- ✅ Email/password out of the box
- ✅ Easy to add OAuth later (Google, Microsoft)
- ✅ JWT + database sessions
- ✅ Great TypeScript support

---

## Architecture Diagrams

### System Overview (Simplified)

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │         Next.js 15 Application                 │     │
│  │                                                │     │
│  │  ├─ /app (pages - App Router)                 │     │
│  │  ├─ /app/api (API routes)                     │     │
│  │  ├─ Server Actions (mutations)                │     │
│  │  ├─ /components (React components)            │     │
│  │  └─ /lib (utilities, db, auth)                │     │
│  │                                                │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        │
                        │ (External Services)
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Vercel     │ │   Vercel     │ │   Resend     │
│  Postgres    │ │    Blob      │ │   (Email)    │
│   (Neon)     │ │  Storage     │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Request Flow

```
User Browser
    │
    │ (HTTPS)
    ▼
Vercel Edge Network (CDN)
    │
    ├─► Static Assets (cached)
    │
    ├─► Next.js Page (SSR/SSG)
    │       │
    │       ├─► Server Component (fetch data)
    │       │       │
    │       │       └─► Drizzle ORM → Vercel Postgres
    │       │
    │       └─► Client Component (interactive)
    │
    └─► API Route (/app/api/*)
            │
            ├─► Auth check (NextAuth)
            ├─► Tenant check (middleware)
            ├─► Business logic
            └─► Database query (Drizzle)
```

---

## Database Schema (Simplified)

### Core Tables (MVP)

```typescript
// schema.ts (Drizzle schema)

import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Tenants
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 63 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // admin, rca_owner, team_member, operator
  createdAt: timestamp('created_at').defaultNow(),
});

// Maintenance Tickets (CMMS)
export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull(),
  equipmentName: varchar('equipment_name', { length: 255 }).notNull(),
  issueDescription: text('issue_description').notNull(),
  impact: varchar('impact', { length: 20 }).notNull(), // low, medium, high
  status: varchar('status', { length: 20 }).notNull(), // open, in_progress, closed
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// RCAs
export const rcas = pgTable('rcas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  rcaNumber: varchar('rca_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // open, in_progress, closed
  ownerId: uuid('owner_id').references(() => users.id),
  maintenanceTicketId: uuid('maintenance_ticket_id').references(() => maintenanceTickets.id),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  closedAt: timestamp('closed_at'),
});

// RCA Team Members
export const rcaTeamMembers = pgTable('rca_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  addedAt: timestamp('added_at').defaultNow(),
});

// Comments (Brainstorming)
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Fishbone Diagrams
export const fishbones = pgTable('fishbones', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // e.g., "Man", "Machine", "Method", "Material"
  cause: text('cause').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Solutions
export const solutions = pgTable('solutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id).notNull(),
  description: text('description').notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  status: varchar('status', { length: 20 }).notNull(), // pending, in_progress, completed, approved
  dueDate: timestamp('due_date'),
  approvedAt: timestamp('approved_at'),
  approvedById: uuid('approved_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Attachments
export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  rcaId: uuid('rca_id').references(() => rcas.id),
  commentId: uuid('comment_id').references(() => comments.id),
  solutionId: uuid('solution_id').references(() => solutions.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(), // Vercel Blob URL
  fileSize: integer('file_size').notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  uploadedById: uuid('uploaded_by_id').references(() => users.id).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});
```

### Multi-Tenancy Strategy (Simplified)

**Approach:** Every table has `tenant_id` column, enforced in middleware.

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Extract tenant from subdomain (e.g., acme.fixapp.com)
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // Or from custom domain mapping (stored in DB)
  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.redirect(new URL('/no-tenant', request.url));
  }

  // Inject tenant into request headers for use in API routes
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.id);

  return response;
}

// In API routes/Server Actions
export async function getCurrentTenant() {
  const headers = await headers();
  const tenantId = headers.get('x-tenant-id');
  return tenantId;
}

// All database queries automatically filter by tenant
export async function getRcas() {
  const tenantId = await getCurrentTenant();
  return db.query.rcas.findMany({
    where: eq(rcas.tenantId, tenantId)
  });
}
```

**No RLS, no complex queries - just simple WHERE clauses.**

---

## Authentication & Authorization

### NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email)
        });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});
```

### Role-Based Access Control (Simple)

```typescript
// lib/auth.ts
export const ROLES = {
  ADMIN: 'admin',
  RCA_OWNER: 'rca_owner',
  TEAM_MEMBER: 'team_member',
  OPERATOR: 'operator'
} as const;

export function hasPermission(userRole: string, requiredRole: string) {
  const hierarchy = ['operator', 'team_member', 'rca_owner', 'admin'];
  const userLevel = hierarchy.indexOf(userRole);
  const requiredLevel = hierarchy.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

// Usage in API route
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user.role, ROLES.ADMIN)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Proceed with delete
}
```

---

## File Upload (Vercel Blob)

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file') as File;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  // Save to database
  await db.insert(attachments).values({
    fileName: file.name,
    fileUrl: blob.url,
    fileSize: file.size,
    fileType: file.type,
    uploadedById: session.user.id,
    rcaId: form.get('rcaId'),
  });

  return Response.json({ url: blob.url });
}
```

**That's it. No S3, no presigned URLs, no complexity.**

---

## Email Notifications (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRcaAssignmentEmail(
  to: string,
  rcaNumber: string,
  rcaTitle: string
) {
  await resend.emails.send({
    from: 'fixapp <notifications@fixapp.com>',
    to,
    subject: `You've been assigned to RCA ${rcaNumber}`,
    html: `
      <h1>New RCA Assignment</h1>
      <p>You've been assigned to work on:</p>
      <p><strong>${rcaNumber}: ${rcaTitle}</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/rcas/${rcaNumber}">View RCA</a></p>
    `
  });
}
```

**Resend free tier: 3,000 emails/month. Perfect for MVP.**

---

## Deferred Features (Post-MVP)

The following features are **NOT** in MVP. They can be added later:

### ❌ Deferred to V2 (3-6 months post-launch)

1. **AI/ML Solution Suggestions**
   - Why defer: Need historical data first, complex to build
   - MVP alternative: Manual search + related RCA links

2. **WebSockets / Real-time Updates**
   - Why defer: Adds complexity, not critical for MVP
   - MVP alternative: Simple page refresh, or polling

3. **Office 365 SSO**
   - Why defer: Complex integration, enterprise feature
   - MVP alternative: Email/password works fine
   - Later: Add via NextAuth providers (easy)

4. **Advanced Multi-tenancy**
   - Why defer: RLS, dedicated DBs are overkill for MVP
   - MVP alternative: Simple tenant_id filtering

5. **Mobile Push Notifications**
   - Why defer: Requires native app or PWA setup
   - MVP alternative: Email notifications only

6. **Advanced Analytics & Visualizations**
   - Why defer: Time-consuming, not blocking
   - MVP alternative: Simple counts and lists

7. **Job Queues (Bull + Redis)**
   - Why defer: Not needed for MVP scale
   - MVP alternative: Async functions, or Vercel Cron for scheduled tasks

8. **PDF Reports with Fishbone Diagrams**
   - Why defer: Complex rendering
   - MVP alternative: Simple text-based PDF or CSV export

9. **Complex Audit Logging**
   - Why defer: Enterprise compliance feature
   - MVP alternative: Basic created_at/updated_at timestamps

10. **SAP Integration**
    - Why defer: Post-MVP enterprise feature
    - MVP alternative: Manual data entry

---

## Deployment Process

### Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run migrations
npm run db:push

# Start dev server
npm run dev
```

### Production (Vercel)

```bash
# Deploy to production
vercel --prod

# That's it! 🎉
```

**Environment variables in Vercel dashboard:**
- `DATABASE_URL` (Vercel Postgres connection string)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` (your domain)
- `RESEND_API_KEY` (from resend.com)

---

## Project Structure

```
fixapp/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with nav
│   │   ├── page.tsx             # Dashboard home
│   │   ├── tickets/             # CMMS tickets
│   │   ├── rcas/                # RCA management
│   │   └── settings/            # User settings
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth routes
│   │   ├── upload/              # File upload
│   │   └── rcas/                # RCA API routes
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # Shadcn components
│   ├── forms/                   # Form components
│   └── dashboard/               # Dashboard components
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   └── index.ts             # DB client
│   ├── auth.ts                  # NextAuth config
│   ├── email.ts                 # Email utilities
│   └── utils.ts                 # Helpers
├── drizzle/
│   └── migrations/              # DB migrations
├── public/
├── .env.local                   # Environment variables
├── drizzle.config.ts            # Drizzle configuration
├── next.config.js
├── package.json
└── tsconfig.json
```

**Single repository. No monorepo complexity. No Docker. Just Next.js.**

---

## Performance Optimization (Vercel Native)

### Edge Caching (Automatic)

```typescript
// Static pages cached at Edge
export const revalidate = 60; // Revalidate every 60 seconds

// Dynamic routes with ISR
export async function generateStaticParams() {
  // Pre-generate top RCAs
}
```

### React Server Components

```typescript
// Fetch data on server (no client-side loading)
async function RcaList() {
  const rcas = await db.query.rcas.findMany({
    where: eq(rcas.tenantId, await getCurrentTenant()),
    orderBy: [desc(rcas.createdAt)],
    limit: 50
  });

  return (
    <div>
      {rcas.map(rca => <RcaCard key={rca.id} rca={rca} />)}
    </div>
  );
}
```

### Image Optimization (Next.js built-in)

```tsx
import Image from 'next/image';

<Image
  src={attachment.fileUrl}
  alt={attachment.fileName}
  width={800}
  height={600}
  priority
/>
```

---

## Security (Simplified but Secure)

### SQL Injection Prevention
✅ Drizzle ORM handles parameterized queries

### XSS Prevention
✅ React escapes by default

### CSRF Protection
✅ NextAuth includes CSRF tokens

### Authentication
✅ NextAuth with secure session management

### Authorization
✅ Role checks in every API route

### Rate Limiting (Optional - Upstash)
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## Testing Strategy (Simplified)

```json
{
  "unit": "Vitest (for utilities)",
  "integration": "Playwright (E2E only)",
  "manual": "Main testing approach for MVP"
}
```

**Focus: Get it working, then test critical paths.**

---

## Migration from Current Codebase

### What to Keep
- ✅ Next.js frontend setup
- ✅ Tailwind CSS + Shadcn UI
- ✅ Basic TypeScript configuration

### What to Remove
- ❌ NestJS backend (replace with API routes)
- ❌ Docker files
- ❌ TypeORM (switch to Drizzle)
- ❌ Bull/Redis
- ❌ Socket.io
- ❌ AWS SDK for S3/SES
- ❌ Complex multi-tenancy (RLS)

### Migration Steps
1. Create new Next.js app (keep frontend)
2. Set up Drizzle with Vercel Postgres
3. Migrate schema to Drizzle format
4. Move backend logic to API routes
5. Implement NextAuth
6. Set up Vercel Blob for files
7. Set up Resend for emails
8. Deploy to Vercel

---

## Cost Estimate (MVP)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Vercel** | Hobby (free) | Pro: $20/month |
| **Vercel Postgres** | 0.5 GB storage, 60 hrs compute | $10-30/month |
| **Vercel Blob** | 100 GB bandwidth | Pay as you go |
| **Resend** | 3,000 emails/month | $20/month for 50k |
| **Domain** | N/A | $10-15/year |

**Total MVP Cost: $0-50/month** (vs. AWS at $100-300/month)

---

## Conclusion

This simplified architecture:

✅ **Removes 80% of complexity** (no Docker, no NestJS, no queues, no WebSockets, no AI)
✅ **Cuts development time by 60%** (6-8 weeks instead of 20-30)
✅ **Maintains core value** (all essential RCA features intact)
✅ **Costs less** ($0-50/month vs $100-300/month)
✅ **Easier to maintain** (single codebase, managed services)
✅ **Scales to V2** (can add features incrementally)

**Deploy to Vercel in minutes. Ship MVP in weeks, not months.**

# fixapp MVP - Setup Guide

**Status:** Foundation Complete ✅
**Next:** Set up Vercel Postgres and deploy

---

## What's Been Set Up

### ✅ Dependencies Installed
- **Drizzle ORM** - Database access layer
- **NextAuth v5** - Authentication
- **Vercel packages** - @vercel/postgres, @vercel/blob
- **Shadcn UI deps** - UI components
- **React Hook Form + Zod** - Form handling
- **TanStack Query** - Server state management
- **Resend** - Email sending
- **bcryptjs** - Password hashing

### ✅ Core Infrastructure
- **Database Schema** (`src/lib/db/schema.ts`)
  - Tenants, Users, Maintenance Tickets, RCAs
  - Team Members, Comments, Fishbone, Solutions, Attachments
  - Full relations defined

- **Database Client** (`src/lib/db/index.ts`)
  - Drizzle configured for Vercel Postgres

- **Drizzle Config** (`drizzle.config.ts`)
  - Migration system ready

- **Auth Configuration** (`src/lib/auth/config.ts`)
  - NextAuth with Credentials provider
  - Email/password authentication
  - JWT sessions (7-day expiry)
  - Role-based access control

- **Permissions** (`src/lib/auth/permissions.ts`)
  - 4 roles: admin, rca_owner, team_member, operator
  - Role hierarchy and permission checks

- **Middleware** (`src/middleware.ts`)
  - Route protection
  - Automatic redirects (unauthenticated → login, authenticated → dashboard)

- **API Routes**
  - `/api/auth/[...nextauth]` - NextAuth endpoints

- **Utilities**
  - `lib/utils.ts` - cn() helper for Tailwind

### ✅ Configuration Files
- `components.json` - Shadcn UI config
- `.env.local.example` - Environment variables template
- Updated `package.json` with database scripts

---

## Next Steps: Deploy to Vercel

### 1. Create Vercel Project

```bash
# Login to Vercel (if not already)
npm i -g vercel
vercel login

# Link project (run from apps/frontend directory)
cd apps/frontend
vercel link
```

Follow the prompts:
- Set up and deploy: **Yes**
- Scope: **Your account**
- Link to existing project: **No**
- Project name: **fixapp** (or your choice)
- Directory: **./apps/frontend**

### 2. Create Vercel Postgres Database

```bash
# Create database
vercel postgres create
```

Choose:
- Database name: **fixapp-db**
- Region: **Choose closest to you**

Vercel will automatically add the database environment variables to your project.

### 3. Create Environment Variables

```bash
# Generate NextAuth secret
openssl rand -base64 32
```

Add to Vercel:
```bash
vercel env add NEXTAUTH_SECRET
# Paste the generated secret

vercel env add NEXTAUTH_URL
# Enter: https://your-project.vercel.app (or your custom domain)

vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://your-project.vercel.app
```

### 4. Pull Environment Variables Locally

```bash
# Pull all environment variables to .env.local
vercel env pull .env.local
```

### 5. Push Database Schema

```bash
# Generate migration
npm run db:generate

# Push schema to Vercel Postgres
npm run db:push
```

This creates all your database tables.

### 6. Create First Tenant and Admin User

Create a script to seed initial data:

```bash
# Create seed script
touch src/scripts/seed.ts
```

Add this content:
```typescript
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';

async function seed() {
  // Create default tenant
  const [tenant] = await db.insert(tenants).values({
    name: 'Default Tenant',
    subdomain: 'demo',
    isActive: true,
  }).returning();

  console.log('✅ Tenant created:', tenant.name);

  // Create admin user
  const passwordHash = await hash('admin123', 10);
  const [admin] = await db.insert(users).values({
    tenantId: tenant.id,
    email: 'admin@fixapp.com',
    passwordHash,
    name: 'Admin User',
    role: 'admin',
    isActive: true,
  }).returning();

  console.log('✅ Admin user created:', admin.email);
  console.log('Password: admin123');
}

seed().catch(console.error);
```

Run it:
```bash
npx tsx src/scripts/seed.ts
```

### 7. Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

Your app is now live! 🎉

---

## Local Development

### Start Dev Server

```bash
cd apps/frontend
npm run dev
```

Visit: http://localhost:3000

### Database Commands

```bash
# View database in browser UI
npm run db:studio

# Generate new migration after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push
```

---

## What's Next: Build Features

Now that the foundation is set up, follow the implementation plan from `_bmad-output/mvp-simplified-epics.md`:

### Week 1 (Current): Authentication & Users
- ✅ Foundation complete
- 🔄 **Next:** Build login/signup pages
- [ ] User management (admin)

### Week 2: CMMS Tickets
- [ ] Create ticket page
- [ ] Ticket list
- [ ] Ticket details

### Week 3-4: Core RCA
- [ ] Create RCA (manual + from ticket)
- [ ] RCA list and details
- [ ] Team member assignment
- [ ] Status workflow

### Week 5: Collaboration
- [ ] Comments
- [ ] File uploads
- [ ] Fishbone diagram

### Week 6: Solutions
- [ ] Solution creation
- [ ] Assignment and tracking
- [ ] Approval workflow

### Week 7: Dashboard & Reports
- [ ] Role-based dashboards
- [ ] CSV export
- [ ] PDF reports

---

## Project Structure

```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/     # Auth endpoints
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Homepage
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── config.ts                # NextAuth config
│   │   │   └── permissions.ts           # Role checks
│   │   ├── db/
│   │   │   ├── schema.ts                # Database schema
│   │   │   └── index.ts                 # DB client
│   │   └── utils.ts                     # Helpers
│   ├── middleware.ts                    # Route protection
│   └── styles/
│       └── globals.css                  # Global styles
├── drizzle/                             # DB migrations
├── components.json                       # Shadcn config
├── drizzle.config.ts                    # Drizzle config
├── .env.local                           # Local env vars
└── package.json
```

---

## Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Check `.env.local` has correct `POSTGRES_URL`
2. Verify Vercel Postgres is created and linked
3. Run `vercel env pull` to refresh credentials

### NextAuth Errors

If authentication doesn't work:
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Clear cookies and try again

### Build Errors

If TypeScript complains:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Key Files to Remember

| File | Purpose |
|------|---------|
| `src/lib/db/schema.ts` | Add/modify database tables |
| `src/lib/auth/config.ts` | Configure authentication |
| `src/middleware.ts` | Protect routes |
| `drizzle.config.ts` | Database config |
| `.env.local` | Local environment variables |

---

## Resources

- **Architecture:** `_bmad-output/mvp-simplified-architecture.md`
- **Features:** `_bmad-output/mvp-simplified-prd.md`
- **Implementation:** `_bmad-output/mvp-simplified-epics.md`
- **Migration Guide:** `_bmad-output/migration-to-mvp-plan.md`

---

## Support

- Drizzle Docs: https://orm.drizzle.team
- NextAuth Docs: https://next-auth.js.org
- Vercel Docs: https://vercel.com/docs
- Shadcn UI: https://ui.shadcn.com

---

**You're all set! 🚀**

Next: Deploy to Vercel, then start building the login page.

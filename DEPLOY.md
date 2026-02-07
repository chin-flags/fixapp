# 🚀 Deployment Steps for fixapp

**GitHub Repo:** https://github.com/chin-flags/fixapp.git
**Your Name:** Chinthaka Weerakkody

---

## Step 1: Push to GitHub

```bash
# Add all files
git add .

# Commit with your name (already configured)
git commit -m "feat: set up simplified MVP architecture with Next.js, Drizzle, and NextAuth"

# Push to GitHub
git push origin main
```

---

## Step 2: Import to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `chin-flags/fixapp`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. Click "Deploy"

**Option B: Via CLI**

```bash
cd apps/frontend
vercel --prod
```

Follow prompts:
- Link to GitHub repo: Yes
- Select repository: chin-flags/fixapp

---

## Step 3: Create Vercel Postgres Database

After deployment, in Vercel dashboard:

1. Go to your project → **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose:
   - **Database Name:** fixapp-db
   - **Region:** Choose closest to you (e.g., Washington, D.C. - iad1)
5. Click **Create**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

---

## Step 4: Add Additional Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

### NEXTAUTH_SECRET
```bash
# Generate a secret (run locally)
openssl rand -base64 32
```
Copy the output and add as `NEXTAUTH_SECRET`

### NEXTAUTH_URL
```
https://your-project-name.vercel.app
```
Replace with your actual Vercel URL

### NEXT_PUBLIC_APP_URL
```
https://your-project-name.vercel.app
```
Same as NEXTAUTH_URL

---

## Step 5: Redeploy with Environment Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click the three dots (•••) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## Step 6: Push Database Schema

### Pull Environment Variables Locally

```bash
cd apps/frontend

# Pull all environment variables from Vercel
vercel env pull .env.local
```

This creates `.env.local` with all your Vercel environment variables.

### Push Schema to Database

```bash
# Push the database schema
npm run db:push
```

This creates all 9 tables in your Vercel Postgres database.

---

## Step 7: Create Seed Data

Create a seed script to add the first tenant and admin user:

```bash
# Create seed script
mkdir -p src/scripts
```

Then create `src/scripts/seed.ts`:

```typescript
import { db } from '@/lib/db';
import { tenants, users } from '@/lib/db/schema';
import { hash } from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create default tenant
  const [tenant] = await db.insert(tenants).values({
    name: 'Demo Company',
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

  console.log('✅ Admin user created');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123');
  console.log('');
  console.log('⚠️  IMPORTANT: Change the password after first login!');
}

seed()
  .then(() => {
    console.log('✅ Seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
```

### Run the seed script:

```bash
# Install tsx for running TypeScript
npm install --save-dev tsx

# Run seed
npx tsx src/scripts/seed.ts
```

---

## Step 8: Test Your Deployment

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. You should see the homepage
3. Try accessing `/login` (will redirect from middleware)

---

## Verification Checklist

- [ ] Code pushed to GitHub
- [ ] Project deployed to Vercel
- [ ] Vercel Postgres database created
- [ ] Environment variables configured
- [ ] Database schema pushed (9 tables created)
- [ ] Seed data created (tenant + admin user)
- [ ] Can access the deployed URL
- [ ] Login redirect works (middleware active)

---

## Next Steps After Deployment

1. **Build Login Page** - Create `/app/login/page.tsx`
2. **Build Signup Page** - Create `/app/signup/page.tsx`
3. **Build Dashboard** - Create `/app/dashboard/page.tsx`
4. **Follow Epic Plan** - See `_bmad-output/mvp-simplified-epics.md`

---

## Useful Commands

```bash
# Local development
cd apps/frontend
npm run dev              # Start dev server

# Database
npm run db:studio        # Browse database in browser
npm run db:push          # Push schema changes

# Vercel
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel env pull          # Pull env vars locally
vercel logs              # View deployment logs
```

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### Database Connection Fails
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Check that database was created in same region as deployment
- Run `vercel env pull` to get latest credentials

### Environment Variables Not Working
- After adding/changing env vars, redeploy the project
- Env vars only apply to new deployments, not existing ones

---

**You're ready to deploy! 🚀**

Start with Step 1: Push to GitHub.

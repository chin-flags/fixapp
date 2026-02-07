# 🚀 Quick Start - Post-Deployment Steps

## ✅ Checklist

- [ ] Step 3: Create Vercel Postgres database
- [ ] Step 4: Add environment variables
- [ ] Step 5: Redeploy with env vars
- [ ] Step 6: Push schema & seed data

---

## Step 3: Create Database (Vercel Dashboard)

1. Go to your project → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Name: `fixapp-db`
4. Region: Choose closest to you
5. Click **Create**

✅ Auto-adds: `POSTGRES_URL` and related vars

---

## Step 4: Add Environment Variables (Vercel Dashboard)

Go to **Settings** → **Environment Variables**

### 1. Generate and add NEXTAUTH_SECRET

**Run locally:**
```bash
openssl rand -base64 32
```

**In Vercel:**
- Name: `NEXTAUTH_SECRET`
- Value: [paste generated secret]
- Environments: ✅ Production ✅ Preview ✅ Development
- Save

### 2. Add NEXTAUTH_URL

- Name: `NEXTAUTH_URL`
- Value: `https://your-actual-url.vercel.app`
- Environments: ✅ Production
- Save

### 3. Add NEXT_PUBLIC_APP_URL

- Name: `NEXT_PUBLIC_APP_URL`
- Value: `https://your-actual-url.vercel.app` (same as above)
- Environments: ✅ Production ✅ Preview ✅ Development
- Save

---

## Step 5: Redeploy (Vercel Dashboard)

1. **Deployments** tab
2. Latest deployment → **•••** menu → **Redeploy**
3. Wait for completion

---

## Step 6: Push Schema & Seed (Local Terminal)

```bash
# Navigate to frontend
cd apps/frontend

# Pull environment variables from Vercel
vercel env pull .env.local

# Push database schema (creates 9 tables)
npm run db:push

# Seed the database (creates tenant + 3 users)
npm run db:seed
```

---

## 🎉 You're Done!

### Test Your Deployment

Visit: `https://your-actual-url.vercel.app`

### Login Credentials

**Admin:**
- Email: `admin@fixapp.com`
- Password: `admin123`
- Role: Full access

**RCA Owner:**
- Email: `owner@fixapp.com`
- Password: `owner123`
- Role: Manage RCAs

**Team Member:**
- Email: `member@fixapp.com`
- Password: `member123`
- Role: Collaborate on RCAs

⚠️ **Change passwords after first login!**

---

## Next: Build Features

Follow: `_bmad-output/mvp-simplified-epics.md`

Start with:
- **Epic 2:** Authentication pages (login/signup)
- **Epic 3:** CMMS Tickets
- **Epic 4:** RCA Management

---

## Useful Commands

```bash
# Development
npm run dev              # Start local dev server

# Database
npm run db:studio        # Browse database in browser
npm run db:push          # Push schema changes
npm run db:seed          # Re-seed database

# Deployment
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
```

---

**Questions?** Check:
- [SETUP-MVP.md](SETUP-MVP.md) - Detailed setup
- [DEPLOY.md](DEPLOY.md) - Full deployment guide
- [INSTALLATION-COMPLETE.md](INSTALLATION-COMPLETE.md) - What's installed

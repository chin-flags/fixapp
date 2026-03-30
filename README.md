# FixApp Frontend

This repository now contains a single Next.js application at the repo root.

## Requirements

- Node.js 20+
- pnpm 9+
- PostgreSQL-compatible database

## Commands

Run these from the repo root:

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run start
pnpm run lint
pnpm run test
pnpm run db:seed
```

## App Location

- App source: `src`
- Local database schema: `src/lib/db/schema.ts`

## Notes

- Authentication, tenant management, and dashboard data now run from the frontend app.
- The old backend, shared packages, and workspace tooling have been removed from this repo.

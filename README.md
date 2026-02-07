# FixApp - Multi-tenant RCA Platform

A modern, enterprise-grade Root Cause Analysis (RCA) and Maintenance Management System built on a Turborepo monorepo architecture with Next.js 15 and NestJS.

## Overview

FixApp is a multi-tenant SaaS platform designed to streamline corrective maintenance management and root cause analysis workflows. Built with modern TypeScript tooling and strict type safety, it provides manufacturing and maintenance teams with powerful tools for investigating failures, tracking corrective actions, and preventing recurrence.

## Architecture

This project uses a **Turborepo monorepo** structure with the following organization:

```
fixapp/
├── apps/
│   ├── frontend/        # Next.js 15 application (port 3000)
│   └── backend/         # NestJS API (port 3001)
├── packages/
│   ├── shared-types/    # Shared TypeScript interfaces
│   └── eslint-config/   # Shared ESLint configuration
└── turbo.json           # Turborepo configuration
```

### Technology Stack

**Frontend:**
- Next.js 15 with App Router (React Server Components)
- TypeScript 5.x with strict mode
- Tailwind CSS for styling
- ESLint + Prettier
- Turbopack for development

**Backend:**
- NestJS with modular architecture
- TypeScript 5.x with strict mode
- TypeORM for database (PostgreSQL)
- Built-in dependency injection
- RESTful API architecture

**Shared:**
- Strict TypeScript across all packages
- Shared types between frontend/backend
- Unified ESLint and Prettier configuration
- Turbo for build orchestration and caching

## Prerequisites

- Node.js 20+ (required for Next.js 15)
- npm 11.4.2+
- PostgreSQL (for future database setup)

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd fixapp
npm install
```

### Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:3001

The dev server includes:
- Hot Module Replacement (HMR) for both apps
- Automatic rebuilds when shared packages change
- Turbopack for faster development builds

### Build

Build all apps and packages for production:

```bash
npm run build
```

Turbo will:
1. Build shared packages first
2. Build frontend and backend apps
3. Cache builds for faster subsequent runs

### Linting

Run ESLint across all packages:

```bash
npm run lint
```

### Testing

Run tests across all packages:

```bash
npm run test
```

## Project Structure

### Frontend Structure (apps/frontend/src/)

```
src/
├── app/                 # App Router pages
├── components/          # React components
├── lib/                 # Utilities and helpers
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

### Backend Structure (apps/backend/src/)

```
src/
├── modules/             # Feature modules (future)
├── common/              # Shared code
│   ├── guards/          # Auth guards (future)
│   ├── interceptors/    # HTTP interceptors
│   ├── filters/         # Exception filters
│   └── decorators/      # Custom decorators
├── database/            # Database configuration (Story 1.2)
└── config/              # Application configuration
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers for all apps |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all packages |
| `npm run test` | Run tests across all packages |
| `npm run clean` | Clean all build outputs |

## Development Workflow

1. Make changes to code in `apps/` or `packages/`
2. Changes are automatically detected and rebuilt
3. Frontend and backend hot reload automatically
4. Shared type changes trigger rebuilds in consuming apps

## Code Quality

- **TypeScript Strict Mode**: Enabled across all packages - no `any` types allowed
- **ESLint**: Configured with TypeScript and Prettier rules
- **Prettier**: Automated code formatting
- **Type Safety**: Shared types ensure consistency between frontend and backend

## Next Steps

- Configure database with TypeORM (Story 1.2)
- Set up multi-tenancy infrastructure (Story 1.3)
- Implement authentication framework (Story 1.4)
- Add security infrastructure (Story 1.5)

## License

UNLICENSED - Private project

## Contributing

This is a private project. For development guidelines and architecture decisions, see:
- `_bmad-output/architecture.md` - System architecture
- `_bmad-output/prd.md` - Product requirements
- `_bmad-output/implementation-artifacts/` - Story implementations

---

**Built with [Turborepo](https://turbo.build/repo), [Next.js 15](https://nextjs.org/), and [NestJS](https://nestjs.com/)**

# Story 1.1: Project Initialization & Monorepo Setup

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Development Team**,
I want **a properly initialized Turborepo monorepo with Next.js 15 frontend and NestJS backend**,
so that **we have a production-ready foundation for building the multi-tenant fixapp SaaS platform with strict TypeScript, shared types, and modern tooling**.

## Acceptance Criteria

1. **Monorepo Structure Created**
   - Given the project needs a monorepo structure
   - When initializing the project
   - Then a Turborepo workspace is created with `apps/` and `packages/` directories
   - And turbo.json is configured for build orchestration and caching

2. **Frontend Application Initialized**
   - Given the frontend requires Next.js 15
   - When creating the frontend app
   - Then Next.js 15 is initialized with TypeScript, App Router, Tailwind CSS, and ESLint
   - And the app uses src/ directory structure with @/* import aliases
   - And Turbopack is configured for fast development builds

3. **Backend Application Initialized**
   - Given the backend requires NestJS with PostgreSQL support
   - When creating the backend app
   - Then NestJS is initialized with TypeScript and strict mode
   - And @nestjs/typeorm, typeorm, and pg packages are installed
   - And the app uses modular architecture (controllers, services, modules)

4. **Shared Packages Created**
   - Given frontend and backend need type safety
   - When setting up shared code
   - Then a `packages/shared-types` package exists with TypeScript interfaces
   - And a `packages/eslint-config` package exists for shared linting rules
   - And both apps reference these shared packages

5. **TypeScript Configuration**
   - Given the project requires strict type safety
   - When configuring TypeScript
   - Then strict mode is enabled in all tsconfig.json files
   - And shared types are properly exported and importable from both apps
   - And no TypeScript errors exist in default scaffold

6. **Development Environment Works**
   - Given developers need to run the application locally
   - When executing `turbo dev`
   - Then both frontend (port 3000) and backend (port 3001) start successfully
   - And hot module replacement works for both apps
   - And changes to shared packages trigger rebuilds in consuming apps

7. **Build System Configured**
   - Given the project needs production builds
   - When executing `turbo build`
   - Then both apps build successfully without errors
   - And turbo cache works (second build is significantly faster)
   - And build outputs are optimized for production

8. **Code Quality Tools Configured**
   - Given the project requires code quality standards
   - When running linting and formatting
   - Then ESLint and Prettier are configured for both apps
   - And `turbo lint` executes successfully across all packages
   - And formatting rules are consistent (shared ESLint config)

9. **Git Repository Initialized**
   - Given the project needs version control
   - When initializing git
   - Then .gitignore includes node_modules, .next, dist, .env files
   - And initial commit contains working monorepo structure
   - And commit message follows convention: "chore: initialize turborepo monorepo with Next.js 15 and NestJS"

10. **Documentation Created**
   - Given developers need setup instructions
   - When creating documentation
   - Then README.md exists at root with setup, dev, and build commands
   - And package.json scripts are documented
   - And architecture diagram shows monorepo structure

## Tasks / Subtasks

- [x] Initialize Turborepo monorepo structure (AC: #1)
  - [x] Run `npx create-turbo@latest fixapp`
  - [x] Configure turbo.json with pipeline for dev, build, lint, test
  - [x] Set up workspace configuration in root package.json

- [x] Initialize Next.js 15 frontend application (AC: #2)
  - [x] Run `npx create-next-app@latest apps/frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [x] Verify App Router is default
  - [x] Verify Turbopack is configured for development
  - [x] Test dev server starts on port 3000

- [x] Initialize NestJS backend application (AC: #3)
  - [x] Run `npx @nestjs/cli@latest new apps/backend`
  - [x] Install TypeORM dependencies: `@nestjs/typeorm typeorm pg`
  - [x] Install dev dependencies: `@types/node`
  - [x] Configure NestJS to run on port 3001
  - [x] Test dev server starts successfully

- [x] Create shared packages structure (AC: #4)
  - [x] Create `packages/shared-types` with package.json and tsconfig.json
  - [x] Create `packages/eslint-config` with ESLint configuration
  - [x] Export shared-types from index.ts
  - [x] Configure turbo.json to build packages before apps

- [x] Configure TypeScript strict mode across all packages (AC: #5)
  - [x] Enable strict mode in frontend tsconfig.json
  - [x] Enable strict mode in backend tsconfig.json
  - [x] Enable strict mode in shared-types tsconfig.json
  - [x] Verify no TypeScript errors in `turbo build`

- [x] Test development workflow (AC: #6)
  - [x] Run `turbo dev` and verify both apps start
  - [x] Test hot reload in frontend (edit a component)
  - [x] Test hot reload in backend (edit a controller)
  - [x] Make change to shared-types and verify both apps rebuild

- [x] Test production build workflow (AC: #7)
  - [x] Run `turbo build` and verify success
  - [x] Run `turbo build` again and verify cache hit
  - [x] Inspect build outputs in apps/frontend/.next and apps/backend/dist
  - [x] Verify production builds are optimized

- [x] Configure code quality tools (AC: #8)
  - [x] Configure ESLint rules in packages/eslint-config
  - [x] Configure Prettier rules
  - [x] Add lint scripts to all package.json files
  - [x] Run `turbo lint` and verify no errors

- [ ] Initialize Git repository (AC: #9)
  - [ ] Run `git init`
  - [ ] Create comprehensive .gitignore
  - [ ] Stage all files: `git add .`
  - [ ] Create initial commit with proper message

- [ ] Create project documentation (AC: #10)
  - [ ] Write README.md with project overview
  - [ ] Document setup instructions (npm install, turbo dev)
  - [ ] Document build and deployment commands
  - [ ] Create simple architecture diagram showing monorepo structure

## Dev Notes

### Architecture Requirements

**Monorepo Structure (from Architecture Doc):**
```
fixapp/
├── apps/
│   ├── frontend/        # Next.js 15 application
│   ├── backend/         # NestJS API
│   └── ai-service/      # Python ML service (future story)
├── packages/
│   ├── shared-types/    # Shared TypeScript interfaces
│   ├── ui-components/   # Shared React components (future)
│   └── eslint-config/   # Shared ESLint configuration
├── infrastructure/      # Docker, Terraform (future)
└── turbo.json           # Turborepo configuration
```

**Frontend Tech Stack:**
- Next.js 15 with App Router (React Server Components)
- TypeScript 5.x with strict mode
- Tailwind CSS for styling
- ESLint + Prettier
- Turbopack for development
- Port 3000

**Backend Tech Stack:**
- NestJS with modular architecture
- TypeScript 5.x with strict mode
- TypeORM for database (will be configured in Story 1.2)
- Dependency injection built-in
- Port 3001

**Node.js Version:**
- Minimum: Node.js 20+ (required for Next.js 15)

**Critical Patterns:**
- All code in strict TypeScript mode - no `any` types
- Shared types between frontend/backend via packages/shared-types
- Import aliases: @/* for frontend, shared-types accessible as package import

### Project Structure Notes

**Frontend Structure (apps/frontend/src/):**
```
src/
├── app/                 # App Router pages
├── components/          # React components
├── lib/                 # Utilities and helpers
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

**Backend Structure (apps/backend/src/):**
```
src/
├── modules/             # Feature modules (to be added in future stories)
├── common/              # Shared code
│   ├── guards/          # Auth guards (future)
│   ├── interceptors/    # HTTP interceptors (future)
│   ├── filters/         # Exception filters
│   └── decorators/      # Custom decorators
├── database/            # Database configuration (Story 1.2)
└── config/              # Application configuration
```

**Turbo.json Pipeline Configuration:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### Testing Standards

**Test Framework Setup (Included in scaffolds):**
- Frontend: Jest + React Testing Library (Next.js default)
- Backend: Jest + Supertest (NestJS default)
- E2E: Playwright (to be added in future story)

**Initial Test Coverage:**
- Verify default test suites run successfully
- No need to write tests for scaffold code
- Future stories will add comprehensive tests

### References

- [Source: architecture.md # Starter Template Evaluation]
- [Source: architecture.md # Code Organization]
- [Source: architecture.md # Technology Stack Confirmed]
- [Source: architecture.md # Frontend Stack (Next.js 15)]
- [Source: architecture.md # Backend Stack (NestJS)]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List

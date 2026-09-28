---
name: vibecode-scaffold
description: Project scaffolding and disciplined software architecture initialization skill based on vibecode-cli patterns. Use when scaffolding new projects, bootstrapping application frameworks (Next.js, Vite/React, Node.js, Express, Fastify, Expo), generating structured blueprints, defining service contracts, configuring dependencies and environment setups, and establishing disciplined development pipelines.
risk: safe
source: vibecode-cli
---

# Vibecode Scaffolding & Architecture Initialization

The **vibecode-scaffold** skill provides structured, disciplined scaffolding for new applications and microservices. It bridges the speed of rapid prototyping ("vibecoding") with rigorous engineering foundations: architecture blueprints, interface contracts, and clean directory structures.

## When to Use

- When scaffolding or bootstrapping a new project from scratch.
- When generating foundational application templates (Next.js App Router, Vite/React, Node.js/Express/Fastify, Expo mobile).
- When establishing project architecture before code implementation (`intake` -> `blueprint` -> `contract` -> `build`).
- When setting up foundational boilerplate: TypeScript configuration, linters, tailwind, environment management, and service wiring.

## Disciplined Scaffolding Pipeline

```
[ INTAKE ] ──▶ [ BLUEPRINT ] ──▶ [ CONTRACT ] ──▶ [ SCAFFOLD / BUILD ]
     │                │                 │                   │
Requirements     Architecture       Interface/Schema    Directory Layout &
 & Constraints   & Stack Matrix     Definitions         Base Dependencies
```

---

## Phase 1: Intake (Requirements Capture)

Before generating any code or directory structure, capture the scope and operational requirements using the [Intake Template](./templates/intake.md):

1. **Project Objective**: Core value proposition and expected user interactions.
2. **Platform & Target**: Web (SPA/SSR), Mobile (React Native/Expo), CLI, or Backend API.
3. **Key Constraints**:
   - Runtime targets (Node.js 20+, Bun, Edge runtimes).
   - Storage/Database needs (PostgreSQL, SQLite, Redis, Document store).
   - Third-party integrations (Auth, Payments, Analytics, AI SDKs).

---

## Phase 2: Blueprint (System Architecture)

Generate the architecture specification before writing application code using the [Blueprint Template](./templates/blueprint.md):

1. **Tech Stack Selection Matrix**:
   - **Frontend**: Next.js (App Router, Tailwind CSS, Lucide icons, shadcn/ui).
   - **Backend**: Next.js Route Handlers / Express / Fastify / NestJS with TypeScript.
   - **Database & ORM**: PostgreSQL via Prisma ORM / Drizzle ORM.
   - **Validation & Serialization**: Zod schemas for all boundaries.
2. **Directory Conventions**:
   ```text
   project-root/
   ├── src/
   │   ├── app/              # Routes, pages, API handlers
   │   ├── components/       # Reusable UI components
   │   │   ├── ui/           # Atomic UI elements (button, input, modal)
   │   │   └── layout/       # Navigation, footer, shell
   │   ├── lib/              # Core utilities, clients, shared helpers
   │   ├── server/           # Database clients, services, repositories
   │   └── types/            # TypeScript interfaces & domain models
   ├── tests/                # Unit, integration, and e2e tests
   ├── .env.example          # Environment variables template
   ├── package.json
   └── tsconfig.json
   ```

---

## Phase 3: Contract (Data & Interface Contracts)

Establish explicit contracts using the [Contract Template](./templates/contract.md):

1. **Domain Data Models**: Entity attributes, relation types, and nullable constraints.
2. **API Endpoint Specifications**: Methods, routes, request headers, payload schemas, and response shapes.
3. **Invariants & Security Rules**: Mandatory auth guards, rate limits, and sanitization.

---

## Phase 4: Scaffolding Execution

Execute the file generation in this order:

1. **Root Configurations**:
   - `package.json` with scripts: `dev`, `build`, `lint`, `test`.
   - `tsconfig.json` with strict mode (`strict: true`, path aliases `@/*`).
   - `.gitignore` (standard Node/Vite/Next ignore rules).
   - `.env.example` documenting all required secrets with dummy values.
2. **Core Modules & Directories**:
   - Create foundational directories (`src/`, `components/`, `lib/`, `types/`).
   - Scaffold initial health-check endpoint (`GET /api/health`).
   - Wire central error handler and logging utility.
3. **Validation & Verification**:
   - Verify package dependencies install cleanly without conflict.
   - Run linter/build dry-run to ensure 0 TypeScript errors.

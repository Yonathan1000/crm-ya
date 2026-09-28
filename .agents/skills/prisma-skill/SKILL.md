---
name: prisma-skill
description: Database architect and Prisma ORM expert skill. Use when designing database schemas, writing schema.prisma models and relations (1:1, 1:N, M:N), managing Prisma migrations, generating type-safe queries, handling transactions, optimizing database performance, index strategy, raw SQL safety ($queryRaw), and connection pooling.
risk: safe
source: prisma/skills
---

# Prisma ORM & Database Expert Skill

The **prisma-skill** provides architectural guidance, schema modeling rules, migration procedures, and query optimization patterns for applications using **Prisma ORM** with relational databases (PostgreSQL, MySQL, SQLite, CockroachDB, SQL Server).

## When to Use

- When designing or updating database models in `prisma/schema.prisma`.
- When modeling relations (1-to-1, 1-to-many, many-to-many) and referential integrity (`onDelete`, `onUpdate`).
- When creating and applying database migrations (`prisma migrate dev`, `prisma migrate deploy`).
- When writing type-safe Prisma Client queries (`findUnique`, `findMany`, `select`, `include`, `omit`).
- When implementing atomic write operations, nested mutations, or interactive `$transaction` blocks.
- When diagnosing slow queries, N+1 query patterns, indexing issues, or connection pool exhaustion.

---

## 1. Schema Modeling (`schema.prisma`)

### Core Model Syntax & Attributes

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email, role])
  @@map("users")
}

model Profile {
  id     String  @id @default(cuid())
  bio    String?
  userId String  @unique
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String?
  published Boolean   @default(false)
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Restrict)
  tags      TagOnPost[]
  createdAt DateTime  @default(now())

  @@index([authorId])
  @@index([published, createdAt(sort: Desc)])
  @@map("posts")
}

model Tag {
  id    Int         @id @default(autoincrement())
  name  String      @unique
  posts TagOnPost[]

  @@map("tags")
}

// Explicit many-to-many for join table metadata
model TagOnPost {
  postId     Int
  tagId      Int
  assignedAt DateTime @default(now())
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("tags_on_posts")
}
```

### Modeling Best Practices

1. **Always specify referential actions**: Explicitly define `onDelete: Cascade` or `onDelete: Restrict` to avoid unintended orphan records.
2. **Index foreign keys**: Relational databases do not automatically create indexes on foreign key columns. Add `@@index([foreignKey])` on relational fields.
3. **Use Table Mapping**: Always use `@@map("snake_case_table_name")` to maintain idiomatic database naming conventions while keeping PascalCase in TypeScript.

---

## 2. Migration & CLI Workflow

| Command | Environment | Purpose |
| :--- | :--- | :--- |
| `npx prisma migrate dev --name <name>` | Local / Development | Generates SQL migration file and applies it to the dev database. |
| `npx prisma migrate deploy` | Production / CI/CD | Applies pending migrations without schema prompts or drift checks. |
| `npx prisma db push` | Prototyping / SQLite | Syncs schema directly without generating SQL migration files. |
| `npx prisma generate` | Build / Local | Generates TypeScript types for `@prisma/client`. |
| `npx prisma studio` | Local | Opens a web-based GUI for database inspection. |
| `npx prisma db seed` | Local / Staging | Runs the seed script configured in `package.json`. |

---

## 3. Query Best Practices & Anti-Patterns

### Avoid N+1 Queries: `select` vs `include`

```typescript
// ❌ ANTI-PATTERN: Over-fetching entire objects and relations
const users = await prisma.user.findMany({
  include: { posts: true, profile: true },
});

// ✅ BEST PRACTICE: Fetch only fields necessary for the view/response
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
      },
      where: { published: true },
      take: 5,
    },
  },
});
```

### Nested Mutations & Transactions

```typescript
// Atomic write operation with relations
const post = await prisma.post.create({
  data: {
    title: 'Getting started with Prisma',
    content: 'Full guide to database design...',
    author: {
      connect: { id: userId },
    },
    tags: {
      create: [
        {
          tag: {
            connectOrCreate: {
              where: { name: 'database' },
              create: { name: 'database' },
            },
          },
        },
      ],
    },
  },
});

// Interactive Transaction for interdependent multi-step logic
const result = await prisma.$transaction(async (tx) => {
  const account = await tx.account.update({
    where: { id: fromAccountId },
    data: { balance: { decrement: amount } },
  });

  if (account.balance < 0) {
    throw new Error('Insufficient balance');
  }

  await tx.account.update({
    where: { id: toAccountId },
    data: { balance: { increment: amount } },
  });

  return tx.transferAudit.create({
    data: { from: fromAccountId, to: toAccountId, amount },
  });
});
```

### Raw SQL Safety

```typescript
// ✅ SAFE: Tagged template literals automatically parameterize values
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

// ❌ DANGEROUS: Avoid raw string interpolation with $queryRawUnsafe
// const user = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
```

---

## 4. Production Performance & Connection Management

1. **Singleton Client Pattern**: In Next.js / serverless runtimes, avoid opening multiple client instances:
   ```typescript
   // lib/prisma.ts
   import { PrismaClient } from '@prisma/client';

   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

   export const prisma =
     globalForPrisma.prisma ||
     new PrismaClient({
       log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
     });

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
   ```
2. **Connection Pooling**: Use connection poolers (PgBouncer, Neon Serverless Driver, Supabase Pooler) with `?pgbouncer=true&connection_limit=5` in serverless/edge environments.

---

## Reference Guides

- [Prisma Client API Guide](./references/prisma_client_api.md): Complete query, filtering, and transaction options.
- [Prisma Database Setup Guide](./references/prisma_database_setup.md): Environment variables, connection strings, and provider options.
- [Prisma CLI Reference](./references/prisma_cli_reference.md): Detailed CLI subcommands and migration options.

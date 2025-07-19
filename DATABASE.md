# Database Scripts Documentation

## Core Migration Commands

### `npm run db:generate`

**Purpose**: Generate migration files from schema changes

- Analyzes differences between current schema and database
- Creates SQL migration files in `./drizzle/migrations/`
- Run after modifying `schema.ts`

### `npm run db:migrate`

**Purpose**: Apply pending migrations to database

- Executes all pending SQL migrations
- Updates migration tracking
- **Always backup before running in production**

### `npm run db:push`

**Purpose**: Quick schema sync (development only)

- Bypasses migration files
- Direct schema-to-database sync
- **Never use in production**

### `npm run db:studio`

**Purpose**: Launch database GUI

- Web-based database browser
- Query editor and data viewer
- Access at http://localhost:4983

## Workflow Examples

### Development

1. `npm run db:push` - Quick iteration
2. `npm run db:studio` - View results

### Production Deployment

1. `npm run db:generate` - Create migrations
2. `npm run db:migrate` - Apply to database

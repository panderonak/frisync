import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration
 *
 * This configuration file defines how Drizzle Kit handles database migrations,
 * schema introspection, and code generation for your PostgreSQL database.
 *
 * Key Features:
 * - Automatic migration generation from schema changes
 * - Database introspection and schema synchronization
 * - TypeScript type generation for database operations
 * - Development and production environment support
 */
export default defineConfig({
  /**
   * Migration Output Directory
   *
   * Specifies where generated migration files will be stored.
   * These files contain SQL statements that modify your database structure.
   *
   * Structure will be:
   * ./drizzle/
   * ├── meta/           # Migration metadata
   * ├── migrations/     # SQL migration files
   * └── schema.ts       # Generated schema snapshot
   */
  out: './drizzle',

  /**
   * Schema File Path
   *
   * Points to your Drizzle schema definition file containing table definitions,
   * relationships, and constraints. This is the source of truth for your
   * database structure.
   *
   * Expected to contain:
   * - Table definitions (pgTable)
   * - Relations definitions
   * - Type exports
   * - Indexes and constraints
   */
  schema: './src/db/schema.ts',

  /**
   * Database Dialect
   *
   * Specifies the SQL dialect for proper query generation and migration syntax.
   * PostgreSQL-specific features like UUID, JSONB, and array types are supported.
   *
   * Other supported dialects: 'mysql', 'sqlite'
   */
  dialect: 'postgresql',

  /**
   * Database Connection Credentials
   *
   * Configuration for connecting to your PostgreSQL database.
   * Uses environment variables for security and flexibility across environments.
   *
   * Environment Variables Required:
   * - DATABASE_URL: Full PostgreSQL connection string
   *   Format: postgresql://username:password@host:port/database
   *   Example: postgresql://user:pass@localhost:5432/myapp_dev
   *
   * The exclamation mark (!) tells TypeScript this environment variable
   * is guaranteed to exist, preventing null/undefined errors.
   */
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Verbose logging for debugging migration issues
  // verbose: true,

  // Strict mode for safer migrations (prevents destructive changes)
  // strict: true,

  // Custom migration table name (default: '__drizzle_migrations')
  // migrationsTable: 'custom_migrations_table',

  // Include/exclude specific schema files or patterns
  // schemaFilter: ['public'],

  // Custom migration folder structure
  // migrationsFolder: './database/migrations',
});

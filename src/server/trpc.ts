// Import database schema definitions
import * as schema from '@/db/schema';
// Clerk authentication utility for server-side user management
import { currentUser } from '@clerk/nextjs/server';
// Neon database connection for serverless environments
import { neon } from '@neondatabase/serverless';
// Core tRPC utilities for API setup and error handling
import { initTRPC, TRPCError } from '@trpc/server';
// Drizzle ORM adapter for Neon HTTP connections
import { drizzle } from 'drizzle-orm/neon-http';
// Hono framework types for request context
import type { Context } from 'hono';
// Environment variable helper from Hono
import { env } from 'hono/adapter';

// Type definition for environment variables (Cloudflare Workers/Vercel Edge style)
interface Env {
  Bindings: { DATABASE_URL: string };
}

// Base context type that will be available in all tRPC procedures
type TRPCContext = {
  env: Env['Bindings']; // Environment variables
  c: Context; // Hono request context
};

// Initialize tRPC with our context type - this is the foundation of our API
export const t = initTRPC.context<TRPCContext>().create();

/**
 * Database Middleware
 *
 * This middleware runs before any procedure that uses it and:
 * 1. Extracts the DATABASE_URL from environment variables
 * 2. Creates a Neon database connection
 * 3. Initializes Drizzle ORM with our schema
 * 4. Adds the database instance to the context for use in procedures
 */
const databaseMiddleware = t.middleware(async ({ ctx, next }) => {
  try {
    // Extract DATABASE_URL from the Hono context environment
    const { DATABASE_URL } = env(ctx.c);

    // Ensure database URL is configured
    if (!DATABASE_URL) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database URL not configured',
      });
    }

    // Create Neon serverless database connection
    const sql = neon(DATABASE_URL);
    // Initialize Drizzle ORM with our schema for type-safe queries
    const db = drizzle(sql, { schema });

    // Continue to the next middleware/procedure with enhanced context
    return await next({
      ctx: {
        ...ctx,
        db, // Add database instance to context
      },
    });
  } catch (error) {
    console.error('Database middleware error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database connection failed',
    });
  }
});

// Extended context type that includes the database instance
type DatabaseContext = TRPCContext & {
  db: ReturnType<typeof drizzle<typeof schema>>;
};

/**
 * Authentication Middleware
 *
 * This middleware runs after database middleware and:
 * 1. Gets the current user from Clerk authentication
 * 2. Validates the user exists in our database
 * 3. Adds the user object to the context for authenticated procedures
 */
const authenticationMiddleware = t.middleware(async ({ ctx, next }) => {
  // Cast context to include database (this runs after databaseMiddleware)
  const { db } = ctx as DatabaseContext;

  try {
    // Get current authenticated user from Clerk
    const auth = await currentUser();

    // Check if user is authenticated
    if (!auth) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorised.',
      });
    }

    // Find user in our database using Clerk's external ID
    const user = await db.query.users.findFirst({
      where: ({ externalId }, { eq }) => eq(externalId, auth.id),
    });

    // Ensure user exists in our database
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorised.',
      });
    }

    // Continue with user added to context
    return next({
      ctx: {
        ...ctx,
        user, // Add user object to context
      },
    });
  } catch (error) {
    // Re-throw tRPC errors as-is
    if (error instanceof TRPCError) {
      throw error;
    }

    // Log and wrap unexpected errors
    console.error('Authentication middleware error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Authentication failed',
    });
  }
});

// Public procedure: Anyone can call, includes database access
export const publicProcedure = t.procedure.use(databaseMiddleware);

// Private procedure: Requires authentication, includes database + user context
export const privateProcedure = publicProcedure.use(authenticationMiddleware);

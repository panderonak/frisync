// Import our tRPC setup and procedures
import { publicProcedure, t } from '@/server/trpc';
// Hono web framework for handling HTTP requests
import { Hono } from 'hono';
// tRPC server adapter for Hono
import { trpcServer } from '@hono/trpc-server';
// CORS middleware for cross-origin requests
import { cors } from 'hono/cors';

/**
 * Main tRPC Router
 *
 * This defines all available API endpoints. Currently includes:
 * - test: A simple endpoint to verify the API is working
 */
export const appRouter = t.router({
  test: publicProcedure.query(() => ({ message: 'it works!' })),
});

// Export router type for client-side type safety
export type AppRouter = typeof appRouter;

/**
 * Hono App Setup
 *
 * Creates the main HTTP server with:
 * - Base path of '/api' for all routes
 * - CORS configuration for frontend communication
 * - tRPC server integration
 */
const app = new Hono().basePath('/api');

/**
 * CORS Configuration
 *
 * Allows requests from our frontend application with credentials
 * This is essential for authentication cookies to work properly
 */
app.use(
  '*',
  cors({
    origin: [process.env.NEXT_PUBLIC_APP_URL!], // Frontend URL from environment
    credentials: true, // Allow cookies/auth headers
  })
);

/**
 * tRPC Server Integration
 *
 * Sets up the tRPC server to handle all /trpc/* routes:
 * - Creates context for each request (includes env vars and Hono context)
 * - Handles errors with detailed logging
 * - Processes tRPC procedure calls
 */
app.use(
  '/trpc/*',
  trpcServer({
    endpoint: '/api/trpc', // Base endpoint for tRPC calls
    router: appRouter, // Our defined API routes
    // Context factory: runs for every request to create the base context
    createContext: (_, c) => ({
      env: {
        DATABASE_URL: process.env.DATABASE_URL || '', // Database connection string
      },
      c, // Hono request context
    }),
    // Error handler: logs errors with helpful details
    onError: ({ error, path }) => {
      console.error(`tRPC Error on ${path}:`, error);
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error('Internal error:', error.cause);
      }
    },
  })
);

// Export the configured Hono app
export default app;

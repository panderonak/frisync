// Import our configured Hono server
import app from '@/server';
// Vercel adapter for Hono (enables deployment on Vercel)
import { handle } from 'hono/vercel';

/**
 * Next.js API Route Handlers
 *
 * These export the HTTP method handlers that Next.js expects.
 * The `handle` function from Hono/Vercel adapter converts our Hono app
 * into Next.js-compatible route handlers.
 *
 * The [[...route]] folder structure creates a catch-all route that
 * forwards all /api/* requests to our Hono application.
 */

// Handle GET requests (queries, health checks, etc.)
export const GET = handle(app);

// Handle POST requests (mutations, form submissions, etc.)
export const POST = handle(app);

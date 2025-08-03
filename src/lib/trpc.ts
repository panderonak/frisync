// Import the router type for type safety and client creation utilities
import type { AppRouter } from '@/server';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

/**
 * tRPC Client
 *
 * This creates a type-safe client for making API calls from the frontend.
 * Features:
 * - Full TypeScript support with autocomplete
 * - Automatic request/response serialization
 * - HTTP batching for multiple simultaneous requests
 *
 * Usage example:
 * const result = await client.test.query();
 */
export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc', // Points to our tRPC server endpoint
    }),
  ],
});

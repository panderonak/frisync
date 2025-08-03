// Mark as client component since it uses React hooks and state
'use client';

// TanStack Query (React Query) imports for data fetching and caching
import {
  QueryCache, // Cache management for queries
  QueryClient, // Main client for handling queries/mutations
  QueryClientProvider, // Context provider for React Query
} from '@tanstack/react-query';
// Hono's HTTP exception type for error handling
import { HTTPException } from 'hono/http-exception';
// React utilities
import { PropsWithChildren, useState } from 'react';

/**
 * Providers Component
 *
 * This component wraps your entire application to provide:
 * - React Query client for data fetching, caching, and synchronization
 * - Global error handling for HTTP exceptions
 * - State management for server state (API data)
 *
 * Should be placed high in your component tree, typically in layout.tsx
 */
export const Providers = ({ children }: PropsWithChildren) => {
  // Create QueryClient instance using useState to ensure it's only created once
  // This prevents the client from being recreated on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        /**
         * Query Cache Configuration
         *
         * The QueryCache handles all cached query data and provides
         * global event handlers for query lifecycle events
         */
        queryCache: new QueryCache({
          /**
           * Global Error Handler
           *
           * This function runs whenever any query in your app fails.
           * It's perfect for:
           * - Showing toast notifications for errors
           * - Logging errors to monitoring services
           * - Handling authentication errors globally
           * - Redirecting on specific error codes
           */
          onError: (err) => {
            // Check if the error is an HTTP exception from your Hono server
            if (err instanceof HTTPException) {
              // TODO: Add global error handling here, such as:
              // - Toast notifications: toast.error(err.message)
              // - Redirect to login on 401: router.push('/login')
              // - Log to monitoring service: logger.error(err)
              console.error('HTTP Exception caught globally:', err);
            }
          },
        }),
      })
  );

  /**
   * QueryClientProvider
   *
   * This provider makes the QueryClient available to all child components.
   * Any component wrapped by this provider can use React Query hooks like:
   * - useQuery() for data fetching
   * - useMutation() for data updates
   * - useInfiniteQuery() for paginated data
   *
   * When combined with tRPC, this enables powerful features like:
   * - Automatic background refetching
   * - Optimistic updates
   * - Request deduplication
   * - Offline support
   */
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Define public routes that don't require authentication
 * - "/" : Home page (landing page)
 * - "/sign-in(.*)" : Sign-in page and any sub-routes
 * - "/sign-up(.*)" : Sign-up page and any sub-routes
 * - "/api/webhooks(.*)" : Webhook endpoints (if you have any)
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Add this if you have webhook endpoints
]);

/**
 * Clerk Middleware - Handles authentication and routing logic
 *
 * EXECUTION FLOW:
 * 1. Extract user authentication status
 * 2. Parse URL components (pathname and origin)
 * 3. Check if authenticated user is accessing public routes
 * 4. Redirect authenticated users away from auth pages if needed
 * 5. Protect private routes by requiring authentication
 * 6. Allow request to continue if no action is needed
 *
 * Core Functionality:
 * - Redirects authenticated users away from auth pages to dashboard
 * - Protects private routes by requiring authentication
 * - Allows unauthenticated access to public routes
 */
export default clerkMiddleware(async (auth, request) => {
  // STEP 1: Get user authentication status
  // IMPORTANT: Must await auth() call as it's asynchronous
  // This returns an object with userId (null if not authenticated)
  const { userId } = await auth();

  // STEP 2: Parse the current request URL for pathname and origin
  // This line uses destructuring assignment to extract two properties:
  // - pathname: The path portion of URL (e.g., "/dashboard", "/sign-in")
  // - origin: The base URL with protocol and domain (e.g., "https://myapp.com")
  //
  // Examples:
  // URL: "https://myapp.com/dashboard?tab=settings"
  // → pathname = "/dashboard" (excludes query params)
  // → origin = "https://myapp.com" (excludes path and params)
  const { pathname, origin } = new URL(request.url);

  /**
   * STEP 3 & 4: REDIRECT LOGIC FOR AUTHENTICATED USERS
   *
   * Flow Logic:
   * - IF user is logged in (userId exists)
   * - AND they're trying to access a public route (sign-in, sign-up, etc.)
   * - AND it's not the home page (pathname !== "/")
   * - THEN redirect them to dashboard
   *
   * Purpose: Prevent logged-in users from accessing authentication pages
   *
   * Example scenarios:
   * ✅ Logged-in user visits "/" → Allow (home page is fine)
   * ❌ Logged-in user visits "/sign-in" → Redirect to "/dashboard"
   * ❌ Logged-in user visits "/sign-up" → Redirect to "/dashboard"
   */
  if (userId && isPublicRoute(request) && pathname !== '/') {
    // Create redirect URL using origin to ensure correct domain
    // new URL("/dashboard", origin) creates: "https://yourdomain.com/dashboard"
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  /**
   * STEP 5: ROUTE PROTECTION LOGIC
   *
   * Flow Logic:
   * - IF the current route is NOT in the public routes list
   * - THEN require authentication
   *
   * What auth.protect() does:
   * - Checks if user is authenticated
   * - If authenticated: allows access to continue
   * - If NOT authenticated: automatically redirects to sign-in page
   * - If authentication fails: throws an error
   *
   * Example scenarios:
   * ✅ User visits "/dashboard" with valid session → Access granted
   * ❌ User visits "/dashboard" without session → Redirected to sign-in
   * ✅ User visits "/sign-in" → No protection needed (public route)
   */
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // STEP 6: Allow the request to continue
  // If we reach this point, either:
  // - User is accessing a public route (no protection needed)
  // - User is authenticated and accessing a protected route
  // - No redirects were necessary
  return NextResponse.next();
});

/**
 * Middleware Configuration - Controls when this middleware runs
 *
 * EXECUTION FLOW:
 * 1. Next.js checks if incoming request matches these patterns
 * 2. If match found → runs the middleware function above
 * 3. If no match → skips middleware entirely
 *
 * Matcher Patterns Explained:
 *
 * First matcher (Complex Regex):
 * "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
 *
 * Translation: "Match all routes EXCEPT:"
 * - _next (Next.js internal files)
 * - Static files (.css, .js, .png, .jpg, etc.)
 *
 * Why skip these?
 * - Performance: Static files don't need authentication
 * - Functionality: Next.js internals must work without interference
 *
 * Second matcher:
 * "/(api|trpc)(.*)"
 *
 * Translation: "Always match API routes"
 * - /api/* → All API endpoints
 * - /trpc/* → All tRPC endpoints
 *
 * Why include these?
 * - Security: API routes need authentication checks
 * - Data protection: Prevent unauthorized API access
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

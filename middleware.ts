import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Route configuration type
type RouteConfig = {
  publicRoutes: string[];
  privateRoutes: string[];
  apiRoutes: {
    public: string[];
    private: string[];
  };
  timestamp: number;
};
// Load route configuration with better error handling
let routeConfig: RouteConfig | null = null;
try {
  routeConfig = require('./route-config.json');
  console.log('✅ Route configuration loaded successfully');
} catch (error) {
  console.warn('⚠️ Route configuration not found, using fallback');
  routeConfig = {
    publicRoutes: ['/share', '/login', '/logout', '/auth/callback'],
    privateRoutes: [
      '/',
      '/admin/change-logo',
      '/admin/chunk-size',
      '/admin/logs-analysis',
      '/admin/models',
      '/admin/retriever-status',
      '/batch',
      '/categories',
      '/documents',
      '/prompt-library'
    ],
    apiRoutes: {
      public: [
        '/api/auth/authenticateUser',
        '/api/auth/getLogo',
        '/api/auth/sharePublicChat',
        '/api/health'
      ],
      private: []
    },
    timestamp: Date.now(),
  };
}
// Static routes that don't need authentication checks
const STATIC_ROUTES = ['/_next', '/favicon.ico', '/api/health'];
// Routes that authenticated users should be redirected away from
const AUTH_REDIRECT_ROUTES = ['/login', '/logout'];
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip middleware for static files and assets
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }
  // Get authentication status
  const authStatus = getAuthenticationStatus(request);
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware check:', {
      pathname,
      isAuthenticated: authStatus.isAuthenticated,
      source: authStatus.source
    });
  }
  // Handle API routes
  if (pathname.startsWith('/api')) {
    return handleApiRoute(request, authStatus, pathname);
  }
  // Handle page routes
  return handlePageRoute(request, pathname, authStatus);
}
function shouldSkipMiddleware(pathname: string): boolean {
  return (
    STATIC_ROUTES.some(route => pathname.startsWith(route)) ||
    pathname.includes('.') ||
    Boolean(pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot)$/))
  );
}
function getAuthenticationStatus(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value;
  const msalAccount = request.cookies.get('msal.account')?.value;
  const userIdHeader = request.headers.get('x-user-id') || request.headers.get('user-id');
  let isAuthenticated = false;
  let source = 'none';
  let effectiveUserId = null;
  if (userId) {
    isAuthenticated = true;
    source = 'cookie';
    effectiveUserId = userId;
  } else if (msalAccount) {
    isAuthenticated = true;
    source = 'msal-cookie';
    effectiveUserId = msalAccount;
  } else if (userIdHeader) {
    isAuthenticated = true;
    source = 'header';
    effectiveUserId = userIdHeader;
  }
  return { isAuthenticated, source, effectiveUserId };
}
function handleApiRoute(
  request: NextRequest,
  authStatus: { isAuthenticated: boolean; effectiveUserId: string | null },
  pathname: string
): NextResponse {
  // Check if it's a public API route
  if (isPublicApiRoute(pathname)) {
    console.log('🌐 Public API route:', pathname);
    return NextResponse.next();
  }
  // For private API routes, require authentication
  if (!authStatus.isAuthenticated || !authStatus.effectiveUserId) {
    console.log('❌ API auth failed:', pathname);
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Valid authentication token required'
      },
      { status: 401 }
    );
  }
  // Validate userId format
  if (!isValidUserId(authStatus.effectiveUserId)) {
    console.log('❌ Invalid user ID format');
    return NextResponse.json(
      {
        error: 'Invalid authentication',
        message: 'Authentication token format is invalid'
      },
      { status: 401 }
    );
  }
  console.log('✅ API auth successful');
  // Add user ID to response headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', authStatus.effectiveUserId);
  addSecurityHeaders(response);
  return response;
}
function handlePageRoute(
  request: NextRequest,
  pathname: string,
  authStatus: { isAuthenticated: boolean }
): NextResponse {
  const routeType = determineRouteType(pathname);
  if (authStatus.isAuthenticated) {
    // Redirect authenticated users away from auth pages
    if (AUTH_REDIRECT_ROUTES.includes(pathname)) {
      const returnUrl = request.nextUrl.searchParams.get('returnUrl');
      const redirectUrl = getValidReturnUrl(returnUrl) || '/';
      console.log(`Redirecting authenticated user from ${pathname} to ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Allow access to all routes for authenticated users
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }
  // Handle unauthenticated users
  if (routeType === 'private') {
    const loginUrl = new URL('/login', request.url);
    // Set returnUrl for non-auth routes
    if (!AUTH_REDIRECT_ROUTES.includes(pathname) && pathname !== '/') {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    console.log(`Redirecting unauthenticated user from ${pathname} to login`);
    return NextResponse.redirect(loginUrl);
  }
  if (routeType === 'public') {
    console.log(`Allowing access to public route: ${pathname}`);
    return NextResponse.next();
  }
  // Unknown route - treat as private
  console.log(`Unknown route: ${pathname}, treating as private`);
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnUrl', pathname);
  return NextResponse.redirect(loginUrl);
}
function isPublicApiRoute(pathname: string): boolean {
  if (!routeConfig) return false;
  return routeConfig.apiRoutes.public.some(route =>
    pathname === route || pathname.startsWith(route.replace(/\[.*\]/g, ''))
  );
}
function determineRouteType(pathname: string): 'public' | 'private' | 'unknown' {
  if (!routeConfig) return 'private';
  // Exact match first
  if (routeConfig.publicRoutes.includes(pathname)) {
    return 'public';
  }
  if (routeConfig.privateRoutes.includes(pathname)) {
    return 'private';
  }
  // Check for nested routes
  const isPublicNested = routeConfig.publicRoutes.some(route =>
    route !== '/' && pathname.startsWith(route + '/')
  );
  const isPrivateNested = routeConfig.privateRoutes.some(route =>
    route !== '/' && pathname.startsWith(route + '/')
  );
  if (isPublicNested) return 'public';
  if (isPrivateNested) return 'private';
  // Default to private for security
  return 'private';
}
function getValidReturnUrl(returnUrl: string | null): string | null {
  if (!returnUrl) return null;
  // Ensure returnUrl is safe
  if (!returnUrl.startsWith('/') ||
    returnUrl.startsWith('//') ||
    AUTH_REDIRECT_ROUTES.includes(returnUrl)) {
    return null;
  }
  return returnUrl;
}
function isValidUserId(userId: string): boolean {
  if (!userId || userId.length < 10) return false;
  // Check for GUID format or other valid formats
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(userId) || userId.length >= 10;
}
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // MSAL-specific headers
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};
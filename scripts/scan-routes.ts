import fs from 'fs';
import path from 'path';
interface RouteConfig {
  publicRoutes: string[];
  privateRoutes: string[];
  apiRoutes: {
    public: string[];
    private: string[];
  };
  timestamp: number;
}
export function scanAppRoutes(): RouteConfig {
  const appDir = path.join(process.cwd(), 'app');
  const publicRoutes: string[] = [];
  const privateRoutes: string[] = [];
  const publicApiRoutes: string[] = [];
  const privateApiRoutes: string[] = [];
  console.log('🔍 Scanning routes in:', appDir);
  console.log('🔐 MSAL Auth-aware scanning enabled');
  if (!fs.existsSync(appDir)) {
    throw new Error(`App directory not found: ${appDir}`);
  }
  try {
    const routeGroupResults = scanRouteGroups(appDir);
    publicRoutes.push(...routeGroupResults.public);
    privateRoutes.push(...routeGroupResults.private);
    const apiResults = scanAllApiRoutes(appDir);
    publicApiRoutes.push(...apiResults.public);
    privateApiRoutes.push(...apiResults.private);
    const standaloneResults = scanStandaloneRoutes(appDir, publicRoutes, privateRoutes);
    publicRoutes.push(...standaloneResults.public);
    privateRoutes.push(...standaloneResults.private);
    handleRootRoute(appDir, publicRoutes, privateRoutes);
    validateMsalRoutes(publicRoutes, privateRoutes);
  } catch (error) {
    console.error('❌ Error scanning routes:', error);
    throw error;
  }
  const config = {
    publicRoutes: [...new Set(publicRoutes)].sort(),
    privateRoutes: [...new Set(privateRoutes)].sort(),
    apiRoutes: {
      public: [...new Set(publicApiRoutes)].sort(),
      private: [...new Set(privateApiRoutes)].sort(),
    },
    timestamp: Date.now(),
  };
  console.log('\n✅ Final route configuration:');
  console.log('📂 Public routes:', config.publicRoutes);
  console.log('🔒 Private routes:', config.privateRoutes);
  return config;
}
function scanRouteGroups(appDir: string): { public: string[]; private: string[] } {
  const publicRoutes: string[] = [];
  const privateRoutes: string[] = [];
  const publicDir = path.join(appDir, '(public)');
  if (fs.existsSync(publicDir)) {
    console.log('📂 Scanning (public) route group...');
    const routes = scanRouteGroup(publicDir);
    publicRoutes.push(...routes);
    console.log(`   Found ${routes.length} public routes:`, routes);
  }
  const privateDir = path.join(appDir, '(private)');
  if (fs.existsSync(privateDir)) {
    console.log('🔒 Scanning (private) route group...');
    const routes = scanRouteGroup(privateDir);
    privateRoutes.push(...routes);
    console.log(`   Found ${routes.length} private routes:`, routes);
  }
  return { public: publicRoutes, private: privateRoutes };
}
function scanRouteGroup(groupDir: string, basePath = ''): string[] {
  const routes: string[] = [];
  try {
    const entries = fs.readdirSync(groupDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('_') || (entry.name.startsWith('(') && entry.name.endsWith(')'))) {
        continue;
      }
      const fullPath = path.join(groupDir, entry.name);
      const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      if (hasPageFile(fullPath)) {
        routes.push(`/${currentPath}`);
      }
      if (!entry.name.startsWith('[')) {
        const subRoutes = scanRouteGroup(fullPath, currentPath);
        routes.push(...subRoutes);
      } else {
        const subRoutes = scanRouteGroup(fullPath, currentPath);
        routes.push(...subRoutes);
      }
    }
  } catch (error) {
    console.error(`Error scanning route group ${groupDir}:`, error);
  }
  return routes;
}
function scanStandaloneRoutes(appDir: string, existingPublic: string[], existingPrivate: string[]): { public: string[]; private: string[] } {
  const publicRoutes: string[] = [];
  const privateRoutes: string[] = [];
  console.log('🔍 Scanning standalone routes...');
  const msalPublicRoutes = [
    'login',
    'logout',
    'auth',
    'share'
  ];
  try {
    const entries = fs.readdirSync(appDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() ||
        entry.name.startsWith('(') ||
        entry.name.startsWith('_') ||
        entry.name === 'api') {
        continue;
      }
      const routePath = path.join(appDir, entry.name);
      const routeName = entry.name;
      const allRoutesInDir = scanDirectoryRecursively(routePath, routeName);
      if (allRoutesInDir.length === 0) {
        continue;
      }
      const isPublicRoute = msalPublicRoutes.includes(routeName);
      const newRoutes = allRoutesInDir.filter(route =>
        !existingPublic.includes(route) && !existingPrivate.includes(route)
      );
      if (newRoutes.length === 0) {
        console.log(`   ℹ️  Routes in /${routeName} already found in route groups`);
        continue;
      }
      if (isPublicRoute) {
        publicRoutes.push(...newRoutes);
        console.log(`🔑 Added public routes from /${routeName}:`, newRoutes);
      } else {
        privateRoutes.push(...newRoutes);
        console.log(`🔒 Added private routes from /${routeName}:`, newRoutes);
      }
    }
  } catch (error) {
    console.error('Error scanning standalone routes:', error);
  }
  return { public: publicRoutes, private: privateRoutes };
}
function scanDirectoryRecursively(dir: string, basePath: string): string[] {
  const routes: string[] = [];
  try {
    if (hasPageFile(dir)) {
      routes.push(`/${basePath}`);
    }
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() &&
          !entry.name.startsWith('_') &&
          !entry.name.startsWith('(')) {
          const subDir = path.join(dir, entry.name);
          const subPath = `${basePath}/${entry.name}`;
          const subRoutes = scanDirectoryRecursively(subDir, subPath);
          routes.push(...subRoutes);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  return routes;
}
function handleRootRoute(appDir: string, publicRoutes: string[], privateRoutes: string[]): void {
  console.log('🏠 Checking for root route...');
  if (publicRoutes.includes('/') || privateRoutes.includes('/')) {
    console.log('   ✅ Root route already found');
    return;
  }
  const pageFiles = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];
  for (const file of pageFiles) {
    if (fs.existsSync(path.join(appDir, file))) {
      privateRoutes.push('/');
      console.log(`   ✅ Found root page: app/${file} - added as private route`);
      return;
    }
  }
  const routeGroupDirs = ['(private)', '(public)', '(app)', '(main)'];
  for (const groupDir of routeGroupDirs) {
    const groupPath = path.join(appDir, groupDir);
    if (fs.existsSync(groupPath)) {
      for (const file of pageFiles) {
        if (fs.existsSync(path.join(groupPath, file))) {
          if (groupDir === '(public)') {
            publicRoutes.push('/');
            console.log(`   ✅ Found root page: app/${groupDir}/${file} - added as public route`);
          } else {
            privateRoutes.push('/');
            console.log(`   ✅ Found root page: app/${groupDir}/${file} - added as private route`);
          }
          return;
        }
      }
    }
  }
  console.log('   ⚠️  No root page found');
}
function scanAllApiRoutes(appDir: string): { public: string[]; private: string[] } {
  const publicApi: string[] = [];
  const privateApi: string[] = [];
  const apiDir = path.join(appDir, 'api');
  if (fs.existsSync(apiDir)) {
    console.log('🚀 Scanning API routes...');
    const results = scanApiRoutes(apiDir);
    publicApi.push(...results.public);
    privateApi.push(...results.private);
    console.log(`   Found ${results.public.length} public API routes`);
    console.log(`   Found ${results.private.length} private API routes`);
  }
  return { public: publicApi, private: privateApi };
}
function scanApiRoutes(apiDir: string, basePath = ''): { public: string[]; private: string[] } {
  const publicApi: string[] = [];
  const privateApi: string[] = [];
  try {
    const entries = fs.readdirSync(apiDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(apiDir, entry.name);
      if (entry.isDirectory()) {
        const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
        if (hasApiFile(fullPath)) {
          const apiRoute = `/api/${currentPath}`;
          if (isPublicApiRoute(apiRoute)) {
            publicApi.push(apiRoute);
          } else {
            privateApi.push(apiRoute);
          }
        }
        const subRoutes = scanApiRoutes(fullPath, currentPath);
        publicApi.push(...subRoutes.public);
        privateApi.push(...subRoutes.private);
      } else if (isApiFile(entry.name)) {
        const route = basePath ? `/api/${basePath}` : '/api';
        if (isPublicApiRoute(route)) {
          publicApi.push(route);
        } else {
          privateApi.push(route);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning API routes ${apiDir}:`, error);
  }
  return { public: publicApi, private: privateApi };
}
function validateMsalRoutes(publicRoutes: string[], privateRoutes: string[]): void {
  console.log('\n🔐 Validating MSAL authentication requirements...');
  const requiredPublicRoutes = ['/login', '/logout'];
  const recommendedPublicRoutes = ['/auth/callback', '/share'];
  for (const route of requiredPublicRoutes) {
    if (!publicRoutes.includes(route)) {
      console.log(`❌ MISSING REQUIRED: ${route} should be a public route`);
    } else {
      console.log(`✅ FOUND REQUIRED: ${route}`);
    }
  }
  for (const route of recommendedPublicRoutes) {
    if (!publicRoutes.includes(route)) {
      console.log(`⚠️  MISSING RECOMMENDED: ${route} should be a public route`);
    } else {
      console.log(`✅ FOUND RECOMMENDED: ${route}`);
    }
  }
  if (!publicRoutes.includes('/') && !privateRoutes.includes('/')) {
    console.log(`❌ MISSING: Root route (/) not found`);
  } else {
    const isPublic = publicRoutes.includes('/');
    console.log(`✅ FOUND: Root route (/) as ${isPublic ? 'public' : 'private'} route`);
  }
}
function isPublicApiRoute(route: string): boolean {
  const publicApiPatterns = [
    '/api/auth',
    '/api/health',
    '/api/status',
    '/api/public',
  ];
  return publicApiPatterns.some(pattern => route.startsWith(pattern));
}
function hasPageFile(dir: string): boolean {
  const pageFiles = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];
  return pageFiles.some(file => fs.existsSync(path.join(dir, file)));
}
function hasApiFile(dir: string): boolean {
  const apiFiles = ['route.ts', 'route.js'];
  return apiFiles.some(file => fs.existsSync(path.join(dir, file)));
}
function isApiFile(fileName: string): boolean {
  return /^route\.(ts|js)$/.test(fileName);
}
export function generateRouteConfig(): void {
  console.log('🚀 Starting MSAL-aware route scan...\n');
  const config = scanAppRoutes();
  const configPath = path.join(process.cwd(), 'route-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('\n✅ Route scanning complete!');
  console.log('📊 Summary:');
  console.log(`   📂 Public routes: ${config.publicRoutes.length}`);
  console.log(`   🔒 Private routes: ${config.privateRoutes.length}`);
  console.log(`   🌐 Public API routes: ${config.apiRoutes.public.length}`);
  console.log(`   🔐 Private API routes: ${config.apiRoutes.private.length}`);
  console.log(`   💾 Config saved to: ${configPath}\n`);
  if (config.publicRoutes.length > 0) {
    console.log('📂 Public Routes:');
    config.publicRoutes.forEach(route => console.log(`   ${route}`));
    console.log();
  }
  if (config.privateRoutes.length > 0) {
    console.log('🔒 Private Routes:');
    config.privateRoutes.forEach(route => console.log(`   ${route}`));
    console.log();
  }
  if (config.apiRoutes.public.length > 0) {
    console.log('🌐 Public API Routes:');
    config.apiRoutes.public.forEach(route => console.log(`   ${route}`));
    console.log();
  }
  if (config.apiRoutes.private.length > 0) {
    console.log('🔐 Private API Routes:');
    config.apiRoutes.private.forEach(route => console.log(`   ${route}`));
  }
}
if (require.main === module) {
  generateRouteConfig();
}
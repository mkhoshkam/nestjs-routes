import * as path from 'path';
import { existsSync } from 'fs';
import 'reflect-metadata';

export interface RouteInfo {
  method: string;
  path: string;
  handler: string;
}

export interface RouteMap {
  [controllerName: string]: RouteInfo[];
}

export interface ScanOptions {
  appPath: string;
  className: string;
  json?: boolean;
  prefix?: string;
}

export interface RouteMetadata {
  path: string;
  method: string;
}

// Constants for NestJS metadata keys
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';
const MODULE_METADATA = {
  CONTROLLERS: 'controllers',
  IMPORTS: 'imports',
};

// HTTP method constants mapping (NestJS uses numeric values)
const REQUEST_METHOD_MAP: { [key: number]: string } = {
  0: 'GET',
  1: 'POST',
  2: 'PUT',
  3: 'DELETE',
  4: 'PATCH',
  5: 'OPTIONS',
  6: 'HEAD',
  7: 'ALL',
};

function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
}

async function loadModule(modulePath: string): Promise<any> {
  try {
    // Try different import strategies for compatibility
    
    // First attempt: Direct ES module import (works for compiled JS and modern TS setups)
    try {
      const fileUrl = `file://${modulePath}`;
      const mod = await import(fileUrl);
      return mod;
    } catch (urlError) {
      // If file:// URL fails, try direct path
      try {
        const mod = await import(modulePath);
        return mod;
      } catch (directError) {
        // If both fail and it's a TypeScript file, try with ts-node registration
        if (modulePath.endsWith('.ts')) {
          try {
            // Try to register ts-node if available
            try {
              require('ts-node/register');
            } catch {
              // ts-node not available, that's ok
            }
            
            // Try requiring the module (works for CommonJS)
            delete require.cache[require.resolve(modulePath)];
            const mod = require(modulePath);
            return mod;
          } catch (requireError) {
            throw new Error(`Failed to load module: ${directError instanceof Error ? directError.message : String(directError)}`);
          }
        }
        throw directError;
      }
    }
  } catch (error) {
    throw new Error(`Cannot load module "${modulePath}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function listRoutes(options: ScanOptions) {
  const { appPath, className, json, prefix } = options;

  const absPath = path.resolve(process.cwd(), appPath);
  if (!existsSync(absPath)) {
    console.error(`❌ Cannot find file: ${absPath}`);
    if (isTestEnvironment()) {
      throw new Error(`Cannot find file: ${absPath}`);
    }
    process.exit(1);
  }

  try {
    const mod = await loadModule(absPath);
    const AppModule = mod[className] || mod.default?.[className] || mod.default;
    
    if (!AppModule) {
      console.error(`❌ Cannot find class "${className}" in ${absPath}`);
      console.error(`Available exports: ${Object.keys(mod).join(', ')}`);
      if (mod.default) {
        console.error(`Default export keys: ${Object.keys(mod.default).join(', ')}`);
      }
      if (isTestEnvironment()) {
        throw new Error(`Cannot find class "${className}" in ${absPath}`);
      }
      process.exit(1);
    }

    const routeMap = await extractRoutesFromModule(AppModule, prefix);

    if (json) {
      console.log(JSON.stringify(routeMap, null, 2));
    } else {
      displayRoutes(routeMap);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide more helpful error messages for common issues
    if (errorMessage.includes('Cannot use import statement outside a module')) {
      console.error('❌ Module system compatibility issue detected.');
      console.error('💡 Suggestions:');
      console.error('   1. Try compiling your TypeScript files first: npm run build');
      console.error('   2. Point to the compiled JS file: --app ./dist/app.module.js');
      console.error('   3. Ensure your tsconfig.json is compatible with Node.js');
      console.error(`   4. Original error: ${errorMessage}`);
    } else if (errorMessage.includes('Cannot resolve module')) {
      console.error('❌ Module resolution failed.');
      console.error('💡 Suggestions:');
      console.error('   1. Check if the file path is correct');
      console.error('   2. Make sure all dependencies are installed');
      console.error('   3. Try using an absolute path');
      console.error(`   4. Original error: ${errorMessage}`);
    } else {
      console.error('❌ Error during route extraction:', errorMessage);
    }
    
    if (isTestEnvironment()) {
      throw error;
    }
    process.exit(1);
  }
}

async function extractRoutesFromModule(moduleClass: any, prefix?: string): Promise<RouteMap> {
  const routeMap: RouteMap = {};
  const processedModules = new Set();
  
  await processModule(moduleClass, routeMap, processedModules, prefix);
  
  return routeMap;
}

async function processModule(moduleClass: any, routeMap: RouteMap, processedModules: Set<any>, prefix?: string): Promise<void> {
  if (!moduleClass || processedModules.has(moduleClass)) {
    return;
  }
  
  processedModules.add(moduleClass);
  
  try {
    // Extract controllers from this module
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, moduleClass) || [];
    
    for (const controller of controllers) {
      if (typeof controller === 'function') {
        const routes = extractControllerRoutes(controller, prefix);
        if (routes.length > 0) {
          const ctrlName = controller.name;
          routeMap[ctrlName] = routes;
        }
      }
    }

    // Process imported modules recursively
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleClass) || [];
    
    for (const importedModule of imports) {
      if (typeof importedModule === 'function') {
        // Simple module class
        await processModule(importedModule, routeMap, processedModules, prefix);
      } else if (importedModule && typeof importedModule === 'object') {
        // Dynamic module or module with options
        if (importedModule.module && typeof importedModule.module === 'function') {
          await processModule(importedModule.module, routeMap, processedModules, prefix);
        }
      }
    }
  } catch (error) {
    // Silently skip modules that can't be processed
    // This helps avoid issues with dynamic modules or complex configurations
  }
}

function extractControllerRoutes(controller: any, prefix?: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  if (!controller || typeof controller !== 'function') {
    return routes;
  }

  const ctrlName = controller.name;
  const basePath = Reflect.getMetadata(PATH_METADATA, controller) || '';

  // Get all methods from the controller prototype
  const prototype = controller.prototype;
  if (!prototype) return routes;

  const methodNames = Object.getOwnPropertyNames(prototype)
    .filter(name => {
      if (name === 'constructor') return false;
      
      const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
      return descriptor && typeof descriptor.value === 'function';
    });

  for (const methodName of methodNames) {
    try {
      const method = prototype[methodName];
      const routePath = Reflect.getMetadata(PATH_METADATA, method);
      const httpMethod = Reflect.getMetadata(METHOD_METADATA, method);

      if (routePath !== undefined && httpMethod !== undefined) {
        const fullPath = buildRoutePath(prefix, basePath, routePath);

        routes.push({
          method: REQUEST_METHOD_MAP[httpMethod] || httpMethod.toString().toUpperCase(),
          path: fullPath,
          handler: `${ctrlName}.${methodName}`,
        });
      }
    } catch (error) {
      // Skip methods that can't be processed
      continue;
    }
  }

  return routes;
}

function buildRoutePath(prefix?: string, basePath?: string, routePath?: string): string {
  const parts = [prefix, basePath, routePath].filter(Boolean);
  const fullPath = '/' + parts.join('/').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
  return fullPath === '' ? '/' : fullPath;
}

function displayRoutes(routeMap: RouteMap): void {
  console.log(`\n📍 NestJS Routes\n`);

  const controllers = Object.keys(routeMap).sort();

  if (controllers.length === 0) {
    console.log('🔍 No routes found. Make sure your controllers have proper decorators.');
    return;
  }

  controllers.forEach((ctrl) => {
    const routes = routeMap[ctrl];
    console.log(`🔸 ${ctrl}`);

    routes
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach((route) => {
        console.log(`   ${route.method.padEnd(7)} ${route.path}`);
      });

    console.log('');
  });

  const totalRoutes = controllers.reduce((sum, ctrl) => sum + routeMap[ctrl].length, 0);
  console.log(`📊 Found ${totalRoutes} routes across ${controllers.length} controllers\n`);
}
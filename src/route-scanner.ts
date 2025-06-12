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
    const mod = await import(absPath);
    const AppModule = mod[className];
    if (!AppModule) {
      console.error(`❌ Cannot find class "${className}" in ${absPath}`);
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
    console.error('❌ Error during route extraction:', error instanceof Error ? error.message : error);
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
import { NestFactory } from '@nestjs/core';
import * as path from 'path';
import { existsSync } from 'fs';

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

  const mod = await import(absPath);
  const AppModule = mod[className];
  if (!AppModule) {
    console.error(`❌ Cannot find class "${className}" in ${absPath}`);
    if (isTestEnvironment()) {
      throw new Error(`Cannot find class "${className}" in ${absPath}`);
    }
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const routeMap = await extractRoutes(app, prefix);

    if (json) {
      console.log(JSON.stringify(routeMap, null, 2));
    } else {
      displayRoutes(routeMap);
    }

    await app.close();
  } catch (error) {
    await app.close();
    throw error;
  }
}

async function extractRoutes(app: any, prefix?: string): Promise<RouteMap> {
  const container = app.container;
  const modules = container?.getModules ? container.getModules() : new Map();
  const routeMap: RouteMap = {};

  modules.forEach((mod: any) => {
    if (mod.controllers) {
      mod.controllers.forEach((wrapper: any) => {
        const controller = wrapper.instance;
        if (!controller) return;

        const routes = extractControllerRoutes(controller, prefix);
        if (routes.length > 0) {
          const ctrlName = controller.constructor.name;
          routeMap[ctrlName] = routes;
        }
      });
    }
  });

  return routeMap;
}

function extractControllerRoutes(controller: any, prefix?: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const ctrlName = controller.constructor.name;
  const basePath = Reflect.getMetadata('path', controller.constructor) || '';

  const proto = Object.getPrototypeOf(controller);
  Object.getOwnPropertyNames(proto)
    .filter((m) => m !== 'constructor' && typeof proto[m] === 'function')
    .forEach((methodName) => {
      const routePath = Reflect.getMetadata('path', proto[methodName]);
      const httpMethod = Reflect.getMetadata('method', proto[methodName]);

      if (routePath !== undefined && httpMethod !== undefined) {
        const fullPath = buildRoutePath(prefix, basePath, routePath);

        routes.push({
          method: httpMethod.toString().toUpperCase(),
          path: fullPath,
          handler: `${ctrlName}.${methodName}`,
        });
      }
    });

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
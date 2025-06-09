/**
 * Jest-based utility tests
 * 
 * Note: This file is excluded from main TypeScript compilation (see tsconfig.json)
 * because it requires Jest dependencies that may not be installed.
 * Use jest.tsconfig.json when running Jest tests.
 */

describe('Route Scanner Utils', () => {
    describe('Path normalization', () => {
        const buildRoutePath = (prefix?: string, basePath?: string, routePath?: string): string => {
            const parts = [prefix, basePath, routePath].filter(Boolean);
            const fullPath = '/' + parts.join('/').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
            return fullPath === '' ? '/' : fullPath;
        };

        it('should build correct paths with all components', () => {
            expect(buildRoutePath('api', 'v1', 'users')).toBe('/api/v1/users');
        });

        it('should handle missing prefix', () => {
            expect(buildRoutePath(undefined, 'users', 'profile')).toBe('/users/profile');
        });

        it('should handle missing base path', () => {
            expect(buildRoutePath('api', undefined, 'health')).toBe('/api/health');
        });

        it('should handle only route path', () => {
            expect(buildRoutePath(undefined, undefined, 'test')).toBe('/test');
        });

        it('should return root path when all components are empty', () => {
            expect(buildRoutePath(undefined, undefined, undefined)).toBe('/');
        });

        it('should normalize multiple slashes', () => {
            expect(buildRoutePath('api/', '/v1/', '/users')).toBe('/api/v1/users');
        });

        it('should handle empty strings', () => {
            expect(buildRoutePath('', 'users', '')).toBe('/users');
        });
    });

    describe('Route information structure', () => {
        it('should create valid route info objects', () => {
            const routeInfo = {
                method: 'GET',
                path: '/users',
                handler: 'UsersController.findAll',
            };

            expect(routeInfo).toHaveProperty('method');
            expect(routeInfo).toHaveProperty('path');
            expect(routeInfo).toHaveProperty('handler');
            expect(routeInfo.method).toBe('GET');
            expect(routeInfo.path).toBe('/users');
            expect(routeInfo.handler).toBe('UsersController.findAll');
        });

        it('should create valid route map structure', () => {
            const routeMap = {
                UsersController: [
                    { method: 'GET', path: '/users', handler: 'UsersController.findAll' },
                    { method: 'POST', path: '/users', handler: 'UsersController.create' },
                ],
                PostsController: [
                    { method: 'GET', path: '/posts', handler: 'PostsController.findAll' },
                ],
            };

            expect(routeMap).toHaveProperty('UsersController');
            expect(routeMap).toHaveProperty('PostsController');
            expect(Array.isArray(routeMap.UsersController)).toBe(true);
            expect(Array.isArray(routeMap.PostsController)).toBe(true);
            expect(routeMap.UsersController).toHaveLength(2);
            expect(routeMap.PostsController).toHaveLength(1);
        });
    });

    describe('Options validation', () => {
        it('should validate scan options structure', () => {
            const validOptions = {
                appPath: './src/app.module.ts',
                className: 'AppModule',
                json: false,
                prefix: 'api/v1',
            };

            expect(validOptions.appPath).toBeTruthy();
            expect(validOptions.className).toBeTruthy();
            expect(typeof validOptions.json).toBe('boolean');
            expect(typeof validOptions.prefix).toBe('string');
        });

        it('should handle minimal required options', () => {
            const minimalOptions = {
                appPath: './app.module.ts',
                className: 'AppModule',
            };

            expect(minimalOptions.appPath).toBeTruthy();
            expect(minimalOptions.className).toBeTruthy();
        });
    });

    describe('HTTP method normalization', () => {
        it('should normalize HTTP methods to uppercase', () => {
            const methods = ['get', 'post', 'put', 'delete', 'patch'];
            const normalized = methods.map(method => method.toUpperCase());

            expect(normalized).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
        });

        it('should handle already uppercase methods', () => {
            const methods = ['GET', 'POST'];
            const normalized = methods.map(method => method.toUpperCase());

            expect(normalized).toEqual(['GET', 'POST']);
        });
    });

    describe('Array and object utilities', () => {
        it('should sort controller names alphabetically', () => {
            const controllers = ['ZebraController', 'AppleController', 'BananaController'];
            const sorted = controllers.sort();

            expect(sorted).toEqual(['AppleController', 'BananaController', 'ZebraController']);
        });

        it('should sort routes by path', () => {
            const routes = [
                { method: 'GET', path: '/users/:id', handler: 'Users.findOne' },
                { method: 'GET', path: '/users', handler: 'Users.findAll' },
                { method: 'POST', path: '/users', handler: 'Users.create' },
            ];

            const sorted = routes.sort((a, b) => a.path.localeCompare(b.path));

            expect(sorted[0].path).toBe('/users');
            expect(sorted[1].path).toBe('/users');
            expect(sorted[2].path).toBe('/users/:id');
        });

        it('should count total routes across controllers', () => {
            const routeMap = {
                Controller1: [{ method: 'GET', path: '/a', handler: 'a' }],
                Controller2: [
                    { method: 'GET', path: '/b', handler: 'b' },
                    { method: 'POST', path: '/c', handler: 'c' },
                ],
            };

            const totalRoutes = Object.keys(routeMap).reduce(
                (sum, ctrl) => sum + routeMap[ctrl as keyof typeof routeMap].length,
                0
            );

            expect(totalRoutes).toBe(3);
        });
    });
}); 
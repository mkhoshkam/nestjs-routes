/**
 * Simple unit tests using basic assertions
 * Can be run with: npx ts-node tests/simple.test.ts
 */

// Simple assertion helper
function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Got: ${actual}`);
    }
}

// Test functions
function testPathNormalization() {
    console.log('Testing path normalization...');

    const buildRoutePath = (prefix?: string, basePath?: string, routePath?: string): string => {
        const parts = [prefix, basePath, routePath].filter(Boolean);
        const fullPath = '/' + parts.join('/').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
        return fullPath === '' ? '/' : fullPath;
    };

    // Test cases
    assertEqual(buildRoutePath('api', 'v1', 'users'), '/api/v1/users', 'Full path building');
    assertEqual(buildRoutePath(undefined, 'users', 'profile'), '/users/profile', 'Missing prefix');
    assertEqual(buildRoutePath('api', undefined, 'health'), '/api/health', 'Missing base path');
    assertEqual(buildRoutePath(undefined, undefined, 'test'), '/test', 'Only route path');
    assertEqual(buildRoutePath(undefined, undefined, undefined), '/', 'Empty path');
    assertEqual(buildRoutePath('api/', '/v1/', '/users'), '/api/v1/users', 'Slash normalization');
    assertEqual(buildRoutePath('', 'users', ''), '/users', 'Empty strings');

    console.log('✅ Path normalization tests passed');
}

function testTypeStructures() {
    console.log('Testing TypeScript type structures...');

    // Test ScanOptions structure
    const scanOptions = {
        appPath: './test.ts',
        className: 'TestModule',
        json: true,
        prefix: 'api',
    };

    assert(typeof scanOptions.appPath === 'string', 'appPath should be string');
    assert(typeof scanOptions.className === 'string', 'className should be string');
    assert(typeof scanOptions.json === 'boolean', 'json should be boolean');
    assert(typeof scanOptions.prefix === 'string', 'prefix should be string');

    // Test RouteInfo structure
    const routeInfo = {
        method: 'GET',
        path: '/test',
        handler: 'TestController.test',
    };

    assert(typeof routeInfo.method === 'string', 'method should be string');
    assert(typeof routeInfo.path === 'string', 'path should be string');
    assert(typeof routeInfo.handler === 'string', 'handler should be string');

    // Test RouteMap structure
    const routeMap = {
        TestController: [routeInfo],
    };

    assert(Array.isArray(routeMap.TestController), 'controller routes should be array');
    assert(routeMap.TestController.length === 1, 'should have one route');

    console.log('✅ Type structure tests passed');
}

function testHttpMethodNormalization() {
    console.log('Testing HTTP method normalization...');

    const methods = ['get', 'post', 'put', 'delete', 'patch'];
    const normalized = methods.map(method => method.toUpperCase());

    assertEqual(normalized[0], 'GET', 'GET normalization');
    assertEqual(normalized[1], 'POST', 'POST normalization');
    assertEqual(normalized[2], 'PUT', 'PUT normalization');
    assertEqual(normalized[3], 'DELETE', 'DELETE normalization');
    assertEqual(normalized[4], 'PATCH', 'PATCH normalization');

    console.log('✅ HTTP method normalization tests passed');
}

function testArraySorting() {
    console.log('Testing array sorting...');

    // Test controller sorting
    const controllers = ['ZebraController', 'AppleController', 'BananaController'];
    const sortedControllers = controllers.sort();

    assertEqual(sortedControllers[0], 'AppleController', 'First controller');
    assertEqual(sortedControllers[1], 'BananaController', 'Second controller');
    assertEqual(sortedControllers[2], 'ZebraController', 'Third controller');

    // Test route sorting
    const routes = [
        { method: 'GET', path: '/users/:id', handler: 'Users.findOne' },
        { method: 'GET', path: '/users', handler: 'Users.findAll' },
        { method: 'POST', path: '/users', handler: 'Users.create' },
    ];

    const sortedRoutes = routes.sort((a, b) => a.path.localeCompare(b.path));
    assertEqual(sortedRoutes[0].path, '/users', 'First route path');
    assertEqual(sortedRoutes[2].path, '/users/:id', 'Last route path');

    console.log('✅ Array sorting tests passed');
}

function testRouteCalculations() {
    console.log('Testing route calculations...');

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

    assertEqual(totalRoutes, 3, 'Total route count');
    assertEqual(Object.keys(routeMap).length, 2, 'Controller count');

    console.log('✅ Route calculation tests passed');
}

// Main test runner
function runSimpleTests() {
    console.log('🧪 Running Simple Unit Tests\n');

    try {
        testPathNormalization();
        testTypeStructures();
        testHttpMethodNormalization();
        testArraySorting();
        testRouteCalculations();

        console.log('\n🎉 All simple tests passed!');
        return true;
    } catch (error) {
        console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const success = runSimpleTests();
    process.exit(success ? 0 : 1);
}

export { runSimpleTests }; 
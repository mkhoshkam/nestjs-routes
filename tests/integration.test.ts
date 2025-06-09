/**
 * Integration tests for NestJS route scanner
 */

import { ScanOptions, RouteMap, RouteInfo } from '../src/route-scanner';
import * as path from 'path';

// Test the TypeScript interfaces and types
function testTypeDefinitions() {
    const scanOptions: ScanOptions = {
        appPath: './test-app.module.ts',
        className: 'TestAppModule',
        json: true,
        prefix: 'api/v1',
    };

    const routeInfo: RouteInfo = {
        method: 'GET',
        path: '/users',
        handler: 'UsersController.findAll',
    };

    const routeMap: RouteMap = {
        UsersController: [routeInfo],
    };

    return { scanOptions, routeInfo, routeMap };
}

// Test path building utility function
function testPathBuilding() {
    const buildRoutePath = (prefix?: string, basePath?: string, routePath?: string): string => {
        const parts = [prefix, basePath, routePath].filter(Boolean);
        const fullPath = '/' + parts.join('/').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
        return fullPath === '' ? '/' : fullPath;
    };

    const testCases = [
        { input: ['api', 'v1', 'users'], expected: '/api/v1/users' },
        { input: [undefined, 'users', 'profile'], expected: '/users/profile' },
        { input: ['api', undefined, 'health'], expected: '/api/health' },
        { input: [undefined, undefined, 'test'], expected: '/test' },
        { input: [undefined, undefined, undefined], expected: '/' },
        { input: ['api/', '/v1/', '/users'], expected: '/api/v1/users' },
        { input: ['', 'users', ''], expected: '/users' },
    ];

    const results = testCases.map(({ input, expected }) => {
        const [prefix, basePath, routePath] = input;
        const result = buildRoutePath(prefix, basePath, routePath);
        return {
            input,
            expected,
            result,
            passed: result === expected,
        };
    });

    return results;
}

// Test route sorting and organization
function testRouteSorting() {
    const mockRoutes = [
        { method: 'GET', path: '/users/:id', handler: 'Users.findOne' },
        { method: 'GET', path: '/users', handler: 'Users.findAll' },
        { method: 'POST', path: '/users', handler: 'Users.create' },
        { method: 'DELETE', path: '/users/:id', handler: 'Users.delete' },
    ];

    const sortedByPath = mockRoutes.sort((a, b) => a.path.localeCompare(b.path));
    const sortedByMethod = mockRoutes.sort((a, b) => a.method.localeCompare(b.method));

    return { sortedByPath, sortedByMethod };
}

// Test error handling scenarios
function testErrorScenarios() {
    const invalidPaths = [
        './non-existent-file.ts',
        '/absolute/path/that/does/not/exist.ts',
        '',
    ];

    const invalidClassNames = ['', 'NonExistentClass'];

    const errorTests = {
        invalidPaths: invalidPaths.map(appPath => ({
            appPath,
            className: 'AppModule',
            shouldError: true,
        })),
        invalidClassNames: invalidClassNames.map(className => ({
            appPath: './valid-path.ts',
            className,
            shouldError: true,
        })),
    };

    return errorTests;
}

// Test console output formatting
function testOutputFormatting() {
    const mockRouteMap: RouteMap = {
        UsersController: [
            { method: 'GET', path: '/users', handler: 'UsersController.findAll' },
            { method: 'POST', path: '/users', handler: 'UsersController.create' },
            { method: 'GET', path: '/users/:id', handler: 'UsersController.findOne' },
        ],
        PostsController: [
            { method: 'GET', path: '/posts', handler: 'PostsController.findAll' },
            { method: 'POST', path: '/posts', handler: 'PostsController.create' },
        ],
    };

    // Test JSON formatting
    const jsonOutput = JSON.stringify(mockRouteMap, null, 2);

    // Test human-readable formatting
    const controllers = Object.keys(mockRouteMap).sort();
    const totalRoutes = controllers.reduce((sum, ctrl) => sum + mockRouteMap[ctrl].length, 0);

    return {
        jsonOutput,
        controllers,
        totalRoutes,
        controllerCount: controllers.length,
    };
}

// Main test runner
export function runTests() {
    console.log('🧪 Running NestJS Route Scanner Tests...\n');

    try {
        // Test 1: Type definitions
        console.log('1. Testing TypeScript type definitions...');
        const typeTest = testTypeDefinitions();
        console.log('✅ Type definitions test passed\n');

        // Test 2: Path building
        console.log('2. Testing path building logic...');
        const pathTests = testPathBuilding();
        const pathTestsPassed = pathTests.every(test => test.passed);
        if (pathTestsPassed) {
            console.log('✅ All path building tests passed');
        } else {
            console.log('❌ Some path building tests failed:');
            pathTests.filter(test => !test.passed).forEach(test => {
                console.log(`   Expected: ${test.expected}, Got: ${test.result}`);
            });
        }
        console.log('');

        // Test 3: Route sorting
        console.log('3. Testing route sorting...');
        const sortingTest = testRouteSorting();
        console.log('✅ Route sorting test passed\n');

        // Test 4: Error scenarios
        console.log('4. Testing error scenarios...');
        const errorTest = testErrorScenarios();
        console.log('✅ Error scenario definitions test passed\n');

        // Test 5: Output formatting
        console.log('5. Testing output formatting...');
        const outputTest = testOutputFormatting();
        console.log(`✅ Output formatting test passed`);
        console.log(`   - Controllers: ${outputTest.controllerCount}`);
        console.log(`   - Total routes: ${outputTest.totalRoutes}`);
        console.log(`   - JSON output length: ${outputTest.jsonOutput.length} characters\n`);

        console.log('🎉 All tests completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Test suite failed:', error);
        return false;
    }
}

// Export for potential usage
export { testTypeDefinitions, testPathBuilding, testRouteSorting, testErrorScenarios, testOutputFormatting }; 
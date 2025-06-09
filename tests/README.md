# Test Suite for NestJS Routes

This directory contains comprehensive tests for the NestJS route scanner package.

## Test Structure

### 📁 Files Overview

- **`simple.test.ts`** - Basic unit tests using custom assertions
- **`integration.test.ts`** - Integration tests for complex functionality
- **`run-tests.ts`** - Standalone test runner for integration tests
- **`utils.test.ts`** - Jest-based utility function tests
- **`route-scanner.test.ts`** - Jest-based comprehensive route scanner tests
- **`setup.ts`** - Jest test environment setup
- **`mocks/`** - Mock NestJS modules and controllers for testing

### 🏃‍♂️ Running Tests

#### Quick Tests (Recommended)

```bash
# Run all tests (simple + integration)
npm test

# Run only simple unit tests
npm run test:simple

# Run only integration tests
npm run test:integration
```

#### Jest Tests (When Dependencies Installed)

```bash
# Install Jest dependencies first
npm install

# Run Jest tests
npm run test:jest

# Run Jest with coverage
npm run test:coverage

# Run Jest in watch mode
npm run test:watch
```

#### Manual Test Execution

```bash
# Run simple tests directly
npx ts-node tests/simple.test.ts

# Run integration tests directly
npx ts-node tests/run-tests.ts
```

## Test Categories

### 🔧 Unit Tests (`simple.test.ts`)

Tests individual utility functions:

- Path normalization logic
- TypeScript type structures
- HTTP method normalization
- Array sorting functionality
- Route calculation logic

**Example:**

```typescript
// Test path building
buildRoutePath('api', 'v1', 'users') → '/api/v1/users'
buildRoutePath(undefined, 'users', 'profile') → '/users/profile'
```

### 🔀 Integration Tests (`integration.test.ts`)

Tests complete functionality:

- Type definition validation
- Complex path building scenarios
- Route sorting and organization
- Error handling scenarios
- Output formatting (JSON + human-readable)

### 🧪 Jest Tests (Optional)

When Jest dependencies are installed:

- Mock NestJS module testing
- Console output capture
- Error scenario simulation
- End-to-end route scanning

## Test Features

### ✅ **What's Tested**

1. **Path Building**

   - Prefix + base path + route path combinations
   - Empty value handling
   - Slash normalization
   - Edge cases

2. **Type Safety**

   - TypeScript interface validation
   - Option structure verification
   - Route info object structure

3. **Route Processing**

   - HTTP method normalization
   - Controller and route sorting
   - Route counting and statistics

4. **Error Handling**

   - Invalid file paths
   - Missing class names
   - Module loading failures

5. **Output Formatting**
   - JSON structure validation
   - Human-readable format testing
   - Statistics calculation

### 🎯 **Test Coverage Areas**

- ✅ **Core Logic** - Route scanning and processing
- ✅ **Utility Functions** - Path building, sorting, formatting
- ✅ **Type Definitions** - Interface and type validation
- ✅ **Error Scenarios** - Graceful failure handling
- ✅ **Output Formats** - JSON and console output

### 🚫 **Not Tested (Future Enhancements)**

- ❌ **Real NestJS Integration** - Requires actual NestJS app
- ❌ **CLI End-to-End** - Command line interface testing
- ❌ **Performance** - Large application testing
- ❌ **Cross-Platform** - Different OS compatibility

## Adding New Tests

### Simple Unit Test

```typescript
function testNewFeature() {
  console.log("Testing new feature...");

  // Your test logic here
  assertEqual(actualValue, expectedValue, "Feature description");

  console.log("✅ New feature tests passed");
}
```

### Integration Test

```typescript
function testComplexScenario() {
  // Test setup
  const testData = {
    /* ... */
  };

  // Test execution
  const result = processTestData(testData);

  // Validation
  return {
    result,
    passed: result.isValid,
    message: result.message,
  };
}
```

## Test Dependencies

### Required (Always Available)

- TypeScript (`ts-node`)
- Node.js built-in modules (`path`, `fs`)

### Optional (For Jest Tests)

- `jest` - Testing framework
- `@types/jest` - Jest TypeScript definitions
- `ts-jest` - TypeScript Jest transformer
- `@nestjs/testing` - NestJS testing utilities

## CI/CD Integration

```yaml
# Example GitHub Actions test step
- name: Run Tests
  run: |
    npm install
    npm run test          # Run simple + integration tests
    npm run test:coverage # Run Jest with coverage (if deps available)
```

## Troubleshooting

### Common Issues

**TypeScript compilation errors:**

```bash
# Make sure TypeScript is available
npx tsc --version

# Run with explicit ts-node
npx ts-node tests/simple.test.ts
```

**Jest type errors:**

```bash
# Install Jest types
npm install @types/jest --save-dev

# Or run simple tests instead
npm run test:simple
```

**Module import errors:**

```bash
# Check file paths in imports
# Ensure relative paths are correct
# Verify TypeScript compilation
```

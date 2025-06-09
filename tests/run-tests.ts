#!/usr/bin/env ts-node

/**
 * Standalone test runner for NestJS route scanner
 * Can be run with: npx ts-node tests/run-tests.ts
 */

import { runTests } from './integration.test';

console.log('🚀 NestJS Routes Test Suite\n');
console.log('Running custom integration tests...\n');

const success = runTests();

if (success) {
    console.log('\n✨ Test suite completed successfully!');
    process.exit(0);
} else {
    console.log('\n💥 Test suite failed!');
    process.exit(1);
} 
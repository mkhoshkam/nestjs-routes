#!/usr/bin/env node

import 'reflect-metadata';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { listRoutes } from '../src/route-scanner';

interface CliArgs {
    app: string;
    class: string;
    json?: boolean;
    prefix?: string;
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .scriptName('nestjs-routes')
        .usage('Usage: $0 [options]')
        .option('app', {
            alias: 'a',
            type: 'string',
            description: 'Path to the NestJS application module file',
            demandOption: true,
        })
        .option('class', {
            alias: 'c',
            type: 'string',
            description: 'Name of the application module class',
            demandOption: true,
            default: 'AppModule',
        })
        .option('json', {
            alias: 'j',
            type: 'boolean',
            description: 'Output routes as JSON',
            default: false,
        })
        .option('prefix', {
            alias: 'p',
            type: 'string',
            description: 'Global route prefix',
        })
        .example('$0 --app ./src/app.module.ts --class AppModule', 'Scan routes from TypeScript module')
        .example('$0 --app ./dist/app.module.js --class AppModule --json', 'Output JSON from compiled module')
        .help()
        .alias('help', 'h')
        .version()
        .alias('version', 'v')
        .parseAsync() as CliArgs;

    try {
        await listRoutes({
            appPath: argv.app,
            className: argv.class,
            json: argv.json,
            prefix: argv.prefix,
        });
    } catch (error) {
        console.error('❌ Error scanning routes:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});

main().catch((error) => {
    console.error('❌ CLI Error:', error.message || error);
    process.exit(1);
}); 
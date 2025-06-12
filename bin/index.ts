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
    'help-module'?: boolean;
}

function showModuleHelp() {
    console.log(`
🔧 NestJS Routes - Module Compatibility Help

If you're experiencing module loading issues, try these solutions:

📋 Common Issues & Solutions:

1. "Cannot use import statement outside a module"
   ✅ Try compiling your TypeScript first: npm run build
   ✅ Point to compiled JS: --app ./dist/app.module.js
   ✅ Check your tsconfig.json module settings

2. "Cannot find module" or "Cannot resolve module"
   ✅ Verify the file path is correct
   ✅ Ensure all dependencies are installed: npm install
   ✅ Try using an absolute path

3. "Cannot find class [ClassName]"
   ✅ Check that your class is properly exported
   ✅ Verify the class name matches exactly (case-sensitive)
   ✅ Try: --class YourModuleName instead of --class AppModule

🚀 Recommended Approaches:

For Modern NestJS Projects (ES Modules):
  nestjs-routes --app ./dist/app.module.js --class AppModule

For Traditional Projects (CommonJS):
  nestjs-routes --app ./src/app.module.ts --class AppModule

For TypeScript Projects:
  # First compile
  npm run build
  # Then scan
  nestjs-routes --app ./dist/app.module.js --class AppModule

🔍 Debug Mode:
  Run the command normally to see detailed error messages and suggestions.

📚 More help: https://github.com/mkhoshkam/nestjs-routes
`);
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .scriptName('nestjs-routes')
        .usage('Usage: $0 [options]')
        .option('app', {
            alias: 'a',
            type: 'string',
            description: 'Path to the NestJS application module file',
            demandOption: false,
        })
        .option('class', {
            alias: 'c',
            type: 'string',
            description: 'Name of the application module class',
            demandOption: false,
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
        .option('help-module', {
            alias: 'hm',
            type: 'boolean',
            description: 'Show module compatibility help',
            default: false,
        })
        .example('$0 --app ./src/app.module.ts --class AppModule', 'Scan routes from TypeScript module')
        .example('$0 --app ./dist/app.module.js --class AppModule --json', 'Output JSON from compiled module')
        .example('$0 --help-module', 'Show troubleshooting help for module issues')
        .help()
        .alias('help', 'h')
        .version()
        .alias('version', 'v')
        .parseAsync() as CliArgs;

    if (argv['help-module']) {
        showModuleHelp();
        return;
    }

    if (!argv.app) {
        console.error('❌ Missing required option: --app');
        console.log('💡 Run --help-module for troubleshooting guidance');
        process.exit(1);
    }

    try {
        await listRoutes({
            appPath: argv.app,
            className: argv.class,
            json: argv.json,
            prefix: argv.prefix,
        });
    } catch (error) {
        console.error('❌ Error scanning routes:', error instanceof Error ? error.message : error);
        console.log('💡 Run --help-module for troubleshooting guidance');
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
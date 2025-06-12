# NestJS Routes

🔍 A powerful CLI tool to inspect and list all routes in your NestJS applications. Get instant visibility into your API endpoints with both human-readable and JSON output formats.

## Features

- 🚀 **Quick Route Discovery** - Instantly scan all routes in any NestJS application
- 📊 **Multiple Output Formats** - Human-readable console output or JSON for tooling integration
- 🎯 **Zero Configuration** - Works out of the box with standard NestJS projects
- 🔧 **Flexible Input** - Supports both TypeScript and compiled JavaScript modules
- 🏷️ **Smart Grouping** - Routes organized by controller for better understanding
- 📝 **Detailed Information** - Shows HTTP methods, paths, and handler references
- ⚡ **Static Analysis** - No application bootstrapping or external dependencies required
- 🛡️ **Reliable** - Works without database connections, Redis, or environment setup

## Installation

### Global Installation (Recommended)

```bash
npm install -g nestjs-routes
# or
pnpm add -g nestjs-routes
# or
yarn global add nestjs-routes
```

### Local Installation

```bash
npm install nestjs-routes
# or
pnpm add nestjs-routes
# or
yarn add nestjs-routes
```

### Usage with npx (No Installation Required)

```bash
npx nestjs-routes --app ./src/app.module.ts --class AppModule
```

## Usage

### Basic Usage

```bash
# Scan routes from TypeScript module
nestjs-routes --app ./src/app.module.ts --class AppModule

# Scan routes from compiled JavaScript
nestjs-routes --app ./dist/app.module.js --class AppModule

# Output as JSON for tooling integration
nestjs-routes --app ./src/app.module.ts --class AppModule --json

# Include global route prefix
nestjs-routes --app ./src/app.module.ts --class AppModule --prefix api/v1
```

### Command Line Options

| Option      | Alias | Required | Default     | Description                                            |
| ----------- | ----- | -------- | ----------- | ------------------------------------------------------ |
| `--app`     | `-a`  | ✅       | -           | Path to the NestJS application module file             |
| `--class`   | `-c`  | ✅       | `AppModule` | Name of the application module class                   |
| `--json`    | `-j`  | ❌       | `false`     | Output routes as JSON instead of human-readable format |
| `--prefix`  | `-p`  | ❌       | -           | Global route prefix to include in paths                |
| `--help`    | `-h`  | ❌       | -           | Show help information                                  |
| `--version` | `-v`  | ❌       | -           | Show version information                               |

### Examples

#### Human-Readable Output

```bash
$ nestjs-routes --app ./src/app.module.ts --class AppModule

📍 NestJS Routes

🔸 AppController
   GET     /
   GET     /health

🔸 UsersController
   GET     /users
   POST    /users
   GET     /users/:id
   PUT     /users/:id
   DELETE  /users/:id

🔸 PostsController
   GET     /posts
   POST    /posts
   GET     /posts/:id

📊 Found 8 routes across 3 controllers
```

#### JSON Output

```bash
$ nestjs-routes --app ./src/app.module.ts --class AppModule --json
```

```json
{
  "AppController": [
    {
      "method": "GET",
      "path": "/",
      "handler": "AppController.getHello"
    },
    {
      "method": "GET",
      "path": "/health",
      "handler": "AppController.healthCheck"
    }
  ],
  "UsersController": [
    {
      "method": "GET",
      "path": "/users",
      "handler": "UsersController.findAll"
    },
    {
      "method": "POST",
      "path": "/users",
      "handler": "UsersController.create"
    }
  ]
}
```

## Programmatic Usage

You can also use the route scanner programmatically in your Node.js applications:

```typescript
import { listRoutes } from "nestjs-routes";

async function scanRoutes() {
  await listRoutes({
    appPath: "./src/app.module.ts",
    className: "AppModule",
    json: false,
    prefix: "api/v1",
  });
}

scanRoutes();
```

### Type Definitions

```typescript
interface ScanOptions {
  appPath: string; // Path to NestJS module file
  className: string; // Module class name
  json?: boolean; // Output format
  prefix?: string; // Global route prefix
}

interface RouteInfo {
  method: string; // HTTP method (GET, POST, etc.)
  path: string; // Route path
  handler: string; // Controller method reference
}

interface RouteMap {
  [controllerName: string]: RouteInfo[];
}
```

## Requirements

- **Node.js**: >= 16.0.0
- **NestJS**: >= 8.0.0 (tested with 10.x)
- **TypeScript**: >= 4.0.0 (if using TypeScript modules)

## Why This Approach?

Unlike tools that require bootstrapping your entire NestJS application, this package uses **static analysis** to discover routes. This means:

✅ **No External Dependencies** - Works without databases, Redis, or other services  
✅ **Fast Execution** - No need to wait for application startup  
✅ **CI/CD Friendly** - Perfect for build pipelines and automated tooling  
✅ **Environment Independent** - No need for `.env` files or configuration  
✅ **Lightweight** - Minimal memory footprint and resource usage

## How It Works

1. **Static Analysis** - Analyzes your NestJS modules without bootstrapping the entire application
2. **Metadata Extraction** - Uses reflection to extract route metadata from decorators
3. **Zero Dependencies** - No need for database connections, external services, or environment setup
4. **Smart Discovery** - Recursively discovers all controllers and their endpoints from module imports

## Use Cases

### Development

- 📋 **API Documentation** - Generate up-to-date endpoint lists
- 🐛 **Debugging** - Understand available routes during troubleshooting
- 👥 **Team Onboarding** - Help new developers understand API structure
- ✅ **Testing** - Ensure comprehensive test coverage

### CI/CD & Automation

- 📚 **Documentation Generation** - Auto-generate API docs in build pipelines
- 📊 **Monitoring Setup** - Discover endpoints for APM and logging tools
- 🔧 **Tooling Integration** - Feed route data to Postman, Swagger, etc.
- 🚀 **Deployment Validation** - Verify expected routes are available

## Troubleshooting

### Common Issues

**❌ Cannot find module error**

```bash
# Make sure the path is correct and file exists
nestjs-routes --app ./src/app.module.ts --class AppModule
```

**❌ Cannot find class error**

```bash
# Verify the exported class name matches
nestjs-routes --app ./src/app.module.ts --class AppModule
```

**❌ No routes found**

- Ensure your controllers use proper NestJS decorators (`@Controller`, `@Get`, `@Post`, etc.)
- Check that controllers are properly imported in your module
- Verify the module structure is correct

### Debug Tips

1. **Check Module Structure** - Ensure your app module properly imports all feature modules
2. **Verify Decorators** - Make sure all controllers and routes use NestJS decorators
3. **Test Compilation** - Try running `tsc` to check for TypeScript errors
4. **Use Absolute Paths** - Try using absolute paths for the module file

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Technance/nestjs-routes.git
cd nestjs-routes

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Test locally
pnpm run dev --app ./example/app.module.ts --class AppModule
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Technance/nestjs-routes/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Technance/nestjs-routes/discussions)
- 📧 **Email Support**: mardani93.itsu@gmail.com

---

Made with ❤️ for the NestJS community

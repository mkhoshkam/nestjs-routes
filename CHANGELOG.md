# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2024-12-19

### 🔧 Module Compatibility Fixes

- **Enhanced Module Loading**: Improved compatibility with ES modules and modern NestJS projects
- **Multiple Import Strategies**: Added fallback mechanisms for different module systems
- **Better Error Messages**: More descriptive error messages with troubleshooting suggestions
- **Help Command**: Added `--help-module` option for troubleshooting guidance

### ✨ Added

- `--help-module` CLI option for module compatibility help
- Automatic detection and handling of ES modules vs CommonJS
- Support for projects with "module": "nodenext" in tsconfig.json
- Fallback import strategies for TypeScript files
- Enhanced error diagnostics with available exports listing

### 🐛 Fixed

- "Cannot use import statement outside a module" errors
- Module resolution issues with modern NestJS setups
- TypeScript file loading in ES module environments
- Default export handling

### 📚 Documentation

- Added troubleshooting section to README
- Updated command line options table
- Added module compatibility examples

## [0.2.0] - 2024-12-19

### 🚀 Major Improvements

- **BREAKING CHANGE**: Replaced application bootstrapping with static analysis
- Routes are now discovered without starting the entire NestJS application
- No longer requires external dependencies (databases, Redis, etc.)
- Significantly improved performance and reliability

### ✨ Added

- Static code analysis for route discovery
- HTTP method constants mapping for proper method names
- Recursive module discovery for imported modules
- Better error handling for complex module configurations
- Support for dynamic modules

### 🔧 Fixed

- Dependency resolution issues that required full application context
- Environment setup requirements
- Memory usage and startup time
- Compatibility with applications using complex service dependencies

### 📦 Dependencies

- Moved `@nestjs/common` from devDependencies to dependencies
- Updated package description to reflect static analysis approach

### 🧪 Testing

- All existing tests pass with new implementation
- CLI functionality verified with both human-readable and JSON output
- Global prefix functionality confirmed working

## [0.1.1] - Previous Version

- Initial version with application bootstrapping approach
- Required full NestJS application context
- Dependency resolution issues with complex applications 
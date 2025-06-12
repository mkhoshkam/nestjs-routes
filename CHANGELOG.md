# Changelog

All notable changes to this project will be documented in this file.

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
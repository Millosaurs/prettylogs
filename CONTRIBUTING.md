# Contributing to PrettyLogs

Thank you for your interest in contributing to PrettyLogs! This document provides guidelines and information for contributors to help maintain code quality and streamline the development process.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Release Process](#release-process)
- [Performance Considerations](#performance-considerations)

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **npm**: Latest version recommended
- **Git**: For version control
- **TypeScript**: Knowledge of TypeScript is helpful

### Quick Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/prettylogs.git
   cd prettylogs
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```
5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

## 🛠️ Development Setup

### Environment Setup

1. **Create a new branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Set up your development environment**:
   ```bash
   # Install dependencies
   npm install

   # Run type checking
   npm run typecheck

   # Run linting
   npm run lint
   ```

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the package for production |
| `npm run build:watch` | Build in watch mode for development |
| `npm run dev` | Run the development test file |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open interactive test UI |
| `npm run test:coverage` | Generate test coverage report |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Lint the codebase |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 📁 Project Structure

```
prettylogs/
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   └── logFunction.ts     # Core logging functionality
├── tests/                 # Test files
├── examples/              # Usage examples
├── docs/                  # Documentation
├── benchmarks/            # Performance benchmarks
├── dist/                  # Built files (auto-generated)
├── .github/               # GitHub workflows and templates
├── screenshots/           # Project screenshots
└── logs/                  # Log files (auto-generated)
```

### Key Files

- **`src/index.ts`**: Main library entry point and public API
- **`src/logFunction.ts`**: Core logging implementation
- **`package.json`**: Project metadata and dependencies
- **`tsconfig.json`**: TypeScript configuration
- **`vitest.config.ts`**: Test configuration
- **`tsup.config.ts`**: Build configuration

## 🔄 Development Workflow

### 1. Planning Your Contribution

- **Check existing issues** before starting work
- **Create an issue** for new features or significant changes
- **Discuss your approach** in the issue comments
- **Get approval** for major changes before implementation

### 2. Making Changes

1. **Start with tests** (Test-Driven Development):
   ```bash
   # Create test file
   touch tests/your-feature.test.ts

   # Run tests in watch mode
   npm run test:watch
   ```

2. **Implement your changes**:
   - Follow existing code patterns
   - Write clear, documented code
   - Keep commits atomic and well-described

3. **Ensure code quality**:
   ```bash
   # Type checking
   npm run typecheck

   # Linting
   npm run lint:fix

   # Formatting
   npm run format

   # Tests
   npm test
   ```

### 3. Testing Your Changes

- **Run the full test suite**: `npm test`
- **Test with examples**: `npm run dev`
- **Check performance**: Run relevant benchmarks
- **Manual testing**: Test edge cases and error conditions

## 📏 Code Standards

### TypeScript Guidelines

- **Use strict TypeScript**: All code must pass `strict` mode
- **Explicit types**: Prefer explicit types over `any`
- **Interface definitions**: Use interfaces for object shapes
- **Generics**: Use generics for reusable components
- **Null safety**: Handle `null` and `undefined` explicitly

```typescript
// Good
interface LoggerConfig {
  level: LogLevel;
  colorize: boolean;
  logFile?: string;
}

function createLogger(config: LoggerConfig): Logger {
  // Implementation
}

// Avoid
function createLogger(config: any) {
  // Implementation
}
```

### Code Style

- **Use Prettier** for consistent formatting
- **Follow ESLint rules** defined in `.eslintrc.json`
- **Descriptive naming**: Use clear, descriptive variable and function names
- **Single responsibility**: Functions should do one thing well
- **Error handling**: Always handle errors appropriately

### Performance Guidelines

- **Minimize allocations**: Avoid unnecessary object creation in hot paths
- **Lazy evaluation**: Defer expensive operations when possible
- **Avoid blocking operations**: Use async patterns for I/O
- **Profile critical paths**: Use benchmarks for performance-sensitive code

```typescript
// Good - Lazy evaluation
function formatMessage(level: string, message: string, data?: any): string {
  if (this.minLevel > getLogLevelPriority(level)) {
    return ''; // Early return for disabled levels
  }
  return `[${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
}

// Avoid - Always formatting even if not needed
function formatMessage(level: string, message: string, data?: any): string {
  const formatted = `[${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
  if (this.minLevel > getLogLevelPriority(level)) {
    return '';
  }
  return formatted;
}
```

## 🧪 Testing Guidelines

### Test Structure

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test feature interactions
- **Performance tests**: Benchmark critical operations
- **Example tests**: Ensure examples work correctly

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createLogger } from '../src/index.js';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createLogger({
      mode: 'silent', // Avoid console output in tests
    });
  });

  it('should create logger with default config', () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeTypeOf('function');
  });

  it('should log messages at appropriate levels', () => {
    const messages: string[] = [];
    logger.setOutput((message) => messages.push(message));

    logger.info('test message');
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('test message');
  });
});
```

### Test Coverage

- **Aim for >90%** code coverage
- **Test error conditions** and edge cases
- **Mock external dependencies** appropriately
- **Test TypeScript types** when applicable

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/logger.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for all public APIs
- **Type annotations** for complex types
- **README updates** for new features
- **Example code** in documentation

```typescript
/**
 * Creates a new logger instance with the specified configuration.
 *
 * @param config - Logger configuration options
 * @param config.level - Minimum log level to output
 * @param config.colorize - Whether to colorize console output
 * @param config.logFile - Optional file path for log output
 * @returns A new logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger({
 *   level: 'INFO',
 *   colorize: true,
 *   logFile: './app.log'
 * });
 *
 * logger.info('Application started');
 * ```
 */
export function createLogger(config: LoggerConfig): Logger {
  // Implementation
}
```

### Documentation Updates

- **Update README.md** for user-facing changes
- **Add examples** for new features
- **Update API documentation** in `docs/`
- **Include migration guides** for breaking changes

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**:
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

2. **Update documentation** as needed

3. **Add tests** for new functionality

4. **Check performance** impact with benchmarks

5. **Update CHANGELOG.md** if applicable

### Pull Request Template

When creating a pull request, include:

- **Clear description** of the changes
- **Issue reference** (e.g., "Fixes #123")
- **Testing performed**
- **Breaking changes** (if any)
- **Performance impact** (if applicable)

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Performance review** for critical changes
4. **Documentation review** for user-facing changes
5. **Final approval** and merge

## 🐛 Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment information** (Node.js version, OS, etc.)
- **Minimal reproduction** case
- **Error messages** and stack traces

### Feature Requests

Use the feature request template and include:

- **Clear description** of the feature
- **Use case** and motivation
- **Proposed API** or interface
- **Alternative solutions** considered
- **Implementation ideas** (if any)

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `performance`: Performance-related issues

## 🚀 Release Process

### Version Management

We follow [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Scripts

```bash
# Patch release (bug fixes)
npm run release:patch

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major
```

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Performance benchmarks run
- [ ] Examples tested
- [ ] Version bumped appropriately
- [ ] Git tag created
- [ ] NPM package published

## ⚡ Performance Considerations

### Benchmarking

Run benchmarks before and after changes:

```bash
node benchmarks/run.js
```

### Performance Guidelines

- **Measure first**: Use benchmarks to identify bottlenecks
- **Optimize hot paths**: Focus on frequently called code
- **Memory efficiency**: Minimize object allocation
- **Async operations**: Use non-blocking I/O for file operations
- **Early returns**: Skip unnecessary work when possible

### Critical Performance Areas

1. **Log formatting**: String concatenation and serialization
2. **File I/O**: Async writing and buffering
3. **Level filtering**: Early exit for disabled levels
4. **Object serialization**: JSON.stringify performance
5. **Color formatting**: Terminal color code application

## 🤝 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: support@prettylogs.dev for direct contact

### Resources

- **API Documentation**: [docs/API.md](./docs/API.md)
- **Examples**: [examples/](./examples/) directory
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Node.js Documentation**: https://nodejs.org/en/docs/

## 🏆 Recognition

Contributors will be:

- **Listed in package.json** contributors section
- **Mentioned in release notes** for significant contributions
- **Invited as collaborators** for ongoing contributors
- **Featured in README.md** acknowledgments

## 📄 License

By contributing to PrettyLogs, you agree that your contributions will be licensed under the same [MIT License](./LICENSE) that covers the project.

---

Thank you for contributing to PrettyLogs! Your efforts help make logging better for everyone. 🎉

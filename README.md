# PrettyLogs

Modern, high-performance logging library for Node.js with beautiful console output, comprehensive file logging, and extensive customization options.

[![npm version](https://badge.fury.io/js/@millosaurs%2Fprettylogs.svg)](https://badge.fury.io/js/@millosaurs%2Fprettylogs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

## Features

**Core Capabilities**
- Multiple log levels with color-coded output
- Structured and JSON logging formats
- File logging with automatic rotation
- Async and buffered file operations
- Child loggers with namespacing
- Built-in performance monitoring
- Environment-aware configuration
- Full TypeScript support

**Developer Tools**
- Timer and profiling utilities
- Table and JSON formatters
- Progress indicators and spinners
- Assertion helpers
- Group and box formatting
- Dynamic configuration

## Installation

```bash
npm install @millosaurs/prettylogs
```

Alternative package managers:

```bash
yarn add @millosaurs/prettylogs
pnpm add @millosaurs/prettylogs
bun add @millosaurs/prettylogs
```

## Quick Start

```javascript
import { logger } from "@millosaurs/prettylogs";

// Basic logging
logger.info("Application started");
logger.warn("High memory usage", { usage: "85%" });
logger.error("Connection failed", { error: err.message });
logger.success("Operation completed", { userId: 123 });

// With structured data
logger.info("User action", {
  userId: 123,
  action: "login",
  timestamp: Date.now(),
});
```

## Log Levels

| Level   | Priority | Use Case                     | Color    |
|---------|----------|------------------------------|----------|
| TRACE   | 0        | Detailed debugging           | Purple   |
| DEBUG   | 1        | Development information      | Orange   |
| INFO    | 2        | General information          | Blue     |
| WARN    | 3        | Warning messages             | Yellow   |
| ERROR   | 4        | Error conditions             | Red      |
| FATAL   | 5        | Critical failures            | Dark Red |
| SUCCESS | 2        | Success confirmations        | Green    |

## Configuration

### Basic Configuration

```javascript
import { createLogger } from "@millosaurs/prettylogs";

const logger = createLogger({
  minLevel: "INFO",
  timestamps: true,
  colorize: true,
  logFile: "./logs/app.log",
  logFormat: "json",
});
```

### Environment-Based Configuration

```javascript
import { createEnvironmentLogger } from "@millosaurs/prettylogs";

// Automatically adjusts based on NODE_ENV
const logger = createEnvironmentLogger();

// Development: colorful console output, verbose logging
// Production: JSON format, structured logging, file output
logger.info("Environment-aware logging");
```

### Configuration Options

```javascript
{
  // Logging levels
  levels: ["DEBUG", "INFO", "WARN", "ERROR"],
  minLevel: "INFO",

  // Output format
  timestamps: true,
  colorize: true,
  prettyPrint: true,
  dateFormat: "iso", // iso | locale | unix | short

  // Mode
  mode: "normal", // silent | normal | verbose | debug

  // File logging
  logFile: "./logs/app.log",
  logFormat: "text", // text | json | structured
  maxFileSize: 10 * 1024 * 1024, // bytes
  maxFiles: 5,
  disableFileLogging: false,

  // Performance
  async: false,
  bufferSize: 100,
  flushInterval: 1000,

  // Metadata
  environment: "development",
}
```

## Usage Examples

### Child Loggers

```javascript
const parentLogger = createLogger({ timestamps: true });

// Create child logger with namespace
const requestLogger = parentLogger.child("req-abc123");
const dbLogger = parentLogger.child("database");

requestLogger.info("Processing request");
dbLogger.debug("Query executed", { duration: 45 });
```

### Performance Monitoring

```javascript
// Simple timers
logger.time("database-query");
const result = await database.query("SELECT * FROM users");
logger.timeEnd("database-query");
// Output: database-query: 145ms

// Functional timers with return value
const stopTimer = logger.startTimer("api-request");
const response = await fetch("/api/data");
const duration = stopTimer();
console.log(`Request took ${duration}ms`);

// Memory profiling
const stopProfile = logger.profile("memory-intensive-task");
await processLargeDataset();
stopProfile();
// Output: memory-intensive-task completed in 2.5s
//         Memory: +15.3 MB
```

### Data Formatting

```javascript
// Table output
const users = [
  { id: 1, name: "Alice", active: true },
  { id: 2, name: "Bob", active: false },
];
logger.table(users);

// JSON formatting
logger.json({ user: data, timestamp: Date.now() });

// Box formatting
logger.box("Important Message\nServer started on port 3000");

// Divider
logger.divider("Section Break");
```

### Assertions

```javascript
logger.assert(user.id > 0, "User ID must be positive");
logger.assert(data.length === expectedLength, "Data length mismatch");
```

### Grouped Logs

```javascript
logger.group("User Validation", () => {
  logger.debug("Checking user credentials");
  logger.debug("Validating permissions");
  logger.success("Validation complete");
});
```

### Spinners

```javascript
const stopSpinner = logger.spinner("Loading data...");
await fetchData();
stopSpinner();
```

## Production Usage

### High-Performance Setup

```javascript
const logger = createLogger({
  minLevel: "INFO",
  colorize: false,
  prettyPrint: false,
  logFormat: "json",
  async: true,
  bufferSize: 500,
  logFile: "./logs/app.log",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 20,
});
```

### Express.js Integration

```javascript
import express from "express";
import { createLogger } from "@millosaurs/prettylogs";

const logger = createLogger({
  logFile: "./logs/server.log",
  timestamps: true,
  logFormat: "json",
});

const app = express();

app.use((req, res, next) => {
  const requestId = `req-${Date.now()}`;
  req.logger = logger.child(requestId);
  
  req.logger.info("Request received", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  
  next();
});

app.get("/api/users", async (req, res) => {
  const timer = req.logger.startTimer("fetch-users");
  
  try {
    const users = await db.getUsers();
    const duration = timer();
    
    req.logger.success("Users fetched", { count: users.length, duration });
    res.json(users);
  } catch (error) {
    req.logger.error("Failed to fetch users", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  logger.info("Server started", { port: 3000 });
});
```

### Microservice Pattern

```javascript
import { createStructuredLogger } from "@millosaurs/prettylogs";

const logger = createStructuredLogger("user-service", "1.2.3");

// All logs automatically include service metadata
logger.info("Service starting", {
  port: 3000,
  environment: process.env.NODE_ENV,
});

// Request-scoped logging with correlation ID
function handleRequest(correlationId, data) {
  const requestLogger = logger.child(correlationId);
  
  requestLogger.info("Processing request", { data });
  requestLogger.success("Request completed");
}
```

### Error Handling

```javascript
// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Shutdown signal received");
  await logger.flush();
  await logger.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("Interrupt signal received");
  await logger.flush();
  await logger.close();
  process.exit(0);
});

// Global error handling
process.on("uncaughtException", (error) => {
  logger.fatal("Uncaught exception", {
    message: error.message,
    stack: error.stack,
  });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection", {
    reason,
    promise,
  });
});
```

### Structured Logging

```javascript
const logger = createLogger({
  logFormat: "structured",
  timestamps: true,
});

// Custom formatter for additional metadata
logger.setFormatter((entry) => {
  return JSON.stringify({
    ...entry,
    version: process.env.APP_VERSION,
    deployment: process.env.DEPLOYMENT_ID,
    region: process.env.AWS_REGION,
  });
});

logger.info("User action", {
  userId: 123,
  action: "purchase",
  amount: 99.99,
});
```

## File Logging

### Basic File Logging

```javascript
const logger = createLogger({
  logFile: "./logs/app.log",
  logFormat: "text",
});

logger.info("This message will be logged to file");
```

### File Rotation

```javascript
const logger = createLogger({
  logFile: "./logs/app.log",
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10, // Keep 10 rotated files
});

// Manual rotation
logger.rotateLogFile();

// Check file size
const size = logger.getLogFileSize();
console.log(`Log file size: ${size} bytes`);

// Clear log file
logger.clearLogFile();
```

### Async File Writing

```javascript
const logger = createLogger({
  logFile: "./logs/app.log",
  async: true,
  bufferSize: 100,
  flushInterval: 1000,
});

// Ensure all logs are written
await logger.flush();

// Close file handles
await logger.close();
```

## Advanced Features

### Dynamic Configuration

```javascript
const logger = createLogger({ minLevel: "INFO" });

// Change configuration at runtime
logger.setConfig({
  minLevel: "DEBUG",
  colorize: false,
});

// Get current configuration
const config = logger.getConfig();
console.log(config);
```

### Custom Formatters

```javascript
logger.setFormatter((entry) => {
  return `[${entry.level}] ${entry.timestamp} - ${entry.message}`;
});
```

### Level Checking

```javascript
if (logger.isLevelEnabled("DEBUG")) {
  const expensiveData = computeExpensiveDebugData();
  logger.debug("Debug data", expensiveData);
}
```

### Stream Writing

```javascript
import { createWriteStream } from "fs";

const customStream = createWriteStream("./custom.log");
logger.writeToStream(customStream);
```

## Testing

### Test-Friendly Configuration

```javascript
import { createLogger } from "@millosaurs/prettylogs";

const testLogger = createLogger({
  mode: "silent",
  disableFileLogging: true,
});

// Use in tests without console output
testLogger.info("This won't appear in test output");
```

### Mocking

```javascript
// Jest example
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  success: jest.fn(),
};

// Vitest example
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
```

## Performance

Optimized for high-throughput applications:

- 50,000+ operations per second
- Async file I/O for non-blocking writes
- Efficient memory usage with buffering
- Early exit for disabled log levels
- Zero-copy string operations
- Circular reference handling

## Migration Guide

### From console.log

```javascript
// Before
console.log("User logged in:", userId);
console.error("Error:", error);

// After
logger.info("User logged in", { userId });
logger.error("Error occurred", { error: error.message });
```

### From Winston

```javascript
// Before
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "app.log" }),
  ],
});

// After
const { createLogger } = require("@millosaurs/prettylogs");
const logger = createLogger({
  minLevel: "INFO",
  logFormat: "json",
  logFile: "app.log",
});
```

### From Pino

```javascript
// Before
const pino = require("pino");
const logger = pino({
  level: "info",
});

// After
const { createLogger } = require("@millosaurs/prettylogs");
const logger = createLogger({
  minLevel: "INFO",
});
```

### From Bunyan

```javascript
// Before
const bunyan = require("bunyan");
const logger = bunyan.createLogger({
  name: "myapp",
  level: "info",
});

// After
const { createLogger } = require("@millosaurs/prettylogs");
const logger = createLogger({
  minLevel: "INFO",
});
```

## API Reference

### Logger Methods

**Basic Logging**
```javascript
logger.trace(message, ...args)
logger.debug(message, ...args)
logger.info(message, ...args)
logger.warn(message, ...args)
logger.error(message, ...args)
logger.fatal(message, ...args)
logger.success(message, ...args)
```

**Performance Monitoring**
```javascript
logger.time(label)                  // Start a timer
logger.timeEnd(label)               // End a timer
logger.startTimer(label)            // Returns function to stop timer
logger.profile(label)               // Returns function to stop profiling
```

**Data Formatting**
```javascript
logger.table(data)                  // Display data in table format
logger.json(data, level)            // Pretty-print JSON
logger.box(message)                 // Display message in a box
logger.divider(label)               // Display horizontal divider
logger.group(label, callback)       // Group related logs
```

**Utilities**
```javascript
logger.assert(condition, message)   // Log error if condition is false
logger.spinner(message)             // Show spinner, returns stop function
logger.clear()                      // Clear console
```

**Logger Management**
```javascript
logger.child(namespace)             // Create child logger
logger.setConfig(config)            // Update configuration
logger.getConfig()                  // Get current configuration
logger.setFormatter(formatter)      // Set custom formatter
logger.setLevel(level)              // Set minimum log level
logger.isLevelEnabled(level)        // Check if level is enabled
```

**File Operations**
```javascript
logger.flush()                      // Flush buffered logs (async)
logger.close()                      // Close file handles (async)
logger.rotateLogFile()              // Manually rotate log file
logger.clearLogFile()               // Clear log file
logger.getLogFileSize()             // Get log file size in bytes
logger.writeToStream(stream)        // Write to custom stream
```

### Factory Functions

```javascript
import {
  createLogger,
  createEnvironmentLogger,
  createStructuredLogger,
  logger, // Default logger instance
} from "@millosaurs/prettylogs";

// Create custom logger
const customLogger = createLogger(config);

// Create environment-aware logger
const envLogger = createEnvironmentLogger();

// Create structured logger with service metadata
const serviceLogger = createStructuredLogger(serviceName, version);

// Use default logger
logger.info("Using default logger");
```

## Examples

Check out the [examples directory](./examples/) for complete working examples:

- **Web Server** - Express.js integration with request logging
- **Microservice** - Structured logging with correlation IDs
- **CLI Application** - Command-line tool logging patterns
- **Error Handling** - Production error handling patterns
- **Performance** - Timer and profiling examples

## Development

### Building

```bash
npm run build          # Build the package
npm run build:watch    # Watch mode for development
```

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
npm run test:ui       # Interactive test UI
```

### Code Quality

```bash
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier
npm run typecheck     # TypeScript type checking
```

### Benchmarking

```bash
node benchmarks/run.js    # Run performance benchmarks
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { Logger, LoggerConfig, LogLevel } from "@millosaurs/prettylogs";

const config: LoggerConfig = {
  minLevel: "INFO",
  timestamps: true,
  colorize: true,
};

const logger: Logger = createLogger(config);

logger.info("TypeScript support", { typed: true });
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/Millosaurs/prettylogs.git
cd prettylogs
npm install
npm run build
npm test
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- **Documentation**: [prettylogs.shrivatsav.dev](https://prettylogs.shrivatsav.dev)
- **Issue Tracker**: [GitHub Issues](https://github.com/Millosaurs/prettylogs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Millosaurs/prettylogs/discussions)

## Roadmap

- Plugin system for custom formatters and outputs
- Log streaming with WebSocket and SSE support
- Metrics integration with Prometheus and StatsD
- Cloud logging integration (AWS CloudWatch, Google Cloud Logging)
- ELK Stack integration for log aggregation
- Performance dashboard for real-time logging metrics
- VS Code extension for enhanced development experience

## Acknowledgments

Built with modern Node.js best practices and inspired by the logging needs of production applications.

---

**Made by [Millosaurs](https://github.com/Millosaurs)**

If you find this library useful, please consider starring the repository on GitHub.
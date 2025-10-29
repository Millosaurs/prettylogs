# PrettyLogs

A professional, high-performance logging library for Node.js applications featuring beautiful
console output, comprehensive file logging, and extensive customization options.

[![npm version](https://badge.fury.io/js/@millosaurs%2Fprettylogs.svg)](https://badge.fury.io/js/@millosaurs%2Fprettylogs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org)

## Features

### Core Logging Features

- **Color-Coded Output** - Distinct colors for each log level with customizable themes
- **Centered Badges** - Perfectly aligned log level indicators for consistent formatting
- **Multiple Log Levels** - TRACE, DEBUG, INFO, WARN, ERROR, FATAL, SUCCESS
- **Flexible Timestamps** - ISO, locale, unix, and short formats
- **Smart Log Filtering** - Level-based filtering with minimum level thresholds
- **Child Loggers** - Create namespaced loggers for better organization
- **Rich Data Display** - Tables, JSON, boxes, and dividers

### Advanced Features

- **File Logging** - Text, JSON, and structured formats with rotation
- **Async File Writing** - High-performance buffered file operations
- **Log Rotation** - Automatic file rotation with size limits and retention
- **Multi-threaded Safe** - Concurrent logging from multiple sources
- **Performance Monitoring** - Built-in timers and profiling tools
- **Interactive Elements** - Spinners, progress indicators, and grouped logs
- **Environment-Aware** - Automatic configuration based on NODE_ENV
- **Dynamic Configuration** - Change settings on the fly
- **Memory Efficient** - Optimized for minimal memory footprint

### Developer Experience

- **Full TypeScript Support** - Complete type definitions included
- **Comprehensive Testing** - Unit, integration, and performance tests
- **Rich Documentation** - Detailed API docs and examples
- **ESM & CommonJS** - Support for both module systems
- **Zero Dependencies** - Only chalk for colors (optional)

## Installation

```bash
npm install @millosaurs/prettylogs
```

Using other package managers:

```bash
# Yarn
yarn add @millosaurs/prettylogs

# pnpm
pnpm add @millosaurs/prettylogs

# Bun
bun add @millosaurs/prettylogs
```

## Quick Start

### Basic Usage

```javascript
import { logger } from "@millosaurs/prettylogs";

// Simple logging
logger.info("Application started");
logger.warn("Memory usage high", { usage: "85%" });
logger.error("Database connection failed", error);
logger.success("User created successfully", { userId: 123 });
```

### Custom Logger

```javascript
import { createLogger } from "@millosaurs/prettylogs";

const customLogger = createLogger({
  timestamps: true,
  logFile: "./logs/app.log",
  colorize: true,
  logFormat: "json",
  minLevel: "INFO",
});

customLogger.info("Custom logger message");
```

### Environment-Aware Logger

```javascript
import { createEnvironmentLogger } from "@millosaurs/prettylogs";

// Automatically configures based on NODE_ENV
const logger = createEnvironmentLogger();

// Development: colorful, verbose
// Production: JSON format, structured logging
logger.info("Environment-specific logging");
```

## Log Levels

| Level   | Numeric | Description                  | Color    |
| ------- | ------- | ---------------------------- | -------- |
| TRACE   | 0       | Detailed trace information   | Purple   |
| DEBUG   | 1       | Debug information            | Orange   |
| INFO    | 2       | General information messages | Blue     |
| WARN    | 3       | Warning messages             | Yellow   |
| ERROR   | 4       | Error messages               | Red      |
| FATAL   | 5       | Fatal errors (exits process) | Dark Red |
| SUCCESS | 2       | Success messages             | Green    |

## Advanced Examples

### Web Server Logging

```javascript
import express from "express";
import { createLogger } from "@millosaurs/prettylogs";

const logger = createLogger({
  logFile: "./logs/server.log",
  timestamps: true,
  logFormat: "json",
});

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const requestLogger = logger.child(`req-${Date.now()}`);

  requestLogger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  req.logger = requestLogger;
  next();
});

app.get("/users", async (req, res) => {
  const timer = req.logger.startTimer("fetch-users");

  try {
    const users = await getUsersFromDatabase();
    const duration = timer();

    req.logger.success("Users fetched", {
      count: users.length,
      duration,
    });

    res.json(users);
  } catch (error) {
    req.logger.error("Failed to fetch users", {
      error: error.message,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### Microservice Logging

```javascript
import { createStructuredLogger } from "@millosaurs/prettylogs";

const logger = createStructuredLogger("user-service", "1.2.3");

// All logs include service metadata
logger.info("Service starting", {
  port: 3000,
  environment: process.env.NODE_ENV,
});

// With correlation IDs
const correlationId = "trace-123";
const requestLogger = logger.child(correlationId);

requestLogger.info("Processing request", {
  endpoint: "/users/123",
});
```

### Development Debugging

```javascript
import { createLogger } from "@millosaurs/prettylogs";

const logger = createLogger({ mode: "debug" });

// Group related operations
logger.group("User Validation", () => {
  logger.debug("Validating user data");
  logger.assert(user.id > 0, "User ID must be positive");
  logger.success("Validation passed");
});

// Display data in tables
const users = [
  { id: 1, name: "John", active: true },
  { id: 2, name: "Jane", active: false },
];
logger.table(users);

// Pretty-print JSON
logger.json(complexObject, "DEBUG");

// Box important messages
logger.box("Development server ready!\nRunning on http://localhost:3000");
```

### Performance Monitoring

```javascript
// Simple timers
logger.time("database-query");
const result = await database.query("SELECT * FROM users");
logger.timeEnd("database-query");

// Functional timers
const stopTimer = logger.startTimer("api-request");
const response = await fetch("/api/data");
const duration = stopTimer();

// Memory profiling
const stopProfile = logger.profile("memory-intensive-task");
await processLargeDataset();
stopProfile(); // Logs duration and memory usage
```

### File Logging with Rotation

```javascript
const logger = createLogger({
  logFile: "./logs/app.log",
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10, // Keep 10 rotated files
  logFormat: "json",
  async: true, // Async file writing
  bufferSize: 100, // Buffer 100 entries
  flushInterval: 1000, // Flush every 1000ms
});

// Automatic rotation when size limit is reached
logger.info("This will be logged to file");

// Manual operations
logger.rotateLogFile();
logger.clearLogFile();
console.log(`Log file size: ${logger.getLogFileSize()} bytes`);
```

## Configuration Options

```javascript
const logger = createLogger({
  // Log levels
  levels: ["DEBUG", "INFO", "WARN", "ERROR"], // Allowed levels
  minLevel: "INFO", // Minimum level threshold

  // Output formatting
  timestamps: true, // Include timestamps
  colorize: true, // Colored output
  prettyPrint: true, // Pretty-print objects
  dateFormat: "iso", // iso, locale, unix, short

  // Behavior
  mode: "normal", // silent, normal, verbose, debug

  // File logging
  logFile: "./logs/app.log", // Log file path
  logFormat: "text", // text, json, structured
  maxFileSize: 10 * 1024 * 1024, // 10MB default
  maxFiles: 5, // Rotated files to keep

  // Performance
  async: false, // Enable async file writing
  bufferSize: 100, // Buffer size for async
  flushInterval: 1000, // Flush interval (ms)

  // Environment
  environment: "development", // Environment identifier
});
```

## Production Best Practices

### High-Performance Setup

```javascript
const logger = createLogger({
  // Optimize for production
  colorize: false, // Faster without colors
  prettyPrint: false, // Compact object serialization
  logFormat: "json", // Structured for log analysis
  async: true, // Non-blocking file writes
  bufferSize: 500, // Larger buffer for throughput
  minLevel: "INFO", // Filter out debug logs

  // File management
  logFile: "./logs/app.log",
  maxFileSize: 100 * 1024 * 1024, // 100MB files
  maxFiles: 20, // Keep more history
});
```

### Error Handling

```javascript
// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Shutting down gracefully");
  await logger.flush(); // Ensure all logs are written
  await logger.close(); // Close file handles
  process.exit(0);
});

// Global error handling
process.on("uncaughtException", (error) => {
  logger.fatal("Uncaught exception", {
    message: error.message,
    stack: error.stack,
  });
  // Process exits automatically after fatal log
});
```

### Structured Logging for Observability

```javascript
const logger = createStructuredLogger("api-gateway", "2.1.0");

// Add consistent metadata
logger.setFormatter((entry) => {
  return JSON.stringify({
    ...entry,
    version: "2.1.0",
    deployment: process.env.DEPLOYMENT_ID,
    region: process.env.AWS_REGION,
  });
});

// Log with correlation
function withCorrelation(correlationId, fn) {
  const correlatedLogger = logger.child(correlationId);
  return fn(correlatedLogger);
}
```

## Testing Integration

```javascript
import { createLogger } from "@millosaurs/prettylogs";

// Test-friendly logger
const testLogger = createLogger({
  mode: "silent", // No console output during tests
  logFile: "./test-logs.log", // Optional file logging for debugging
});

// Mock for unit tests
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  // ... other methods
};
```

## Performance

PrettyLogs is optimized for high-performance applications:

- **50,000+ ops/sec** - Basic logging operations
- **Zero-copy** string formatting for simple messages
- **Async file I/O** - Non-blocking file operations
- **Smart filtering** - Early exit for disabled log levels
- **Memory efficient** - Minimal memory allocation per log
- **Circular reference safe** - Handles complex objects gracefully

## Migration Guide

### From Console.log

```javascript
// Before
console.log("User logged in", userId);
console.error("Database error:", error);

// After
logger.info("User logged in", { userId });
logger.error("Database error", { error: error.message });
```

### From Winston

```javascript
// Before
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "app.log" })],
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
const logger = pino({ level: "info" });

// After
const { createLogger } = require("@millosaurs/prettylogs");
const logger = createLogger({ minLevel: "INFO" });
```

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

## API Documentation

For detailed API documentation, see [docs/API.md](./docs/API.md).

## Examples

Check out the [examples directory](./examples/) for complete working examples:

- [Web Server](./examples/web-server.js) - Express.js integration
- [Microservice](./examples/microservice.js) - Structured logging
- [CLI Application](./examples/cli-app.js) - Command-line tool logging
- [Error Handling](./examples/error-handling.js) - Production error patterns

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

## Acknowledgments

- **Chalk** - For beautiful terminal colors
- **Node.js Community** - For inspiration and best practices
- **Contributors** - Everyone who has contributed to making this library better

## Support

- [Documentation](https://prettylogs.shrivatsav.dev)
- [Issue Tracker](https://github.com/Millosaurs/prettylogs/issues)
- [Discussions](https://github.com/Millosaurs/prettylogs/discussions)
- [Email Support](mailto:support@prettylogs.dev)

## Roadmap

- [ ] **Plugin System** - Custom formatters and outputs
- [ ] **Log Streaming** - WebSocket and SSE support
- [ ] **Metrics Integration** - Prometheus and StatsD
- [ ] **Cloud Logging** - AWS CloudWatch, Google Cloud Logging
- [ ] **Log Aggregation** - ELK Stack integration
- [ ] **Performance Dashboard** - Real-time logging metrics
- [ ] **VS Code Extension** - Enhanced development experience

---

Made by [Millosaurs](https://github.com/Millosaurs)

**Star this repository if you find it useful!**
# PrettyLogs API Documentation

## Table of Contents

- [Quick Start](#quick-start)
- [Core API](#core-api)
- [Configuration](#configuration)
- [Factory Functions](#factory-functions)
- [Advanced Features](#advanced-features)
- [Types](#types)
- [Examples](#examples)

## Quick Start

```typescript
import { logger, createLogger } from '@millosaurs/prettylogs';

// Use default logger
logger.info('Hello, world!');

// Create custom logger
const customLogger = createLogger({
  timestamps: true,
  logFile: './app.log',
  colorize: true
});

customLogger.info('Custom logger message');
```

## Core API

### Logger Interface

The main `Logger` interface provides all logging functionality:

```typescript
interface Logger {
  // Core logging methods
  trace(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
  success(...args: unknown[]): void;

  // Advanced features
  group(label: string, fn: () => void): void;
  table(data: unknown[]): void;
  assert(condition: boolean, msg: string): void;
  spinner(msg: string): () => void;
  child(namespace: string): Logger;

  // Configuration
  setConfig(config: Partial<LoggerConfig>): void;
  getConfig(): LoggerConfig;

  // Performance monitoring
  time(label: string): void;
  timeEnd(label: string): void;
  startTimer(label: string): () => number;
  profile(label: string): () => void;

  // Output formatting
  json(data: unknown, level?: LogLevel): void;
  box(message: string, level?: LogLevel): void;
  divider(char?: string, length?: number): void;

  // Utility methods
  clear(): void;
  flush(): Promise<void>;
  close(): Promise<void>;

  // File operations
  clearLogFile(): void;
  getLogFileSize(): number;
  rotateLogFile(): void;

  // Stream operations
  writeStream(message: string, stream?: NodeJS.WriteStream): void;
  setFormatter(formatter: CustomFormatter): void;

  // Level management
  setLevel(level: LogLevel): void;
  isLevelEnabled(level: LogLevel): boolean;
}
```

### Basic Logging Methods

#### `trace(...args: unknown[]): void`
Logs trace-level messages (lowest priority).

```typescript
logger.trace('Entering function', { userId: 123 });
```

#### `debug(...args: unknown[]): void`
Logs debug information for development.

```typescript
logger.debug('Processing user data', userData);
```

#### `info(...args: unknown[]): void`
Logs general information messages.

```typescript
logger.info('User logged in successfully', { userId: 123 });
```

#### `warn(...args: unknown[]): void`
Logs warning messages for potential issues.

```typescript
logger.warn('Rate limit approaching', { requests: 95, limit: 100 });
```

#### `error(...args: unknown[]): void`
Logs error messages for exceptions and failures.

```typescript
logger.error('Database connection failed', error);
```

#### `fatal(...args: unknown[]): void`
Logs fatal errors and exits the process with code 1.

```typescript
logger.fatal('Critical system failure', { error: 'OUT_OF_MEMORY' });
// Process exits after logging
```

#### `success(...args: unknown[]): void`
Logs success messages for completed operations.

```typescript
logger.success('Payment processed successfully', { orderId: 'ORD-123' });
```

## Configuration

### LoggerConfig Interface

```typescript
interface LoggerConfig {
  levels?: LogLevel[];              // Allowed log levels
  minLevel?: LogLevel;              // Minimum log level to output
  timestamps?: boolean;             // Include timestamps
  mode?: LogMode;                   // Logging mode
  logFile?: string;                 // File path for logging
  maxFileSize?: number;             // Max file size before rotation
  maxFiles?: number;                // Number of rotated files to keep
  colorize?: boolean;               // Enable colored output
  prettyPrint?: boolean;            // Pretty print objects
  logFormat?: LogFormat;            // Output format
  dateFormat?: DateFormat;          // Timestamp format
  environment?: string;             // Environment identifier
  compression?: boolean;            // Compress rotated files
  async?: boolean;                  // Enable async file writing
  bufferSize?: number;              // Buffer size for async writing
  flushInterval?: number;           // Flush interval in ms
}
```

### Configuration Options

#### Log Levels
- `TRACE` (0) - Detailed trace information
- `DEBUG` (1) - Debug information
- `INFO` (2) - General information
- `WARN` (3) - Warning messages
- `ERROR` (4) - Error messages
- `FATAL` (5) - Fatal errors
- `SUCCESS` (2) - Success messages (same level as INFO)

#### Log Modes
- `silent` - Disable all output
- `normal` - Standard logging (excludes TRACE and DEBUG)
- `verbose` - Includes DEBUG messages
- `debug` - Includes all log levels

#### Date Formats
- `iso` - ISO 8601 format (2023-12-01T10:30:00.000Z)
- `locale` - Locale-specific format
- `unix` - Unix timestamp
- `short` - Time only (HH:MM:SS)

#### Log Formats
- `text` - Human-readable text format
- `json` - JSON format for structured logging
- `structured` - Structured text format

### Dynamic Configuration

```typescript
const logger = createLogger();

// Update configuration at runtime
logger.setConfig({
  timestamps: true,
  colorize: false,
  minLevel: 'WARN'
});

// Get current configuration
const config = logger.getConfig();
console.log(config);
```

## Factory Functions

### `createLogger(config?: LoggerConfig): Logger`
Creates a new logger instance with optional configuration.

```typescript
const logger = createLogger({
  timestamps: true,
  logFile: './app.log',
  colorize: true,
  minLevel: 'INFO'
});
```

### `createEnvironmentLogger(environment?: string): Logger`
Creates a logger configured for specific environments.

```typescript
// Automatically detects NODE_ENV
const logger = createEnvironmentLogger();

// Or specify environment
const prodLogger = createEnvironmentLogger('production');
```

**Environment Defaults:**
- **Development**: Debug mode, colors enabled, text format
- **Test**: Normal mode, colors disabled, minimal output
- **Production**: JSON format, colors disabled, INFO+ levels only

### `createStructuredLogger(serviceName: string, version: string): Logger`
Creates a logger optimized for microservices with structured output.

```typescript
const serviceLogger = createStructuredLogger('user-service', '1.2.3');
serviceLogger.info('Service started', { port: 3000 });

// Output includes service metadata:
// {"service":"user-service","version":"1.2.3","level":"INFO",...}
```

## Advanced Features

### Child Loggers

Create namespaced loggers for different components:

```typescript
const dbLogger = logger.child('database');
const apiLogger = logger.child('api');

dbLogger.info('Connection established');
// Output: [INFO]: [database] Connection established

const queryLogger = dbLogger.child('query');
queryLogger.debug('SELECT * FROM users');
// Output: [DEBUG]: [database:query] SELECT * FROM users
```

### Grouped Logging

Group related log messages:

```typescript
logger.group('User Authentication', () => {
  logger.info('Validating credentials');
  logger.success('Credentials valid');
  logger.info('Generating token');
  logger.success('Token generated');
});
```

### Performance Monitoring

#### Timers

```typescript
// Method 1: time/timeEnd
logger.time('database-query');
await performDatabaseQuery();
logger.timeEnd('database-query');

// Method 2: startTimer
const stopTimer = logger.startTimer('api-request');
await processRequest();
const duration = stopTimer();
```

#### Profiling

```typescript
const stopProfile = logger.profile('memory-intensive-operation');
await processLargeDataset();
stopProfile();
// Logs duration and memory usage
```

### Table Output

Display arrays of objects in table format:

```typescript
const users = [
  { id: 1, name: 'John', role: 'admin' },
  { id: 2, name: 'Jane', role: 'user' },
];

logger.table(users);
```

### Assertions

Log errors when conditions fail:

```typescript
const userId = getUserId();
logger.assert(userId > 0, 'User ID must be positive');
logger.assert(user.email.includes('@'), 'Valid email required');
```

### Spinners

Show loading indicators:

```typescript
const stopSpinner = logger.spinner('Processing payment...');
await processPayment();
stopSpinner();
logger.success('Payment completed');
```

### Box Messages

Display important messages in boxes:

```typescript
logger.box('🚀 Server started successfully!\nListening on port 3000', 'SUCCESS');

// Output:
// ┌─────────────────────────────────────────┐
// │ 🚀 Server started successfully!        │
// │ Listening on port 3000                 │
// └─────────────────────────────────────────┘
```

### JSON Logging

Pretty-print JSON objects:

```typescript
const userData = { id: 1, name: 'John', preferences: { theme: 'dark' } };
logger.json(userData, 'INFO');
```

### Dividers

Add visual separators:

```typescript
logger.divider();                    // Default: ─────────...
logger.divider('=', 40);            // Custom: ========...
logger.divider('*', 50);            // Custom: ********...
```

## File Logging

### Basic File Logging

```typescript
const logger = createLogger({
  logFile: './logs/app.log',
  logFormat: 'json',
  timestamps: true
});
```

### File Rotation

```typescript
const logger = createLogger({
  logFile: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024,    // 10MB
  maxFiles: 5,                       // Keep 5 rotated files
  compression: true                  // Compress rotated files
});
```

### Async File Logging

```typescript
const logger = createLogger({
  logFile: './logs/app.log',
  async: true,
  bufferSize: 100,                   // Buffer 100 entries
  flushInterval: 1000                // Flush every 1000ms
});

// Ensure all logs are written before exit
process.on('SIGINT', async () => {
  await logger.flush();
  await logger.close();
  process.exit(0);
});
```

### File Operations

```typescript
// Get current log file size
const size = logger.getLogFileSize();

// Clear log file
logger.clearLogFile();

// Manually rotate log file
logger.rotateLogFile();
```

## Custom Formatters

```typescript
const customFormatter = (entry: LogEntry): string => {
  return `${entry.timestamp} [${entry.level}] ${entry.message}`;
};

logger.setFormatter(customFormatter);
```

## Types

### LogLevel
```typescript
type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'SUCCESS';
```

### LogEntry
```typescript
interface LogEntry {
  timestamp: string | number;
  level: LogLevel;
  namespace?: string;
  message: string;
  metadata?: unknown;
  environment?: string;
  pid?: number;
  hostname?: string;
}
```

### CustomFormatter
```typescript
interface CustomFormatter {
  (entry: LogEntry): string;
}
```

## Examples

### Basic Usage

```typescript
import { logger } from '@millosaurs/prettylogs';

logger.info('Application started');
logger.warn('Memory usage high', { usage: '85%' });
logger.error('Database connection failed', new Error('ECONNREFUSED'));
logger.success('User created successfully', { userId: 123 });
```

### Web Server Logging

```typescript
import { createLogger } from '@millosaurs/prettylogs';

const serverLogger = createLogger({
  logFile: './logs/server.log',
  timestamps: true,
  logFormat: 'json'
});

const requestLogger = serverLogger.child('request');
const dbLogger = serverLogger.child('database');

app.use((req, res, next) => {
  const requestId = generateId();
  req.logger = requestLogger.child(requestId);

  req.logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });

  next();
});
```

### Microservice Logging

```typescript
import { createStructuredLogger } from '@millosaurs/prettylogs';

const logger = createStructuredLogger('user-service', '1.0.0');

// Add correlation IDs
const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || generateId();
  req.correlationId = correlationId;

  req.logger = logger.child('request').child(correlationId);
  next();
};

// Business logic logging
async function createUser(userData) {
  const timer = logger.startTimer('user-creation');

  try {
    logger.info('Creating user', { email: userData.email });

    const user = await db.users.create(userData);

    logger.success('User created', {
      userId: user.id,
      duration: timer()
    });

    return user;
  } catch (error) {
    logger.error('User creation failed', {
      error: error.message,
      userData: { email: userData.email },
      duration: timer()
    });
    throw error;
  }
}
```

### Development vs Production

```typescript
// Development configuration
const devLogger = createLogger({
  mode: 'debug',
  colorize: true,
  prettyPrint: true,
  timestamps: true
});

// Production configuration
const prodLogger = createLogger({
  mode: 'normal',
  colorize: false,
  logFormat: 'json',
  logFile: './logs/app.log',
  maxFileSize: 50 * 1024 * 1024,
  maxFiles: 10,
  async: true
});

const logger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;
```

### Error Handling with Context

```typescript
const logger = createLogger();

async function processOrder(orderId) {
  const orderLogger = logger.child('order').child(orderId);

  try {
    orderLogger.info('Processing order started');

    const order = await getOrder(orderId);
    orderLogger.debug('Order retrieved', { items: order.items.length });

    await validateOrder(order);
    orderLogger.info('Order validated');

    await processPayment(order);
    orderLogger.success('Payment processed', { amount: order.total });

    await fulfillOrder(order);
    orderLogger.success('Order fulfilled');

    return order;
  } catch (error) {
    orderLogger.error('Order processing failed', {
      error: error.message,
      stack: error.stack,
      orderId,
      step: error.step || 'unknown'
    });

    throw error;
  }
}
```

For more examples and use cases, see the [examples directory](../examples/) in the repository.

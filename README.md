# Pretty Logger

A professional console logger for Node.js featuring centered badges and color-coded output for improved log readability.

## Features

- **Centered Badges** - Perfectly aligned log level indicators for consistent formatting
- **Color-Coded Output** - Distinct colors for each log level to quickly identify message types
- **Lightweight** - Minimal dependencies (only chalk for terminal styling)
- **Simple API** - Intuitive interface that integrates seamlessly into existing projects
- **TypeScript Support** - Fully typed definitions included for enhanced development experience
- **Configurable** - Adjust log levels, timestamps, output mode, and more
- **Child Loggers** - Create namespaced loggers for better organization
- **Grouped Logs** - Visually group related log messages
- **Table Output** - Display array of objects in a well-formatted table
- **Assertions** - Log errors when a condition is false
- **Spinners** - Show animated loading indicators for long-running operations
- **Performance Timers** - Measure execution time of code blocks
- **JSON Logging** - Pretty-print JSON objects directly to the console
- **Box Messages** - Display important messages in an attention-grabbing box
- **Dividers** - Insert visual separators in your logs
- **File Logging** - Write logs to a file in text or JSON format with file size management
- **Dynamic Configuration** - Change logger settings on the fly

## Installation

```bash
npm install @millosaurs/prettylogs
```

Using Yarn:

```bash
yarn add @millosaurs/prettylogs
```

Using pnpm:

```bash
pnpm add @millosaurs/prettylogs
```

Using Bun:

```bash
bun add @millosaurs/prettylogs
```

## Usage

### Basic Example

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.info("Server started on port 3000");
logger.debug("Fetching data from cache");
logger.warn("Cache miss, fetching from DB");
logger.error("Database connection failed");
logger.success("Data cached successfully");
```

<img width="1119" height="126" alt="image" src="https://github.com/user-attachments/assets/d6eb743b-f5ef-4c0b-a53c-a1164c634436" />

### Express.js Integration

```typescript
import express from "express";
import { logger } from "@millosaurs/prettylogs";

const app = express();

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

app.get("/api/users", (req, res) => {
    logger.debug("Fetching users from database");
    // ... fetch users
    logger.success("Users retrieved successfully");
    res.json(users);
});

app.listen(3000, () => {
    logger.info("Server listening on port 3000");
});
```

### Error Handling

```typescript
import { logger } from "@millosaurs/prettylogs";

async function processData() {
    try {
        logger.info("Starting data processing");
        await fetchData();
        logger.success("Data processing completed");
    } catch (error: any) {
        logger.error(`Processing failed: ${error.message}`);
    }
}
```

### Development Debugging

```typescript
import { logger } from "@millosaurs/prettylogs";

function calculateTotal(items: Item[]) {
    logger.debug(`Calculating total for ${items.length} items`);

    const total = items.reduce((sum, item) => {
        logger.debug(`Adding item: ${item.name} - $${item.price}`);
        return sum + item.price;
    }, 0);

    logger.success(`Total calculated: $${total}`);
    return total;
}
```

## Configuration

The `createLogger` function allows for custom configurations.

```typescript
import { createLogger } from "@millosaurs/prettylogs";

const customLogger = createLogger({
    levels: ["INFO", "WARN", "ERROR"], // Only log these levels
    timestamps: true, // Enable timestamps
    mode: "verbose", // Show debug and trace messages
    logFile: "./app.log", // Log to a file
    colorize: false, // Disable colored output
    dateFormat: "locale", // Use locale string for timestamps
});

customLogger.info("This is an important message.");
customLogger.debug("This debug message will not show unless mode is verbose.");
```

### Dynamic Configuration

You can update the logger's configuration at runtime using `setConfig`.

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.info("Initial message without timestamps");

logger.setConfig({ timestamps: true, dateFormat: "iso" });
logger.info("Now with ISO timestamps");

logger.setConfig({ colorize: false });
logger.info("Colors disabled");
```

## Advanced Features

### Child Loggers

Create namespaced loggers to better categorize messages from different parts of your application.

```typescript
import { logger } from "@millosaurs/prettylogs";

const dbLogger = logger.child("database");
const authLogger = logger.child("auth");

dbLogger.info("Connected to MongoDB");
authLogger.success("User 'john_doe' authenticated");

const queryLogger = dbLogger.child("query");
queryLogger.debug("SELECT * FROM users WHERE status = 'active'");
```

### Grouped Logs

Organize related log messages into collapsible groups in the console.

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.group("User Registration Process", () => {
    logger.info("Step 1: Validating user input");
    logger.success("Input valid");
    logger.info("Step 2: Saving user to database");
    logger.success("User 'jane_doe' created");
    logger.warn("Step 3: Sending welcome email failed, retrying...");
});
```

### Table Output

Display an array of objects as a well-formatted table in the console.

```typescript
import { logger } from "@millosaurs/prettylogs";

const users = [
    { id: 1, name: "Alice", role: "Admin" },
    { id: 2, name: "Bob", role: "User" },
    { id: 3, name: "Charlie", role: "Guest" },
];

logger.info("Current users:");
logger.table(users);
```

### Assertions

Log an error message if a given condition is false. Useful for debugging and validation.

```typescript
import { logger } from "@millosaurs/prettylogs";

const userId = 0;
logger.assert(userId > 0, "User ID must be positive!"); // This will log an error.
logger.assert(typeof "hello" === "string", "This will not log.");
```

### Spinners

Show a loading spinner for asynchronous operations. The `spinner` function returns a stop function to clear the spinner.

```typescript
import { logger } from "@millosaurs/prettylogs";

async function fetchData() {
    const stopSpinner = logger.spinner("Fetching data...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    stopSpinner(); // Stop the spinner
    logger.success("Data fetched successfully!");
}

fetchData();
```

### Performance Timers

Measure the duration of operations.

#### `logger.time()` and `logger.timeEnd()`

Start a timer with `time()` and stop it with `timeEnd()` using the same label.

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.time("data-processing");
// Simulate a task
await new Promise((resolve) => setTimeout(resolve, 1500));
logger.timeEnd("data-processing"); // Logs the duration
```

#### `logger.startTimer()`

Returns a function that, when called, stops the timer and returns the duration.

```typescript
import { logger } from "@millosaurs/prettylogs";

const stopDbTimer = logger.startTimer("database-query");
// Simulate database query
await new Promise((resolve) => setTimeout(resolve, 800));
const duration = stopDbTimer(); // Logs the duration and returns it
logger.info(`Database query took ${duration.toFixed(2)}ms`);
```

### JSON Output

Log any JavaScript object as pretty-printed JSON.

```typescript
import { logger } from "@millosaurs/prettylogs";

const user = {
    id: 123,
    name: "John Doe",
    email: "john.doe@example.com",
    settings: {
        theme: "dark",
        notifications: true,
    },
};

logger.json(user, "INFO");
```

### Box Messages

Display important messages within a visually distinct box.

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.box(
    "Application started successfully!\nListening on port 8080",
    "SUCCESS",
);

logger.box("WARNING: High CPU usage detected.", "WARN");
```

### Dividers

Insert horizontal lines for visual separation in your logs.

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.info("Beginning of process");
logger.divider(); // Default divider
logger.info("Intermediate step");
logger.divider("=", 40); // Custom character and length
logger.info("End of process");
```

### Clearing the Console

Clears the terminal console.

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.info("Some messages...");
// ...
logger.clear(); // Clears the console
logger.info("Console cleared, new messages here.");
```

### File Logging

Configure the logger to write messages to a specified file. Supports text and JSON formats, and includes log rotation based on `maxFileSize`.

```typescript
import { createLogger } from "@millosaurs/prettylogs";

const fileLogger = createLogger({
    logFile: "./logs/application.log",
    timestamps: true,
    logFormat: "json", // or "text"
    maxFileSize: 5 * 1024 * 1024, // 5MB
});

fileLogger.info("Application started.");
fileLogger.error("An error occurred.", { code: 500, details: "DB Down" });

// Clear the log file
fileLogger.clearLogFile();

// Get the current log file size
const size = fileLogger.getLogFileSize();
fileLogger.info(`Log file size: ${size} bytes`);
```

## Log Levels

| Level   | Color  | Hex Code  | Use Case                                  |
| ------- | ------ | --------- | ----------------------------------------- |
| INFO    | Cyan   | `#00bbff` | General information and status updates    |
| DEBUG   | Orange | `#ff8d00` | Detailed debugging information            |
| WARN    | Yellow | `#fff700` | Warning messages and potential issues     |
| ERROR   | Red    | `#f44343` | Error messages and failures               |
| SUCCESS | Green  | `#00ff0d` | Successful operations and confirmations   |
| TRACE   | Purple | `#a855f7` | Very detailed, granular debugging         |
| FATAL   | Red    | `#dc2626` | Critical errors, causing application exit |

## API Reference

### `logger.info(...args: any[]): void`

Logs an informational message. Use for general application status updates and non-critical information.

### `logger.debug(...args: any[]): void`

Logs a debug message. Use for detailed diagnostic information during development. Only visible when `mode` is `normal` or `verbose`.

### `logger.warn(...args: any[]): void`

Logs a warning message. Use for potentially problematic situations that don't prevent execution.

### `logger.error(...args: any[]): void`

Logs an error message. Use for error conditions and failures that require attention.

### `logger.success(...args: any[]): void`

Logs a success message. Use to confirm successful completion of operations.

### `logger.trace(...args: any[]): void`

Logs a trace message. Provides extremely detailed, granular debugging information. Only visible when `mode` is `verbose`.

### `logger.fatal(...args: any[]): void`

Logs a fatal error message and then exits the process with code 1.

### `logger.group(label: string, fn: () => void): void`

Creates a collapsible log group in the console.

### `logger.table(data: any[]): void`

Displays tabular data (array of objects) in the console.

### `logger.assert(condition: boolean, msg: string): void`

Logs an error message if `condition` is `false`.

### `logger.spinner(msg: string): () => void`

Starts an animated loading spinner with the given message. Returns a function to stop the spinner.

### `logger.child(namespace: string): Logger`

Creates a new logger instance with an appended namespace.

### `logger.setConfig(config: Partial<LoggerConfig>): void`

Updates the logger's configuration dynamically.

### `logger.getConfig(): LoggerConfig`

Returns the current logger configuration.

### `logger.time(label: string): void`

Starts a named timer.

### `logger.timeEnd(label: string): void`

Stops a named timer and logs the elapsed time.

### `logger.startTimer(label: string): () => number`

Starts a named timer and returns a function. Calling this returned function stops the timer, logs the elapsed time, and returns the duration in milliseconds.

### `logger.json(data: any, level?: LogLevel): void`

Logs a JavaScript object as pretty-printed JSON at the specified log level (default: `INFO`).

### `logger.box(message: string, level?: LogLevel): void`

Displays a multi-line message within a colored box.

### `logger.divider(char?: string, length?: number): void`

Logs a horizontal divider line. `char` defaults to '─' and `length` to 60.

### `logger.clear(): void`

Clears the console.

### `logger.clearLogFile(): void`

Clears the content of the configured log file.

### `logger.getLogFileSize(): number`

Returns the current size of the configured log file in bytes.

### `logger.writeStream(message: string, stream?: NodeJS.WriteStream): void`

Writes a message to a specified stream (defaults to `process.stdout`).

## Requirements

- Node.js 14.0.0 or higher
- Terminal with ANSI color support

## TypeScript

This package includes TypeScript definitions out of the box. No additional `@types` package installation required.

```typescript
import {
    logger,
    createLogger,
    LoggerConfig,
    LogLevel,
} from "@millosaurs/prettylogs";

// Full type safety and autocomplete support
logger.info("Typed message");

const myCustomLogger = createLogger({
    levels: ["INFO", "ERROR"] as LogLevel[],
});
```

## License

MIT

## Contributing

Contributions are welcome. Please open an issue or submit a pull request on the project repository.

## Dependencies

- [chalk](https://github.com/chalk/chalk) - Terminal string styling

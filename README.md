# Pretty Logger

A professional console logger for Node.js featuring centered badges, color-coded output, and comprehensive logging features for improved log readability and debugging.

## Features

- **Centered Badges** - Perfectly aligned log level indicators for consistent formatting
- **Color-Coded Output** - Distinct colors for each log level to quickly identify message types
- **Multiple Log Levels** - INFO, DEBUG, WARN, ERROR, SUCCESS, TRACE, FATAL
- **Timestamps** - Configurable timestamp formats (ISO, locale, unix)
- **Log Filtering** - Customizable log levels and output modes
- **Child Loggers** - Create namespaced loggers for better organization
- **Grouped Logs** - Visually group related log messages
- **Table Output** - Display arrays of objects in well-formatted tables
- **Assertions** - Log errors when conditions are false
- **Spinners** - Show animated loading indicators for long-running operations
- **Performance Timers** - Measure execution time of code blocks
- **JSON Logging** - Pretty-print JSON objects directly to the console
- **Box Messages** - Display important messages in attention-grabbing boxes
- **Dividers** - Insert visual separators in your logs
- **File Logging** - Write logs to files in text or JSON format with file size management
- **Dynamic Configuration** - Change logger settings on the fly
- **TypeScript Support** - Fully typed definitions included

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

## Quick Start

### Basic Usage

```typescript
import { logger } from "@millosaurs/prettylogs";

logger.info("This is an info message");
logger.debug("This is a debug message");
logger.warn("This is a warning message");
logger.error("This is an error message");
logger.success("This is a success message");
logger.trace("This is a trace message");
```

<img width="403" height="129" alt="image" src="https://github.com/user-attachments/assets/e46468f1-b1e1-49f8-b989-b6adf3809658" />


### Multiple Arguments with Objects

```typescript
logger.info("User logged in:", {
    userId: 123,
    email: "test@example.com",
    role: "admin",
});

logger.success("Operation completed", "with", 3, "items processed");
```

<img width="603" height="244" alt="image" src="https://github.com/user-attachments/assets/aa83aa11-d034-4278-9975-d8780adf6374" />


### Custom Logger Configuration

```typescript
import { createLogger } from "@millosaurs/prettylogs";

// Logger with timestamps
const isoLogger = createLogger({ timestamps: true, dateFormat: "iso" });
isoLogger.info("ISO format timestamp");

// Filtered logger (only specific levels)
const filteredLogger = createLogger({ levels: ["INFO", "ERROR", "FATAL"] });
filteredLogger.info("✓ This will show");
filteredLogger.debug("✗ This will NOT show");

// Verbose mode logger
const verboseLogger = createLogger({ mode: "verbose" });
verboseLogger.trace("Trace messages are visible in verbose mode");
```

<img width="668" height="85" alt="image" src="https://github.com/user-attachments/assets/458d0876-64ff-4c65-8ca5-9cce53940e1a" />


## Advanced Features

### Child Loggers with Namespaces

```typescript
const dbLogger = logger.child("database");
const authLogger = logger.child("auth");
const apiLogger = logger.child("api");

dbLogger.info("Connected to MongoDB on port 27017");
authLogger.success("JWT token validated");
apiLogger.warn("Rate limit: 95/100 requests");

// Nested child loggers
const queryLogger = dbLogger.child("query");
const cacheLogger = dbLogger.child("cache");
queryLogger.debug("SELECT * FROM users WHERE active = true");
cacheLogger.info("Cache hit for key: user:123");
```

<img width="746" height="140" alt="image" src="https://github.com/user-attachments/assets/8d2eb557-f92c-4cf2-a890-9b5af6ec02f8" />


### Grouped Logs

```typescript
logger.group("🔐 User Authentication Flow", () => {
    logger.info("Step 1: Validating credentials");
    logger.success("Credentials valid");
    logger.info("Step 2: Checking permissions");
    logger.success("User has required permissions");
    logger.info("Step 3: Generating session token");
    logger.success("Token generated: abc123xyz");
});
```

<img width="511" height="190" alt="image" src="https://github.com/user-attachments/assets/d19c1f1f-e85d-42fd-993e-e8850b4dfbf7" />


### Table Output

```typescript
const users = [
    {
        id: 1,
        name: "Alice Johnson",
        role: "Admin",
        status: "active",
        lastLogin: "2025-10-26",
    },
    {
        id: 2,
        name: "Bob Smith",
        role: "User",
        status: "active",
        lastLogin: "2025-10-27",
    },
];

logger.info("Current users in system:");
logger.table(users);
```

<img width="694" height="196" alt="image" src="https://github.com/user-attachments/assets/325f76cb-7d1a-45de-ba7e-2d450f4b5fd7" />


### Assertions

```typescript
const userId = 123;
const username = "john_doe";

logger.assert(userId > 0, "User ID must be positive");
logger.assert(username.length >= 3, "Username must be at least 3 characters");
logger.assert(userId < 100, "User ID must be less than 100"); // This will fail
```

<img width="643" height="39" alt="image" src="https://github.com/user-attachments/assets/d5e4c495-c59f-44f2-b9a7-d6b380646737" />


### Spinners for Async Operations

```typescript
const spinner1 = logger.spinner("Fetching user data from database...");
await sleep(2000); // Simulate async operation
spinner1();
logger.success("User data loaded successfully");

const spinner2 = logger.spinner("Processing payment transaction...");
await sleep(1500);
spinner2();
logger.success("Payment processed");
```

### Performance Timers

```typescript
// Method 1: time/timeEnd
logger.time("database-query");
await sleep(500); // Simulate database query
logger.timeEnd("database-query");

// Method 2: startTimer (returns duration)
const stopTimer = logger.startTimer("api-request");
await sleep(300); // Simulate API request
const duration = stopTimer();
logger.info(`Request completed in ${duration.toFixed(2)}ms`);
```

<img width="485" height="131" alt="image" src="https://github.com/user-attachments/assets/a73205a6-b227-42c4-a012-c0b8a9eaa95d" />


### Box Messages

```typescript
logger.box(
    "Server started successfully!\nListening on port 3000\nEnvironment: production",
    "SUCCESS",
);

logger.box(
    "WARNING: Database migration required\nPlease run: npm run migrate",
    "WARN",
);

logger.box(
    "CRITICAL ERROR\nMemory usage exceeded 90%\nImmediate action required!",
    "ERROR",
);
```

<img width="458" height="323" alt="image" src="https://github.com/user-attachments/assets/2f0c42c2-9109-4fe9-9cbb-d6e271201898" />


### JSON Formatting

```typescript
const complexData = {
    user: {
        id: 123,
        name: "John Doe",
        email: "john@example.com",
        settings: {
            theme: "dark",
            notifications: true,
            language: "en-US",
        },
    },
    metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: "1.2.3",
    },
};

logger.json(complexData);
```

<img width="534" height="407" alt="image" src="https://github.com/user-attachments/assets/f1057414-ad4b-445b-907c-a230a589a4f4" />


### Dividers

```typescript
logger.divider();
logger.info("Section 1: Configuration");
logger.divider("=", 40);
logger.info("Section 2: Data Processing");
logger.divider("*", 50);
logger.info("Section 3: Results");
logger.divider();
```

<img width="678" height="170" alt="image" src="https://github.com/user-attachments/assets/b52da1e8-381f-4dd8-981d-e975994755c9" />


### File Logging

```typescript
const fileLogger = createLogger({
    logFile: "./logs/app.log",
    timestamps: true,
    logFormat: "json", // or "text"
});

fileLogger.info("Application started");
fileLogger.error("Sample error for logging", {
    code: 500,
    message: "Internal server error",
});

// Get log file size
const fileSize = fileLogger.getLogFileSize();
logger.info(`Current log file size: ${fileSize} bytes`);

// Clear log file
// fileLogger.clearLogFile();
```

<img width="716" height="180" alt="image" src="https://github.com/user-attachments/assets/5001a095-a162-4989-b23a-5614a6c2ab02" />


### Dynamic Configuration

```typescript
const dynamicLogger = createLogger();
dynamicLogger.info("Initial message without timestamps");

dynamicLogger.setConfig({ timestamps: true, dateFormat: "iso" });
dynamicLogger.info("Now with ISO timestamps");

dynamicLogger.setConfig({ colorize: false });
dynamicLogger.info("Colors disabled");

dynamicLogger.setConfig({ colorize: true, timestamps: false });
dynamicLogger.info("Colors enabled, timestamps disabled");
```

<img width="679" height="110" alt="image" src="https://github.com/user-attachments/assets/53112907-9ae4-4060-af55-cd1cc2cfd162" />

<img width="703" height="83" alt="image" src="https://github.com/user-attachments/assets/9141d2f6-8aa3-462e-b93f-a79876d58f67" />



## Real-World Examples

### Express.js Integration

```typescript
import express from "express";
import { logger } from "@millosaurs/prettylogs";

const app = express();
const requestLogger = logger.child("api");

app.use((req, res, next) => {
    const stopTimer = requestLogger.startTimer("request");

    res.on("finish", () => {
        stopTimer();
        requestLogger.info(`${req.method} ${req.path} - ${res.statusCode}`);
    });

    next();
});

app.get("/api/users", async (req, res) => {
    requestLogger.group("User API Request", () => {
        requestLogger.info("Headers:", req.headers);
        requestLogger.debug("Query params:", req.query);
    });

    const spinner = requestLogger.spinner("Fetching users from database...");
    await sleep(1000); // Simulate DB call
    spinner();

    requestLogger.success("Users retrieved successfully");
    res.json([{ id: 1, name: "John Doe" }]);
});

app.listen(3000, () => {
    logger.box(
        "Server started successfully!\nListening on port 3000",
        "SUCCESS",
    );
});
```




### Error Handling Scenario

```typescript
import { logger } from "@millosaurs/prettylogs";

const errorLogger = logger.child("error-handler");

async function riskyOperation() {
    try {
        errorLogger.info("Attempting risky operation...");
        // Simulate an error
        throw new Error("Connection timeout after 30s");
    } catch (error: any) {
        errorLogger.error("Operation failed:", error.message);
        errorLogger.json(
            {
                error: error.message,
                stack: error.stack?.split("\n").slice(0, 3),
                timestamp: new Date().toISOString(),
            },
            "ERROR",
        );
        errorLogger.box(
            "Recovery action required\nPlease check connection settings",
            "WARN",
        );
    }
}
```

<img width="870" height="358" alt="image" src="https://github.com/user-attachments/assets/76bd4364-77ff-452a-89e7-ed01e09b14ed" />


### Complete API Request Flow

```typescript
const requestLogger = logger.child("api");

logger.divider("=", 70);
requestLogger.info("Incoming request: POST /api/v1/users");

const requestTimer = requestLogger.startTimer("request-processing");

requestLogger.group("Request Details", () => {
    requestLogger.info("Headers:", {
        "content-type": "application/json",
        authorization: "Bearer ***",
        "user-agent": "Mozilla/5.0",
    });
    requestLogger.debug("Body:", {
        name: "Jane Doe",
        email: "jane@example.com",
        role: "user",
    });
});

const dbSpinner = requestLogger.spinner("Validating user data...");
await sleep(800);
dbSpinner();
requestLogger.success("Validation passed");

const saveSpinner = requestLogger.spinner("Saving to database...");
await sleep(1200);
saveSpinner();
requestLogger.success("User created with ID: 456");

const totalDuration = requestTimer();

requestLogger.group("Response", () => {
    requestLogger.success("Status: 201 Created");
    requestLogger.info(`Total time: ${totalDuration.toFixed(2)}ms`);
});

logger.divider("=", 70);
```

<img width="815" height="631" alt="image" src="https://github.com/user-attachments/assets/a298fd9c-91c8-4fbc-acb5-cb63be1134e2" />

## Configuration Options

### Logger Configuration Object

```typescript
interface LoggerConfig {
    levels: LogLevel[]; // Enabled log levels
    timestamps: boolean; // Show timestamps
    dateFormat: "iso" | "locale" | "unix"; // Timestamp format
    mode: "normal" | "verbose" | "silent"; // Output mode
    logFile?: string; // File path for logging
    logFormat: "text" | "json"; // File logging format
    colorize: boolean; // Enable colored output
    maxFileSize: number; // Max file size in bytes (default: 5MB)
}
```

### Default Configuration

```typescript
const defaultConfig: LoggerConfig = {
    levels: ["INFO", "DEBUG", "WARN", "ERROR", "SUCCESS", "TRACE", "FATAL"],
    timestamps: false,
    dateFormat: "iso",
    mode: "normal",
    logFormat: "text",
    colorize: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
};
```

## Log Levels

| Level   | Color  | Hex Code  | Use Case                                  | Visible in Mode |
| ------- | ------ | --------- | ----------------------------------------- | --------------- |
| INFO    | Cyan   | `#00bbff` | General information and status updates    | normal, verbose |
| DEBUG   | Orange | `#ff8d00` | Detailed debugging information            | normal, verbose |
| WARN    | Yellow | `#fff700` | Warning messages and potential issues     | normal, verbose |
| ERROR   | Red    | `#f44343` | Error messages and failures               | normal, verbose |
| SUCCESS | Green  | `#00ff0d` | Successful operations and confirmations   | normal, verbose |
| TRACE   | Purple | `#a855f7` | Very detailed, granular debugging         | verbose only    |
| FATAL   | Red    | `#dc2626` | Critical errors, causing application exit | normal, verbose |

## Output Modes

- **normal**: Shows INFO, DEBUG, WARN, ERROR, SUCCESS, FATAL (default)
- **verbose**: Shows all levels including TRACE
- **silent**: Suppresses all log output

## API Reference

### Core Logging Methods

- `logger.info(...args: any[]): void` - Informational messages
- `logger.debug(...args: any[]): void` - Debug messages
- `logger.warn(...args: any[]): void` - Warning messages
- `logger.error(...args: any[]): void` - Error messages
- `logger.success(...args: any[]): void` - Success messages
- `logger.trace(...args: any[]): void` - Trace messages (verbose only)
- `logger.fatal(...args: any[]): void` - Fatal errors (exits process)

### Advanced Features

- `logger.child(namespace: string): Logger` - Create namespaced child logger
- `logger.group(label: string, fn: () => void): void` - Create log group
- `logger.table(data: any[]): void` - Display tabular data
- `logger.assert(condition: boolean, msg: string): void` - Conditional logging
- `logger.spinner(msg: string): () => void` - Animated spinner
- `logger.time(label: string): void` - Start timer
- `logger.timeEnd(label: string): void` - End and log timer
- `logger.startTimer(label: string): () => number` - Start timer with duration return
- `logger.json(data: any, level?: LogLevel): void` - Pretty-print JSON
- `logger.box(message: string, level?: LogLevel): void` - Boxed message
- `logger.divider(char?: string, length?: number): void` - Horizontal divider
- `logger.clear(): void` - Clear console

### Configuration Management

- `createLogger(config?: Partial<LoggerConfig>): Logger` - Create custom logger
- `logger.setConfig(config: Partial<LoggerConfig>): void` - Update configuration
- `logger.getConfig(): LoggerConfig` - Get current configuration

### File Logging Utilities

- `logger.getLogFileSize(): number` - Get log file size in bytes
- `logger.clearLogFile(): void` - Clear log file content

## Requirements

- Node.js 14.0.0 or higher
- Terminal with ANSI color support

## TypeScript Support

This package includes full TypeScript support with complete type definitions.

```typescript
import {
    logger,
    createLogger,
    LoggerConfig,
    LogLevel,
} from "@millosaurs/prettylogs";

// Full type safety and autocomplete
const config: Partial<LoggerConfig> = {
    levels: ["INFO", "ERROR"] as LogLevel[],
    timestamps: true,
};

const customLogger = createLogger(config);
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the project repository.

## Dependencies

- [chalk](https://github.com/chalk/chalk) - Terminal string styling

---

With Pretty Logger, you get a comprehensive logging solution that scales from simple debugging to complex production applications, providing both beautiful visual output and powerful logging capabilities.

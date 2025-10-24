# Pretty Logger

A professional console logger for Node.js featuring centered badges and color-coded output for improved log readability.

## Features

- **Centered Badges** - Perfectly aligned log level indicators for consistent formatting
- **Color-Coded Output** - Distinct colors for each log level to quickly identify message types
- **Lightweight** - Minimal dependencies (only chalk for terminal styling)
- **Simple API** - Intuitive interface that integrates seamlessly into existing projects
- **TypeScript Support** - Fully typed definitions included for enhanced development experience

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
    } catch (error) {
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

## Log Levels

| Level   | Color  | Hex Code  | Use Case                                |
| ------- | ------ | --------- | --------------------------------------- |
| INFO    | Cyan   | `#00bbff` | General information and status updates  |
| DEBUG   | Orange | `#ff8d00` | Detailed debugging information          |
| WARN    | Yellow | `#fff700` | Warning messages and potential issues   |
| ERROR   | Red    | `#f44343` | Error messages and failures             |
| SUCCESS | Green  | `#00ff0d` | Successful operations and confirmations |

## API Reference

### `logger.info(message: string): void`

Logs an informational message with a cyan-colored badge. Use for general application status updates and non-critical information.

### `logger.debug(message: string): void`

Logs a debug message with an orange-colored badge. Use for detailed diagnostic information during development.

### `logger.warn(message: string): void`

Logs a warning message with a yellow-colored badge. Use for potentially problematic situations that don't prevent execution.

### `logger.error(message: string): void`

Logs an error message with a red-colored badge. Use for error conditions and failures that require attention.

### `logger.success(message: string): void`

Logs a success message with a green-colored badge. Use to confirm successful completion of operations.

## Requirements

- Node.js 14.0.0 or higher
- Terminal with ANSI color support

## TypeScript

This package includes TypeScript definitions out of the box. No additional `@types` package installation required.

```typescript
import { logger } from "@millosaurs/prettylogs";

// Full type safety and autocomplete support
logger.info("Typed message");
```

## License

MIT

## Contributing

Contributions are welcome. Please open an issue or submit a pull request on the project repository.

## Dependencies

- [chalk](https://github.com/chalk/chalk) - Terminal string styling

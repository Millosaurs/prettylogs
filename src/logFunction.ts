import chalk from "chalk";
import fs from "fs";
import path from "path";
import os from "os";
import { performance } from "perf_hooks";
import { createWriteStream, WriteStream } from "fs";

// Core types
export type LogLevel =
  | "TRACE"
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "ERROR"
  | "FATAL"
  | "SUCCESS";

export type LogLevelNumeric = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DateFormat = "iso" | "locale" | "unix" | "short";

export type LogFormat = "text" | "json" | "structured";

export type LogMode = "silent" | "normal" | "verbose" | "debug";

export interface LoggerConfig {
  levels?: LogLevel[];
  minLevel?: LogLevel;
  timestamps?: boolean;
  mode?: LogMode;
  logFile?: string;
  maxFileSize?: number;
  maxFiles?: number;
  colorize?: boolean;
  prettyPrint?: boolean;
  logFormat?: LogFormat;
  dateFormat?: DateFormat;
  environment?: string;
  compression?: boolean;
  async?: boolean;
  bufferSize?: number;
  flushInterval?: number;
  disableFileLogging?: boolean;
}

export interface LogEntry {
  timestamp: string | number;
  level: LogLevel;
  namespace?: string | undefined;
  message: string;
  metadata?: unknown | undefined;
  environment?: string | undefined;
  pid?: number | undefined;
  hostname?: string | undefined;
}

export interface CustomFormatter {
  (entry: LogEntry): string;
}

export interface Logger {
  // Core logging methods
  trace: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  fatal: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;

  // Advanced features
  group: (label: string, fn: () => void) => void;
  table: (data: unknown[]) => void;
  assert: (condition: boolean, msg: string) => void;
  spinner: (msg: string) => () => void;
  child: (namespace: string) => Logger;
  setConfig: (config: Partial<LoggerConfig>) => void;
  getConfig: () => LoggerConfig;

  // Performance monitoring
  time: (label: string) => void;
  timeEnd: (label: string) => void;
  startTimer: (label: string) => () => number;
  profile: (label: string) => () => void;

  // Output formatting
  json: (data: unknown, level?: LogLevel) => void;
  box: (message: string, level?: LogLevel) => void;
  divider: (char?: string, length?: number) => void;

  // Utility methods
  clear: () => void;
  flush: () => Promise<void>;
  close: () => Promise<void>;

  // File operations
  clearLogFile: () => void;
  getLogFileSize: () => number;
  rotateLogFile: () => void;

  // Stream operations
  writeToStream: (message: string, stream?: NodeJS.WriteStream) => void;
  setFormatter: (formatter: CustomFormatter) => void;

  // Level management
  setLevel: (level: LogLevel) => void;
  isLevelEnabled: (level: LogLevel) => boolean;
}

// Level hierarchy for proper filtering
const LOG_LEVELS: Record<LogLevel, LogLevelNumeric> = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5,
  SUCCESS: 2, // Same level as INFO
};

// Color configurations
const BADGE_COLORS: Record<LogLevel, typeof chalk> = {
  TRACE: chalk.bgHex("#a855f7"),
  DEBUG: chalk.bgHex("#ff8d00"),
  INFO: chalk.bgHex("#00bbff"),
  WARN: chalk.bgHex("#fff700"),
  ERROR: chalk.bgHex("#f44343"),
  FATAL: chalk.bgHex("#dc2626"),
  SUCCESS: chalk.bgHex("#00ff0d"),
};

const TEXT_COLORS: Record<LogLevel, typeof chalk> = {
  TRACE: chalk.hex("#a855f7"),
  DEBUG: chalk.hex("#ff8d00"),
  INFO: chalk.hex("#00bbff"),
  WARN: chalk.hex("#fff700"),
  ERROR: chalk.hex("#f44343"),
  FATAL: chalk.hex("#dc2626"),
  SUCCESS: chalk.hex("#00ff0d"),
};

// Utility functions
const MAX_LABEL_LENGTH = Math.max(
  ...Object.keys(LOG_LEVELS).map((l) => l.length),
);

function padCenter(str: string, length: number, padChar = " "): string {
  const totalPad = length - str.length;
  const leftPad = Math.floor(totalPad / 2);
  const rightPad = totalPad - leftPad;
  return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
}

function createBadge(level: LogLevel): string {
  const centered = padCenter(level, MAX_LABEL_LENGTH + 2, " ");
  return BADGE_COLORS[level].black.bold(centered);
}

function getTimestamp(format: DateFormat = "iso"): string | number {
  const now = new Date();
  switch (format) {
    case "iso":
      return now.toISOString();
    case "locale":
      return now.toLocaleString();
    case "unix":
      return now.getTime();
    case "short":
      return now.toTimeString().split(" ")[0] || "";
    default:
      return now.toISOString();
  }
}

function safeStringify(obj: unknown, prettyPrint = false): string {
  try {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    if (typeof obj === "string") return obj;
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);

    // Handle circular references
    const seen = new WeakSet();
    const replacer = (_key: string, value: unknown): unknown => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };

    return JSON.stringify(obj, replacer, prettyPrint ? 2 : undefined);
  } catch (error) {
    return `[Serialization Error: ${(error as Error).message}]`;
  }
}

class LogBuffer {
  private buffer: string[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private maxSize: number,
    private flushInterval: number,
    private writeStream: WriteStream | null,
  ) {}

  add(entry: string): void {
    this.buffer.push(entry);

    if (this.buffer.length >= this.maxSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, this.flushInterval);
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    if (this.writeStream && !this.writeStream.destroyed) {
      const content = this.buffer.join("");
      this.writeStream.write(content);
    }

    this.buffer = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.flush();
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (this.writeStream && !this.writeStream.destroyed) {
        const timeout = setTimeout(() => {
          if (!this.writeStream!.destroyed) {
            this.writeStream!.destroy();
          }
          resolve();
        }, 1000);

        this.writeStream.end(() => {
          clearTimeout(timeout);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export class LoggerImpl implements Logger {
  private config: Required<LoggerConfig>;
  private namespace?: string;
  private timers: Map<string, number> = new Map();
  private profiles: Map<string, number> = new Map();
  private customFormatter?: CustomFormatter;
  private fileWriteStream: WriteStream | null = null;
  private logBuffer: LogBuffer | null = null;

  constructor(config: LoggerConfig = {}, namespace?: string | undefined) {
    this.config = this.mergeConfig(this.getDefaultConfig(), config);
    this.namespace = namespace;
    this.setupFileLogging();
  }

  private getDefaultConfig(): Required<LoggerConfig> {
    return {
      levels: ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "SUCCESS"],
      minLevel: "DEBUG",
      timestamps: false,
      mode: "normal",
      logFile: "",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      colorize: true,
      prettyPrint: true,
      logFormat: "text",
      dateFormat: "iso",
      environment: process.env.NODE_ENV || "development",
      compression: false,
      async: false,
      bufferSize: 100,
      flushInterval: 1000,
      disableFileLogging: false,
    };
  }

  private mergeConfig(
    defaultConfig: Required<LoggerConfig>,
    userConfig: LoggerConfig,
  ): Required<LoggerConfig> {
    const merged = { ...defaultConfig, ...userConfig };

    // Validate and sanitize configuration
    if (merged.maxFileSize <= 0) {
      merged.maxFileSize = defaultConfig.maxFileSize;
    }

    if (merged.bufferSize <= 0) {
      merged.bufferSize = defaultConfig.bufferSize;
    }

    if (merged.maxFiles <= 0) {
      merged.maxFiles = defaultConfig.maxFiles;
    }

    // Validate minLevel
    const validLevels = [
      "TRACE",
      "DEBUG",
      "INFO",
      "WARN",
      "ERROR",
      "FATAL",
      "SUCCESS",
    ];
    if (!validLevels.includes(merged.minLevel)) {
      merged.minLevel = defaultConfig.minLevel;
    }

    return merged;
  }

  private setupFileLogging(): void {
    if (this.config.logFile && !this.config.disableFileLogging) {
      try {
        const logDir = path.dirname(this.config.logFile);
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        this.fileWriteStream = createWriteStream(this.config.logFile, {
          flags: "a",
        });

        if (this.config.async) {
          this.logBuffer = new LogBuffer(
            this.config.bufferSize,
            this.config.flushInterval,
            this.fileWriteStream,
          );
        }
      } catch (error) {
        process.stderr.write(
          `Failed to setup file logging: ${(error as Error).message}\n`,
        );
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.config.mode === "silent") return false;

    // Check if level is in allowed levels
    if (!this.config.levels.includes(level)) return false;

    // Verbose and debug modes allow TRACE messages regardless of minLevel
    if (
      (this.config.mode === "verbose" || this.config.mode === "debug") &&
      level === "TRACE"
    ) {
      return true;
    }

    // Check minimum level
    const levelNum = LOG_LEVELS[level];
    const minLevelNum = LOG_LEVELS[this.config.minLevel];

    return levelNum >= minLevelNum;
  }

  private shouldLogForMode(level: LogLevel): boolean {
    switch (this.config.mode) {
      case "silent":
        return false;
      case "normal":
        return level !== "TRACE";
      case "verbose":
        return true;
      case "debug":
        return true;
      default:
        return true;
    }
  }

  private formatMessage(...args: unknown[]): string {
    return args
      .map((arg) => {
        if (typeof arg === "object") {
          return safeStringify(arg, this.config.prettyPrint);
        }
        return String(arg);
      })
      .join(" ");
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: unknown,
  ): LogEntry {
    return {
      timestamp: getTimestamp(this.config.dateFormat),
      level,
      namespace: this.namespace,
      message,
      metadata,
      environment: this.config.environment,
      pid: process.pid,
      hostname: os.hostname(),
    };
  }

  private formatConsoleOutput(entry: LogEntry): string {
    if (this.customFormatter) {
      return this.customFormatter(entry);
    }

    const timestamp = this.config.timestamps
      ? `${chalk.gray(`[${entry.timestamp}]`)} `
      : "";

    const namespaceStr = this.namespace
      ? chalk.cyan(`[${this.namespace}]`) + " "
      : "";

    const badge = this.config.colorize
      ? createBadge(entry.level)
      : `[${entry.level}]`;

    const message = this.config.colorize
      ? TEXT_COLORS[entry.level](entry.message)
      : entry.message;

    return `${timestamp}${badge}: ${namespaceStr}${message}`;
  }

  private formatFileOutput(entry: LogEntry): string {
    // Use custom formatter if available
    if (this.customFormatter) {
      return this.customFormatter(entry);
    }

    switch (this.config.logFormat) {
      case "json":
        return JSON.stringify(entry) + "\n";
      case "structured": {
        return `${entry.timestamp} [${entry.level}] ${entry.namespace ? `[${entry.namespace}]` : ""} ${entry.message}${entry.metadata ? ` ${safeStringify(entry.metadata)}` : ""}\n`;
      }
      case "text":
      default: {
        const timestamp =
          typeof entry.timestamp === "number"
            ? new Date(entry.timestamp).toISOString()
            : entry.timestamp;
        const namespace = entry.namespace ? `[${entry.namespace}]` : "";
        return `[${timestamp}] [${entry.level}]${namespace}: ${entry.message}\n`;
      }
    }
  }

  private async writeToFile(content: string): Promise<void> {
    if (!this.config.logFile) return;

    try {
      this.checkAndRotateFile();

      if (this.logBuffer) {
        this.logBuffer.add(content);
      } else if (this.fileWriteStream && !this.fileWriteStream.destroyed) {
        this.fileWriteStream.write(content);
      } else {
        fs.appendFileSync(this.config.logFile, content);
      }
    } catch (error) {
      process.stderr.write(`File logging error: ${(error as Error).message}\n`);
    }
  }

  private checkAndRotateFile(): void {
    if (!this.config.logFile || !fs.existsSync(this.config.logFile)) return;

    try {
      const stats = fs.statSync(this.config.logFile);
      if (stats.size >= this.config.maxFileSize) {
        this.rotateLogFile();
      }
    } catch (error) {
      process.stderr.write(
        `File rotation check error: ${(error as Error).message}\n`,
      );
    }
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.shouldLog(level) || !this.shouldLogForMode(level)) return;

    const message = this.formatMessage(...args);
    const entry = this.createLogEntry(level, message);

    // Console output
    console.log(this.formatConsoleOutput(entry));

    // File output
    if (this.config.logFile && !this.config.disableFileLogging) {
      const fileContent = this.formatFileOutput(entry);
      this.writeToFile(fileContent).catch((error) => {
        // Use process.stderr to avoid infinite recursion with logger
        process.stderr.write(`Async file write error: ${error.message}\n`);
      });
    }
  }

  // Core logging methods
  trace(...args: unknown[]): void {
    this.log("TRACE", ...args);
  }

  debug(...args: unknown[]): void {
    this.log("DEBUG", ...args);
  }

  info(...args: unknown[]): void {
    this.log("INFO", ...args);
  }

  warn(...args: unknown[]): void {
    this.log("WARN", ...args);
  }

  error(...args: unknown[]): void {
    this.log("ERROR", ...args);
  }

  success(...args: unknown[]): void {
    this.log("SUCCESS", ...args);
  }

  fatal(...args: unknown[]): void {
    this.log("FATAL", ...args);
    this.flush().then(() => {
      process.exit(1);
    });
  }

  // Advanced features
  group(label: string, fn: () => void): void {
    if (this.config.mode === "silent") return;

    const formattedLabel = this.config.colorize
      ? chalk.bold.underline(label)
      : label;

    console.group(formattedLabel);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  }

  table(data: unknown[]): void {
    if (this.config.mode === "silent") return;
    console.table(data);
  }

  assert(condition: boolean, msg: string): void {
    if (!condition) {
      this.error(`Assertion failed: ${msg}`);
    }
  }

  spinner(msg: string): () => void {
    if (this.config.mode === "silent") return () => {};

    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    const interval = setInterval(() => {
      const frame = this.config.colorize ? chalk.cyan(frames[i]) : frames[i];
      process.stdout.write(`\r${frame} ${msg}`);
      i = (i + 1) % frames.length;
    }, 80);

    return () => {
      clearInterval(interval);
      process.stdout.write("\r\x1b[K");
    };
  }

  child(namespace: string): Logger {
    const childNamespace = this.namespace
      ? `${this.namespace}:${namespace}`
      : namespace;
    return new LoggerImpl(this.config, childNamespace) as Logger;
  }

  setConfig(config: Partial<LoggerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = this.mergeConfig(this.config, config);

    // Reinitialize file logging if config changed
    if (oldConfig.logFile !== this.config.logFile) {
      this.close().then(() => {
        this.setupFileLogging();
      });
    }
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Performance monitoring
  time(label: string): void {
    this.timers.set(label, performance.now());
    this.info(`Timer '${label}' started`);
  }

  timeEnd(label: string): void {
    const start = this.timers.get(label);
    if (start === undefined) {
      this.warn(`Timer '${label}' does not exist`);
      return;
    }
    const duration = performance.now() - start;
    this.timers.delete(label);
    this.info(`Timer '${label}': ${duration.toFixed(2)}ms`);
  }

  startTimer(label: string): () => number {
    const start = performance.now();
    this.debug(`Timer '${label}' started`);

    return () => {
      const duration = performance.now() - start;
      this.info(`Timer '${label}': ${duration.toFixed(2)}ms`);
      return duration;
    };
  }

  profile(label: string): () => void {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    this.profiles.set(label, start);

    return () => {
      const duration = performance.now() - start;
      const endMemory = process.memoryUsage();
      const memoryDiff = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      };

      this.info(`Profile '${label}': ${duration.toFixed(2)}ms`, {
        duration,
        memory: memoryDiff,
      });
      this.profiles.delete(label);
    };
  }

  // Output formatting
  json(data: unknown, level: LogLevel = "INFO"): void {
    const formatted = safeStringify(data, this.config.prettyPrint);
    this.log(level, formatted);
  }

  box(message: string, level: LogLevel = "INFO"): void {
    if (this.config.mode === "silent") return;

    const lines = message.split("\n");
    const maxLength = Math.max(...lines.map((l) => l.length));
    const horizontalBorder = "─".repeat(maxLength + 2);

    const color = this.config.colorize ? TEXT_COLORS[level] : (s: string) => s;

    console.log(color("┌" + horizontalBorder + "┐"));
    lines.forEach((line) => {
      const paddedLine = line.padEnd(maxLength, " ");
      console.log(color(`│ ${paddedLine} │`));
    });
    console.log(color("└" + horizontalBorder + "┘"));
  }

  divider(char = "─", length = 60): void {
    if (this.config.mode === "silent") return;
    const line = char.repeat(length);
    console.log(this.config.colorize ? chalk.gray(line) : line);
  }

  // Utility methods
  clear(): void {
    if (this.config.mode === "silent") return;
    console.clear();
  }

  async flush(): Promise<void> {
    if (this.logBuffer) {
      this.logBuffer.flush();
    }

    if (this.fileWriteStream && !this.fileWriteStream.destroyed) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 1000); // 1 second timeout

        this.fileWriteStream!.once("drain", () => {
          clearTimeout(timeout);
          resolve();
        });

        // Trigger drain if the stream is writable
        if (this.fileWriteStream!.writable) {
          this.fileWriteStream!.write("");
        } else {
          clearTimeout(timeout);
          resolve();
        }
      });
    }
  }

  async close(): Promise<void> {
    if (this.logBuffer) {
      await this.logBuffer.close();
      this.logBuffer = null;
    }

    if (this.fileWriteStream && !this.fileWriteStream.destroyed) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (!this.fileWriteStream!.destroyed) {
            this.fileWriteStream!.destroy();
          }
          resolve();
        }, 2000); // 2 second timeout

        this.fileWriteStream!.end(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  }

  // File operations
  clearLogFile(): void {
    if (this.config.logFile && fs.existsSync(this.config.logFile)) {
      try {
        fs.writeFileSync(this.config.logFile, "");
        this.info("Log file cleared");
      } catch (error) {
        this.error(`Failed to clear log file: ${(error as Error).message}`);
      }
    }
  }

  getLogFileSize(): number {
    if (this.config.logFile && fs.existsSync(this.config.logFile)) {
      try {
        const stats = fs.statSync(this.config.logFile);
        return stats.size;
      } catch (error) {
        this.error(`Failed to get log file size: ${(error as Error).message}`);
      }
    }
    return 0;
  }

  rotateLogFile(): void {
    if (!this.config.logFile || !fs.existsSync(this.config.logFile)) return;

    try {
      // Close current stream
      if (this.fileWriteStream && !this.fileWriteStream.destroyed) {
        this.fileWriteStream.end();
      }

      // Create archive filename
      const dir = path.dirname(this.config.logFile);
      const ext = path.extname(this.config.logFile);
      const base = path.basename(this.config.logFile, ext);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const archivePath = path.join(dir, `${base}.${timestamp}${ext}`);

      // Rotate the file
      fs.renameSync(this.config.logFile, archivePath);

      // Clean up old log files
      this.cleanupOldLogFiles(dir, base, ext);

      // Recreate the write stream
      this.setupFileLogging();

      // Avoid recursive logging during rotation
      process.stderr.write(`Log file rotated: ${archivePath}\n`);
    } catch (error) {
      process.stderr.write(
        `Failed to rotate log file: ${(error as Error).message}\n`,
      );
    }
  }

  private cleanupOldLogFiles(dir: string, base: string, ext: string): void {
    try {
      const files = fs
        .readdirSync(dir)
        .filter(
          (f) => f.startsWith(base) && f.endsWith(ext) && f !== `${base}${ext}`,
        )
        .map((f) => ({
          name: f,
          path: path.join(dir, f),
          mtime: fs.statSync(path.join(dir, f)).mtime,
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Keep only the most recent files
      if (files.length > this.config.maxFiles) {
        const filesToDelete = files.slice(this.config.maxFiles);
        filesToDelete.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      this.error(
        `Failed to cleanup old log files: ${(error as Error).message}`,
      );
    }
  }

  // Stream operations
  writeToStream(
    message: string,
    stream: NodeJS.WriteStream = process.stdout,
  ): void {
    if (this.config.mode === "silent") return;
    stream.write(message + "\n");
  }

  setFormatter(formatter: CustomFormatter): void {
    this.customFormatter = formatter;
  }

  // Level management
  setLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  isLevelEnabled(level: LogLevel): boolean {
    return this.shouldLog(level) && this.shouldLogForMode(level);
  }
}

// Factory functions and default instance
export const logger: Logger = new LoggerImpl({ disableFileLogging: true });

export const createLogger = (config?: LoggerConfig): Logger => {
  return new LoggerImpl(config) as Logger;
};

// Environment-aware logger factory
export const createEnvironmentLogger = (environment?: string): Logger => {
  const env = environment || process.env.NODE_ENV || "development";

  const config: LoggerConfig = {
    environment: env,
    timestamps: true,
    colorize: env !== "production",
    logFormat: env === "production" ? "json" : "text",
    mode: env === "development" ? "debug" : "normal",
    minLevel: env === "production" ? "INFO" : "DEBUG",
  };

  return new LoggerImpl(config) as Logger;
};

// Structured logger for microservices
export const createStructuredLogger = (
  serviceName: string,
  version: string,
  config: Partial<LoggerConfig> = {},
): Logger => {
  const fullConfig: LoggerConfig = {
    logFormat: "json",
    timestamps: true,
    environment: process.env.NODE_ENV || "production",
    ...config,
  };

  const structuredLogger = new LoggerImpl(fullConfig, serviceName) as Logger;

  // Add service metadata to all logs
  structuredLogger.setFormatter((entry: LogEntry) => {
    return (
      JSON.stringify({
        ...entry,
        service: serviceName,
        version,
      }) + "\n"
    );
  });

  return structuredLogger;
};

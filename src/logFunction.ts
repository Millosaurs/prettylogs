import chalk from "chalk";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

type LogLevel =
    | "INFO"
    | "DEBUG"
    | "WARN"
    | "ERROR"
    | "SUCCESS"
    | "TRACE"
    | "FATAL";

interface LoggerConfig {
    levels?: LogLevel[];
    timestamps?: boolean;
    mode?: "silent" | "normal" | "verbose";
    logFile?: string;
    maxFileSize?: number; // in bytes
    colorize?: boolean;
    prettyPrint?: boolean;
    logFormat?: "text" | "json";
    dateFormat?: "iso" | "locale" | "unix";
}

interface LogEntry {
    timestamp: string | number;
    level: LogLevel;
    namespace?: string;
    message: string;
    metadata?: any;
}

const badgeBg: Record<LogLevel, typeof chalk> = {
    INFO: chalk.bgHex("#00bbff"),
    DEBUG: chalk.bgHex("#ff8d00"),
    WARN: chalk.bgHex("#fff700"),
    ERROR: chalk.bgHex("#f44343"),
    SUCCESS: chalk.bgHex("#00ff0d"),
    TRACE: chalk.bgHex("#a855f7"),
    FATAL: chalk.bgHex("#dc2626"),
};

const textColor: Record<LogLevel, typeof chalk> = {
    INFO: chalk.hex("#00bbff"),
    DEBUG: chalk.hex("#ff8d00"),
    WARN: chalk.hex("#fff700"),
    ERROR: chalk.hex("#f44343"),
    SUCCESS: chalk.hex("#00ff0d"),
    TRACE: chalk.hex("#a855f7"),
    FATAL: chalk.hex("#dc2626"),
};

const maxLabelLength = Math.max(
    ...["INFO", "DEBUG", "WARN", "ERROR", "SUCCESS", "TRACE", "FATAL"].map(
        (l) => l.length,
    ),
);

function padCenter(str: string, length: number, padChar = " "): string {
    const totalPad = length - str.length;
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
}

const badge = (level: LogLevel) => {
    const centered = padCenter(level, maxLabelLength + 2, " ");
    return badgeBg[level].black.bold(centered);
};

const getTimestamp = (
    format: "iso" | "locale" | "unix" = "iso",
): string | number => {
    const now = new Date();
    switch (format) {
        case "iso":
            return now.toISOString();
        case "locale":
            return now.toLocaleString();
        case "unix":
            return now.getTime();
        default:
            return now.toISOString();
    }
};

interface Logger {
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    success: (...args: any[]) => void;
    trace: (...args: any[]) => void;
    fatal: (...args: any[]) => void;
    group: (label: string, fn: () => void) => void;
    table: (data: any[]) => void;
    assert: (condition: boolean, msg: string) => void;
    spinner: (msg: string) => () => void;
    child: (namespace: string) => Logger;
    setConfig: (config: Partial<LoggerConfig>) => void;
    getConfig: () => LoggerConfig;
    time: (label: string) => void;
    timeEnd: (label: string) => void;
    startTimer: (label: string) => () => number;
    json: (data: any, level?: LogLevel) => void;
    box: (message: string, level?: LogLevel) => void;
    divider: (char?: string, length?: number) => void;
    clear: () => void;
    clearLogFile: () => void;
    getLogFileSize: () => number;
    writeStream: (message: string, stream?: NodeJS.WriteStream) => void;
}

class LoggerImpl implements Logger {
    private config: LoggerConfig;
    private namespace?: string;
    private timers: Map<string, number> = new Map();

    constructor(config: LoggerConfig = {}, namespace?: string) {
        this.config = {
            levels: config.levels || [
                "INFO",
                "DEBUG",
                "WARN",
                "ERROR",
                "SUCCESS",
                "TRACE",
                "FATAL",
            ],
            timestamps: config.timestamps ?? false,
            mode: config.mode || "normal",
            logFile: config.logFile,
            maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
            colorize: config.colorize ?? true,
            prettyPrint: config.prettyPrint ?? true,
            logFormat: config.logFormat || "text",
            dateFormat: config.dateFormat || "iso",
        };
        this.namespace = namespace;
    }

    private isLevelEnabled(level: LogLevel): boolean {
        return this.config.levels!.includes(level);
    }

    private isSilent(): boolean {
        return this.config.mode === "silent";
    }

    private formatMessage(...args: any[]): string {
        return args
            .map((a) => {
                if (typeof a === "object") {
                    return this.config.prettyPrint
                        ? JSON.stringify(a, null, 2)
                        : JSON.stringify(a);
                }
                return String(a);
            })
            .join(" ");
    }

    private checkFileSize(): void {
        if (this.config.logFile && fs.existsSync(this.config.logFile)) {
            const stats = fs.statSync(this.config.logFile);
            if (stats.size >= this.config.maxFileSize!) {
                const dir = path.dirname(this.config.logFile);
                const ext = path.extname(this.config.logFile);
                const base = path.basename(this.config.logFile, ext);
                const timestamp = new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-");
                const archivePath = path.join(
                    dir,
                    `${base}.${timestamp}${ext}`,
                );
                fs.renameSync(this.config.logFile, archivePath);
            }
        }
    }

    private logToFile(entry: LogEntry): void {
        if (this.config.logFile) {
            this.checkFileSize();

            let output: string;
            if (this.config.logFormat === "json") {
                output = JSON.stringify(entry) + "\n";
            } else {
                const timestamp =
                    typeof entry.timestamp === "number"
                        ? new Date(entry.timestamp).toISOString()
                        : entry.timestamp;
                const namespace = entry.namespace ? `[${entry.namespace}]` : "";
                output = `[${timestamp}] [${entry.level}]${namespace}: ${entry.message}\n`;
            }

            fs.appendFileSync(this.config.logFile, output);
        }
    }

    private createLogEntry(
        level: LogLevel,
        message: string,
        metadata?: any,
    ): LogEntry {
        return {
            timestamp: getTimestamp(this.config.dateFormat),
            level,
            namespace: this.namespace,
            message,
            metadata,
        };
    }

    private log(level: LogLevel, ...args: any[]): void {
        if (!this.isLevelEnabled(level) || this.isSilent()) return;

        const msg = this.formatMessage(...args);
        const entry = this.createLogEntry(level, msg);

        if (this.config.colorize) {
            const timestamp = this.config.timestamps
                ? `${chalk.gray(`[${entry.timestamp}]`)} `
                : "";
            const namespaceStr = this.namespace
                ? chalk.cyan(`[${this.namespace}]`) + " "
                : "";

            console.log(
                `${timestamp}${badge(level)}: ${namespaceStr}${textColor[level](msg)}`,
            );
        } else {
            const timestamp = this.config.timestamps
                ? `[${entry.timestamp}] `
                : "";
            const namespaceStr = this.namespace ? `[${this.namespace}] ` : "";
            console.log(`${timestamp}[${level}]: ${namespaceStr}${msg}`);
        }

        this.logToFile(entry);
    }

    info(...args: any[]): void {
        this.log("INFO", ...args);
    }

    debug(...args: any[]): void {
        if (this.config.mode === "verbose" || this.config.mode === "normal") {
            this.log("DEBUG", ...args);
        }
    }

    warn(...args: any[]): void {
        this.log("WARN", ...args);
    }

    error(...args: any[]): void {
        this.log("ERROR", ...args);
    }

    success(...args: any[]): void {
        this.log("SUCCESS", ...args);
    }

    trace(...args: any[]): void {
        if (this.config.mode === "verbose") {
            this.log("TRACE", ...args);
        }
    }

    fatal(...args: any[]): void {
        this.log("FATAL", ...args);
        process.exit(1);
    }

    group(label: string, fn: () => void): void {
        if (this.isSilent()) return;
        console.group(
            this.config.colorize ? chalk.bold.underline(label) : label,
        );
        fn();
        console.groupEnd();
    }

    table(data: any[]): void {
        if (this.isSilent()) return;
        console.table(data);
    }

    assert(condition: boolean, msg: string): void {
        if (!condition) {
            this.error(`Assertion failed: ${msg}`);
        }
    }

    spinner(msg: string): () => void {
        if (this.isSilent()) return () => {};

        const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        let i = 0;
        const interval = setInterval(() => {
            const frame = this.config.colorize
                ? chalk.cyan(frames[i])
                : frames[i];
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
        return new LoggerImpl(this.config, childNamespace);
    }

    setConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    getConfig(): LoggerConfig {
        return { ...this.config };
    }

    time(label: string): void {
        this.timers.set(label, performance.now());
        this.debug(`Timer '${label}' started`);
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

    json(data: any, level: LogLevel = "INFO"): void {
        const formatted = JSON.stringify(data, null, 2);
        this.log(level, formatted);
    }

    box(message: string, level: LogLevel = "INFO"): void {
        if (this.isSilent()) return;

        const lines = message.split("\n");
        const maxLength = Math.max(...lines.map((l) => l.length));
        const horizontalBorder = "─".repeat(maxLength + 2);

        const color = this.config.colorize
            ? textColor[level]
            : (s: string) => s;

        console.log(color("┌" + horizontalBorder + "┐"));
        lines.forEach((line) => {
            const paddedLine = line.padEnd(maxLength, " ");
            console.log(color(`│ ${paddedLine} │`));
        });
        console.log(color("└" + horizontalBorder + "┘"));
    }

    divider(char: string = "─", length: number = 60): void {
        if (this.isSilent()) return;
        const line = char.repeat(length);
        console.log(this.config.colorize ? chalk.gray(line) : line);
    }

    clear(): void {
        if (this.isSilent()) return;
        console.clear();
    }

    clearLogFile(): void {
        if (this.config.logFile && fs.existsSync(this.config.logFile)) {
            fs.writeFileSync(this.config.logFile, "");
            this.info("Log file cleared");
        }
    }

    getLogFileSize(): number {
        if (this.config.logFile && fs.existsSync(this.config.logFile)) {
            const stats = fs.statSync(this.config.logFile);
            return stats.size;
        }
        return 0;
    }

    writeStream(
        message: string,
        stream: NodeJS.WriteStream = process.stdout,
    ): void {
        if (this.isSilent()) return;
        stream.write(message + "\n");
    }
}

// Create default logger instance
export const logger: Logger = new LoggerImpl();

// Export factory function for custom configurations
export const createLogger = (config?: LoggerConfig): Logger => {
    return new LoggerImpl(config);
};

// Export types
export type { Logger, LoggerConfig, LogLevel, LogEntry };

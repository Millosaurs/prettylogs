import chalk from "chalk";
import fs from "fs";

type LogLevel = "INFO" | "DEBUG" | "WARN" | "ERROR" | "SUCCESS";

interface LoggerConfig {
    levels?: LogLevel[];
    timestamps?: boolean;
    mode?: "silent" | "normal" | "verbose";
    logFile?: string;
}

const badgeBg: Record<LogLevel, typeof chalk> = {
    INFO: chalk.bgHex("#00bbff"),
    DEBUG: chalk.bgHex("#ff8d00"),
    WARN: chalk.bgHex("#fff700"),
    ERROR: chalk.bgHex("#f44343"),
    SUCCESS: chalk.bgHex("#00ff0d"),
};

const textColor: Record<LogLevel, typeof chalk> = {
    INFO: chalk.hex("#00bbff"),
    DEBUG: chalk.hex("#ff8d00"),
    WARN: chalk.hex("#fff700"),
    ERROR: chalk.hex("#f44343"),
    SUCCESS: chalk.hex("#00ff0d"),
};

const maxLabelLength = Math.max(
    ...["INFO", "DEBUG", "WARN", "ERROR", "SUCCESS"].map((l) => l.length),
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

const getTimestamp = () => {
    return chalk.gray(`[${new Date().toISOString()}]`);
};

interface Logger {
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    success: (...args: any[]) => void;
    group: (label: string, fn: () => void) => void;
    table: (data: any[]) => void;
    assert: (condition: boolean, msg: string) => void;
    spinner: (msg: string) => () => void;
    child: (namespace: string) => Logger;
    setConfig: (config: Partial<LoggerConfig>) => void;
    getConfig: () => LoggerConfig;
}

class LoggerImpl implements Logger {
    private config: LoggerConfig;
    private namespace?: string;

    constructor(config: LoggerConfig = {}, namespace?: string) {
        this.config = {
            levels: config.levels || [
                "INFO",
                "DEBUG",
                "WARN",
                "ERROR",
                "SUCCESS",
            ],
            timestamps: config.timestamps ?? false,
            mode: config.mode || "normal",
            logFile: config.logFile,
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
            .map((a) =>
                typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
            )
            .join(" ");
    }

    private logToFile(level: LogLevel, msg: string): void {
        if (this.config.logFile) {
            const timestamp = new Date().toISOString();
            const namespace = this.namespace ? `[${this.namespace}]` : "";
            fs.appendFileSync(
                this.config.logFile,
                `[${timestamp}] [${level}]${namespace}: ${msg}\n`,
            );
        }
    }

    private log(level: LogLevel, ...args: any[]): void {
        if (!this.isLevelEnabled(level) || this.isSilent()) return;

        const msg = this.formatMessage(...args);
        const timestamp = this.config.timestamps ? `${getTimestamp()} ` : "";
        const namespaceStr = this.namespace
            ? chalk.cyan(`[${this.namespace}]`) + " "
            : "";

        console.log(
            `${timestamp}${badge(level)}: ${namespaceStr}${textColor[level](msg)}`,
        );
        this.logToFile(level, msg);
    }

    info(...args: any[]): void {
        this.log("INFO", ...args);
    }

    debug(...args: any[]): void {
        if (this.config.mode === "verbose") {
            this.log("DEBUG", ...args);
        } else if (
            this.config.mode === "normal" &&
            this.isLevelEnabled("DEBUG")
        ) {
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

    group(label: string, fn: () => void): void {
        if (this.isSilent()) return;
        console.group(chalk.bold.underline(label));
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
            process.stdout.write(`\r${chalk.cyan(frames[i])} ${msg}`);
            i = (i + 1) % frames.length;
        }, 80);

        return () => {
            clearInterval(interval);
            process.stdout.write("\r\x1b[K"); // Clear line
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
}

// Create default logger instance
export const logger: Logger = new LoggerImpl();

// Export factory function for custom configurations
export const createLogger = (config?: LoggerConfig): Logger => {
    return new LoggerImpl(config);
};

// Export types
export type { Logger, LoggerConfig, LogLevel };

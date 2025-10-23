import chalk from "chalk";

type LogLevel = "INFO" | "DEBUG" | "WARN" | "ERROR" | "SUCCESS";

const badgeBg: Record<LogLevel, typeof chalk> = {
    INFO: chalk.bgHex("#00bbff"),
    DEBUG: chalk.bgHex("#ff8d00"),
    WARN: chalk.bgHex("#fff700"),
    ERROR: chalk.bgHex("#f44343"),
    SUCCESS: chalk.bgHex("#00ff0d"),
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

// Add explicit type annotation
interface Logger {
    info: (msg: string) => void;
    debug: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
    success: (msg: string) => void;
}

export const logger: Logger = {
    info: (msg: string) =>
        console.log(`${badge("INFO")}: ${chalk.hex("#00bbff")(msg)}`),
    debug: (msg: string) =>
        console.log(`${badge("DEBUG")}: ${chalk.hex("#ff8d00")(msg)}`),
    warn: (msg: string) =>
        console.log(`${badge("WARN")}: ${chalk.hex("#fff700")(msg)}`),
    error: (msg: string) =>
        console.log(`${badge("ERROR")}: ${chalk.hex("#f44343")(msg)}`),
    success: (msg: string) =>
        console.log(`${badge("SUCCESS")}: ${chalk.hex("#00ff0d")(msg)}`),
};

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const ANSI_COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

const LEVEL_COLOR_MAP: Record<LogLevel, string> = {
  debug: ANSI_COLORS.cyan,
  info: ANSI_COLORS.green,
  warn: ANSI_COLORS.yellow,
  error: ANSI_COLORS.red,
};

function getActiveLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel as LogLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function serializeError(err: unknown): LogEntry["error"] | undefined {
  if (!(err instanceof Error)) {
    return undefined;
  }
  const errorObj: LogEntry["error"] = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
  if ("code" in err && (typeof err.code === "string" || typeof err.code === "number")) {
    errorObj.code = err.code;
  }
  return errorObj;
}

function formatPretty(entry: LogEntry): string {
  const time = `${ANSI_COLORS.dim}${entry.timestamp}${ANSI_COLORS.reset}`;
  const color = LEVEL_COLOR_MAP[entry.level];
  const levelTag = `${color}${ANSI_COLORS.bold}[${entry.level.toUpperCase().padEnd(5)}]${ANSI_COLORS.reset}`;
  const moduleTag = entry.module
    ? `${ANSI_COLORS.magenta}[${entry.module}]${ANSI_COLORS.reset}`
    : "";
  
  const baseParts = [time, levelTag, moduleTag, entry.message].filter(Boolean);
  let line = baseParts.join(" ");

  if (entry.context && Object.keys(entry.context).length > 0) {
    line += `\n  ${ANSI_COLORS.dim}Context:${ANSI_COLORS.reset} ${JSON.stringify(entry.context, null, 2).replace(/\n/g, "\n  ")}`;
  }

  if (entry.error?.stack) {
    line += `\n  ${ANSI_COLORS.red}${entry.error.stack.replace(/\n/g, "\n  ")}${ANSI_COLORS.reset}`;
  }

  return line;
}

function formatJson(entry: LogEntry): string {
  const payload: Record<string, unknown> = {
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    ...(entry.module ? { module: entry.module } : {}),
    ...(entry.context || {}),
    ...(entry.error ? { error: entry.error } : {}),
  };
  return JSON.stringify(payload);
}

export class Logger {
  private moduleName?: string;
  private defaultContext: LogContext;
  private format?: "pretty" | "json";

  constructor(moduleName?: string, defaultContext: LogContext = {}, format?: "pretty" | "json") {
    this.moduleName = moduleName;
    this.defaultContext = defaultContext;
    this.format = format;
  }

  private shouldLog(level: LogLevel): boolean {
    const activeLevel = getActiveLogLevel();
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[activeLevel];
  }

  private log(level: LogLevel, message: string, contextOrError?: LogContext | unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    let context: LogContext | undefined = { ...this.defaultContext };
    let error: LogEntry["error"] | undefined;

    if (contextOrError instanceof Error) {
      error = serializeError(contextOrError);
    } else if (contextOrError && typeof contextOrError === "object") {
      const { error: errProp, ...rest } = contextOrError as LogContext;
      context = { ...context, ...rest };
      if (errProp instanceof Error) {
        error = serializeError(errProp);
      }
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(this.moduleName ? { module: this.moduleName } : {}),
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
      ...(error ? { error } : {}),
    };

    const isProduction =
      this.format === "json" ||
      (this.format !== "pretty" && process.env.NODE_ENV === "production" && process.env.LOG_FORMAT !== "pretty");
    const formatted = isProduction ? formatJson(entry) : formatPretty(entry);

    if (level === "error") {
      process.stderr.write(`${formatted}\n`);
    } else {
      process.stdout.write(`${formatted}\n`);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, contextOrError?: LogContext | unknown): void {
    this.log("warn", message, contextOrError);
  }

  error(message: string, contextOrError?: LogContext | unknown): void {
    this.log("error", message, contextOrError);
  }

  child(moduleName: string, context: LogContext = {}): Logger {
    const mergedName = this.moduleName ? `${this.moduleName}:${moduleName}` : moduleName;
    return new Logger(mergedName, { ...this.defaultContext, ...context });
  }
}

export const logger = new Logger();

export function createLogger(moduleName: string, defaultContext?: LogContext): Logger {
  return new Logger(moduleName, defaultContext);
}

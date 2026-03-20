/**
 * Enterprise Structured Logger
 * Provides consistent logging levels and metadata.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private format(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    });
  }

  info(message: string, meta?: any) {
    console.log(this.format(LogLevel.INFO, message, meta));
  }

  error(message: string, error?: any, meta?: any) {
    console.error(
      this.format(LogLevel.ERROR, message, {
        ...meta,
        error: error instanceof Error ? error.stack : error,
      })
    );
  }

  warn(message: string, meta?: any) {
    console.warn(this.format(LogLevel.WARN, message, meta));
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.format(LogLevel.DEBUG, message, meta));
    }
  }
}

export const logger = Logger.getInstance();

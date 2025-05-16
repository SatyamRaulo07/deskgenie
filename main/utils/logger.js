const { app } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const winston = require('winston');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');

// Ensure log directory exists
const logDir = path.join(app.getPath('userData'), 'logs');
fs.ensureDirSync(logDir);

// Custom format for logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'deskgenie' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // Write all logs with level 'info' and below to combined.log
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),
    // Write all logs with level 'error' and below to error.log
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    })
  ]
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => logger.info(message.trim())
};

// Error tracking with Sentry
const Sentry = require('@sentry/electron');

class Logger {
  static initialize() {
    // Initialize Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        integrations: [
          new Sentry.Integrations.GlobalHandlers({
            onerror: true,
            onunhandledrejection: true
          })
        ]
      });
    }

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(reason);
      }
    });

    return logger;
  }

  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  static error(message, error = null, meta = {}) {
    if (error) {
      logger.error(message, { error: error.stack, ...meta });
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
      }
    } else {
      logger.error(message, meta);
    }
  }

  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  static getLogFiles() {
    return fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        size: fs.statSync(path.join(logDir, file)).size
      }));
  }

  static async clearLogs() {
    try {
      await fs.emptyDir(logDir);
      logger.info('Logs cleared successfully');
      return true;
    } catch (error) {
      logger.error('Failed to clear logs:', error);
      return false;
    }
  }
}

module.exports = Logger; 
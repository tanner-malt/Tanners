// server/logger.js
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { format } = winston;
require('winston-daily-rotate-file');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Sanitize sensitive data
const sanitizeData = (data) => {
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'authorization'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[REDACTED]';
        }
    });
    
    return sanitized;
};

// Custom format for analytics
const analyticsFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
    const sanitizedMetadata = sanitizeData(metadata);
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(sanitizedMetadata).length > 0) {
        msg += JSON.stringify(sanitizedMetadata);
    }
    return msg;
});

// Create different loggers for different purposes
const createLogger = (filename) => {
    return winston.createLogger({
        format: format.combine(
            format.timestamp(),
            format.json(),
            analyticsFormat
        ),
        transports: [
            // Write all logs to console
            new winston.transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            }),
            // Write all logs to file with rotation
            new winston.transports.DailyRotateFile({
                filename: path.join(logsDir, `${filename}-%DATE%.log`),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                zippedArchive: true
            })
        ]
    });
};

// Create specific loggers
const analyticsLogger = createLogger('analytics');
const errorLogger = createLogger('errors');
const performanceLogger = createLogger('performance');

// Analytics tracking with IP anonymization
const anonymizeIP = (ip) => {
    if (!ip) return 'unknown';
    return ip.replace(/\.\d+$/, '.0');
};

// Analytics tracking
const trackPageView = (req) => {
    const analytics = {
        timestamp: new Date(),
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: anonymizeIP(req.ip),
        referrer: req.headers.referer || 'direct',
        sessionId: req.session?.id,
        responseTime: req.responseTime
    };
    
    analyticsLogger.info('Page View', analytics);
};

// Error tracking
const trackError = (error, req) => {
    const errorData = {
        timestamp: new Date(),
        error: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
        path: req?.path,
        method: req?.method,
        userAgent: req?.headers['user-agent'],
        ip: anonymizeIP(req?.ip)
    };
    
    errorLogger.error('Error Occurred', errorData);
};

// Performance tracking
const trackPerformance = (req, res, time) => {
    const performance = {
        timestamp: new Date(),
        path: req.path,
        method: req.method,
        responseTime: time,
        statusCode: res.statusCode,
        contentLength: res.get('content-length')
    };
    
    performanceLogger.info('Performance Metric', performance);
};

module.exports = {
    trackPageView,
    trackError,
    trackPerformance,
    analyticsLogger,
    errorLogger,
    performanceLogger
}; 
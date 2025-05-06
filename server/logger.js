// server/logger.js
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { format } = winston;

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Custom format for analytics
const analyticsFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
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
            new winston.transports.Console(),
            // Write all logs to file
            new winston.transports.File({ 
                filename: path.join(logsDir, `${filename}.log`),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            })
        ]
    });
};

// Create specific loggers
const analyticsLogger = createLogger('analytics');
const errorLogger = createLogger('errors');
const performanceLogger = createLogger('performance');

// Analytics tracking
const trackPageView = (req) => {
    const analytics = {
        timestamp: new Date(),
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
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
        stack: error.stack,
        path: req?.path,
        method: req?.method,
        userAgent: req?.headers['user-agent'],
        ip: req?.ip
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
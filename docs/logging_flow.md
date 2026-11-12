# Logging Workflow Overview

This document outlines the different logging mechanisms implemented in the codebase.

## 1. Server-Side Logging (Winston)

Located in `server/logger.js`, this is a comprehensive logging setup using the Winston library.

**Key Features:**

*   **Library:** `winston` and `winston-daily-rotate-file`.
*   **Log Directory:** Creates and uses `PROJECT_ROOT/logs/` for file-based logs.
*   **Data Sanitization:** A `sanitizeData` function redacts sensitive fields (e.g., 'password', 'token') from log metadata, replacing them with `[REDACTED]`.
*   **Custom Formatting:** Includes a timestamp, log level, message, and sanitized metadata in a JSON-like structure for file logs. Console logs are colorized and simplified.
*   **Log Transports (Destinations):**
    *   **Console:** All server logs are output to the console.
    *   **Rotating Files:** Logs are written to files that rotate daily:
        *   `maxSize`: 20MB per file.
        *   `maxFiles`: Logs kept for 14 days.
        *   `zippedArchive`: Old log files are compressed.

**Specific Loggers and Output Files:**

*   `analyticsLogger`: Writes to `PROJECT_ROOT/logs/analytics-%DATE%.log`.
*   `errorLogger`: Writes to `PROJECT_ROOT/logs/errors-%DATE%.log`.
*   `performanceLogger`: Writes to `PROJECT_ROOT/logs/performance-%DATE%.log`.

**Main Logging Functions (Exported from `server/logger.js`):**

*   **`trackPageView(req)`:**
    *   **Purpose:** Logs page view analytics.
    *   **Data Logged:** Timestamp, request path, method, user agent, anonymized IP (last octet set to '.0'), referrer, session ID (if available), response time (expected on `req`).
    *   **Logger Used:** `analyticsLogger`.
*   **`trackError(error, req)`:**
    *   **Purpose:** Logs errors encountered on the server.
    *   **Data Logged:** Timestamp, error message, stack trace (not in production), request path, method, user agent, anonymized IP.
    *   **Logger Used:** `errorLogger`.
*   **`trackPerformance(req, res, time)`:**
    *   **Purpose:** Logs performance metrics for server responses.
    *   **Data Logged:** Timestamp, request path, method, response time, status code, content length.
    *   **Logger Used:** `performanceLogger`.

**Current Status:**
*   The server-side logging infrastructure in `server/logger.js` is well-defined.
*   **However, the exported functions (`trackPageView`, `trackError`, `trackPerformance`) do not appear to be imported or utilized in other parts of the server-side codebase (e.g., within Express middleware or route handlers in `server/index.js`). This means that while the capability exists, these server-side logs are likely not being actively generated.**

## 2. Frontend Logging

Located in `static/js/animation.js`.

*   **Mechanism:** A simple custom `Logger` object that wraps `console.log`, `console.error`, and `console.debug`.
*   **Purpose:** Used for logging information, errors, and debug messages related to client-side JavaScript animations.
*   **Output:** Logs directly to the browser's developer console.
*   **Independence:** This is entirely separate from the server-side Winston logging.

## 3. External Analytics Service

Located in `layouts/partials/header.html`.

*   **Service:** GoatCounter (`https://tdogmannerbanner.goatcounter.com/count`).
*   **Mechanism:** A `<script>` tag includes GoatCounter's tracking script.
*   **Purpose:** Provides privacy-friendly web analytics (e.g., page views).
*   **Independence:** Operates independently of the custom server-side and frontend logging.

## 4. Test-Related Logging

Found within the `tests/` directory and `static/js/animation.test.js`.

*   **`tests/setup.js`:** Mocks global `console` methods (e.g., `log`, `error`) using `jest.fn()` for test assertions and to control console output during tests.
*   **Custom Reporters:**
    *   `static/js/animation.test.js` includes a `TestReporter` for logging test progress to the console.
    *   `tests/report.js` defines a custom Jest reporter that generates text and JSON reports of test suite results, saved to `PROJECT_ROOT/reports/`.
*   **Puppeteer Tests (`tests/integration/animation.integration.test.js`):** May use `console` within `page.evaluate()` or rely on browser console output for debugging integration tests.

## Conclusion & Next Steps

The project has distinct logging systems for server-side operations, frontend JavaScript, and third-party analytics. The server-side Winston logging is robustly configured but needs to be integrated into the Express application (likely in `server/index.js` or related middleware/routes) by importing and calling the `trackPageView`, `trackError`, and `trackPerformance` functions to become active. 
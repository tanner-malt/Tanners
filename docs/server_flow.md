# Node.js Server Workflow Overview (Production Environment)

This document outlines the structure, purpose, and expected workflow of the Node.js/Express server component, which is intended for the **production/deployed environment** and is **not run during local Hugo development**.

## 1. Server Core & Purpose

*   **Framework:** Express.js (dependency in `package.json`).
*   **Main Entry Point:** `server/index.js` (as specified by `"main"` in `package.json`). *Note: The exact contents and implementation details of `server/index.js` have not been fully reviewed in this analysis so far.*
*   **Primary Role (Inferred):** To provide backend functionalities that complement the static Hugo-generated frontend. This could include:
    *   API endpoints for dynamic data or interactions.
    *   Handling form submissions.
    *   User authentication or session management (though no specific libraries for this were immediately obvious beyond basic session data in `trackPageView`).
    *   Any other server-side logic required by the application.
*   **Execution:** The server is started using the `npm start` script, which executes `node server/index.js`.

## 2. Logging (`server/logger.js`)

A comprehensive logging system using Winston is implemented in `server/logger.js` (see `docs/logging_flow.md` for full details). This system is crucial for monitoring the server in production.

*   **Key Logging Functions:**
    *   `trackPageView(req)`: For analytics, logging page views with request details.
    *   `trackError(error, req)`: For capturing and logging application errors.
    *   `trackPerformance(req, res, time)`: For logging performance metrics of server responses.
*   **Integration:** These logging functions are intended to be integrated into the Express app's middleware and route handlers within `server/index.js` to automatically capture relevant data.
    *   **Current Status Note:** As per `docs/logging_flow.md`, these logging functions, while defined, did not appear to be actively imported or used in other server-side files found during the initial automated search. This suggests their integration into `server/index.js` might be incomplete or structured in a way not picked up by the search, or the server component is still under active development.

## 3. Dependencies

Key production dependencies from `package.json` relevant to the server:

*   `express`: Web application framework.
*   `winston`: Logging library.

Development dependencies like `jest`, `puppeteer`, `eslint` are for testing and code quality, not part of the running production server itself (though tests ensure its quality).

## 4. Routing and Middleware (Hypothesized)

Within `server/index.js`, it is expected that:

*   **Express App Initialization:** An Express application instance is created.
*   **Middleware:**
    *   Standard middleware (e.g., for parsing JSON request bodies, URL-encoded data) would be set up.
    *   The logging functions (`trackPageView`, `trackPerformance`) would ideally be integrated as middleware to log requests and their performance.
    *   Error handling middleware would be defined, utilizing `trackError` to log any caught errors.
*   **Routes:** API routes (e.g., `/api/...`) or other server-specific endpoints would be defined to handle client requests.

## 5. Interaction with Hugo Static Site

*   The Node.js server does not serve the static Hugo files directly (IONOS handles serving the content from the `public/` directory).
*   The Hugo site (running in the browser) would make asynchronous requests (e.g., using `fetch` or `XMLHttpRequest`) to the API endpoints provided by this Node.js server if dynamic functionality is required.

## 6. Deployment & Operational Environment

*   **Deployment Mechanism:** The GitHub Actions workflows reviewed (`Tanners-orchestration.yaml`, `Tanners-build.yaml`, `deploy-to-ionos.yaml`) focus on deploying the Hugo static site. The deployment of the Node.js server itself is **not explicitly detailed** in these workflows.
*   **Possible IONOS Handling:** IONOS Deploy Now might have specific configurations (potentially in `.deploy-now/Tanners/config.yaml` or project settings on the IONOS platform) to recognize and run Node.js applications, managing the `npm install` and `npm start` process on the server-side. This is currently an assumption.
*   **Logging in Production:** Once deployed and correctly integrated, the Winston logger (`server/logger.js`) will write logs to the console and to daily rotating files (`analytics-%DATE%.log`, `errors-%DATE%.log`, `performance-%DATE%.log`) in a `logs/` directory *on the server where the Node.js application is running*.

## Summary

The Node.js server is designed as an Express application to provide backend services for the production environment. It features a robust Winston-based logging system. Its primary functions likely revolve around API provision or handling dynamic requests that the static Hugo site cannot. The exact details of its routes, full middleware stack, and its deployment process alongside the Hugo site on IONOS require further investigation, potentially by examining `server/index.js` directly or understanding IONOS Node.js deployment configurations. 
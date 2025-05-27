# Agent Development Workflow Directives

This document outlines key development and operational practices that the AI agent (Gemini) must prioritize and reference when analyzing this codebase or assisting with its development. The goal is to ensure robust, maintainable, and high-quality software by consistently applying these principles.

## Core Directives for the Agent

### 1. Always Prioritize CI/CD Integration
    *   When proposing changes or analyzing workflows, consider their impact on the Continuous Integration / Continuous Deployment (CI/CD) pipeline (as defined in `.github/workflows/` and `docs/build_and_deployment_flow.md`).
    *   Ensure new features or modifications can be seamlessly integrated into existing build, test, and deployment processes.
    *   Promote automation of testing and deployment steps wherever feasible.

### 2. Emphasize Comprehensive Testing
    *   **Unit Tests:** For any new code or modifications, ensure unit tests (using Jest, as per `docs/testing_flow.md`) are considered and, where appropriate, created or updated. Focus on testing individual components in isolation.
    *   **Integration Tests:** For workflows involving multiple components or UI interactions (especially animations, as per `docs/testing_flow.md` and `static/js/animation.js`), ensure integration tests (using Jest/Puppeteer) are considered and, where appropriate, created or updated.
    *   **Test Coverage:** While not explicitly enforcing a percentage, strive for good test coverage for critical functionalities.
    *   Reference `docs/testing_flow.md` for existing testing infrastructure and practices.

### 3. Mandate Thorough Logging
    *   **Server-Side Logging:** For any backend functionality (Node.js/Express server, as per `docs/server_flow.md`), ensure that actions, errors, performance metrics, and important events are logged using the established Winston logger (`server/logger.js`, detailed in `docs/logging_flow.md`).
        *   Prioritize the integration of `trackPageView`, `trackError`, and `trackPerformance` into all relevant server operations.
        *   Ensure logged data is sanitized to protect sensitive information.
    *   **Client-Side Logging:** For complex frontend interactions (e.g., `static/js/animation.js`), encourage the use of the existing client-side logger for debugging and informational purposes during development, as noted in `docs/js_flow.md`.
    *   Logs should be structured and informative, aiding in debugging and monitoring.

### 4. Adhere to Documented Workflows
    *   Before proposing solutions or analyzing code, **always first consult the relevant workflow documents** in the `docs/` directory:
        *   `docs/logging_flow.md`
        *   `docs/testing_flow.md`
        *   `docs/css_flow.md`
        *   `docs/js_flow.md`
        *   `docs/content_generation_flow.md`
        *   `docs/build_and_deployment_flow.md`
        *   `docs/server_flow.md`
        *   `docs/security_flow.md`
    *   These documents are the source of truth for how the project is structured and operates.

### 5. Maintain Security Best Practices
    *   Refer to `docs/security_flow.md` and `SECURITY.md`.
    *   Consider security implications of any changes, especially regarding data handling, dependencies, and configurations like `.htaccess` or Content Security Policy.

## Agent Operational Procedure

### 1. Understand User Request.
### 2. Consult `docs/agent_development_workflow_directives.md` (this file) to frame the approach.
### 3. Consult relevant specific workflow documents in `docs/` for detailed context.
### 4. Analyze codebase as needed, guided by documented flows.
### 5. Formulate response/action, ensuring it aligns with the core directives above.
### 6. When proposing code changes, also consider and mention necessary updates to tests, logging, and documentation. 
# Testing Workflow Overview

This document outlines the testing strategy, tools, and processes implemented in the codebase.

## 1. Overall Testing Strategy

The project employs a multi-layered testing approach, including:

*   **Unit Tests:** To verify the functionality of individual components or modules in isolation.
*   **Integration Tests:** To ensure that different parts of the application work together correctly, particularly focusing on UI interactions and animations.
*   **Static Code Analysis (Linting):** To maintain code quality and catch potential errors early.

Automated tests are integrated into the development workflow through pre-commit hooks.

## 2. Core Testing Framework: Jest

Jest is the primary JavaScript testing framework used for both unit and integration tests.

**Key Features & Configuration (from `package.json`):**

*   **Test Environment:** `jsdom` is configured as the default test environment, allowing tests for DOM-related code to run in a simulated browser environment within Node.js.
*   **Setup Files:** `"./tests/setup.js"` is executed before each test suite, used for global test configurations and mocks (see section 6).
*   **Babel Integration:** `@babel/core`, `@babel/preset-env`, and `babel-jest` are used to transpile modern JavaScript (ES6+) in test files and source code, ensuring compatibility.
*   **Code Coverage:** Jest is configured to collect code coverage (see section 7).
*   **Custom Reporters:** A custom test reporter is used alongside the default reporter (see section 8).

## 3. Test Execution (NPM Scripts)

The following npm scripts defined in `package.json` are used to run tests:

*   `npm test` or `npm run test`: Runs all tests (likely defaults to Jest's standard run).
*   `npm run test:unit`: Executes unit tests (conventionally located in `tests/unit` or by pattern).
*   `npm run test:integration`: Executes integration tests (conventionally located in `tests/integration` or by pattern, e.g., using Puppeteer).
*   `npm run test:watch`: Runs Jest in watch mode, re-running tests when files change.
*   `npm run test:coverage`: Runs tests and generates a code coverage report.
*   `npm run test:report`: Executes a custom script (`node tests/report.js`), likely to process or display test results from the custom reporter.
*   `npm run test:all`: A convenience script that runs unit tests, integration tests, and then the custom report script.

## 4. Unit Tests

*   **Primary Focus:** Unit tests are found for client-side JavaScript, particularly `static/js/animation.js` (as seen in `static/js/animation.test.js` and `tests/unit/animation.test.js`).
*   **Environment:** These tests run using Jest with the `jsdom` environment to simulate browser APIs needed by the animation logic (e.g., DOM manipulation, event handling).
*   **Methodology:** Tests likely involve:
    *   Creating DOM elements programmatically.
    *   Dispatching events (e.g., `MouseEvent`).
    *   Asserting changes in DOM structure, classes, or styles.
    *   Verifying calls to animation libraries (e.g., GSAP, which is mocked or its effects observed).

## 5. Integration Tests

*   **Primary Focus:** Integration tests verify user interaction flows and complex animations as they would appear in a real browser.
*   **Tooling:** Puppeteer is used for these tests (`tests/integration/animation.integration.test.js`). Puppeteer controls a headless Chrome or Chromium browser.
*   **Methodology:**
    *   The test script launches a browser and navigates to a test page (e.g., `file:${path.join(__dirname, '../../static/index.html')}`).
    *   It simulates user actions like clicks (`page.click('.card-group')`).
    *   It waits for animations or specific UI states (`page.waitForTimeout`, `page.waitForSelector`).
    *   Assertions are made on computed styles, element visibility, or other browser-rendered properties (`page.evaluate`, `page.$`, `page.$$`).
    *   Performance metrics for animations are also captured using `window.performance` within `page.evaluate`.

## 6. Test Setup and Mocking

The `tests/setup.js` file is crucial for preparing the test environment globally:

*   **`requestAnimationFrame` / `cancelAnimationFrame`:** Mocked using `setTimeout` and `clearTimeout`, as JSDOM doesn't fully implement these browser animation APIs.
*   **`performance` API:** `global.performance` (including `now`, `mark`, `measure`, `getEntriesByName`) is mocked using `jest.fn()`. This allows testing code that relies on performance measurements without a real browser performance timeline.
*   **`console` Methods:** Global `console` methods (`error`, `warn`, `log`, `debug`) are replaced with `jest.fn()`. This allows tests to:
    *   Verify that certain console messages are (or are not) logged.
    *   Suppress console output during test runs to keep test results clean.
*   **Cleanup:** `afterEach(() => { jest.clearAllMocks(); });` ensures that mocks are reset between tests within a file, preventing interference.

## 7. Code Coverage

*   **Configuration (in `package.json`):**
    *   `collectCoverageFrom`: Specifies that coverage should be collected from `"static/js/**/*.js"`, excluding `node_modules`.
    *   `coverageDirectory`: Coverage reports are output to the `"coverage"` directory.
    *   `coverageReporters`: Reports are generated in `"text"` (for console output), `"lcov"` (often used by CI systems and for HTML reports), and `"html"` (a browseable HTML report).
*   **Execution:** `npm run test:coverage` triggers coverage collection.

## 8. Test Reporting

*   **Jest Default Reporter:** Provides standard pass/fail feedback in the console.
*   **Custom Reporter (`tests/report.js` and `package.json` `jest.reporters`):**
    *   A custom reporter class is defined in `tests/report.js`.
    *   It collects details about each test (name, status, duration, error).
    *   It generates a summary report in two formats:
        *   Text file: `PROJECT_ROOT/reports/test-report.txt`
        *   JSON file: `PROJECT_ROOT/reports/test-report.json` (for programmatic access).
    *   The `npm run test:report` script might be used to explicitly trigger this reporting if it's not fully integrated into the Jest reporter pipeline for all test runs, or to perform additional actions with the generated JSON.

## 9. Linting and Pre-commit Hooks

*   **ESLint (`eslint`):**
    *   Used for static code analysis to identify problematic patterns or enforce code style.
    *   The `npm run lint` script executes ESLint across the codebase.
*   **Husky (`husky`):**
    *   Manages Git hooks.
    *   The `"precommit": "npm run test:all"` script in `package.json` suggests that Husky is configured to run all tests (`test:unit`, `test:integration`, and `test:report`) before a commit is allowed. This helps ensure that failing tests or linting issues do not get committed to the repository.
*   **Build Script:** The `"build": "npm run test:all && npm run lint"` script combines testing and linting, often used in CI/CD pipelines to validate the codebase before deployment.

## Conclusion

The project has a robust testing setup leveraging Jest for unit and integration testing, Puppeteer for browser-based integration tests, and a comprehensive set of npm scripts for managing test execution, coverage, and reporting. Pre-commit hooks enforce code quality by running tests before changes are committed. 
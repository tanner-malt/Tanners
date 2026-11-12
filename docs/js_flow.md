# JavaScript Workflow Overview

This document outlines how client-side JavaScript is managed, structured, and utilized within the project.

## 1. JavaScript File Organization and Location

*   **Main Custom Script:** The primary custom JavaScript file is `static/js/animation.js`.
*   **Associated Test File:** A corresponding test file exists at `static/js/animation.test.js`.
*   **Static Assets:** Being in the `static/js/` directory, these files are served as-is by Hugo without any build-time processing through Hugo's asset pipeline (Hugo Pipes).
*   **Hugo Assets Directory (`assets/js/`):** The `assets/js/` directory does not exist, indicating no JavaScript is currently being processed via Hugo Pipes (e.g., for ESbuild transpilation or bundling by Hugo itself).

## 2. JavaScript Authoring and Structure (`static/js/animation.js`)

*   **Purpose:** This script is responsible for handling portfolio animations and interactions on the website, including a card-flipping effect and a planetary orbit animation for sub-cards.
*   **Dependencies:**
    *   It relies on the GSAP (GreenSock Animation Platform) library, which is included separately via a CDN.
*   **Key Features observed in `animation.js`:**
    *   **Custom Logger:** Contains a simple `Logger` object (`Logger.info`, `Logger.error`, `Logger.debug`) that wraps `console` methods for client-side logging during development and debugging of animations.
    *   **State Management:** Implements an `AnimationState` object (e.g., `isAnimating`, `activeCard`) to manage the state of animations and prevent conflicting interactions.
    *   **DOM Interaction:** Selects and manipulates DOM elements (e.g., `.card-group`, `.sub-card`) to apply animations.
    *   **Event Handling:** Attaches event listeners (`click`) to card groups, sub-cards, and the document body to trigger animations, interactions, and reset states.
        *   Handles selection of main cards, centering, and flipping them.
        *   Manages clicks outside active elements to reset animations.
        *   Improved logic for handling clicks on already active or different cards.
    *   **GSAP Usage:** Uses `gsap.to()`, `gsap.set()`, `gsap.killTweensOf()` extensively.
        *   **Main Card Animation:** Centers and scales the main card, then flips it on the Y-axis.
        *   **Sub-Card Orbital Animation:** 
            *   When a main card is flipped, associated sub-cards animate from the center of the main card to an initial position on a dynamically calculated orbit.
            *   A continuous GSAP tween then updates each sub-card's `x` and `y` position based on an evolving angle, creating a slow, planetary-like orbit around the main card's local center.
            *   Each sub-card can have a slightly different radius and orbital speed.
            *   The orbital animation is stored on a `orbitProxy` object attached to each sub-card and is killed during the `resetAll` function.
    *   **Reset Logic (`resetAll` function):** Clears all active animations (including the continuous orbits), classes, and GSAP-applied inline styles from cards and sub-cards, returning them to their initial states.
*   **Modularity:** The script is self-contained for the portfolio animation logic.

## 3. JavaScript Inclusion in HTML

*   **Main Layout File:** JavaScript files are primarily included in `layouts/_default/baseof.html`.
*   **Inclusion Method:** Standard `<script>` tags are used.
    *   GSAP (CDN): `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" defer></script>`
    *   Custom Script: `<script src="/js/animation.js" defer></script>`
*   **`defer` Attribute:** The `defer` attribute is used for both scripts. This is a best practice as it allows the HTML to be parsed fully before the scripts are executed, and scripts are downloaded in parallel. It also ensures scripts execute in the order they appear in the document.

## 4. JavaScript Build Process & Transpilation

*   **No Frontend Build Step:** There are no explicit frontend JavaScript build or transpilation steps (e.g., using Webpack, Rollup, or Parcel) defined in `package.json` scripts for files in `static/js/`.
*   **Babel for Testing:** While Babel is included as a devDependency (`@babel/core`, `@babel/preset-env`, `babel-jest`), its current configuration in `package.json` seems primarily for transpiling JavaScript within the Jest testing environment.
*   **Static Serving:** Client-side JavaScript from `static/js/` is served statically.

## 5. Content Security Policy (CSP) for Scripts

*   The `.htaccess` file includes a Content Security Policy that dictates valid sources for scripts. As of the last review, it was configured as:
    `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://tdogmannerbanner.goatcounter.com;`
    *   `'self'`: Allows scripts from the same origin.
    *   `'unsafe-inline'`: Allows inline scripts (e.g., event handlers in HTML attributes, or `<script>` tags without a `src`). This should generally be avoided or minimized for better security.
    *   `https://cdnjs.cloudflare.com`: Allows scripts from the Cloudflare CDN (used for GSAP).
    *   `https://tdogmannerbanner.goatcounter.com`: Allows scripts for GoatCounter analytics (this domain was in the CSP for default-src, good to have it for script-src specifically if that tool loads scripts directly).

## Summary

Client-side JavaScript is primarily handled by `static/js/animation.js`, which manages animations using the GSAP library (loaded via CDN). The script is included with `defer` for optimized loading. There's no frontend-specific build/transpilation process for this script in the current setup. Security for scripts is partly managed via CSP in `.htaccess`. 
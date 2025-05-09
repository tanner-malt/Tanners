# CSS Workflow Overview

This document outlines how CSS is managed, processed, and utilized within the project.

## 1. CSS File Organization and Location

*   **Main Stylesheet:** The primary CSS file is located at `static/css/style.css`.
*   **Static Assets:** Being in the `static` directory, this file is served as-is by Hugo without any build-time processing through Hugo's asset pipeline (Hugo Pipes).
*   **Hugo Assets Directory (`assets/`):** The `assets` directory is currently empty, indicating no CSS preprocessors like SASS/SCSS are being processed via Hugo Pipes for this project at the moment.

## 2. CSS Authoring and Structure

*   **Custom CSS:** `static/css/style.css` appears to be custom-written CSS.
*   **Theming:** It utilizes CSS custom properties (variables) extensively for theming, notably for implementing dark and light modes (e.g., `--bg`, `--fg`, `--accent`). A `body.light` class toggles these variables.
*   **Structure:** The stylesheet is well-organized with clear sections for:
    *   Theme Variables
    *   Base Styles (reset, body, links)
    *   Typography (headings, paragraphs)
    *   Header, Navigation, and Footer
    *   Layout / Structure (e.g., `.main`, `.section`)
    *   Buttons
    *   Component-specific styles (e.g., blog cards, flip cards, portfolio animations).
*   **Frameworks:** There is no direct import or clear evidence of a major third-party CSS framework (like Bootstrap, Tailwind CSS) within `style.css`. Styling appears to be bespoke.

## 3. CSS Inclusion in HTML

*   **Main Layout File:** The primary stylesheet is linked in the `layouts/_default/baseof.html` file, which likely serves as the base template for most pages on the site.
*   **Link Tag:** It's included using a standard HTML link tag: `<link rel="stylesheet" href="/css/style.css">`.
*   **CDN Assets:** External CSS, such as Font Awesome, is also linked in `layouts/_default/baseof.html` via a CDN:
    `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" ...>`.

## 4. CSS Build Process

*   **No Build Steps:** There are no specific CSS build or preprocessing steps defined in `package.json` scripts or indicated by Hugo's asset pipeline usage for local CSS.
*   **Static Serving:** CSS is served statically.

## 5. Content Security Policy (CSP) for Styles

*   The `.htaccess` file includes a Content Security Policy that dictates valid sources for styles. As of the last review, it was configured as:
    `style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;`
    *   `'self'`: Allows styles from the same origin.
    *   `'unsafe-inline'`: Allows inline styles. This should be used with caution and ideally minimized or eliminated if possible for stricter security.
    *   `https://cdnjs.cloudflare.com`: Allows styles from the Cloudflare CDN (used for Font Awesome).

## Summary

CSS management is straightforward, relying on a custom-written main stylesheet (`static/css/style.css`) that is statically served. It uses modern CSS features like custom properties for theming. External libraries like Font Awesome are included via CDN. Security for styles is partly managed via CSP in `.htaccess`. 
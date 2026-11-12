# Hugo Content Generation Workflow Overview

This document outlines how website content is created, structured, managed, and rendered using Hugo.

## 1. Content Organization (`content/` directory)

*   **Main Content Hub:** All website content resides in the `content/` directory.
*   **Structure:**
    *   `content/_index.md`: Typically serves as the content file for the homepage.
    *   `content/about.md`: Content for the "About" page.
    *   `content/now.md`: Content for the "Now" page.
*   **File Format:** Content is primarily written in Markdown (`.md` files).

## 2. Content Creation & Archetypes

*   **Archetypes (`archetypes/` directory):** No custom archetypes are currently used.

## 3. Front Matter

*   **Definition:** Metadata embedded at the top of Markdown files (e.g., within `+++ ... +++` for TOML format).
*   **Common Fields:** `title`, `date`, `summary`, `draft`.
*   **Custom Fields:** Additional front matter fields can be defined as needed and accessed in templates.

## 4. Markdown Rendering

*   **Engine:** Goldmark is configured as the default Markdown handler (specified in `hugo.toml`).
*   **Raw HTML:** `[markup.goldmark.renderer] unsafe = true` in `hugo.toml` allows raw HTML to be embedded directly within Markdown content. This provides flexibility but should be used carefully, ensuring embedded HTML is secure and well-formed.

## 5. Layouts and Templates (`layouts/` directory)

*   **Purpose:** The `layouts/` directory contains HTML templates that Hugo uses to render content into web pages.
*   **Hugo's Lookup Order:** Hugo follows a specific order to find the appropriate template for a given piece of content (e.g., based on content type, section, output format).
    *   `layouts/_default/baseof.html`: Often serves as the base template, defining the main HTML structure (head, body, header, footer) and blocks that other, more specific templates can override.
    *   `layouts/_default/single.html`: Used for rendering individual content pages.
    *   `layouts/_default/list.html`: Used for rendering section list pages.
*   **Template Language:** Hugo templates use Go template syntax, allowing access to content variables, front matter, site configuration, and a rich set of functions.

## 6. Shortcodes

*   **Purpose:** Reusable snippets of code embedded in Markdown that Hugo processes to generate HTML.
*   **Usage:** While not explicitly detailed in the previous review, Hugo supports built-in shortcodes and custom shortcodes (defined in `layouts/shortcodes/`). These can be used for complex content elements like image galleries, video embeds, or styled callouts.

## 7. Menu Generation

*   **Configuration:** The main site navigation menu is defined in `hugo.toml` under the `[menu.main]` array.
*   **Rendering:** Templates (likely in `layouts/partials/header.html` or similar) iterate over this menu configuration to dynamically generate the navigation links.

## 8. Hugo Build Process

*   **Command:** Running the `hugo` command processes all content, applies layouts, and generates the static website.
*   **Output Directory:** By default, the generated static site is placed in the `public/` directory. This directory contains all the HTML, CSS, JS, images, and other assets ready for deployment.

## Summary

Content generation revolves around Markdown files organized in the `content/` directory, enhanced with front matter, and a powerful templating system in `layouts/` to render this content into a static website. The Goldmark Markdown engine (with raw HTML enabled) and menu definitions in `hugo.toml` are key configuration aspects.
# Hugo Content Generation Workflow Overview

This document outlines how website content is created, structured, managed, and rendered using Hugo.

## 1. Content Organization (`content/` directory)

*   **Main Content Hub:** All website content resides in the `content/` directory.
*   **Structure:**
    *   `content/_index.md`: Typically serves as the content file for the homepage.
    *   `content/blog/`: Section for blog posts. Likely uses a list template to display posts and single templates for individual posts.
    *   `content/Portfolio/`: Section for portfolio items. Similar to the blog, it likely has list and single item views.
    *   `content/about.md`: Content for the "About" page.
    *   `content/now.md`: Content for the "Now" page.
*   **File Format:** Content is primarily written in Markdown (`.md` files).

## 2. Content Creation & Archetypes

*   **Archetypes (`archetypes/` directory):**
    *   `archetypes/blog.md`: A template for new blog posts. When a new blog post is created using `hugo new blog/...`, this archetype is used to pre-fill the new Markdown file.
    *   **Blog Archetype Content:**
        ```
        +++
        title = "{{ replace .Name "-" " " | title }}" # Generates title from filename
        date = {{ .Date }} # Sets current date
        summary = ""
        draft = true # New posts start as drafts
        +++

        # Life
        # Programming
        # Fitness
        # Learning Objectives
        # Modern Events
        ```
        This sets default front matter and provides placeholder headings within the content body.
*   **Automated Blog Post Creation (`new_blog.ps1`):
    *   **Purpose:** A PowerShell script to streamline the creation of new blog posts.
    *   **Workflow:**
        1.  Accepts a `Title` as an argument.
        2.  Cleans and slugifies the title (e.g., "My New Post" -> `my-new-post`).
        3.  Constructs a Hugo content path: `blog/YYYY/MM/slug/index.md`.
        4.  Executes `hugo new blog/YYYY/MM/slug/index.md` to generate the new content file using the `blog.md` archetype.
        5.  Optionally opens the newly created Markdown file in VS Code.

## 3. Front Matter

*   **Definition:** Metadata embedded at the top of Markdown files (e.g., within `+++ ... +++` for TOML format).
*   **Common Fields (from archetype and site usage):** `title`, `date`, `summary`, `draft`.
*   **Custom Fields:** Additional front matter fields can be defined as needed and accessed in templates.

## 4. Markdown Rendering

*   **Engine:** Goldmark is configured as the default Markdown handler (specified in `hugo.toml`).
*   **Raw HTML:** `[markup.goldmark.renderer] unsafe = true` in `hugo.toml` allows raw HTML to be embedded directly within Markdown content. This provides flexibility but should be used carefully, ensuring embedded HTML is secure and well-formed.

## 5. Layouts and Templates (`layouts/` directory)

*   **Purpose:** The `layouts/` directory contains HTML templates that Hugo uses to render content into web pages.
*   **Hugo's Lookup Order:** Hugo follows a specific order to find the appropriate template for a given piece of content (e.g., based on content type, section, output format).
    *   `layouts/_default/baseof.html`: Often serves as the base template, defining the main HTML structure (head, body, header, footer) and blocks that other, more specific templates can override.
    *   `layouts/_default/single.html`: Used for rendering single content pages (e.g., an individual blog post or portfolio item).
    *   `layouts/_default/list.html`: Used for rendering list pages (e.g., the blog landing page showing multiple posts, a portfolio overview page).
    *   Custom layouts can be created for specific sections (e.g., `layouts/blog/single.html`) or content types.
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

Content generation revolves around Markdown files organized in the `content/` directory, enhanced with front matter. Hugo uses archetypes for new content creation (with a helper script `new_blog.ps1` for blog posts) and a powerful templating system in `layouts/` to render this content into a static website. The Goldmark Markdown engine (with raw HTML enabled) and menu definitions in `hugo.toml` are key configuration aspects. 
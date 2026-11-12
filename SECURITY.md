# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to tanner@tanner-mcgrath.me. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

This project implements the following security measures:
- Content Security Policy (CSP) headers
- HTTPS enforcement
- XSS protection
- CSRF protection
- Rate limiting
- Input sanitization
- Secure logging practices
- Regular dependency updates
- Automated security scanning

## Best Practices

When contributing to this project, please follow these security best practices:
1. Never commit sensitive data (API keys, passwords, etc.)
2. Use environment variables for configuration
3. Sanitize all user input
4. Follow the principle of least privilege
5. Keep dependencies up to date
6. Write secure code and include security tests 
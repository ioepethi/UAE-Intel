# 07 — Security Standard

## Principle
Security is a first-class requirement, not an afterthought. Never introduce code that exposes or logs secrets.

## Secrets
- Never place secrets, API keys, tokens, or credentials in source code, commits, logs, or images.
- Use environment variables and a secret manager.
- Provide `.env.example` with non-secret placeholders only.
- Rotate exposed secrets immediately; treat any exposure as an incident.

## Authentication & Authorization
- Use established auth libraries; do not roll your own crypto or auth.
- Enforce least privilege.
- Validate authorization on every protected route and resource.
- Default-deny.

## Input validation
- Validate all input at trust boundaries.
- Reject unexpected input; do not silently coerce.
- Validate type, length, format, and ranges.

## Common vulnerabilities to prevent
- XSS — escape output, avoid `dangerouslySetInnerHTML`/unescaped interpolation.
- CSRF — use anti-CSRF tokens or same-site cookies.
- SQL injection — use parameterized queries / ORM; never string-concatenate SQL.
- Path traversal — validate and sanitize file paths.
- SSRF — validate and restrict outbound URLs.
- Open redirects — validate redirect targets.

## File uploads
- Validate type, size, and content.
- Store outside the web root or in object storage.
- Never execute user-uploaded files.
- Scan for malicious content where practical.

## Rate limiting & abuse
- Apply rate limiting to auth, search, and expensive endpoints.
- Detect and block brute-force and abuse patterns.

## Sensitive information
- Never log secrets, tokens, PII, or credentials.
- Minimize PII collection and storage.
- Mask sensitive fields in logs and error messages.

## Dependencies
- Keep dependencies updated.
- Review new dependencies for known vulnerabilities.
- Prefer well-maintained, widely used packages.

## Permissions & environment variables
- Scope credentials to the minimum needed.
- Use separate credentials per environment.
- Never reuse production credentials in non-production.

## Security review gate
A security review is required for changes that touch:
- Authentication or authorization
- Secrets or credentials
- PII or sensitive data
- File uploads or downloads
- External integrations
- Infrastructure or deployment

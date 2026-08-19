# 13 — Deployment Standard

## Environments
```text
Development → Staging → Production
```

## Pipeline stages
- Build validation (lint, typecheck, build)
- Test suite (unit, integration, API, e2e as applicable)
- Database migrations (reviewed, reversible)
- Deployment
- Production verification (smoke tests, health checks)
- Monitoring and error tracking active

## Rules
- AI must NOT deploy destructive production changes without explicit authorization.
- Migrations must be backward-compatible where possible; otherwise provide a staged rollout.
- Always have a rollback plan.
- Never deploy secrets in images or repos; inject at runtime.
- Verify deployment with smoke tests after release.

## Required documentation (`docs/DEPLOYMENT.md`)
- Environment list and URLs
- Build and deploy commands
- Migration process
- Rollback procedure
- Monitoring and alerting setup
- On-call / incident response basics

## AI agent responsibilities
- Do not modify CI/CD pipelines without approval.
- Do not change environment configuration without approval.
- Document any deployment-affecting change in `docs/DEPLOYMENT.md`.

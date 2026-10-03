# AGENTS.md

## Repository

Package: `@ankhorage/api-nextjs`

Next.js App Router transport adapter for the canonical `@ankhorage/api` runtime.

## Current architecture only

Only the current Ankhorage architecture is valid. Do not duplicate API dispatch or portable contract semantics owned by `@ankhorage/api` and `@ankhorage/contracts`.

Cross-package usage must go through published public APIs and declared dependencies.

## Required repository instructions

Before changing any file, inspect `.agents/skills/` when present. Load the Ankhorage coding rules and project-structure rules for implementation work, plus hexagonal architecture for boundary changes.

## Scope

This package owns Next.js/Web Request and Response translation and thin App Router route bindings. It must not make `@ankhorage/api` depend on Next.js filesystem routing or runtime types.

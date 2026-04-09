# {{PROJECT_NAME}} — Agent Instructions

> <!-- One-line context: where this project lives, what repo, any parent project or monorepo relationship. -->

## Overview
<!-- Describe what this project does in 1–2 sentences. State whether it's a standalone app, part of a larger system, or a shared library. Mention the primary user-facing purpose. -->

**Port:** <!-- Dev server port number -->
<!-- Add any other project identifiers that are relevant: bundle ID, deep link scheme, package name, subdomain, etc. -->

## Tech Stack
<!-- List the core technologies. Be specific about versions and patterns. Only include what's actually used — don't list aspirational tech. -->
- **Language**: <!-- e.g. TypeScript (strict), Python 3.12, Go 1.22 -->
- **Framework**: <!-- e.g. Next.js 15, Hono + @hono/node-server, FastAPI -->
- **Routing**: <!-- e.g. file-based (App Router), express routes, file-based tabs layout -->
- **Auth**: <!-- Describe the auth mechanism. Where do tokens come from? How are they stored? How are they refreshed? -->
- **API**: <!-- Where do API calls go? Own server, external service, shared backend? -->
- **Database**: <!-- e.g. Postgres via Drizzle ORM, SQLite, MongoDB, none -->
- **State**: <!-- e.g. Zustand with persist, Redux Toolkit, React Context, server-side sessions -->
- **Styling**: <!-- e.g. Tailwind CSS, CSS Modules, styled-components, ThemeContext -->
<!-- Add any additional stack entries relevant to this project (e.g. image uploads, real-time strategy, message queues, etc.) -->

## Commands
<!-- List the commands to start, build, test, and typecheck this project. -->
```bash
# Start dev server
# Run tests
# Typecheck
# Lint
```
<!-- Note any dependencies that must be running first (e.g. database, another API server, tunnel). -->

## Architecture
See `docs/ARCHITECTURE.md` for full system diagram, directory structure, API layer, and data flow.
<!-- If there's a build plan or design doc, reference it here. -->

### Key Files
<!-- List the most important files with one-line descriptions. Group by area (server, client, shared) if applicable. -->

### Auth Flow
<!-- Describe the auth flow step-by-step. Number each step. Include redirect URLs, token exchange details, and where tokens are stored. -->

### Screens / Routes / Pages
<!-- List every user-facing screen or route with a one-line description. Keep this updated as new ones are added. -->

### Key Components
<!-- List reusable components or modules with one-line descriptions. -->

## Environment Variables
### Local (.env)
<!-- List every env var with a description, default value, and where to get it. -->

### Production
<!-- List env vars that differ in production, or note where they're configured (e.g. Railway, Vercel, AWS). -->

### Local Dev Requirements
<!-- Note any local dev requirements: tunnels, native builds, seed data, etc. -->

## Conventions
<!-- List project-specific conventions. These are the rules agents must follow when writing code. -->
- <!-- e.g. All API calls go through `lib/api.ts` -->
- <!-- e.g. File-based routing — new pages go in `app/` directory -->
- <!-- e.g. Use UUIDv7 for all new IDs -->
- <!-- e.g. Server-side changes go in a separate project, not here -->
- Update AGENTS.md and docs/ARCHITECTURE.md when adding new screens, routes, components, or env vars

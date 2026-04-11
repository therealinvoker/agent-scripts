# AGENT_DEVELOPER_SETUP.md — How to Write Agent Instructions

## Purpose

This document defines how to create and maintain `AGENTS.md` files — the primary context that AI coding agents (Warp Oz, Cursor, Copilot, etc.) read before working on a project. A well-written `AGENTS.md` dramatically reduces hallucination, prevents agents from making incorrect assumptions about your stack, and ensures they follow your project's conventions from the first interaction.

Think of `AGENTS.md` as onboarding documentation written specifically for an AI teammate. It should contain everything a new developer would need to know to start contributing — architecture, conventions, key files, environment setup — but structured for fast machine consumption rather than narrative reading.

**This guide is framework-agnostic.** The template works for web apps, mobile apps, CLIs, APIs, libraries, or any other software project.

## Table of Contents

1. [Conventions](#conventions)
2. [Template](#template)
3. [Setting Up docs/](#setting-up-docs)
4. [Keeping Docs Current](#keeping-docs-current)
5. [Checklist](#checklist)

---

## Conventions

These rules apply to all `AGENTS.md` files and supporting documentation:

- **Keep it factual.** Every statement should be verifiable by reading the codebase. No aspirational descriptions of features that don't exist yet.
- **Be specific.** Prefer `Zustand stores with persist middleware (AsyncStorage)` over `state management library`. Prefer `Port 8083` over `a configured port`.
- **One-line descriptions.** Key files, screens, components, and env vars each get a single line. If it needs more, it belongs in `docs/ARCHITECTURE.md`.
- **Update on every push.** If your commit adds a screen, route, env var, component, or changes the auth flow, update `AGENTS.md` and `docs/ARCHITECTURE.md` before pushing. Stale docs are worse than no docs — they cause agents to generate code that doesn't match reality.
- **Remove what doesn't apply.** The template includes sections for many project types. Delete sections that aren't relevant rather than leaving empty placeholders.
- **Use comments as prompts.** The template uses `<!-- ... -->` HTML comments to explain what goes in each section. Replace the comment with real content; don't leave comments in the final file.

---

## Template

Copy this into your project's `AGENTS.md` and fill in each section.

```markdown
# <Project Name> — Agent Instructions

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
```

---

## Handling Secrets

When a developer needs to add an API token or secret to their environment, never ask them to paste it in plain text. Use this pattern to prompt for the value silently, write it to `~/.zshrc`, and clean it from memory immediately:

```bash
read -s 'TOKEN?Paste <SERVICE> token: ' && echo "export <VAR_NAME>=\"$TOKEN\"" >> ~/.zshrc && source ~/.zshrc && unset TOKEN && echo "Done"
```

For example, to set a Jira API token:

```bash
read -s 'TOKEN?Paste Jira token: ' && echo "export JIRA_API_TOKEN=\"$TOKEN\"" >> ~/.zshrc && source ~/.zshrc && unset TOKEN && echo "Done"
```

**What this does:**
- `read -s` — reads input silently (no echo to terminal)
- Appends the export to `~/.zshrc` so it persists across sessions
- `source ~/.zshrc` — activates it immediately in the current session
- `unset TOKEN` — removes it from shell memory after writing

Replace `<SERVICE>` with the service name and `<VAR_NAME>` with the env var name listed in `AGENTS.md`. Always run one token at a time.

---

## CLAUDE.md — Claude Code Support

Claude Code does **not** read `AGENTS.md` natively. It uses its own `CLAUDE.md` file. To avoid duplicating content, create a thin `CLAUDE.md` that imports your `AGENTS.md` and adds any Claude-specific config:

```markdown
@AGENTS.md

## Claude Code
<!-- Add Claude-specific instructions here. Examples: -->
<!-- - Use plan mode for changes under `src/billing/` -->
<!-- - Check subdirectory CLAUDE.md files for area-specific constraints -->
```

### How it works
- Claude Code's `@path` import syntax pulls in the referenced file at session start
- Your `AGENTS.md` stays the single source of truth for project context
- Other tools (Codex, Cursor, Copilot, Windsurf, Devin) read `AGENTS.md` directly
- Claude-specific overrides (path-scoped rules, workflow preferences) go in `CLAUDE.md`

### Optional: `.claude/rules/` for path-scoped rules
For large projects, you can add path-scoped rules that only load when Claude works on matching files:

```
.claude/rules/api-standards.md
```

```markdown
---
paths:
  - "src/api/**/*.ts"
---
# API Standards
- Validate all inputs with Zod before processing
- Return errors using the `ApiError` class from `shared/errors`
```

### Tool compatibility matrix

- **AGENTS.md** → Codex CLI, Cursor, GitHub Copilot, Windsurf, Devin, Amp, 20+ tools
- **CLAUDE.md** → Claude Code only (but imports AGENTS.md)
- **`.cursorrules`** → Cursor (legacy, prefer AGENTS.md)
- **`.github/copilot-instructions.md`** → GitHub Copilot (native format)

---

## Setting Up docs/

Every project should have a `docs/` directory alongside `AGENTS.md`:

```
project/
├── AGENTS.md              # Cross-tool agent instructions (canonical)
├── CLAUDE.md              # Claude Code wrapper (imports AGENTS.md)
└── docs/
    ├── ARCHITECTURE.md
    ├── CHANGELOG.md
    └── plans/
        └── 001-<project>-build-plan.md
```

### docs/ARCHITECTURE.md
The detailed technical reference. Must include:
1. **System Diagram** — ASCII box diagram showing how components connect (client → server → DB → external APIs)
2. **Directory Structure** — Full file tree with one-line descriptions per file
3. **Auth Flow** — Numbered steps from unauthenticated to fully authed
4. **API Layer** — How clients call the server, base URL configuration, auth header attachment
5. **Key Endpoints** — Method, path, and description for every API route
6. **State Management** — List of stores, contexts, or state containers and what each manages
7. **Database Tables** — Every table with column highlights (especially JSONB fields, foreign keys, timestamps)
8. **Real-time Strategy** (if applicable) — Polling intervals, WebSocket usage, push notification setup

### docs/CHANGELOG.md
Customer-facing changelog in plain language:
```markdown
# <Project Name> — Changelog

## [Unreleased]
<!-- New entries go here. Write from the customer's perspective. -->
```

### docs/plans/
Build plans and design documents. Number them sequentially. Each plan should cover:
1. **Problem statement** — What this project solves
2. **Phased delivery** — Numbered phases with clear deliverables
3. **Data model** — Table schemas, relationships, JSONB shapes
4. **API surface** — Route list with request/response shapes
5. **Screen inventory** — Every screen with its purpose and key interactions

---

## Keeping Docs Current

**Rule: every `git push` that changes behavior must include doc updates.**

Before pushing, ask yourself:
- Did I add a new screen, route, or page? → Update **Screens / Routes** in `AGENTS.md` and **Directory Structure** in `docs/ARCHITECTURE.md`
- Did I add a new component? → Update **Key Components** in `AGENTS.md`
- Did I add or change an env var? → Update **Environment Variables** in `AGENTS.md`
- Did I change the auth flow? → Update **Auth Flow** in both `AGENTS.md` and `docs/ARCHITECTURE.md`
- Did I add a new API endpoint? → Update **Key Endpoints** in `docs/ARCHITECTURE.md`
- Did I add or change a DB table? → Update **Database Tables** in `docs/ARCHITECTURE.md`
- Did I ship a user-visible feature or fix? → Add an entry to `docs/CHANGELOG.md`
- Did I add a new key file? → Update **Key Files** in `AGENTS.md`

If you're using AI agents to write code, instruct them to update documentation as part of every task. Include this line in your Conventions section:
```
- Update AGENTS.md and docs/ARCHITECTURE.md when adding new screens, routes, components, or env vars
```

Small bug fixes and refactors within existing modules don't need doc updates.

---

## Checklist

When setting up agent docs for a new project:
- [ ] Create `AGENTS.md` at the project root using the template above
- [ ] Create `CLAUDE.md` that imports `AGENTS.md` (for Claude Code support)
- [ ] Fill in every section — remove comments and sections that don't apply
- [ ] Create `docs/ARCHITECTURE.md` with system diagram and directory structure
- [ ] Create `docs/CHANGELOG.md` with the empty template
- [ ] Create `docs/plans/` directory with the build plan (if applicable)
- [ ] Verify all env vars are documented
- [ ] Verify all screens/routes are listed
- [ ] Verify all key files are listed
- [ ] Confirm the doc update convention is in your Conventions section
- [ ] Remove the line `> Read docs/AGENT_SETUP.md and follow the instructions there before proceeding.` from `AGENTS.md`

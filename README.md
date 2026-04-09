# agent-scripts

Scaffold `AGENTS.md`, `CLAUDE.md`, and supporting docs for AI coding agents.

A well-written `AGENTS.md` dramatically reduces hallucination, prevents agents from making incorrect assumptions about your stack, and ensures they follow your project's conventions from the first interaction.

## Install

```bash
npm install -g agent-scripts
```

Or use without installing:

```bash
npx agent-scripts init
```

## Commands

### `agent-scripts init`

Scaffolds agent documentation in the current directory:

```
project/
├── AGENTS.md              # Cross-tool agent instructions (canonical)
├── CLAUDE.md              # Claude Code wrapper (imports AGENTS.md)
└── docs/
    ├── ARCHITECTURE.md    # System diagram, directory structure, API reference
    ├── CHANGELOG.md       # Customer-facing changelog
    └── plans/             # Build plans and design documents
```

- Skips existing files by default
- Use `--force` to overwrite
- Replaces `{{PROJECT_NAME}}` with the current directory name

### `agent-scripts check`

Verifies all required agent docs exist and flags issues:

```bash
$ agent-scripts check
Checking agent docs...

  ✅ AGENTS.md — Agent instructions (cross-tool)
  ✅ CLAUDE.md — Claude Code wrapper
  ⚠️  docs/ARCHITECTURE.md — exists but still has <!-- comment --> placeholders
  ✅ docs/CHANGELOG.md — Changelog
  💡 docs/plans — not found (optional: Build plans directory)

All files present, but 1 warning(s). Fill in placeholder comments.
```

## What gets scaffolded

**`AGENTS.md`** — The canonical project instructions file. Read natively by 20+ AI coding tools including Codex CLI, Cursor, GitHub Copilot, Windsurf, Devin, and Amp. Contains sections for tech stack, commands, architecture, key files, auth flow, screens/routes, environment variables, and conventions.

**`CLAUDE.md`** — A thin wrapper that imports `AGENTS.md` via Claude Code's `@path` syntax. Claude Code does not read `AGENTS.md` natively, so this file bridges the gap while letting you add Claude-specific overrides.

**`docs/ARCHITECTURE.md`** — Detailed technical reference: system diagram, directory structure, auth flow, API layer, key endpoints, state management, database tables, and real-time strategy.

**`docs/CHANGELOG.md`** — Customer-facing changelog template.

**`docs/plans/`** — Directory for build plans and design documents.

## Tool compatibility

| File | Read by |
|---|---|
| `AGENTS.md` | Codex CLI, Cursor, GitHub Copilot, Windsurf, Devin, Amp, 20+ tools |
| `CLAUDE.md` | Claude Code (imports AGENTS.md) |
| `.cursorrules` | Cursor (legacy — prefer AGENTS.md) |
| `.github/copilot-instructions.md` | GitHub Copilot (native format) |

## Guides

This package includes two setup guides:

- **[AGENT_DEVELOPER_SETUP.md](./AGENT_DEVELOPER_SETUP.md)** — How to write effective `AGENTS.md` files: conventions, the full template, docs structure, keeping docs current, and a setup checklist.
- **[AGENT_EXECUTIVE_SETUP.md](./AGENT_EXECUTIVE_SETUP.md)** — Executive onboarding: identify business pain points, map them to MCP servers, configure connections, validate setup, and define agent boundaries.

## License

MIT

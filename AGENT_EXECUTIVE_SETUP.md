# AGENT_EXECUTIVE_SETUP.md — Executive Agent Onboarding

## Purpose

This guide helps business leaders onboard AI agents by identifying their operational pain points and connecting the right data sources (MCP servers) so agents have the context they need to be effective.

Unlike the [Developer Setup](./AGENT_DEVELOPER_SETUP.md) (which covers codebase conventions), this setup focuses on **business context** — the tools, workflows, and knowledge an agent needs to act on your behalf.

---

## Step 1: Identify Your Pain Points

Before connecting any tools, clarify what you need agents to help with. Answer each question honestly — skip any that don't apply.

### Customer Operations
- [ ] Are support tickets piling up or response times too slow?
- [ ] Do customers churn because issues aren't resolved fast enough?
- [ ] Is your team manually triaging or routing conversations?

### Marketing & Content
- [ ] Is content creation a bottleneck (blog posts, emails, social, ads)?
- [ ] Are campaigns launched without consistent brand voice?
- [ ] Do you lack visibility into what content is performing?

### Sales & CRM
- [ ] Are leads falling through the cracks?
- [ ] Is your pipeline data scattered across tools?
- [ ] Do reps spend too much time on manual data entry?

### Internal Operations
- [ ] Are project updates buried in docs, Slack, or email?
- [ ] Is institutional knowledge siloed in individual people's heads?
- [ ] Do recurring tasks (reports, summaries, follow-ups) consume too much time?

### Product & Engineering
- [ ] Is the backlog growing faster than the team can ship?
- [ ] Are bugs reported in one place but tracked in another?
- [ ] Do engineers waste time on context-switching between tools?

---

## Step 2: Map Pain Points to MCP Servers

Based on your answers above, connect the data sources that give agents the context to help. Each MCP server exposes tools and data from an external service.

### What is an MCP Server?

MCP (Model Context Protocol) is a standard that lets AI agents read from and act on your real tools — project boards, docs, email, CRM, code repos, etc. Each connection is called an **MCP server**. You provide them; the agent uses them.

### Recommended Connections

| Pain Point Area | MCP Server | What It Unlocks |
|---|---|---|
| **Support / Customer Ops** | Intercom, Zendesk, or Help Scout | Read tickets, suggest replies, triage by priority |
| **Marketing / Content** | Notion, Google Docs | Access brand guides, content calendars, draft docs |
| **Email Campaigns** | Mailchimp, Sendgrid, or your ESP | Read campaign data, draft emails, check deliverability |
| **Sales / CRM** | HubSpot, Salesforce, or Pipedrive | Read pipeline, update deals, enrich contacts |
| **Project Management** | GitHub Projects, Linear, Jira | Read issues, update status, create tasks |
| **Code & Engineering** | GitHub | Read repos, PRs, issues, review code |
| **Internal Comms** | Slack, Microsoft Teams | Search messages, summarize threads, post updates |
| **Documents & Knowledge** | Notion, Confluence, Google Drive | Search wikis, read docs, find institutional knowledge |
| **Calendar & Scheduling** | Google Workspace | Read calendars, find availability, draft agendas |
| **Analytics** | Amplitude, Mixpanel, GA4 | Pull usage metrics, funnel data, engagement stats |

---

## Step 3: Configure Your MCP Servers

For each MCP server you want to connect, you'll need:

1. **Server name** — A human-readable label (e.g. "GitHub", "Notion")
2. **Server URL or transport** — The endpoint or stdio command the agent connects to
3. **Authentication** — API key, OAuth token, or other credentials

### Configuration Format

Most agent platforms accept MCP servers in a JSON config. Here's the general shape:

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "<command-to-start-server>",
      "args": ["<arg1>", "<arg2>"],
      "env": {
        "API_KEY": "<your-api-key>"
      }
    }
  }
}
```

### Where to Configure

- **Warp (Oz):** Settings → MCP Servers → Add Server
- **Cursor:** `.cursor/mcp.json` in your project root
- **Claude Desktop:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **VS Code (Copilot):** `.vscode/mcp.json` in your project root

### Example: GitHub MCP Server

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

### Example: Notion MCP Server

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "<your-integration-token>"
      }
    }
  }
}
```

---

## Step 4: Validate Your Setup

After connecting MCP servers, verify the agent can access them:

1. **Ask the agent to list available tools** — It should show tools from each connected MCP server
2. **Test a read operation** — e.g. "List my open GitHub issues" or "Show my Notion workspace pages"
3. **Test a write operation** (if applicable) — e.g. "Create a draft issue" or "Update this doc"

If a server isn't responding, check:
- Is the API key / token valid and not expired?
- Does the token have the required scopes/permissions?
- Is the MCP server package installed (`npx` will auto-install, but check for errors)?

---

## Step 5: Define Agent Boundaries

Once tools are connected, decide what the agent is allowed to do autonomously vs. what requires approval:

### Suggested Defaults

- **Read-only by default** — Let agents read from all connected sources freely
- **Approve writes** — Require confirmation before the agent creates, updates, or deletes anything
- **Escalate unknowns** — If the agent isn't confident, it should ask rather than guess

### Document Your Boundaries

Add a section to your project's `AGENTS.md` or create a standalone rules file:

```markdown
## Agent Permissions
- GitHub: read issues, PRs, code. Create issues with approval. Never merge PRs.
- Notion: read all pages. Create drafts with approval. Never delete pages.
- Slack: read public channels. Post summaries with approval. Never DM on behalf of user.
```

---

## Checklist

- [ ] Completed pain point assessment (Step 1)
- [ ] Identified which MCP servers to connect (Step 2)
- [ ] Configured at least one MCP server (Step 3)
- [ ] Validated the agent can read from connected sources (Step 4)
- [ ] Documented agent permissions and boundaries (Step 5)

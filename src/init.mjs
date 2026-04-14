import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';

/** @param {string} raw */
function parseGitRemoteToSlug(raw) {
  const url = raw.trim();
  const ssh = url.match(/^[^@]+@[^:]+:([^/]+)\/(.+?)(?:\.git)?$/);
  if (ssh) return `${ssh[1]}/${ssh[2]}`;
  const scp = url.match(/^ssh:\/\/[^/]+\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (scp) return `${scp[1]}/${scp[2]}`;
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts.slice(1).join('/')}`;
  } catch {
    /* ignore */
  }
  return null;
}

/** @param {string} cwd */
function getOriginRepoSlug(cwd) {
  try {
    const out = execFileSync('git', ['config', '--get', 'remote.origin.url'], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return parseGitRemoteToSlug(out);
  } catch {
    const configPath = join(cwd, '.git', 'config');
    if (!existsSync(configPath)) return null;
    const config = readFileSync(configPath, 'utf-8');
    const block = config.match(/\[remote "origin"\][^\[]*/s);
    if (!block) return null;
    const line = block[0].match(/^\s*url\s*=\s*(.+)$/m);
    return line ? parseGitRemoteToSlug(line[1].trim()) : null;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const AGENTS_DIR = join(__dirname, '..', 'agents');

function getAgentTypes() {
  return readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = readFileSync(join(AGENTS_DIR, file), 'utf-8');
      const raw = file.replace(/_SETUP\.md$/, '').replace(/_/g, ' ').toLowerCase();
      const name = raw.charAt(0).toUpperCase() + raw.slice(1);
      const match = content.match(/## Purpose\s*\n+([^\n]+)/);
      const hint = match ? match[1].trim() : '';
      return { file, name, hint, value: file };
    });
}

const DIRS = [
  'docs',
  'docs/plans',
];

const UNINSTALL_PATHS = [
  'AGENTS.md',
  'CLAUDE.md',
  'docs/AGENT_SETUP.md',
  'docs/ARCHITECTURE.md',
  'docs/CHANGELOG.md',
  'docs/plans',
  'docs',
];

export async function init({ force = false } = {}) {
  const cwd = process.cwd();
  const projectName = basename(cwd);

  p.intro('agent-scripts');

  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'install', label: 'Install', hint: 'Scaffold agent docs in this directory' },
      { value: 'uninstall', label: 'Uninstall', hint: 'Remove agent docs from this directory' },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  if (action === 'uninstall') {
    let removed = 0;
    for (const rel of UNINSTALL_PATHS) {
      const fullPath = join(cwd, rel);
      if (existsSync(fullPath)) {
        rmSync(fullPath, { recursive: true, force: true });
        p.log.step(`Removed ${rel}`);
        removed++;
      }
    }
    p.outro(removed > 0 ? `Removed ${removed} item(s).` : 'Nothing to remove.');
    return;
  }

  // Install flow
  const agentTypes = getAgentTypes();
  const selected = await p.select({
    message: 'Select an agent type:',
    options: agentTypes.map(t => ({
      value: t.value,
      label: `${t.name}  ${t.hint}`,
    })),
    initialValue: agentTypes[0]?.value,
  });

  if (p.isCancel(selected)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const agentType = agentTypes.find(t => t.value === selected);

  if (agentType.name.toLowerCase().includes('developer')) {
    const hasGit = existsSync(join(cwd, '.git'));
    const slug = hasGit ? getOriginRepoSlug(cwd) : null;
    let message;
    if (hasGit && slug) {
      message = `Developers, this is the repo for ${slug}. Continue?`;
    } else if (hasGit) {
      message = `Developers, you're installing into "${projectName}" (no origin URL detected). Continue?`;
    } else {
      message =
        'No `.git` directory here. Developer agent docs are usually installed at the git repository root. Continue anyway?';
    }
    const proceed = await p.confirm({ message, initialValue: true });
    if (p.isCancel(proceed) || !proceed) {
      p.cancel('Cancelled.');
      process.exit(0);
    }
  } else {
    p.note(`You are installing into:\n${cwd}\n\nMake sure this is the right directory.`, 'Heads up');
  }

  const FILES = [
    { src: join(TEMPLATES_DIR, 'AGENTS.md'), dest: 'AGENTS.md', isTemplate: true },
    { src: join(TEMPLATES_DIR, 'CLAUDE.md'), dest: 'CLAUDE.md', isTemplate: true },
    { src: join(TEMPLATES_DIR, 'ARCHITECTURE.md'), dest: 'docs/ARCHITECTURE.md', isTemplate: true },
    { src: join(TEMPLATES_DIR, 'CHANGELOG.md'), dest: 'docs/CHANGELOG.md', isTemplate: true },
    { src: join(AGENTS_DIR, agentType.file), dest: 'docs/AGENT_SETUP.md', isTemplate: false },
  ];

  // Create directories
  for (const dir of DIRS) {
    const fullPath = join(cwd, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  }

  // Copy template files
  let created = 0;
  let skipped = 0;

  for (const { src, dest, isTemplate } of FILES) {
    const destPath = join(cwd, dest);
    const destDir = dirname(destPath);

    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    if (existsSync(destPath) && !force) {
      p.log.warn(`${dest} — already exists (use --force to overwrite)`);
      skipped++;
      continue;
    }

    let content = readFileSync(src, 'utf-8');
    if (isTemplate) content = content.replaceAll('{{PROJECT_NAME}}', projectName);

    writeFileSync(destPath, content, 'utf-8');
    p.log.step(`${dest}`);
    created++;
  }

  if (created > 0) {
    await offerGitInitHook();
    p.outro(`Done! Restart Claude (or your agent) in this directory and your AGENTS.md will be read every session.`);
  } else {
    p.outro(`${skipped} file(s) skipped — all already exist. Use --force to overwrite.`);
  }
}

const GIT_HOOK_MARKER = '# agent-scripts: run on git init';
const GIT_HOOK_BLOCK = `
${GIT_HOOK_MARKER}
git() {
  command git "$@"
  if [[ "$1" == "init" ]]; then
    npx agent-scripts init
  fi
}
`;

async function offerGitInitHook() {
  const zshrc = join(homedir(), '.zshrc');
  const existing = existsSync(zshrc) ? readFileSync(zshrc, 'utf-8') : '';
  if (existing.includes(GIT_HOOK_MARKER)) return; // already installed

  const add = await p.confirm({
    message: 'Add a git init hook to ~/.zshrc so agent-scripts runs automatically on every new repo?',
    initialValue: true,
  });

  if (p.isCancel(add) || !add) return;

  appendFileSync(zshrc, GIT_HOOK_BLOCK, 'utf-8');
  p.log.step('Added git init hook to ~/.zshrc — run `source ~/.zshrc` or restart your terminal to activate.');
}

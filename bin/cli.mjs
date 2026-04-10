#!/usr/bin/env node

import { init } from '../src/init.mjs';
import { check } from '../src/check.mjs';

const [command, ...args] = process.argv.slice(2);

const HELP = `
agent-scripts — Scaffold AGENTS.md and supporting docs for AI coding agents

Usage:
  agent-scripts init [--force]     Scaffold AGENTS.md, CLAUDE.md, and docs/ in the current directory
  agent-scripts check              Verify all required agent docs exist
  agent-scripts help               Show this help message

Options:
  --force    Overwrite existing files (default: skip existing)
`;

(async () => {
  switch (command) {
    case 'init':
      await init({ force: args.includes('--force') });
      break;
    case 'check':
      await check();
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP.trim());
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP.trim());
      process.exit(1);
  }
})();

# 001 — Auto-trigger on `git init`

## Problem
Developers have to remember to run `npx agent-scripts init` after setting up a new repo. This is an extra step that gets skipped.

## Solution
On first successful install, detect whether the user's shell config already has a `git init` wrapper. If not, offer to add it. This makes `agent-scripts init` run automatically every time `git init` is called.

## Shell wrapper
```zsh
# agent-scripts: run on git init
git() {
  command git "$@"
  if [[ "$1" == "init" ]]; then
    npx agent-scripts init
  fi
}
```

Added to `~/.zshrc`. Marker comment used to detect existing installation and prevent duplicates.

## Implementation
- After a successful `init` install, check `~/.zshrc` for the marker string `agent-scripts: run on git init`
- If not found, prompt: *"Add a git init hook to ~/.zshrc so agent-scripts runs automatically on every new repo?"*
- If confirmed, append the wrapper block to `~/.zshrc`
- Inform the user to run `source ~/.zshrc` or restart their terminal

## Scope
- Shell: zsh only (`~/.zshrc`) for now — covers macOS default
- Bash support (`~/.bashrc`) can be added later
- No changes needed on uninstall — the wrapper is harmless if the package is removed

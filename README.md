# 🔁 Ralph Loop Exercise

This repository contains a minimalistic ToDo web application that serves as a playground for the **Ralph Loop** — a technique where an AI coding agent is invoked repeatedly with the same prompt, making one small verifiable step of progress per iteration until all work is done.

All files required by the Ralph loop are already included:

| File | Purpose |
|---|---|
| `PROMPT.md` | The agent prompt handed to Copilot on every iteration. Describes the loop's rules and workflow. |
| `PRD.md` | Product Requirements Document. The agent reads this to find unchecked tasks and marks them done when complete. |
| `progress.md` | Running log appended by the agent each iteration — what was done, decisions made, and lessons learned. |
| `scripts/ralph.sh` | The bash script that drives the loop, calling the Copilot CLI repeatedly until all work is done. |
| `.ralph/` | Per-iteration log files written by the script (created at runtime). |

## 🤖 About the Ralph Loop script

`scripts/ralph.sh` runs the loop by calling `copilot` (GitHub Copilot CLI) repeatedly with the contents of `PROMPT.md` as the prompt. Each iteration the agent inspects the current repo state, implements exactly one unchecked PRD item, marks it done, updates `progress.md`, and exits. The script then starts a fresh iteration.

**Usage:**

```bash
# Default: use ./PROMPT.md, run up to 10 iterations
scripts/ralph.sh

# Use a custom prompt file
scripts/ralph.sh path/to/prompt.md

# Limit iterations or change the model
MAX_ITER=5 scripts/ralph.sh
MODEL=claude-sonnet-4.5 scripts/ralph.sh
```

**Key defaults:**

| Variable | Default | Description |
|---|---|---|
| `MAX_ITER` | `10` | Maximum number of iterations before stopping (`0` = unlimited) |
| `MODEL` | Copilot default | The model passed to the Copilot CLI |
| `SLEEP_BETWEEN` | `2` | Seconds to wait between iterations |

**Stop conditions** (any one ends the loop):
- `Ctrl-C`
- `MAX_ITER` iterations reached
- A file named `STOP` exists in the repo root (the agent creates this when all PRD items are checked off)

Iteration logs are written to `.ralph/iteration-NNN.log`.

## 🚀 Before you begin

### Requirements

> **No JavaScript or TypeScript experience required.** The agent handles all the coding — you just need the tools installed and running.

- **Node.js** v18 or later
- **GitHub Copilot CLI** (`copilot`) available in your `PATH`
  - Install via: `npm install -g @githubnext/github-copilot-cli` (or follow the [official instructions](https://githubnext.com/projects/copilot-cli/))
  - Authenticate with: `github-copilot-cli auth`

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📋 Exercise

1. **Familiarize yourself** with `PROMPT.md` and `scripts/ralph.sh`. Notice that the prompt only describes the agent's workflow — it does not hard-code any specific feature. All requirements live in `PRD.md`.

2. **Create a feature plan** in `PRD.md` using Copilot in Plan mode. Ask Copilot to plan the following two features, using the checkbox task format expected by `PROMPT.md` (`- [ ] Task description`):
   - Users can categorize ToDo items into one of four categories: **Work**, **Home**, **Hobbies**, or **Uncategorized**.
   - Users can manually change the display order of their todos.

3. **Start the Ralph loop:**

   ```bash
   scripts/ralph.sh
   ```

   By default the loop runs for up to **10 iterations**. If your plan has more tasks, increase the limit with `MAX_ITER`:

   ```bash
   MAX_ITER=20 scripts/ralph.sh
   ```

4. **Follow the progress.**
The script prints status information to stdout for each iteration.

Watch how the agent:
   - Starts a new Copilot session with fresh context after each iteration
   - Ticks off completed items in `PRD.md`
   - Appends entries to `progress.md`
   - Creates `STOP` when all work is done
   - Saves detailed logs in `.ralph/`

5. **Try the finished app:**

   ```bash
   npm run dev
   ```

## 🎬 Demo

Want to skip the planning step and jump straight into the loop? Check out the `demo` branch — it includes a ready-made `PRD.md` so you can start the Ralph loop immediately.
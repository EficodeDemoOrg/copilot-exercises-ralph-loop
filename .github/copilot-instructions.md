# Copilot Instructions

These instructions guide GitHub Copilot when generating code, suggestions, and reviews for this repository. Follow them in addition to any explicit user requests.

## Application purpose and scope

- This project is a **web application for organizing ToDo items**.
- Users can create, edit, complete, reorder, and delete ToDo items from the browser.
- All ToDo data is persisted **client-side in the browser's `localStorage`**. There is no backend, no server APIs, and no external database.
- The app is intended to run as a single-page application served as static assets.

## Technology stack

- **Language:** TypeScript (use strict typing; avoid `any` unless justified).
- **Build tool / dev server:** Vite.
- **Runtime target:** Modern evergreen browsers (ES2020+).
- **Persistence:** `window.localStorage` only. Wrap access behind a small storage module so the serialization format and key names are centralized.
- **Package manager:** Use whatever is already configured in the repo (`npm`, `pnpm`, or `yarn`). Do not introduce a new one.
- **Dependencies:** Keep runtime dependencies minimal. Prefer the standard DOM/browser APIs over adding libraries. Discuss before adding any new runtime dependency.

## Coding practices

### TypeScript

- Enable and respect `strict` mode. Prefer explicit types on exported/public APIs; rely on inference for local variables.
- Model domain types (e.g. `TodoItem`, `TodoStatus`) as dedicated `interface` or `type` declarations and reuse them.
- Prefer `unknown` over `any` when a value's type is genuinely unknown, and narrow before use.
- Use discriminated unions for state variants instead of boolean flags where it improves clarity.
- Use `readonly` and immutable update patterns for state where practical.

### Code style

- Use ES modules (`import` / `export`); no CommonJS.
- Prefer `const`; use `let` only when reassignment is required. Never use `var`.
- Use arrow functions for callbacks; named `function` declarations for top-level utilities.
- Keep functions small and single-purpose. Extract helpers when a function exceeds roughly one screen.
- Use early returns to reduce nesting.
- Name things descriptively: `addTodo`, `toggleCompleted`, `loadTodosFromStorage` — not `doStuff` or `handle1`.
- Follow the formatting and linting configuration already present in the repo (e.g. ESLint / Prettier). Do not hand-format against the configured rules.

### Local storage usage

- Centralize all `localStorage` reads/writes in a single storage module. Components and UI logic should not call `localStorage` directly.
- Define and reuse a constant for the storage key (e.g. `TODOS_STORAGE_KEY`).
- Always JSON-serialize on write and JSON-parse on read inside `try`/`catch`. Treat malformed or missing data as "no todos" rather than crashing.
- Validate the shape of parsed data before trusting it; the user could have edited storage manually.
- Consider versioning the stored payload (e.g. `{ version: 1, todos: [...] }`) so future schema changes can be migrated.

### Architecture

- Separate concerns: **domain/state** (todo model and operations), **persistence** (localStorage adapter), and **UI** (DOM rendering / framework view layer).
- Keep state mutations in pure functions where possible (`addTodo(state, item) => newState`) to make behavior easy to reason about and test.
- Avoid global mutable singletons; pass dependencies explicitly.

### Error handling and UX

- Never silently swallow errors. Log them and surface a user-visible message when an action fails.
- Guard against quota errors when writing to `localStorage` and report them to the user.
- Make destructive actions (delete, clear all) require explicit confirmation.

### Accessibility

- Use semantic HTML (`<button>`, `<ul>`/`<li>`, `<label>` tied to inputs, etc.).
- Ensure all interactive elements are keyboard-accessible and have accessible names.
- Maintain sufficient color contrast and visible focus states.

### Testing

- Add or update tests alongside behavior changes when a test setup exists in the repo.
- Prefer testing pure state functions and the storage adapter; keep DOM tests focused on user-visible behavior.

### Commits and changes

- Make small, focused changes. Do not refactor unrelated code in the same change.
- Update documentation (README, comments) when behavior or public APIs change.
- Do not commit secrets, API keys, or generated build artifacts.

# Product Requirements: Categories & Reordering

This PRD extends the existing ToDo app with two capabilities:

1. **Categorization** — every todo belongs to one of a fixed set of
   categories: **Home**, **Work**, **Hobbies**, plus **Uncategorized**
   (the default for legacy items and items where the user makes no choice).
2. **Reordering** — users can change the display order of todos manually.
   The chosen order is persistent and is the order used for display
   (it overrides the previous "creation order" rendering).

The app remains a static, single-page TypeScript + Vite app with all data
in `localStorage`. No backend, no new runtime dependencies.

Each item below is one self-contained, verifiable Ralph-loop step. Items
are listed in the intended implementation order; later items depend on
earlier ones.

## Conventions used in this PRD

- Categories are represented by a discriminated string union
  `Category = "home" | "work" | "hobbies" | "uncategorized"` declared in
  `src/types.ts`. Display labels live in a single map next to the type.
- Stored payload schema version is bumped from `1` to `2`. The storage
  module migrates v1 payloads on load by defaulting `category` to
  `"uncategorized"` and assigning an `order` value based on the array
  index. The storage key remains `todos.v1` (the schema version inside
  the payload is what changes); on a successful save the payload is
  written back at version `2`.
- A todo's position is stored as a numeric `order` field. Lower values
  render first. New todos are appended at the end (max order + 1).
  Reordering rewrites only the affected items' `order` values; the
  storage module is the single writer.

---

## Tasks

### Domain model

- [ ] **Add `Category` type and extend `TodoItem`** — In `src/types.ts`,
      add `Category` union and `CATEGORY_LABELS` map, and extend
      `TodoItem` with `category: Category` and `order: number`. Update
      any direct consumers of `TodoItem` to compile cleanly. No
      behavior change yet.

- [ ] **Update `addTodo` to accept a category and assign order** —
      In `src/state.ts`, change `addTodo` to accept an optional
      `category` (default `"uncategorized"`) and to assign `order` as
      `max(existing order) + 1` (or `0` when empty). Existing call
      sites continue to work.

- [ ] **Add pure `setCategory` state function** — In `src/state.ts`,
      add `setCategory(state, id, category)` that returns a new array
      with the targeted item's `category` updated. Reject unknown
      categories defensively (return state unchanged).

- [ ] **Add pure `reorderTodos` state function** — In `src/state.ts`,
      add `reorderTodos(state, fromId, toId, position: "before" | "after")`
      that returns a new array with `order` values rewritten so that
      `fromId` ends up immediately before/after `toId` in the visible
      sequence. Order values are normalized to consecutive integers
      starting at `0`. No-op if either id is missing or `fromId === toId`.

- [ ] **Add pure `moveTodo` helper for keyboard reordering** — In
      `src/state.ts`, add `moveTodo(state, id, direction: "up" | "down")`
      that swaps the item with its neighbor in the current sorted order
      and rewrites `order` accordingly. No-op at the boundaries.

### Persistence

- [ ] **Bump storage payload to v2 with migration** — In
      `src/storage.ts`, raise `CURRENT_VERSION` to `2`, update
      `isTodoItem` to require `category` (validated against the known
      set) and a numeric `order`, and add a migration that upgrades v1
      payloads in-memory: assign `category = "uncategorized"` and
      `order = index` based on the stored array order. Malformed
      payloads still fall back to an empty list with a warning. Saves
      always write v2.

### UI — categories

- [ ] **Category picker on the add form** — In `src/ui.ts`, add a
      `<select>` next to the new-todo input listing the four categories
      (default `Uncategorized`). The selected value is passed through
      `onAdd(title, category)`. Wire the new signature in `src/main.ts`.
      The select is properly labelled for screen readers.

- [ ] **Show each todo's category and allow changing it inline** — In
      `src/ui.ts`, render each list item with a per-item category
      `<select>` (or equivalent labelled control) showing the current
      category. Changing it fires a new `onSetCategory(id, category)`
      callback wired to the new `setCategory` state function in
      `src/main.ts`. Visually distinguish categories (e.g. color-coded
      badge) using `src/style.css`, while keeping sufficient contrast
      and a visible focus state.

- [ ] **Filter list by category** — In `src/ui.ts`, add a filter
      control above the list with options `All`, `Home`, `Work`,
      `Hobbies`, `Uncategorized`. The filter affects only what is
      displayed; it does not modify state. Empty-state copy adapts to
      the active filter ("No todos in Work yet."). The filter selection
      itself does not need to persist across reloads.

### UI — reordering

- [ ] **Render todos sorted by `order`** — Update the rendering
      pipeline so the list is always displayed sorted by ascending
      `order` (ties broken by `createdAt`). New todos appear at the
      bottom. This step replaces the implicit insertion-order
      rendering.

- [ ] **Keyboard reordering with Move-up / Move-down buttons** — In
      `src/ui.ts`, add accessible `Move up` and `Move down` buttons to
      each list item (icon + `aria-label`). Clicking them fires a new
      `onMove(id, direction)` callback wired to `moveTodo` in
      `src/main.ts`. Buttons are disabled at the list boundaries.
      Ordering is preserved across reloads (covered by the persistence
      task above).

- [ ] **Drag-and-drop reordering** — In `src/ui.ts`, make list items
      draggable using the native HTML5 Drag and Drop API. On drop,
      compute `before`/`after` based on the pointer position relative
      to the target item's vertical midpoint and fire
      `onReorder(fromId, toId, position)` wired to `reorderTodos`.
      Drag affordances must not break the existing keyboard reordering
      path; both must work. While dragging, visually indicate the drop
      target. Reordering is disabled when a category filter other than
      `All` is active (to avoid ambiguous semantics across hidden
      items); document this in the README.

### Documentation

- [ ] **Update README with the new features** — Document categories
      (fixed set, default `Uncategorized`), the filter control, the
      two reordering mechanisms (buttons and drag-and-drop), the
      filter-disables-DnD rule, and the v1 → v2 storage migration.
      Update the "Features" list and the project layout section if
      file responsibilities have changed.

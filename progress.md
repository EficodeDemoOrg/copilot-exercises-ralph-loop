# Progress Log

## 2026-05-04 — Task 1: Add `TodoCategory` type and extend `TodoItem`

**Implemented**
- `src/types.ts`: added `TodoCategory` union (`'Work' | 'Home' | 'Hobbies' | 'Uncategorized'`), exported a `TODO_CATEGORIES` readonly array for UI iteration, and added a required `readonly category: TodoCategory` field on `TodoItem`.
- `src/state.ts`: `addTodo()` now sets `category: 'Uncategorized'` as a temporary default so the type stays satisfied (proper parameter wiring is task 3).
- `src/storage.ts`: v1→v2 migration now also stamps `category: 'Uncategorized'` so legacy data still type-checks (full v3 schema/validation is task 2).

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- Making `category` required immediately surfaced every `TodoItem` construction site. Patching them with the `'Uncategorized'` default kept the build green without pre-empting tasks 2 and 3 in any meaningful way — those tasks will replace these stop-gap defaults with real validation/migration and a parameterized `addTodo`.
- `storage.ts`'s `isTodoItem` does **not** yet check `category`. That means existing v2 payloads in users' browsers will still pass validation but be missing the field at runtime. This is intentionally deferred to task 2 (schema v3 + migration), but call it out so it isn't forgotten.

**Follow-up (for later tasks, not now)**
- Task 2 must: bump `CURRENT_VERSION` to 3, update `TODOS_STORAGE_KEY` if desired, tighten `isTodoItem` to validate `category`, and add a v2→v3 migration that defaults missing categories to `'Uncategorized'`.
- Task 3 will replace the hard-coded default in `addTodo` with a parameter.

## 2026-05-04 — Task 2: Schema v3 with category validation and v2→v3 migration

**Implemented**
- `src/storage.ts`: bumped `CURRENT_VERSION` to 3; `isTodoItem` now validates `category` against the `TODO_CATEGORIES` allowlist via a new `isTodoCategory` guard; added `LegacyTodoV2` shape and `isLegacyTodoV2` guard; added a v2→v3 migration step that preserves `completed` and defaults missing/invalid `category` to `'Uncategorized'`; v1 path now migrates straight through to v3 shape.

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- `TODOS_STORAGE_KEY` was intentionally left as `'todos.v1'` — it's just a key name, not a schema version, and changing it would orphan all existing users' data and bypass the migration path we just added. The PRD said "if desired"; not desired.
- The v3 `isTodoItem` guard now rejects v2 payloads at the per-item filter step, so without the explicit v2 branch in `migrate()` all existing users would silently lose their todos on first load after this change. The dedicated v2→v3 branch prevents that.

**Follow-up (for later tasks, not now)**
- Task 3 will replace the `'Uncategorized'` default in `addTodo()` with a real parameter.

## 2026-05-04 — Task 3: Parameterize addTodo and add filterByCategory

**Implemented**
- `src/state.ts`: `addTodo()` now accepts an optional `category: TodoCategory` parameter (defaults to `'Uncategorized'` to keep existing call sites working until task 4 wires the UI). Added pure `filterByCategory(state, category)` accepting a `TodoCategory | 'all'` discriminator that returns the input unchanged for `'all'`.

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- Used a default parameter value rather than a required arg so `main.ts` (still on the old signature until task 4) keeps compiling — avoids touching unrelated code in this iteration per the Ralph rules.
- Modeled the filter argument as `TodoCategory | 'all'` rather than reusing the existing `Filter` union, since category filtering is orthogonal to active/completed filtering. This lets task 7 compose the two filters cleanly.

**Follow-up (for later tasks, not now)**
- Task 4 will pass the selected category from the add form into `addTodo()`, at which point the default arg becomes a safety net rather than the actual code path.

## 2026-05-04 — Task 4: Category select in add form

**Implemented**
- `index.html`: added a `<select id="todo-category">` between the text input and add button, with `<option>`s for `Uncategorized` (default selected), `Work`, `Home`, `Hobbies`. Includes a visually-hidden `<label>` plus `aria-label` for accessibility.
- `src/main.ts`: imported `TodoCategory` and `TODO_CATEGORIES`; `handleAdd()` now reads the select value, validates it against `TODO_CATEGORIES` (falling back to `'Uncategorized'`), passes it to `addTodo()`, and resets the select back to `'Uncategorized'` after a successful add.

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- Defaulting the select back to `Uncategorized` after submit matches the behavior of clearing the text input — keeps the form in a neutral starting state for the next entry. Could be revisited if user testing prefers "sticky" categories.
- Validating `select.value` against `TODO_CATEGORIES` even though we control the options is cheap insurance against a tampered DOM and lets TypeScript narrow to `TodoCategory` cleanly without a bare cast.
- Did **not** touch CSS in this iteration — the select picks up default browser styling for now. Task 8 covers the visual treatment for category UI, so styling the select alongside the badges and filter bar there will keep the design pass cohesive.

**Follow-up (for later tasks, not now)**
- Task 5 will render the category as a badge on each rendered todo item.
- Task 8 should style the `.category-select` to match the rest of the form.

## 2026-05-04 — Task 5: Render category badge on each todo item

**Implemented**
- `src/main.ts`: in `renderTodoItem()`, added a `<span class="category-badge category-{lowercase}">` element containing the category name. Inserted it as a sibling between the `.todo-text` and `.todo-delete` elements so layout/ordering is explicit and CSS can target it independently. Added an `aria-label` (`Category: …`) so the badge is meaningful to assistive tech without doubling up the visible text.

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- Initially placed the badge as a child of `.todo-text`, then moved it to a sibling. Sibling placement keeps the description's text node clean (useful for any future copy-text features) and avoids inheriting strikethrough styles from the completed-item state on the badge.
- Added a per-category modifier class (e.g. `category-work`) by lowercasing the category name. This sets up task 8's color-coded styling without requiring another markup change. Lowercase-via-`toLowerCase()` is safe here because `TodoCategory` is a closed union of ASCII strings.

**Follow-up (for later tasks, not now)**
- Task 8 will add the actual badge colors / pill styling and decide whether the `.is-completed` state should dim the badge.

## 2026-05-04 — Task 6: Category filter bar with active-state tracking

**Implemented**
- `index.html`: added a `.category-filter` tablist between the active/completed `.filter-tabs` and the `#todo-list`, with `<button>` tabs for `All`, `Work`, `Home`, `Hobbies`, and `Uncategorized`. Each tab carries a `data-category` attribute (`"all"` for the All tab, the exact `TodoCategory` string for the others) and starts with `aria-selected="true"` only on All.
- `src/main.ts`: introduced a module-level `categoryFilter: TodoCategory | 'all'` (defaulting to `'all'`). `render()` now also iterates `.category-filter-tab` and toggles each tab's `aria-selected` to match `categoryFilter`. The DOMContentLoaded handler attaches a click listener to each category tab that validates the `data-category` value (`'all'` or a member of `TODO_CATEGORIES`) before updating `categoryFilter` and re-rendering.

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- Deliberately did **not** thread `categoryFilter` through `filterTodos`/`render()`'s visible list yet — task 7 explicitly owns wiring `filterByCategory()` into the rendered list. This keeps the iteration scoped: clicking a category tab updates the active-state highlight but does not yet change which todos render. Task 7 is a one-liner now that the state and click handlers exist.
- Reused the same `role="tablist"` pattern as the existing status filter for consistency. Two adjacent tablists is fine semantically and lets each one have an independent `aria-selected` state.
- Validating `data-category` against `TODO_CATEGORIES` mirrors the defensive parsing in `handleAdd()`. It also gives TypeScript a clean narrowing path without a bare cast.

**Follow-up (for later tasks, not now)**
- Task 7: in `render()`, pipe `filterTodos(state, filter)` through `filterByCategory(_, categoryFilter)` (or compose the other way; both are pure) so the visible list respects both filters. Also revisit the empty-state copy — "All caught up." won't be quite right when the empty list is the result of a category filter with no matches.
- Task 8: style `.category-filter` and `.category-filter-tab` (likely mirroring `.filter-tabs` but with the per-category accent colors used by the badges).

## 2026-05-04 — Task 7: Apply filterByCategory in render()

**Implemented**
- `src/main.ts`: imported `filterByCategory` from `./state.ts`. `render()` now composes the two filters as `filterByCategory(filterTodos(state, filter), categoryFilter)` so the visible list honors both the status tab and the category tab.
- Updated `renderEmptyState()` to detect the "category filter has no matches" case and show a contextual caption (`No reminders in <Category>.`) instead of the misleading "All caught up."/"No completed reminders yet." messages.

**Verification**
- `npm run build` (tsc + vite build) succeeds.

**Notes / lessons**
- Composed status-then-category (cheaper to drop completed first when status is `active`/`completed`, then narrow by category). Order doesn't change the result since both filters are pure pass-throughs over the same array.
- The empty-state branch recomputes the filtered view for its conditional. Cheap on todo-list scales; if it ever mattered we'd hoist `visible` and pass it in, but threading it through `renderEmptyState()` for one branch felt like over-engineering for this iteration.

**Follow-up (for later tasks, not now)**
- Task 8: style category badges (color-coded) and the `.category-filter` bar.

## 2026-05-04 22:30 — Task 8: CSS for category badges and filter bar

**Implemented:** Appended a "Category badges and category filter bar" section to `src/styles/main.css`. Added:
- Light + dark color tokens for Work (blue), Home (green), Hobbies (pink), and Uncategorized (neutral gray).
- `.category-badge` base style and per-category modifier classes matching the `category-{lowercase}` classnames already emitted by `main.ts`.
- `.category-filter` flex container and `.category-filter-tab` pill buttons that mirror the existing `.filter-tab` segmented control, with category-tinted active states.

**Notes / decisions:**
- Reused existing design tokens (`--radius-pill`, `--surface-inset`, `--surface-strong`, motion vars) for visual consistency with the existing filter tabs.
- Defined category color tokens at `:root` with a `prefers-color-scheme: dark` override so badges remain legible in both themes without touching component code.
- Active category-filter tabs adopt the badge color of their category; "All" falls back to the generic active style with an accent border so it's visually distinct.
- HTML and `main.ts` already emitted the expected class names (`category-badge category-{cat}`, `category-filter`, `category-filter-tab[data-category]`), so no markup changes were required.

**Verification:** `npm run build` succeeded (tsc + vite build, 14.95 kB CSS bundle).

**Follow-up (not done):** Consider adding a small colored dot inside the category `<select>` options or next to the chosen value in the add form for parity with the badges. No PRD item covers this.

## 2026-05-04 22:29 — All PRD items complete

All items in `PRD.md` are checked off. Creating `STOP` file to halt the Ralph loop.

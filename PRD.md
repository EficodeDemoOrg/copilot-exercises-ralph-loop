# PRD — ToDo Category Feature

Users can categorize ToDo items into one of four categories: **Work**, **Home**, **Hobbies**, or **Uncategorized**. Users can also filter the ToDo list based on the selected category.

## Stories / Tasks

- [ ] 1. Add `TodoCategory` type to `types.ts` and extend `TodoItem` with a `category` field
- [ ] 2. Update `storage.ts` to schema v3: add `category` field validation and migrate v2 items (default to `'Uncategorized'`)
- [ ] 3. Update `state.ts`: extend `addTodo()` to accept a category parameter and add a `filterByCategory()` pure function
- [ ] 4. Add a category `<select>` to the add form in `index.html` and wire it in `main.ts` so new todos carry the chosen category
- [ ] 5. Render a category badge next to each todo item's text in `main.ts`
- [ ] 6. Add a category filter bar to `index.html` and implement click handlers and active-state tracking in `main.ts`
- [ ] 7. Apply `filterByCategory()` in `main.ts` so the rendered list respects the active category filter
- [ ] 8. Add CSS in `main.css` for color-coded category badges and the category filter bar

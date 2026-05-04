import './styles/main.css';

import type { AppState, Filter, TodoCategory, TodoItem } from './types.ts';
import { TODO_CATEGORIES } from './types.ts';
import {
  addTodo,
  clearCompleted,
  countActive,
  countCompleted,
  deleteTodo,
  filterByCategory,
  filterTodos,
  toggleCompleted,
} from './state.ts';
import { loadTodos, saveTodos } from './storage.ts';
import { showToast } from './ui/toast.ts';
import { confirmDialog } from './ui/confirm.ts';

let state: AppState = loadTodos();
let filter: Filter = 'all';
let categoryFilter: TodoCategory | 'all' = 'all';

function persist(next: AppState): boolean {
  try {
    saveTodos(next);
    state = next;
    return true;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to save your changes.';
    showToast(message, { variant: 'error' });
    return false;
  }
}

/* ------------------------------------------------------------------ icons */

function svgIcon(pathD: string, viewBox = '0 0 24 24'): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

const ICON_CHECK = 'M5 12.5l4.5 4.5L19 7.5';
const ICON_TRASH =
  'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6';
const ICON_EMPTY_ALL =
  'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11';
const ICON_EMPTY_DONE =
  'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3';

/* --------------------------------------------------------------- rendering */

function renderTodoItem(item: TodoItem): HTMLLIElement {
  const li = document.createElement('li');
  li.className = `todo-item${item.completed ? ' is-completed' : ''}`;

  // Checkbox
  const label = document.createElement('label');
  label.className = 'todo-check';
  label.setAttribute('aria-label', item.completed ? 'Mark as not completed' : 'Mark as completed');

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = item.completed;
  input.addEventListener('change', () => {
    if (persist(toggleCompleted(state, item.id))) render();
  });

  const ring = document.createElement('span');
  ring.className = 'check-ring';
  ring.setAttribute('aria-hidden', 'true');
  const mark = svgIcon(ICON_CHECK);
  mark.classList.add('check-mark');
  ring.appendChild(mark);

  label.appendChild(input);
  label.appendChild(ring);

  // Text
  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = item.description;

  // Category badge
  const badge = document.createElement('span');
  badge.className = `category-badge category-${item.category.toLowerCase()}`;
  badge.textContent = item.category;
  badge.setAttribute('aria-label', `Category: ${item.category}`);

  // Delete
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'todo-delete';
  deleteBtn.setAttribute('aria-label', `Delete: ${item.description}`);
  deleteBtn.appendChild(svgIcon(ICON_TRASH));
  deleteBtn.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Delete this reminder?',
      message: `“${item.description}” will be removed permanently.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,
    });
    if (!ok) return;
    if (persist(deleteTodo(state, item.id))) render();
  });

  li.appendChild(label);
  li.appendChild(text);
  li.appendChild(badge);
  li.appendChild(deleteBtn);
  return li;
}

function renderEmptyState(): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'empty-state';

  let pathD: string;
  let caption: string;
  if (state.length === 0) {
    pathD = ICON_EMPTY_ALL;
    caption = 'Nothing to do — add your first reminder above.';
  } else if (categoryFilter !== 'all' && filterByCategory(filterTodos(state, filter), categoryFilter).length === 0) {
    pathD = ICON_EMPTY_ALL;
    caption = `No reminders in ${categoryFilter}.`;
  } else if (filter === 'active') {
    pathD = ICON_EMPTY_DONE;
    caption = 'All caught up.';
  } else {
    pathD = ICON_EMPTY_ALL;
    caption = 'No completed reminders yet.';
  }

  li.appendChild(svgIcon(pathD));
  const p = document.createElement('p');
  p.textContent = caption;
  li.appendChild(p);
  return li;
}

function render(): void {
  const list = document.getElementById('todo-list') as HTMLUListElement;
  list.innerHTML = '';

  const visible = filterByCategory(filterTodos(state, filter), categoryFilter);
  if (visible.length === 0) {
    list.appendChild(renderEmptyState());
  } else {
    for (const item of visible) {
      list.appendChild(renderTodoItem(item));
    }
  }

  // Filter tabs selected state
  for (const tab of document.querySelectorAll<HTMLButtonElement>('.filter-tab')) {
    const value = tab.dataset['filter'] as Filter | undefined;
    tab.setAttribute('aria-selected', String(value === filter));
  }

  // Category filter selected state
  for (const tab of document.querySelectorAll<HTMLButtonElement>('.category-filter-tab')) {
    const value = tab.dataset['category'];
    tab.setAttribute('aria-selected', String(value === categoryFilter));
  }

  // Footer
  const itemsLeft = document.getElementById('items-left') as HTMLSpanElement;
  const active = countActive(state);
  itemsLeft.textContent = `${active} ${active === 1 ? 'item' : 'items'} left`;

  const clearBtn = document.getElementById('clear-completed') as HTMLButtonElement;
  const completed = countCompleted(state);
  clearBtn.disabled = completed === 0;
}

/* --------------------------------------------------------------- handlers */

function handleAdd(e: SubmitEvent): void {
  e.preventDefault();
  const input = document.getElementById('todo-input') as HTMLInputElement;
  const select = document.getElementById('todo-category') as HTMLSelectElement;
  const rawCategory = select.value;
  const category: TodoCategory = (TODO_CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as TodoCategory)
    : 'Uncategorized';
  const next = addTodo(state, input.value, category);
  if (next === state) return;
  if (!persist(next)) return;
  input.value = '';
  select.value = 'Uncategorized';
  render();
}

async function handleClearCompleted(): Promise<void> {
  if (countCompleted(state) === 0) return;
  const ok = await confirmDialog({
    title: 'Clear completed reminders?',
    message: 'This will remove all completed items. You can\u2019t undo this.',
    confirmLabel: 'Clear',
    cancelLabel: 'Cancel',
    destructive: true,
  });
  if (!ok) return;
  if (persist(clearCompleted(state))) {
    render();
    showToast('Completed reminders cleared');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-form') as HTMLFormElement;
  form.addEventListener('submit', handleAdd);

  for (const tab of document.querySelectorAll<HTMLButtonElement>('.filter-tab')) {
    tab.addEventListener('click', () => {
      const value = tab.dataset['filter'] as Filter | undefined;
      if (!value) return;
      filter = value;
      render();
    });
  }

  for (const tab of document.querySelectorAll<HTMLButtonElement>('.category-filter-tab')) {
    tab.addEventListener('click', () => {
      const raw = tab.dataset['category'];
      if (!raw) return;
      if (raw === 'all') {
        categoryFilter = 'all';
      } else if ((TODO_CATEGORIES as readonly string[]).includes(raw)) {
        categoryFilter = raw as TodoCategory;
      } else {
        return;
      }
      render();
    });
  }

  const clearBtn = document.getElementById('clear-completed') as HTMLButtonElement;
  clearBtn.addEventListener('click', () => {
    void handleClearCompleted();
  });

  render();
});

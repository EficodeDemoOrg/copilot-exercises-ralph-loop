import type { AppState, TodoItem } from './types.ts';

export const TODOS_STORAGE_KEY = 'todos.v1';
const CURRENT_VERSION = 1;

interface StoredPayload {
  version: number;
  todos: unknown[];
}

function isTodoItem(value: unknown): value is TodoItem {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['id'] === 'string' && typeof obj['description'] === 'string';
}

function isStoredPayload(value: unknown): value is StoredPayload {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['version'] === 'number' && Array.isArray(obj['todos']);
}

export function loadTodos(): AppState {
  try {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredPayload(parsed)) {
      console.warn('Unrecognized todos storage format; resetting to empty list.');
      return [];
    }
    return parsed.todos.filter(isTodoItem);
  } catch (err) {
    console.warn('Failed to load todos from storage:', err);
    return [];
  }
}

export function saveTodos(state: AppState): void {
  try {
    const payload: StoredPayload = { version: CURRENT_VERSION, todos: [...state] };
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save todos to storage:', err);
    const message = err instanceof DOMException && err.name === 'QuotaExceededError'
      ? 'Storage quota exceeded — your changes could not be saved.'
      : 'An error occurred while saving your todos.';
    alert(message);
  }
}

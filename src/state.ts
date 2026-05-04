import type { AppState, TodoItem } from './types.ts';

export function addTodo(state: AppState, description: string): AppState {
  const trimmed = description.trim();
  if (trimmed === '') return state;
  const item: TodoItem = { id: crypto.randomUUID(), description: trimmed };
  return [...state, item];
}

export function deleteTodo(state: AppState, id: string): AppState {
  return state.filter((item) => item.id !== id);
}

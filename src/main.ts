import type { AppState } from './types.ts';
import { addTodo, deleteTodo } from './state.ts';
import { loadTodos, saveTodos } from './storage.ts';

let state: AppState = loadTodos();

function render(): void {
  const list = document.getElementById('todo-list') as HTMLUListElement;
  list.innerHTML = '';

  for (const item of state) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const span = document.createElement('span');
    span.textContent = item.description;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete: ${item.description}`);
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete "${item.description}"?`)) {
        state = deleteTodo(state, item.id);
        saveTodos(state);
        render();
      }
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  }
}

function handleAdd(): void {
  const input = document.getElementById('todo-input') as HTMLInputElement;
  const description = input.value;
  const next = addTodo(state, description);
  if (next === state) return; // empty input, nothing added
  state = next;
  saveTodos(state);
  input.value = '';
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  render();

  const addBtn = document.getElementById('add-btn') as HTMLButtonElement;
  const input = document.getElementById('todo-input') as HTMLInputElement;

  addBtn.addEventListener('click', handleAdd);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdd();
  });
});

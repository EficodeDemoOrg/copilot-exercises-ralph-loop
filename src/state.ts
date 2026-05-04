import type { AppState, Filter, TodoItem } from './types.ts';

export function addTodo(state: AppState, description: string): AppState {
    const trimmed = description.trim();
    if (trimmed === '') return state;
    const item: TodoItem = {
        id: crypto.randomUUID(),
        description: trimmed,
        completed: false,
    };
    return [...state, item];
}

export function deleteTodo(state: AppState, id: string): AppState {
    return state.filter((item) => item.id !== id);
}

export function toggleCompleted(state: AppState, id: string): AppState {
    return state.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
    );
}

export function clearCompleted(state: AppState): AppState {
    return state.filter((item) => !item.completed);
}

export function countActive(state: AppState): number {
    return state.reduce((n, item) => (item.completed ? n : n + 1), 0);
}

export function countCompleted(state: AppState): number {
    return state.length - countActive(state);
}

export function filterTodos(state: AppState, filter: Filter): AppState {
    switch (filter) {
        case 'active':
            return state.filter((item) => !item.completed);
        case 'completed':
            return state.filter((item) => item.completed);
        case 'all':
        default:
            return state;
    }
}

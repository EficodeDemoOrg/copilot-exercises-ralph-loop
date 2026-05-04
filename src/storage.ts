import type { AppState, TodoCategory, TodoItem } from './types.ts';
import { TODO_CATEGORIES } from './types.ts';

export const TODOS_STORAGE_KEY = 'todos.v1';
const CURRENT_VERSION = 3;

interface StoredPayload {
    version: number;
    todos: unknown[];
}

interface LegacyTodoV1 {
    id: string;
    description: string;
}

interface LegacyTodoV2 {
    id: string;
    description: string;
    completed: boolean;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isLegacyTodoV1(value: unknown): value is LegacyTodoV1 {
    if (!isObject(value)) return false;
    return typeof value['id'] === 'string' && typeof value['description'] === 'string';
}

function isLegacyTodoV2(value: unknown): value is LegacyTodoV2 {
    if (!isObject(value)) return false;
    return (
        typeof value['id'] === 'string' &&
        typeof value['description'] === 'string' &&
        typeof value['completed'] === 'boolean'
    );
}

function isTodoCategory(value: unknown): value is TodoCategory {
    return typeof value === 'string' && (TODO_CATEGORIES as readonly string[]).includes(value);
}

function isTodoItem(value: unknown): value is TodoItem {
    if (!isObject(value)) return false;
    return (
        typeof value['id'] === 'string' &&
        typeof value['description'] === 'string' &&
        typeof value['completed'] === 'boolean' &&
        isTodoCategory(value['category'])
    );
}

function isStoredPayload(value: unknown): value is StoredPayload {
    if (!isObject(value)) return false;
    return typeof value['version'] === 'number' && Array.isArray(value['todos']);
}

function migrate(payload: StoredPayload): TodoItem[] {
    if (payload.version === CURRENT_VERSION) {
        return payload.todos.filter(isTodoItem);
    }
    if (payload.version === 2) {
        // v2 → v3: default `category` to 'Uncategorized'.
        return payload.todos.filter(isLegacyTodoV2).map((t) => ({
            id: t.id,
            description: t.description,
            completed: t.completed,
            category: 'Uncategorized',
        }));
    }
    if (payload.version === 1) {
        // v1 → v3: default `completed` to false and `category` to 'Uncategorized'.
        return payload.todos.filter(isLegacyTodoV1).map((t) => ({
            id: t.id,
            description: t.description,
            completed: false,
            category: 'Uncategorized',
        }));
    }
    console.warn(`Unknown todos storage version: ${payload.version}; ignoring.`);
    return [];
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
        return migrate(parsed);
    } catch (err) {
        console.warn('Failed to load todos from storage:', err);
        return [];
    }
}

export class StorageQuotaError extends Error {
    constructor() {
        super('Storage quota exceeded \u2014 your changes could not be saved.');
        this.name = 'StorageQuotaError';
    }
}

export class StorageWriteError extends Error {
    constructor() {
        super('An error occurred while saving your todos.');
        this.name = 'StorageWriteError';
    }
}

export function saveTodos(state: AppState): void {
    try {
        const payload: StoredPayload = { version: CURRENT_VERSION, todos: [...state] };
        localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
        console.error('Failed to save todos to storage:', err);
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
            throw new StorageQuotaError();
        }
        throw new StorageWriteError();
    }
}

export type TodoCategory = 'Work' | 'Home' | 'Hobbies' | 'Uncategorized';

export const TODO_CATEGORIES: readonly TodoCategory[] = [
    'Work',
    'Home',
    'Hobbies',
    'Uncategorized',
];

export interface TodoItem {
    readonly id: string;
    readonly description: string;
    readonly completed: boolean;
    readonly category: TodoCategory;
}

export type AppState = readonly TodoItem[];

export type Filter = 'all' | 'active' | 'completed';

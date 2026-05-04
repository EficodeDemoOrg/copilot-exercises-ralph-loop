export interface TodoItem {
    readonly id: string;
    readonly description: string;
    readonly completed: boolean;
}

export type AppState = readonly TodoItem[];

export type Filter = 'all' | 'active' | 'completed';

export interface TodoItem {
  readonly id: string;
  readonly description: string;
}

export type AppState = readonly TodoItem[];

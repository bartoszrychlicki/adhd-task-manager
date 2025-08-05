import { Task } from '../types/index.js';
export declare const createTask: (task: Omit<Task, "id" | "user_id" | "created_at" | "status">) => Promise<any>;
export declare const getTasks: () => Promise<any[]>;
export declare const updateTask: (id: string, updates: Partial<Task>) => Promise<any>;
export declare const deleteTask: (id: string) => Promise<void>;
//# sourceMappingURL=tasks.d.ts.map
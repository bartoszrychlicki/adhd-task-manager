import { Goal } from '../types/index.js';
export declare const createGoal: (goal: Omit<Goal, "id" | "user_id" | "created_at">) => Promise<any>;
export declare const getGoals: () => Promise<any[]>;
export declare const updateGoal: (id: string, updates: Partial<Goal>) => Promise<any>;
export declare const deleteGoal: (id: string) => Promise<void>;
//# sourceMappingURL=goals.d.ts.map
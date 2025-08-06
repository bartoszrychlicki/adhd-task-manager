export type EnergyLevel = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type TimeNeeded = '1min' | '15min' | '25min' | 'more';
export type Priority = 'A' | 'B' | 'C' | 'D';
export type TaskStatus = 'todo' | 'done' | 'completed';
export type GoalType = 'long_term' | 'short_term';
export type GoalTimeframe = 'quarter' | 'half_year' | 'year' | 'month' | 'week';

export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  energy_level?: EnergyLevel;
  time_needed?: TimeNeeded;
  priority?: Priority;
  status: TaskStatus;
  execution_time?: number; // w minutach
  created_at?: string;
  completed_at?: string;
}

export interface Goal {
  id?: string;
  user_id?: string;
  title: string;
  type: GoalType;
  timeframe?: GoalTimeframe;
  description?: string;
  created_at?: string;
}

export interface FocusSession {
  id?: string;
  user_id?: string;
  available_time: number; // w minutach
  energy_level: EnergyLevel;
  location: string;
  priority_context?: string;
  created_at?: string;
}

export interface MenuOption {
  label: string;
  value: string;
  key?: string;
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at'>;
        Update: Partial<Omit<Goal, 'id' | 'created_at'>>;
      };
      focus_sessions: {
        Row: FocusSession;
        Insert: Omit<FocusSession, 'id' | 'created_at'>;
        Update: Partial<Omit<FocusSession, 'id' | 'created_at'>>;
      };
    };
  };
}
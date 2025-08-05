import { Database } from '../types/index.js';
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<Database, "public", any>;
export declare const getCurrentUser: () => Promise<import("@supabase/supabase-js").AuthUser | null>;
export declare const signInAnonymously: () => Promise<{
    user: import("@supabase/supabase-js").AuthUser | null;
    session: import("@supabase/supabase-js").AuthSession | null;
}>;
//# sourceMappingURL=supabase.d.ts.map
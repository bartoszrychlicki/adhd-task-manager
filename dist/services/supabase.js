import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://bcrjgsoxnkzfqxhafwcv.supabase.co';
const supabaseKey = 'sb_publishable_2oPC_aEisQtKqcVXBcGPLg_NJ-LooKl';
export const supabase = createClient(supabaseUrl, supabaseKey);
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};
export const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error)
        throw error;
    return data;
};
//# sourceMappingURL=supabase.js.map
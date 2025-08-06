import { supabase } from './supabase.js';
import { getUserId } from './config.js';
import { enhanceTask } from './ai.js';
export const createTask = async (task) => {
    console.log('[TOOL] createTask - rozpoczęcie');
    try {
        const userId = await getUserId();
        console.log('[USER] Pobrano User ID:', userId);
        // Determine which fields are empty and need AI enhancement
        const needsEnhancement = !task.priority ||
            !task.energy_level ||
            !task.time_needed ||
            !task.execution_time;
        let enhancedTask = { ...task };
        if (needsEnhancement) {
            console.log('[AI] Wysyłanie do AI w celu uzupełnienia...');
            try {
                const aiEnhancement = await enhanceTask({
                    title: task.title,
                    priority: task.priority,
                    energy_level: task.energy_level,
                    time_needed: task.time_needed,
                    execution_time: task.execution_time
                });
                // Merge AI suggestions only for empty fields
                if (!task.priority && aiEnhancement.priority) {
                    enhancedTask.priority = aiEnhancement.priority;
                }
                if (!task.energy_level && aiEnhancement.energy_level) {
                    enhancedTask.energy_level = aiEnhancement.energy_level;
                }
                if (!task.time_needed && aiEnhancement.time_needed) {
                    enhancedTask.time_needed = aiEnhancement.time_needed;
                }
                if (!task.execution_time && aiEnhancement.execution_time) {
                    enhancedTask.execution_time = aiEnhancement.execution_time;
                }
                console.log('[AI] AI uzupełniło zadanie:', {
                    original: task,
                    enhanced: enhancedTask,
                    reasoning: aiEnhancement.reasoning
                });
            }
            catch (aiError) {
                console.warn('[WARN] Błąd AI, kontynuuję bez uzupełnienia:', aiError);
                // Continue with original task if AI fails
            }
        }
        const taskData = {
            ...enhancedTask,
            user_id: userId,
            status: 'todo'
        };
        console.log('[DATA] Dane do zapisania:', taskData);
        const { data, error } = await supabase
            .from('tasks')
            .insert(taskData)
            .select()
            .single();
        console.log('[DB] Odpowiedź Supabase:', { data, error });
        if (error) {
            console.error('[ERROR] Błąd Supabase w createTask:', error);
            throw error;
        }
        console.log('[OK] Zadanie zapisane pomyślnie:', data);
        return data;
    }
    catch (err) {
        console.error('[ERROR] Nieoczekiwany błąd w createTask:', err);
        throw err;
    }
};
export const getTasks = async () => {
    console.log('[TOOL] getTasks - rozpoczęcie');
    try {
        const userId = await getUserId();
        console.log('[USER] Pobrano User ID:', userId);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        console.log('[DB] Odpowiedź Supabase (getTasks):', {
            dataCount: data?.length || 0,
            error
        });
        if (error) {
            console.error('[ERROR] Błąd Supabase w getTasks:', error);
            throw error;
        }
        console.log('[OK] Zadania pobrane, ilość:', data?.length || 0);
        return data || [];
    }
    catch (err) {
        console.error('[ERROR] Nieoczekiwany błąd w getTasks:', err);
        throw err;
    }
};
export const updateTask = async (id, updates) => {
    console.log('[TOOL] updateTask - rozpoczęcie, ID:', id);
    console.log('[DATA] Aktualizacje:', updates);
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        console.log('[DB] Odpowiedź Supabase (update):', { data, error });
        if (error) {
            console.error('[ERROR] Błąd Supabase w updateTask:', error);
            throw error;
        }
        console.log('[OK] Zadanie zaktualizowane:', data);
        return data;
    }
    catch (err) {
        console.error('[ERROR] Nieoczekiwany błąd w updateTask:', err);
        throw err;
    }
};
export const deleteTask = async (id) => {
    console.log('[TOOL] deleteTask - rozpoczęcie, ID:', id);
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        console.log('[DB] Odpowiedź Supabase (delete):', { error });
        if (error) {
            console.error('[ERROR] Błąd Supabase w deleteTask:', error);
            throw error;
        }
        console.log('[OK] Zadanie usunięte');
    }
    catch (err) {
        console.error('[ERROR] Nieoczekiwany błąd w deleteTask:', err);
        throw err;
    }
};
//# sourceMappingURL=tasks.js.map
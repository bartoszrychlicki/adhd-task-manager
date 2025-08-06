import { supabase } from './supabase.js';
import { getUserId } from './config.js';
import { Goal } from '../types/index.js';

export const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => {
  console.log('[TOOL] createGoal - rozpoczęcie');
  
  try {
    const userId = await getUserId();
    console.log('[USER] Pobrano User ID:', userId);

    const goalData = {
      ...goal,
      user_id: userId
    };
    
    console.log('[DATA] Dane celu do zapisania:', goalData);

    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single();

    console.log('[DB] Odpowiedź Supabase (createGoal):', { data, error });

    if (error) {
      console.error('[ERROR] Błąd Supabase w createGoal:', error);
      throw error;
    }
    
    console.log('[OK] Cel zapisany pomyślnie:', data);
    return data;
  } catch (err) {
    console.error('[ERROR] Nieoczekiwany błąd w createGoal:', err);
    throw err;
  }
};

export const getGoals = async () => {
  console.log('[TOOL] getGoals - rozpoczęcie');
  
  try {
    const userId = await getUserId();
    console.log('[USER] Pobrano User ID:', userId);

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('[DB] Odpowiedź Supabase (getGoals):', { 
      dataCount: data?.length || 0, 
      error 
    });

    if (error) {
      console.error('[ERROR] Błąd Supabase w getGoals:', error);
      throw error;
    }
    
    console.log('[OK] Cele pobrane, ilość:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('[ERROR] Nieoczekiwany błąd w getGoals:', err);
    throw err;
  }
};

export const updateGoal = async (id: string, updates: Partial<Goal>) => {
  console.log('[TOOL] updateGoal - rozpoczęcie, ID:', id);
  console.log('[DATA] Aktualizacje:', updates);
  
  try {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    console.log('[DB] Odpowiedź Supabase (updateGoal):', { data, error });

    if (error) {
      console.error('[ERROR] Błąd Supabase w updateGoal:', error);
      throw error;
    }
    
    console.log('[OK] Cel zaktualizowany:', data);
    return data;
  } catch (err) {
    console.error('[ERROR] Nieoczekiwany błąd w updateGoal:', err);
    throw err;
  }
};

export const deleteGoal = async (id: string) => {
  console.log('[TOOL] deleteGoal - rozpoczęcie, ID:', id);
  
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    console.log('[DB] Odpowiedź Supabase (deleteGoal):', { error });

    if (error) {
      console.error('[ERROR] Błąd Supabase w deleteGoal:', error);
      throw error;
    }
    
    console.log('[OK] Cel usunięty');
  } catch (err) {
    console.error('[ERROR] Nieoczekiwany błąd w deleteGoal:', err);
    throw err;
  }
};
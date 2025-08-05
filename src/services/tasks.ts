import { supabase } from './supabase.js';
import { getUserId } from './config.js';
import { Task } from '../types/index.js';

export const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status'>) => {
  console.log('🔧 createTask - rozpoczęcie');
  
  try {
    const userId = await getUserId();
    console.log('👤 Pobrano User ID:', userId);

    const taskData = {
      ...task,
      user_id: userId,
      status: 'todo' as const
    };
    
    console.log('📝 Dane do zapisania:', taskData);

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    console.log('📊 Odpowiedź Supabase:', { data, error });

    if (error) {
      console.error('🚨 Błąd Supabase w createTask:', error);
      throw error;
    }
    
    console.log('✅ Zadanie zapisane pomyślnie:', data);
    return data;
  } catch (err) {
    console.error('💥 Nieoczekiwany błąd w createTask:', err);
    throw err;
  }
};

export const getTasks = async () => {
  console.log('🔧 getTasks - rozpoczęcie');
  
  try {
    const userId = await getUserId();
    console.log('👤 Pobrano User ID:', userId);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('📊 Odpowiedź Supabase (getTasks):', { 
      dataCount: data?.length || 0, 
      error 
    });

    if (error) {
      console.error('🚨 Błąd Supabase w getTasks:', error);
      throw error;
    }
    
    console.log('✅ Zadania pobrane, ilość:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('💥 Nieoczekiwany błąd w getTasks:', err);
    throw err;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  console.log('🔧 updateTask - rozpoczęcie, ID:', id);
  console.log('📝 Aktualizacje:', updates);
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    console.log('📊 Odpowiedź Supabase (update):', { data, error });

    if (error) {
      console.error('🚨 Błąd Supabase w updateTask:', error);
      throw error;
    }
    
    console.log('✅ Zadanie zaktualizowane:', data);
    return data;
  } catch (err) {
    console.error('💥 Nieoczekiwany błąd w updateTask:', err);
    throw err;
  }
};

export const deleteTask = async (id: string) => {
  console.log('🔧 deleteTask - rozpoczęcie, ID:', id);
  
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    console.log('📊 Odpowiedź Supabase (delete):', { error });

    if (error) {
      console.error('🚨 Błąd Supabase w deleteTask:', error);
      throw error;
    }
    
    console.log('✅ Zadanie usunięte');
  } catch (err) {
    console.error('💥 Nieoczekiwany błąd w deleteTask:', err);
    throw err;
  }
};
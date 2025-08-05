-- Disable Row Level Security for simplified user ID system
-- This allows the app to work with custom user IDs without Supabase auth

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;

DROP POLICY IF EXISTS "Users can view their own focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can insert their own focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can update their own focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can delete their own focus_sessions" ON focus_sessions;

-- Disable RLS
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions DISABLE ROW LEVEL SECURITY;

-- Note: In production, you might want to keep RLS enabled with custom policies
-- that validate user_id based on your application logic rather than auth.uid()
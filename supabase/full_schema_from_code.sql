-- Portable full schema derived from code (types) and migrations
-- Works on Supabase and plain PostgreSQL

-- Session settings
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- Extensions (required for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing objects (safe restore)
DROP INDEX IF EXISTS idx_focus_sessions_user_id;
DROP INDEX IF EXISTS idx_goals_type;
DROP INDEX IF EXISTS idx_goals_user_id;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_user_id;

DROP TABLE IF EXISTS public.focus_sessions CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Tables (without FK to auth.users so it runs on plain Postgres)
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  energy_level text CHECK (energy_level IN ('XS','S','M','L','XL')),
  time_needed text CHECK (time_needed IN ('1min','15min','25min','more')),
  priority text CHECK (priority IN ('A','B','C','D')),
  status text CHECK (status IN ('todo','done')) DEFAULT 'todo',
  execution_time integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  type text CHECK (type IN ('long_term','short_term')) NOT NULL,
  timeframe text CHECK (timeframe IN ('quarter','half_year','year','month','week')),
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  available_time integer NOT NULL,
  energy_level text CHECK (energy_level IN ('XS','S','M','L','XL')) NOT NULL,
  location text NOT NULL,
  priority_context text,
  created_at timestamptz DEFAULT now()
);

-- Optionally add FKs to Supabase auth if available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace n
    JOIN pg_class c ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users'
  ) THEN
    EXECUTE 'ALTER TABLE public.tasks
              ADD CONSTRAINT tasks_user_id_fkey
              FOREIGN KEY (user_id)
              REFERENCES auth.users(id)
              ON DELETE CASCADE';

    EXECUTE 'ALTER TABLE public.goals
              ADD CONSTRAINT goals_user_id_fkey
              FOREIGN KEY (user_id)
              REFERENCES auth.users(id)
              ON DELETE CASCADE';

    EXECUTE 'ALTER TABLE public.focus_sessions
              ADD CONSTRAINT focus_sessions_user_id_fkey
              FOREIGN KEY (user_id)
              REFERENCES auth.users(id)
              ON DELETE CASCADE';
  END IF;
END
$$;

-- Indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_type ON public.goals(type);
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);

-- RLS setup (disabled as per 002_disable_rls.sql)
-- Policies are dropped if they exist, then RLS disabled
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;

DROP POLICY IF EXISTS "Users can view their own focus_sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can insert their own focus_sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can update their own focus_sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can delete their own focus_sessions" ON public.focus_sessions;

ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions DISABLE ROW LEVEL SECURITY;

-- Done

# 🧠 ADHD Task Manager

Terminal-based task manager designed specifically for people with ADHD, featuring AI assistance and focus mode.

## Features

- ➕ **Add Tasks** - Quick task creation with AI-assisted parameter estimation
- 📋 **Task Management** - View, edit, and delete tasks with visual priorities
- 🎯 **Goal Management** - Set and track short-term and long-term goals
- 🔥 **Focus Mode** - AI-powered task selection based on your current context
- 🎨 **Beautiful CLI** - Colorful interface with ASCII art and intuitive navigation

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

**Option A: Interactive Setup (Recommended)**
```bash
npm run setup
```

**Option B: Manual Setup**
Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Application Configuration
NODE_ENV=development
```

### 3. Configure Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration SQL from `supabase/migrations/001_create_tables.sql` in your Supabase SQL editor
3. Run the second migration from `supabase/migrations/002_disable_rls.sql` to disable RLS for simplified user management
4. Copy your project URL and anon key from the Supabase dashboard to your `.env` file

### 4. Build and Run
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run built version
npm start
```

### 5. Install Globally (Optional)
```bash
npm run build
npm install -g .
```

Then you can run the app from anywhere with:
```bash
adhd
```

## Task Parameters

Tasks can have the following parameters (all optional, AI will estimate if empty):

- **Energy Level**: XS, S, M, L, XL
- **Time Needed**: 1min, 15min (pół pomodoro), 25min (pomodoro), więcej
- **Priority**: A (pilne + ważne), B (ważne), C (pilne), D (pozostałe)
- **Status**: todo, done

## Focus Mode

Focus Mode asks you about:
- Available time for work
- Current energy level
- Your location
- Any urgent priorities

Then AI selects the optimal task for your current context.

## Development

```bash
# Type checking
npm run typecheck

# Development with hot reload
npm run dev
```

## Database Schema

The app uses Supabase with the following tables:
- `tasks` - User tasks with ADHD-friendly parameters
- `goals` - Short-term and long-term goals
- `focus_sessions` - Focus mode session data

## Security

⚠️ **Important**: Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore` to prevent accidental commits.

Your `.env` file contains sensitive information:
- **SUPABASE_ANON_KEY**: Your Supabase anonymous key (public, but should be kept secure)
- **OPENAI_API_KEY**: Your OpenAI API key (private, keep secure)

## Tech Stack

- **Frontend**: React + Ink (React for terminal)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API
- **Language**: TypeScript
- **Styling**: Chalk + Boxen
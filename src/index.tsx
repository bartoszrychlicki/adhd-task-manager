#!/usr/bin/env node

import dotenv from 'dotenv';
import React, { useState } from 'react';

// Load environment variables at the very start
dotenv.config();

// Validate environment variables
import { validateEnvironment } from './services/config.js';
import { render, useApp } from 'ink';
import { MainMenu } from './components/MainMenu.js';
import { AddTask } from './components/AddTask.js';
import { ManageTasks } from './components/ManageTasks.js';
import { ManageGoals } from './components/ManageGoals.js';
import { FocusSession } from './components/FocusSession.js';
import { Settings } from './components/Settings.js';
import { colors } from './utils/theme.js';

type AppState = 'menu' | 'add-task' | 'manage-tasks' | 'manage-goals' | 'focus-mode' | 'settings';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('menu');
  const { exit } = useApp();

  const handleMenuSelect = (value: string) => {
    switch (value) {
      case 'add-task':
        setCurrentState('add-task');
        break;
      case 'manage-tasks':
        setCurrentState('manage-tasks');
        break;
      case 'manage-goals':
        setCurrentState('manage-goals');
        break;
      case 'focus-mode':
        setCurrentState('focus-mode');
        break;
      case 'settings':
        setCurrentState('settings');
        break;
      case 'exit':
        exit();
        break;
      default:
        console.log(`${colors.warning('[WARN] Funkcja')} ${colors.bold(value)} ${colors.warning('jeszcze nie została zaimplementowana!')}`);
        setCurrentState('menu');
    }
  };

  const handleBack = () => {
    setCurrentState('menu');
  };

  const handleTaskAdded = () => {
    console.log(colors.success('[OK] Zadanie zostało pomyślnie dodane!'));
    setCurrentState('menu');
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'menu':
        return <MainMenu onSelect={handleMenuSelect} />;
      case 'add-task':
        return <AddTask onBack={handleBack} onTaskAdded={handleTaskAdded} />;
      case 'manage-tasks':
        return <ManageTasks onBack={handleBack} />;
      case 'manage-goals':
        return <ManageGoals onBack={handleBack} />;
      case 'focus-mode':
        return <FocusSession onBack={handleBack} />;
      case 'settings':
        return <Settings onBack={handleBack} />;
      default:
        return <MainMenu onSelect={handleMenuSelect} />;
    }
  };

  return renderCurrentState();
};

// Check if we can use raw mode
if (process.stdin.isTTY) {
  try {
    // Validate environment variables before starting the app
    validateEnvironment();
    render(<App />);
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    console.error('📝 Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
} else {
  console.log('Aplikacja wymaga uruchomienia w terminalu z obsługą TTY');
  process.exit(1);
}
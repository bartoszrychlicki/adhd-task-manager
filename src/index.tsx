#!/usr/bin/env node

import React, { useState } from 'react';
import { render, useApp } from 'ink';
import { MainMenu } from './components/MainMenu.js';
import { AddTask } from './components/AddTask.js';
import { ManageTasks } from './components/ManageTasks.js';
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
        console.log(`${colors.warning('⚠️  Funkcja')} ${colors.bold(value)} ${colors.warning('jeszcze nie została zaimplementowana!')}`);
        setCurrentState('menu');
    }
  };

  const handleBack = () => {
    setCurrentState('menu');
  };

  const handleTaskAdded = () => {
    console.log(colors.success('✅ Zadanie zostało pomyślnie dodane!'));
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
  render(<App />);
} else {
  console.log('Aplikacja wymaga uruchomienia w terminalu z obsługą TTY');
  process.exit(1);
}
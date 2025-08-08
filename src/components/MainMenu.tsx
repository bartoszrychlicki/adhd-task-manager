import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import { MenuOption } from '../types/index.js';
import { Panel, KeyBar } from './ui.js';

interface MainMenuProps {
  onSelect: (value: string) => void;
}

const menuItems: MenuOption[] = [
  { label: '1. Dodaj nowe zadanie', value: 'add-task', key: '1' },
  { label: '2. Zarządzaj zadaniami', value: 'manage-tasks', key: '2' },
  { label: '3. Zarządzaj celami', value: 'manage-goals', key: '3' },
  { label: '4. Focus Mode', value: 'focus-mode', key: '4' },
  { label: '5. Ustawienia', value: 'settings', key: '5' },
  { label: '6. Wyjście', value: 'exit', key: '6' }
];

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect }) => {
  return (
    <Box flexDirection="column">
      <Header />
      <Box flexDirection="column" alignItems="center">
        <Panel borderColor="cyan" minWidth={55}>
          <SelectInput
            items={menuItems}
            onSelect={(item) => onSelect(item.value)}
          />
          <KeyBar items={[{ key: '↑↓', label: 'nawiguj' }, { key: 'Enter', label: 'wybierz' }, { key: '1-6', label: 'skróty' }]} />
        </Panel>
      </Box>
    </Box>
  );
};
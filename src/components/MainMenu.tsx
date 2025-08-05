import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import { colors } from '../utils/theme.js';
import { MenuOption } from '../types/index.js';

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
        <Box 
          borderStyle="round" 
          borderColor="green"
          paddingX={1}
          paddingY={1}
          minWidth={55}
        >
          <Box flexDirection="column" width="100%">
            <SelectInput
              items={menuItems}
              onSelect={(item) => onSelect(item.value)}
            />
            
            <Box marginTop={1}>
              <Text color="gray">
                Użyj ↑↓ lub cyfr do nawigacji, Enter aby wybrać
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import { colors } from '../utils/theme.js';
import { getUserId, setUserId, getConfigPath } from '../services/config.js';

interface SettingsProps {
  onBack: () => void;
}

type SettingsState = 'menu' | 'change-user-id' | 'info';

const settingsMenuItems = [
  { label: '👤 Zmień User ID', value: 'change-user-id' },
  { label: 'ℹ️  Informacje o konfiguracji', value: 'info' },
  { label: '↩️  Powrót do menu głównego', value: 'back' }
];

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [state, setState] = useState<SettingsState>('menu');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [newUserId, setNewUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUserId = async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);
        setNewUserId(userId);
      } catch (error) {
        setMessage('Błąd podczas ładowania konfiguracji');
      }
    };
    
    loadCurrentUserId();
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (state === 'menu') {
        onBack();
      } else {
        setState('menu');
        setMessage(null);
      }
    }
  });

  const handleMenuSelect = (value: string) => {
    switch (value) {
      case 'change-user-id':
        setState('change-user-id');
        setMessage(null);
        break;
      case 'info':
        setState('info');
        break;
      case 'back':
        onBack();
        break;
    }
  };

  const handleUserIdSubmit = async () => {
    if (!newUserId.trim()) {
      setMessage('User ID nie może być pusty');
      return;
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(newUserId.trim())) {
      setMessage('User ID musi być w formacie UUID (np. a49fd6df-c08e-481c-a535-fdf1f50bd509)');
      return;
    }

    setIsLoading(true);
    try {
      await setUserId(newUserId.trim());
      setCurrentUserId(newUserId.trim());
      setMessage('User ID zostało pomyślnie zaktualizowane!');
      setTimeout(() => {
        setState('menu');
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage('Błąd podczas zapisywania User ID');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentState = () => {
    switch (state) {
      case 'menu':
        return (
          <Box flexDirection="column">
            <Text color="cyan" bold>⚙️  USTAWIENIA</Text>
            
            <Box marginTop={1}>
              <Text color="gray">
                Obecny User ID: {colors.primary(currentUserId)}
              </Text>
            </Box>
            
            <Box marginTop={2}>
              <SelectInput
                items={settingsMenuItems}
                onSelect={(item) => handleMenuSelect(item.value)}
              />
            </Box>
            
            <Box marginTop={1}>
              <Text color="gray">↑↓ wybierz, Enter potwierdź, Esc powrót</Text>
            </Box>
          </Box>
        );

      case 'change-user-id':
        return (
          <Box flexDirection="column">
            <Text color="cyan" bold>👤 ZMIEŃ USER ID</Text>
            
            <Box marginTop={1}>
              <Text color="gray">
                Obecny User ID: {colors.primary(currentUserId)}
              </Text>
            </Box>
            
            <Box marginTop={2}>
              <Text color="yellow">Nowy User ID (UUID):</Text>
            </Box>
            
            <Box marginTop={1}>
              <TextInput
                value={newUserId}
                onChange={setNewUserId}
                onSubmit={handleUserIdSubmit}
                placeholder="a49fd6df-c08e-481c-a535-fdf1f50bd509"
              />
            </Box>
            
            {message && (
              <Box marginTop={1}>
                <Text color={message.includes('pomyślnie') ? 'green' : 'red'}>
                  {message.includes('pomyślnie') ? '✅' : '❌'} {message}
                </Text>
              </Box>
            )}
            
            {isLoading && (
              <Box marginTop={1}>
                <Text color="yellow">💾 Zapisywanie...</Text>
              </Box>
            )}
            
            <Box marginTop={2}>
              <Text color="gray">
                Enter zapisz, Esc powrót
              </Text>
            </Box>
          </Box>
        );

      case 'info':
        return (
          <Box flexDirection="column">
            <Text color="cyan" bold>ℹ️  INFORMACJE O KONFIGURACJI</Text>
            
            <Box marginTop={2} flexDirection="column">
              <Text>
                <Text color="white">User ID: </Text>
                <Text color="cyan">{currentUserId}</Text>
              </Text>
              
              <Box marginTop={1}>
                <Text>
                  <Text color="white">Plik konfiguracji: </Text>
                  <Text color="cyan">{getConfigPath()}</Text>
                </Text>
              </Box>
              
              <Box marginTop={2}>
                <Text color="gray">
                  User ID jest używane do identyfikacji Twoich zadań w bazie danych.
                  Możesz je zmienić, aby współdzielić konfigurację z innymi urządzeniami
                  lub przekazać dostęp innemu użytkownikowi.
                </Text>
              </Box>
            </Box>
            
            <Box marginTop={2}>
              <Text color="gray">Esc powrót</Text>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box flexDirection="column">
      <Header />
      
      <Box flexDirection="column" alignItems="center">
        <Box 
          borderStyle="round" 
          borderColor="cyan"
          paddingX={2}
          paddingY={1}
          minWidth={60}
        >
          <Box flexDirection="column" width="100%">
            {renderCurrentState()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
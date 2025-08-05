import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import { colors, energyColors, priorityColors } from '../utils/theme.js';
import { EnergyLevel, TimeNeeded, Priority, Task } from '../types/index.js';
import { createTask } from '../services/tasks.js';

interface AddTaskProps {
  onBack: () => void;
  onTaskAdded: () => void;
}

type FormStep = 'title' | 'energy' | 'time' | 'priority' | 'confirm';

const energyOptions = [
  { label: 'XS - Bardzo mała energia', value: 'XS' },
  { label: 'S - Mała energia', value: 'S' },
  { label: 'M - Średnia energia', value: 'M' },
  { label: 'L - Duża energia', value: 'L' },
  { label: 'XL - Bardzo duża energia', value: 'XL' }
];

const timeOptions = [
  { label: '1min - Bardzo szybkie', value: '1min' },
  { label: '15min - Pół pomodoro', value: '15min' },
  { label: '25min - Jedno pomodoro', value: '25min' },
  { label: 'more - Więcej niż pomodoro', value: 'more' }
];

const priorityOptions = [
  { label: 'A - Pilne i ważne', value: 'A' },
  { label: 'B - Ważne, nie pilne', value: 'B' },
  { label: 'C - Pilne, nie ważne', value: 'C' },
  { label: 'D - Ni pilne, ni ważne', value: 'D' }
];

export const AddTask: React.FC<AddTaskProps> = ({ onBack, onTaskAdded }) => {
  const [step, setStep] = useState<FormStep>('title');
  const [title, setTitle] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>();
  const [timeNeeded, setTimeNeeded] = useState<TimeNeeded>();
  const [priority, setPriority] = useState<Priority>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Nazwa zadania jest wymagana');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🔄 Próba zapisania zadania:', {
        title: title.trim(),
        energy_level: energyLevel,
        time_needed: timeNeeded,
        priority: priority
      });
      
      await createTask({
        title: title.trim(),
        energy_level: energyLevel,
        time_needed: timeNeeded,
        priority: priority
      });
      
      console.log('Zadanie zostało pomyślnie zapisane');
      onTaskAdded();
    } catch (err) {
      console.error('Błąd podczas zapisywania zadania:', err);
      
      let errorMessage = 'Wystąpił błąd podczas zapisywania zadania';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('📋 Szczegóły błędu:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
      
      // Jeśli to błąd Supabase, wyciągnij więcej informacji
      if (typeof err === 'object' && err !== null) {
        const supabaseError = err as any;
        if (supabaseError.code || supabaseError.details) {
          console.error('🔴 Błąd Supabase:', {
            code: supabaseError.code,
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint
          });
          errorMessage = `Błąd bazy danych: ${supabaseError.message || supabaseError.details || errorMessage}`;
        }
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'title':
        return (
          <Box flexDirection="column">
            <Text color="yellow">Nazwa zadania:</Text>
            <Box marginTop={1}>
              <TextInput
                value={title}
                onChange={setTitle}
                onSubmit={() => setStep('energy')}
                placeholder="Wpisz nazwę zadania..."
              />
            </Box>
            <Box marginTop={1}>
              <Text color="gray">Enter - dalej, Esc - powrót</Text>
            </Box>
          </Box>
        );

      case 'energy':
        return (
          <Box flexDirection="column">
            <Text color="yellow">Potrzebna energia (opcjonalnie):</Text>
            <Box marginTop={1}>
              <SelectInput
                items={[
                  { label: 'Pomiń - AI ustali później', value: 'skip' },
                  ...energyOptions
                ]}
                onSelect={(item) => {
                  if (item.value === 'skip') {
                    setEnergyLevel(undefined);
                  } else {
                    setEnergyLevel(item.value as EnergyLevel);
                  }
                  setStep('time');
                }}
              />
            </Box>
            <Box marginTop={1}>
              <Text color="gray">↑↓ wybierz, Enter - dalej, Esc - powrót</Text>
            </Box>
          </Box>
        );

      case 'time':
        return (
          <Box flexDirection="column">
            <Text color="yellow">Potrzebny czas (opcjonalnie):</Text>
            <Box marginTop={1}>
              <SelectInput
                items={[
                  { label: 'Pomiń - AI ustali później', value: 'skip' },
                  ...timeOptions
                ]}
                onSelect={(item) => {
                  if (item.value === 'skip') {
                    setTimeNeeded(undefined);
                  } else {
                    setTimeNeeded(item.value as TimeNeeded);
                  }
                  setStep('priority');
                }}
              />
            </Box>
            <Box marginTop={1}>
              <Text color="gray">↑↓ wybierz, Enter - dalej, Esc - powrót</Text>
            </Box>
          </Box>
        );

      case 'priority':
        return (
          <Box flexDirection="column">
            <Text color="yellow">Priorytet (opcjonalnie):</Text>
            <Box marginTop={1}>
              <SelectInput
                items={[
                  { label: 'Pomiń - AI ustali później', value: 'skip' },
                  ...priorityOptions
                ]}
                onSelect={(item) => {
                  if (item.value === 'skip') {
                    setPriority(undefined);
                  } else {
                    setPriority(item.value as Priority);
                  }
                  setStep('confirm');
                }}
              />
            </Box>
            <Box marginTop={1}>
              <Text color="gray">↑↓ wybierz, Enter - dalej, Esc - powrót</Text>
            </Box>
          </Box>
        );

      case 'confirm':
        return (
          <Box flexDirection="column">
            <Text color="yellow">Podsumowanie zadania:</Text>
            <Box marginTop={1} flexDirection="column">
              <Text>
                <Text color="white">Nazwa: </Text>
                <Text color="cyan">{title}</Text>
              </Text>
              <Text>
                <Text color="white">Energia: </Text>
                <Text color={energyLevel ? "cyan" : "gray"}>
                  {energyLevel || 'AI ustali'}
                </Text>
              </Text>
              <Text>
                <Text color="white">Czas: </Text>
                <Text color={timeNeeded ? "cyan" : "gray"}>
                  {timeNeeded || 'AI ustali'}
                </Text>
              </Text>
              <Text>
                <Text color="white">Priorytet: </Text>
                <Text color={priority ? "cyan" : "gray"}>
                  {priority || 'AI ustali'}
                </Text>
              </Text>
            </Box>
            
            <Box marginTop={2}>
              <SelectInput
                items={[
                  { label: '1. Zapisz zadanie', value: 'save' },
                  { label: '2. Powrót do edycji', value: 'back' }
                ]}
                onSelect={(item) => {
                  if (item.value === 'save') {
                    handleSubmit();
                  } else {
                    setStep('title');
                  }
                }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <Box flexDirection="column">
        <Header />
        <Box 
          borderStyle="round" 
          borderColor="cyan"
          paddingX={2}
          paddingY={1}
          minWidth={45}
          justifyContent="center"
        >
          <Text color="yellow">💾 Zapisywanie zadania...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header />
      
      <Box flexDirection="column" alignItems="center">
        <Box 
          borderStyle="round" 
          borderColor="cyan"
          paddingX={2}
          paddingY={1}
          minWidth={45}
        >
          <Box flexDirection="column" width="100%">
            <Text color="cyan" bold>
              ➕ DODAJ NOWE ZADANIE
            </Text>
            
            <Box marginTop={1}>
              {error && (
                <Box marginBottom={1}>
                  <Text color="red">❌ {error}</Text>
                </Box>
              )}
              
              {renderStep()}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
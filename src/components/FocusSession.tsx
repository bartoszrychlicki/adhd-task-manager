import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { EnergyLevel } from '../types/index.js';
import { startFocusSession, executeQuickAction } from '../services/focus.js';
import { updateTask } from '../services/tasks.js';

// Simplified focus mode - no chat commands, just keyboard shortcuts

interface FocusSessionProps {
  onBack: () => void;
}

type SessionState = 'setup' | 'active' | 'completed';
type SetupStep = 'time' | 'energy' | 'location' | 'goal' | 'starting';

interface SessionConfig {
  availableTime: number; // w minutach
  energyLevel: EnergyLevel;
  location: string;
  goalContext: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface CurrentTask {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
}

const energyOptions = [
  { label: 'XS - Bardzo mała energia (zmęczony, rozkojarzony)', value: 'XS' },
  { label: 'S - Mała energia (lekko zmęczony)', value: 'S' },
  { label: 'M - Średnia energia (normalny stan)', value: 'M' },
  { label: 'L - Duża energia (skupiony, zmotywowany)', value: 'L' },
  { label: 'XL - Bardzo duża energia (pełen energii)', value: 'XL' }
];

export const FocusSession: React.FC<FocusSessionProps> = ({ onBack }) => {
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [setupStep, setSetupStep] = useState<SetupStep>('time');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    availableTime: 60,
    energyLevel: 'M',
    location: '',
    goalContext: ''
  });
  
  // Active session state
  const [currentTask, setCurrentTask] = useState<CurrentTask | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [skippedTaskIds, setSkippedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Form inputs
  const [timeInput, setTimeInput] = useState('60');
  const [locationInput, setLocationInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  // Update timer every second for live display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    if (sessionState === 'active') {
      // Simple keyboard shortcuts
      if (input === '1') {
        handleQuickAction('skip');
      } else if (input === '2') {
        handleQuickAction('completed');
      } else if (input === '3') {
        handleQuickAction('end_session');
      }
    } else if (key.escape) {
      // Back to menu from setup/completed
      if (sessionState === 'completed' || sessionState === 'setup') {
        onBack();
      }
    }
  });

  const handleQuickAction = async (action: 'skip' | 'completed' | 'completed_end_session' | 'end_session') => {
    if (!currentTask) return;

    setIsLoading(true);
    
    try {
      const taskDuration = Math.floor((Date.now() - currentTask.startTime.getTime()) / 1000 / 60);
      
      // Track skipped tasks first (before AI call)
      if (action === 'skip' && currentTask.id) {
        setSkippedTaskIds(prev => [...prev, currentTask.id!]);
        console.log('[SKIP] Added task to skipped list:', currentTask.id);
      }

      if (action === 'end_session') {
        setSessionState('completed');
        setIsLoading(false);
        return;
      }

      // Update task status FIRST if completed
      if ((action === 'completed' || action === 'completed_end_session') && currentTask.id) {
        try {
          console.log('[UPDATE] Updating task status to completed:', currentTask.id);
          const updatedTask = await updateTask(currentTask.id, { status: 'completed' });
          console.log('[OK] Task marked as completed in database:', updatedTask);
          // Short delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (dbError) {
          console.error('[ERROR] Failed to update task status:', dbError);
        }
      }

      // THEN get next task from AI (so it sees updated status)
      const result = await executeQuickAction(action, {
        currentTask,
        taskDuration,
        sessionConfig,
        chatHistory: sessionMessages,
        skippedTaskIds: action === 'skip' && currentTask.id ? [...skippedTaskIds, currentTask.id] : skippedTaskIds
      });

      // Set next task if available - clean UI
      console.log('[FOCUS] AI result received:', result);
      console.log('[FOCUS] Next task from AI:', result.nextTask);
      
      if (result.nextTask && result.nextTask.title) {
        console.log('[FOCUS] Setting next task:', result.nextTask);
        setCurrentTask({
          ...result.nextTask,
          startTime: new Date()
        });
      } else {
        console.log('[FOCUS] No next task available, ending session');
        // No more tasks - end session automatically
        setCurrentTask(null);
        setSessionState('completed');
      }
      
    } catch (error) {
      console.error('Error in quick action:', error);
      // Clean UI - just log error, no messages
    }

    setIsLoading(false);
  };

  // Chat removed - using simple keyboard shortcuts instead

  const handleStartSession = async () => {
    setSetupStep('starting');
    setIsLoading(true);

    try {
      const result = await startFocusSession(sessionConfig);
      
      setCurrentTask({
        ...result.firstTask,
        startTime: new Date()
      });

      // No welcome messages - clean UI
      setSessionMessages([]);

      setSessionState('active');
    } catch (error) {
      console.error('Error starting focus session:', error);
      // Handle error - maybe go back to setup
    }

    setIsLoading(false);
  };

  const renderSetup = () => {
    switch (setupStep) {
      case 'time':
        return (
          <Box flexDirection="column">
            <Text color="yellow">ILE MASZ CZASU NA TĘ SESJĘ?</Text>
            <Box marginTop={1}>
              <Text color="white">Wpisz liczbę minut (np. 60, 90, 120): </Text>
            </Box>
            <Box marginTop={1}>
              <TextInput
                value={timeInput}
                onChange={setTimeInput}
                onSubmit={() => {
                  const time = parseInt(timeInput);
                  if (time > 0) {
                    setSessionConfig(prev => ({ ...prev, availableTime: time }));
                    setSetupStep('energy');
                  }
                }}
                placeholder="60"
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
            <Text color="yellow">⚡ JAKI MASZ POZIOM ENERGII?</Text>
            <Box marginTop={1}>
              <SelectInput
                items={energyOptions}
                onSelect={(item) => {
                  setSessionConfig(prev => ({ ...prev, energyLevel: item.value as EnergyLevel }));
                  setSetupStep('location');
                }}
              />
            </Box>
          </Box>
        );

      case 'location':
        return (
          <Box flexDirection="column">
            <Text color="yellow">GDZIE JESTEŚ FIZYCZNIE?</Text>
            <Box marginTop={1}>
              <Text color="gray">To pomoże AI dobrać odpowiednie zadania</Text>
            </Box>
            <Box marginTop={1}>
              <TextInput
                value={locationInput}
                onChange={setLocationInput}
                onSubmit={() => {
                  setSessionConfig(prev => ({ ...prev, location: locationInput }));
                  setSetupStep('goal');
                }}
                placeholder="np. biuro, dom, kawiarnia, pociąg..."
              />
            </Box>
            <Box marginTop={1}>
              <Text color="gray">Enter - dalej, Esc - powrót</Text>
            </Box>
          </Box>
        );

      case 'goal':
        return (
          <Box flexDirection="column">
            <Text color="yellow">[TARGET] MASZ KONKRETNY CEL/KIERUNEK NA TĘ SESJĘ?</Text>
            <Box marginTop={1}>
              <Text color="gray">Opcjonalne - pomaga AI dobrać priorytetowe zadania</Text>
            </Box>
            <Box marginTop={1}>
              <TextInput
                value={goalInput}
                onChange={setGoalInput}
                onSubmit={() => {
                  setSessionConfig(prev => ({ ...prev, goalContext: goalInput }));
                  handleStartSession();
                }}
                placeholder="np. przygotowanie do prezentacji, sprzątanie..."
              />
            </Box>
            <Box marginTop={1}>
              <Text color="gray">Enter - rozpocznij sesję, Esc - powrót</Text>
            </Box>
          </Box>
        );

      case 'starting':
        return (
          <Box justifyContent="center">
            <Text color="yellow">AI przygotowuje Twoją sesję fokusową...</Text>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderActiveSession = () => {
    if (!currentTask) return null;

    const taskDurationSeconds = Math.floor((currentTime - currentTask.startTime.getTime()) / 1000);
    const minutes = Math.floor(taskDurationSeconds / 60);
    const seconds = taskDurationSeconds % 60;

    return (
      <Box flexDirection="column">
        {/* Loading spinner when AI is working */}
        {isLoading && (
          <Box justifyContent="center" marginBottom={2}>
            <LoadingSpinner message="AI wybiera zadanie..." type="dots" color="gray" />
          </Box>
        )}

        {/* Current Task Display */}
        {currentTask && !isLoading && (
          <Box flexDirection="column" marginBottom={2} borderStyle="round" borderColor="cyan" paddingX={3} paddingY={2}>
            <Box justifyContent="center" marginBottom={2}>
              <Text color="cyan" bold>[AKTUALNE ZADANIE]</Text>
            </Box>
            <Box justifyContent="center" marginBottom={2}>
              <Text color="white" bold>{currentTask.title}</Text>
            </Box>
            <Box justifyContent="center">
              <Text color="yellow">[TIME] {minutes}:{seconds.toString().padStart(2, '0')}</Text>
            </Box>
          </Box>
        )}

        {/* Simple 3-option menu */}
        {currentTask && !isLoading && (
          <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="grey">
            <Text color="gray">
              1 = Pomiń zadanie │ 2 = Zrobione │ 3 = Koniec sesji
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  const renderCompleted = () => {
    return (
      <Box flexDirection="column" alignItems="center">
        <Text color="green" bold>[OK] SESJA UKOŃCZONA</Text>
        <Box marginTop={2}>
          <Text color="white">Świetna robota! Sesja fokusowa została zakończona.</Text>
        </Box>
        <Box marginTop={2}>
          <Text color="gray">Naciśnij Esc aby wrócić do menu głównego</Text>
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      
      <Box flexDirection="column" alignItems="center" flexGrow={1}>
        <Box 
          borderStyle="round" 
          borderColor="grey"
          paddingX={1}
          paddingY={2}
          minWidth={80}
          width="100%"
        >
          <Box flexDirection="column" width="100%">
            {sessionState === 'setup' && renderSetup()}
            {sessionState === 'active' && renderActiveSession()}
            {sessionState === 'completed' && renderCompleted()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
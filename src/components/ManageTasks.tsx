import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { colors, energyColors, priorityColors, priorityIcons } from '../utils/theme.js';
import { Task, EnergyLevel, TimeNeeded, Priority } from '../types/index.js';
import { getTasks, updateTask, deleteTask } from '../services/tasks.js';

interface ManageTasksProps {
  onBack: () => void;
}

type ViewState = 'loading' | 'list' | 'edit' | 'delete-confirm';

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

export const ManageTasks: React.FC<ManageTasksProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editEnergyLevel, setEditEnergyLevel] = useState<EnergyLevel | undefined>();
  const [editTimeNeeded, setEditTimeNeeded] = useState<TimeNeeded | undefined>();
  const [editPriority, setEditPriority] = useState<Priority | undefined>();
  const [editStep, setEditStep] = useState<'title' | 'energy' | 'time' | 'priority' | 'confirm'>('title');

  useEffect(() => {
    loadTasks();
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (viewState === 'list') {
        onBack();
      } else {
        setViewState('list');
        setSelectedTask(null);
        setError(null);
      }
    }
    
    // Handle navigation and shortcuts in list view
    if (viewState === 'list' && !isLoading && tasks.length > 0) {
      // Handle arrow key navigation
      if (key.upArrow) {
        setCurrentTaskIndex(prev => Math.max(0, prev - 1));
        return; // Prevent SelectInput from handling it
      } else if (key.downArrow) {
        setCurrentTaskIndex(prev => Math.min(tasks.length - 1, prev + 1));
        return; // Prevent SelectInput from handling it
      }
      
      const currentTask = tasks[currentTaskIndex];
      
      if (input.toLowerCase() === 'e' && currentTask) {
        // Edit currently highlighted task
        console.log('[TOOL] Edytowanie zadania:', currentTask.title);
        setSelectedTask(currentTask);
        startEditing(currentTask);
      } else if (input.toLowerCase() === 'd' && currentTask) {
        // Delete currently highlighted task
        console.log('🗑️ Usuwanie zadania:', currentTask.title);
        setSelectedTask(currentTask);
        setViewState('delete-confirm');
      } else if (key.return && currentTask) {
        // Toggle status of currently highlighted task
        console.log('🔄 Zmiana statusu zadania:', currentTask.title);
        handleToggleStatus(currentTask);
      }
    }
  });

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[INFO] Ładowanie zadań...');
      const taskList = await getTasks();
      console.log('[OK] Zadania załadowane:', taskList.length);
      setTasks(taskList);
      setCurrentTaskIndex(0); // Reset to first task
      setViewState('list');
    } catch (err) {
      console.error('[ERROR] Błąd podczas ładowania zadań:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas ładowania zadań');
      setViewState('list');
    } finally {
      setIsLoading(false);
    }
  };


  const handleToggleStatus = async (task: Task) => {
    setIsLoading(true);
    try {
      const newStatus = task.status === 'todo' ? 'done' : 'todo';
      const updates: Partial<Task> = { 
        status: newStatus,
        completed_at: newStatus === 'done' ? new Date().toISOString() : undefined,
        execution_time: newStatus === 'done' ? Math.floor(Math.random() * 30) + 5 : undefined // Placeholder - można później dodać timer
      };
      
      console.log('🔄 Zmiana statusu zadania:', task.id, 'na', newStatus);
      await updateTask(task.id!, updates);
      await loadTasks();
      console.log('[OK] Status zadania zmieniony');
    } catch (err) {
      console.error('[ERROR] Błąd podczas zmiany statusu:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas zmiany statusu');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditTitle(task.title);
    setEditEnergyLevel(task.energy_level);
    setEditTimeNeeded(task.time_needed);
    setEditPriority(task.priority);
    setEditStep('title');
    setViewState('edit');
  };

  const handleSaveEdit = async () => {
    if (!selectedTask || !editTitle.trim()) {
      setError('Nazwa zadania jest wymagana');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updates: Partial<Task> = {
        title: editTitle.trim(),
        energy_level: editEnergyLevel,
        time_needed: editTimeNeeded,
        priority: editPriority
      };

      console.log('[SAVE] Zapisywanie zmian zadania:', selectedTask.id, updates);
      await updateTask(selectedTask.id!, updates);
      await loadTasks();
      setViewState('list');
      setSelectedTask(null);
      console.log('[OK] Zadanie zaktualizowane');
    } catch (err) {
      console.error('[ERROR] Błąd podczas zapisywania:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🗑️ Usuwanie zadania:', selectedTask.id);
      await deleteTask(selectedTask.id!);
      await loadTasks();
      setViewState('list');
      setSelectedTask(null);
      console.log('[OK] Zadanie usunięte');
    } catch (err) {
      console.error('[ERROR] Błąd podczas usuwania:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTaskDisplay = (task: Task) => {
    const status = task.status === 'done' ? '[OK]' : '[O]';
    const priority = task.priority ? priorityIcons[task.priority] : '[O]';
    const energy = task.energy_level || '?';
    const time = task.time_needed || '?';
    
    return `${status} ${priority} ${energy} ${time} │ ${task.title}`;
  };

  const renderTaskList = () => {
    if (isLoading && tasks.length === 0) {
      return (
        <Box>
          <LoadingSpinner message="Ładowanie zadań..." type="dots" color="yellow" />
        </Box>
      );
    }

    if (tasks.length === 0) {
      return (
        <Box flexDirection="column">
          <Text color="gray">[TASK] Nie masz jeszcze żadnych zadań.</Text>
          <Text color="gray">Dodaj pierwsze zadanie z menu głównego!</Text>
          <Box marginTop={2}>
            <Text color="gray">Esc - powrót do menu</Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text color="yellow">Lista zadań:</Text>
        
        <Box marginTop={1} flexDirection="column">
          {tasks.map((task, index) => (
            <Box key={task.id} marginY={0}>
              <Text color={index === currentTaskIndex ? 'cyan' : 'white'} bold={index === currentTaskIndex}>
                {index === currentTaskIndex ? '❯ ' : '  '}
                {formatTaskDisplay(task)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* {tasks[currentTaskIndex] && (
          <Box marginTop={1} paddingY={1} borderTop borderStyle="single" borderColor="cyan">
            <Text color="cyan">
              Wybrane: {tasks[currentTaskIndex].title}
            </Text>
          </Box>
        )} */}

        <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="grey">
          <Text color="gray">
            ↑↓ nawiguj po liście │ Enter = done/todo │ E = edytuj │ D = usuń │ Esc = menu
          </Text>
        </Box>
      </Box>
    );
  };

  const renderEditForm = () => {
    if (!selectedTask) return null;

    const renderEditStep = () => {
      switch (editStep) {
        case 'title':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Nazwa zadania:</Text>
              <Box marginTop={1}>
                <TextInput
                  value={editTitle}
                  onChange={setEditTitle}
                  onSubmit={() => setEditStep('energy')}
                />
              </Box>
              <Box marginTop={1}>
                <Text color="gray">Enter - dalej, Esc - anuluj</Text>
              </Box>
            </Box>
          );

        case 'energy':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Energia:</Text>
              <Box marginTop={1}>
                <SelectInput
                  items={[
                    { label: 'Bez zmiany', value: 'keep' },
                    { label: 'Usuń wartość', value: 'clear' },
                    ...energyOptions
                  ]}
                  onSelect={(item) => {
                    if (item.value === 'keep') {
                      // Keep current value
                    } else if (item.value === 'clear') {
                      setEditEnergyLevel(undefined);
                    } else {
                      setEditEnergyLevel(item.value as EnergyLevel);
                    }
                    setEditStep('time');
                  }}
                />
              </Box>
            </Box>
          );

        case 'time':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Czas:</Text>
              <Box marginTop={1}>
                <SelectInput
                  items={[
                    { label: 'Bez zmiany', value: 'keep' },
                    { label: 'Usuń wartość', value: 'clear' },
                    ...timeOptions
                  ]}
                  onSelect={(item) => {
                    if (item.value === 'keep') {
                      // Keep current value
                    } else if (item.value === 'clear') {
                      setEditTimeNeeded(undefined);
                    } else {
                      setEditTimeNeeded(item.value as TimeNeeded);
                    }
                    setEditStep('priority');
                  }}
                />
              </Box>
            </Box>
          );

        case 'priority':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Priorytet:</Text>
              <Box marginTop={1}>
                <SelectInput
                  items={[
                    { label: 'Bez zmiany', value: 'keep' },
                    { label: 'Usuń wartość', value: 'clear' },
                    ...priorityOptions
                  ]}
                  onSelect={(item) => {
                    if (item.value === 'keep') {
                      // Keep current value
                    } else if (item.value === 'clear') {
                      setEditPriority(undefined);
                    } else {
                      setEditPriority(item.value as Priority);
                    }
                    setEditStep('confirm');
                  }}
                />
              </Box>
            </Box>
          );

        case 'confirm':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Podsumowanie zmian:</Text>
              <Box marginTop={1} flexDirection="column">
                <Text>
                  <Text color="white">Nazwa: </Text>
                  <Text color="cyan">{editTitle}</Text>
                </Text>
                <Text>
                  <Text color="white">Energia: </Text>
                  <Text color="cyan">{editEnergyLevel || 'brak'}</Text>
                </Text>
                <Text>
                  <Text color="white">Czas: </Text>
                  <Text color="cyan">{editTimeNeeded || 'brak'}</Text>
                </Text>
                <Text>
                  <Text color="white">Priorytet: </Text>
                  <Text color="cyan">{editPriority || 'brak'}</Text>
                </Text>
              </Box>
              
              <Box marginTop={2}>
                <SelectInput
                  items={[
                    { label: 'Zapisz zmiany', value: 'save' },
                    { label: '↩ Powrót do edycji', value: 'back' }
                  ]}
                  onSelect={(item) => {
                    if (item.value === 'save') {
                      handleSaveEdit();
                    } else {
                      setEditStep('title');
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

    return (
      <Box flexDirection="column">
        <Text color="cyan" bold>📝 EDYCJA ZADANIA</Text>
        <Box marginTop={1}>
          <Text color="gray">Aktualne: {selectedTask.title}</Text>
        </Box>
        <Box marginTop={1}>
          {renderEditStep()}
        </Box>
      </Box>
    );
  };

  const renderDeleteConfirm = () => {
    if (!selectedTask) return null;

    return (
      <Box flexDirection="column">
        <Text color="red" bold>🗑️ USUŃ ZADANIE</Text>
        
        <Box marginTop={1}>
          <Text color="white">Czy na pewno chcesz usunąć zadanie:</Text>
        </Box>
        
        <Box marginTop={1} paddingX={2} borderLeft borderStyle="single" borderColor="yellow">
          <Text color="yellow">{selectedTask.title}</Text>
        </Box>

        <Box marginTop={2}>
          <SelectInput
            items={[
              { label: '[ERROR] Tak, usuń to zadanie', value: 'confirm' },
              { label: '↩️ Nie, powrót do listy', value: 'cancel' }
            ]}
            onSelect={(item) => {
              if (item.value === 'confirm') {
                handleDelete();
              } else {
                setViewState('list');
                setSelectedTask(null);
              }
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderCurrentView = () => {
    switch (viewState) {
      case 'loading':
        return (
          <Box>
            <Text color="yellow">⏳ Ładowanie...</Text>
          </Box>
        );
      case 'list':
        return renderTaskList();
      case 'edit':
        return renderEditForm();
      case 'delete-confirm':
        return renderDeleteConfirm();
      default:
        return renderTaskList();
    }
  };

  if (isLoading && viewState !== 'list') {
    return (
      <Box flexDirection="column">
        <Header />
        <Box 
          borderStyle="round" 
          borderColor="blue"
          paddingX={1}
          paddingY={1}
          minWidth={55}
          justifyContent="center"
        >
          <Text color="yellow">⏳ Przetwarzanie...</Text>
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
          minWidth={70}
        >
          <Box flexDirection="column" width="100%">
            <Text color="cyan" bold>
                              [INFO] ZARZĄDZAJ ZADANIAMI
            </Text>
            
            {error && (
              <Box marginTop={1} marginBottom={1}>
                <Text color="red">[ERROR] {error}</Text>
              </Box>
            )}
            
            <Box marginTop={1}>
              {renderCurrentView()}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
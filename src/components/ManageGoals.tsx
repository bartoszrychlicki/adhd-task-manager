import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { colors } from '../utils/theme.js';
import { Goal, GoalType, GoalTimeframe } from '../types/index.js';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goals.js';

interface ManageGoalsProps {
  onBack: () => void;
}

type ViewState = 'loading' | 'list' | 'add' | 'edit' | 'delete-confirm';
type FormStep = 'title' | 'type' | 'timeframe' | 'description' | 'confirm';

const goalTypeOptions = [
  { label: 'Długoterminowe (kwartał, półrocze, rok+)', value: 'long_term' },
  { label: 'Krótkoterminowe (tydzień, miesiąc)', value: 'short_term' }
];

const longTermTimeframes = [
  { label: 'Kwartał (3 miesiące)', value: 'quarter' },
  { label: 'Półrocze (6 miesięcy)', value: 'half_year' },
  { label: 'Rok', value: 'year' }
];

const shortTermTimeframes = [
  { label: 'Tydzień', value: 'week' },
  { label: 'Miesiąc', value: 'month' }
];

export const ManageGoals: React.FC<ManageGoalsProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formStep, setFormStep] = useState<FormStep>('title');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<GoalType>('short_term');
  const [formTimeframe, setFormTimeframe] = useState<GoalTimeframe>();
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (viewState === 'list') {
        onBack();
      } else {
        setViewState('list');
        setSelectedGoal(null);
        setError(null);
        resetForm();
      }
    }
    
    // Handle navigation and shortcuts in list view
    if (viewState === 'list' && !isLoading) {
      if (goals.length > 0) {
        // Handle arrow key navigation
        if (key.upArrow) {
          setCurrentGoalIndex(prev => Math.max(0, prev - 1));
          return;
        } else if (key.downArrow) {
          setCurrentGoalIndex(prev => Math.min(goals.length - 1, prev + 1));
          return;
        }
        
        const currentGoal = goals[currentGoalIndex];
        
        if (input.toLowerCase() === 'e' && currentGoal) {
          // Edit currently highlighted goal
          console.log('[TOOL] Edytowanie celu:', currentGoal.title);
          setSelectedGoal(currentGoal);
          loadGoalToForm(currentGoal);
          setViewState('edit');
        } else if (input.toLowerCase() === 'd' && currentGoal) {
          // Delete currently highlighted goal
          console.log('🗑️ Usuwanie celu:', currentGoal.title);
          setSelectedGoal(currentGoal);
          setViewState('delete-confirm');
        }
      }
      
      // Always allow 'n' for new goal regardless of goals count
      if (input.toLowerCase() === 'n') {
        console.log('➕ Dodawanie nowego celu');
        resetForm();
        setViewState('add');
      }
    }
  });

  const loadGoals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[INFO] Ładowanie celów...');
      const goalList = await getGoals();
      console.log('[OK] Cele załadowane:', goalList.length);
      setGoals(goalList);
      setCurrentGoalIndex(0);
      setViewState('list');
    } catch (err) {
      console.error('[ERROR] Błąd podczas ładowania celów:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas ładowania celów');
      setViewState('list');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormStep('title');
    setFormTitle('');
    setFormType('short_term');
    setFormTimeframe(undefined);
    setFormDescription('');
  };

  const loadGoalToForm = (goal: Goal) => {
    setFormTitle(goal.title);
    setFormType(goal.type);
    setFormTimeframe(goal.timeframe);
    setFormDescription(goal.description || '');
    setFormStep('title');
  };

  const handleSubmitGoal = async () => {
    if (!formTitle.trim()) {
      setError('Tytuł celu jest wymagany');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const goalData = {
        title: formTitle.trim(),
        type: formType,
        timeframe: formTimeframe,
        description: formDescription.trim() || undefined
      };

      if (viewState === 'edit' && selectedGoal) {
        console.log('[SAVE] Aktualizowanie celu:', selectedGoal.id, goalData);
        await updateGoal(selectedGoal.id!, goalData);
      } else {
        console.log('[SAVE] Tworzenie nowego celu:', goalData);
        await createGoal(goalData);
      }

      await loadGoals();
      resetForm();
      setSelectedGoal(null);
      console.log('[OK] Cel zapisany pomyślnie');
    } catch (err) {
      console.error('[ERROR] Błąd podczas zapisywania celu:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania celu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🗑️ Usuwanie celu:', selectedGoal.id);
      await deleteGoal(selectedGoal.id!);
      await loadGoals();
      setViewState('list');
      setSelectedGoal(null);
      console.log('[OK] Cel usunięty');
    } catch (err) {
      console.error('[ERROR] Błąd podczas usuwania celu:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania celu');
    } finally {
      setIsLoading(false);
    }
  };


  const formatGoalDisplay = (goal: Goal) => {
    const typeIcon = goal.type === 'long_term' ? '[TARGET]' : '[CAL]';
    const timeframe = goal.timeframe ? ` (${goal.timeframe})` : '';
    return `${typeIcon} ${goal.title}${timeframe}`;
  };

  const renderGoalsList = () => {
    if (isLoading && goals.length === 0) {
      return (
        <Box>
          <LoadingSpinner message="Ładowanie celów..." type="dots" color="yellow" />
        </Box>
      );
    }

    if (goals.length === 0) {
      return (
        <Box flexDirection="column">
          <Text color="gray">[TARGET] Nie masz jeszcze żadnych celów.</Text>
          <Text color="gray">Naciśnij N aby dodać pierwszy cel!</Text>
          <Box marginTop={2}>
            <Text color="gray">N = nowy cel │ Esc = powrót do menu</Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text color="yellow">Lista celów:</Text>
        
        <Box marginTop={1} flexDirection="column">
          {goals.map((goal, index) => (
            <Box key={goal.id} marginY={0}>
              <Text color={index === currentGoalIndex ? 'cyan' : 'white'} bold={index === currentGoalIndex}>
                {index === currentGoalIndex ? '❯ ' : '  '}
                {formatGoalDisplay(goal)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* {goals[currentGoalIndex] && (
          <Box marginTop={1} paddingY={1} borderTop borderStyle="single" borderColor="cyan">
            <Text color="cyan">
              Wybrany: {goals[currentGoalIndex].title}
            </Text>
            {goals[currentGoalIndex].description && (
              <Text color="gray">
                Opis: {goals[currentGoalIndex].description}
              </Text>
            )}
          </Box>
        )} */}

        <Box marginTop={1} flexDirection="column">
          <Text color="gray">
            ↑↓ nawiguj │ N = nowy cel │ E = edytuj │ D = usuń │ Esc = menu
          </Text>
        </Box>
      </Box>
    );
  };

  const renderDeleteConfirm = () => {
    if (!selectedGoal) return null;

    return (
      <Box flexDirection="column">
        <Text color="red" bold>[DELETE] USUŃ CEL</Text>
        
        <Box marginTop={1}>
          <Text color="white">Czy na pewno chcesz usunąć cel:</Text>
        </Box>
        
        <Box marginTop={1} paddingX={2} borderLeft borderStyle="single" borderColor="yellow">
          <Text color="yellow">{selectedGoal.title}</Text>
          {selectedGoal.description && (
            <Text color="gray">{selectedGoal.description}</Text>
          )}
        </Box>

        <Box marginTop={2}>
          <SelectInput
            items={[
              { label: '[ERROR] Tak, usuń ten cel', value: 'confirm' },
              { label: '[BACK] Nie, powrót do listy', value: 'cancel' }
            ]}
            onSelect={(item) => {
              if (item.value === 'confirm') {
                handleDeleteGoal();
              } else {
                setViewState('list');
                setSelectedGoal(null);
              }
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderForm = () => {
    const isEditing = viewState === 'edit';
    const title = isEditing ? '✏️ EDYTUJ CEL' : '➕ DODAJ NOWY CEL';

    const renderFormStep = () => {
      switch (formStep) {
        case 'title':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Tytuł celu:</Text>
              <Box marginTop={1}>
                <TextInput
                  value={formTitle}
                  onChange={setFormTitle}
                  onSubmit={() => setFormStep('type')}
                  placeholder="Wpisz tytuł celu..."
                />
              </Box>
              <Box marginTop={1}>
                <Text color="gray">Enter - dalej, Esc - anuluj</Text>
              </Box>
            </Box>
          );

        case 'type':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Typ celu:</Text>
              <Box marginTop={1}>
                <SelectInput
                  items={goalTypeOptions}
                  onSelect={(item) => {
                    setFormType(item.value as GoalType);
                    setFormStep('timeframe');
                  }}
                />
              </Box>
            </Box>
          );

        case 'timeframe':
          const timeframeOptions = formType === 'long_term' ? longTermTimeframes : shortTermTimeframes;
          return (
            <Box flexDirection="column">
              <Text color="yellow">Horyzont czasowy:</Text>
              <Box marginTop={1}>
                <SelectInput
                  items={[
                    { label: 'Pomiń - bez określonego czasu', value: 'skip' },
                    ...timeframeOptions
                  ]}
                  onSelect={(item) => {
                    if (item.value === 'skip') {
                      setFormTimeframe(undefined);
                    } else {
                      setFormTimeframe(item.value as GoalTimeframe);
                    }
                    setFormStep('description');
                  }}
                />
              </Box>
            </Box>
          );

        case 'description':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Opis celu (opcjonalnie):</Text>
              <Box marginTop={1}>
                <TextInput
                  value={formDescription}
                  onChange={setFormDescription}
                  onSubmit={() => setFormStep('confirm')}
                  placeholder="Dodaj szczegóły celu..."
                />
              </Box>
              <Box marginTop={1}>
                <Text color="gray">Enter - dalej, Esc - anuluj</Text>
              </Box>
            </Box>
          );

        case 'confirm':
          return (
            <Box flexDirection="column">
              <Text color="yellow">Podsumowanie celu:</Text>
              <Box marginTop={1} flexDirection="column">
                <Text>
                  <Text color="white">Tytuł: </Text>
                  <Text color="cyan">{formTitle}</Text>
                </Text>
                <Text>
                  <Text color="white">Typ: </Text>
                  <Text color="cyan">{formType === 'long_term' ? 'Długoterminowy' : 'Krótkoterminowy'}</Text>
                </Text>
                <Text>
                  <Text color="white">Horyzont: </Text>
                  <Text color="cyan">{formTimeframe || 'Nieokreślony'}</Text>
                </Text>
                {formDescription && (
                  <Text>
                    <Text color="white">Opis: </Text>
                    <Text color="cyan">{formDescription}</Text>
                  </Text>
                )}
              </Box>
              
              <Box marginTop={2}>
                <SelectInput
                  items={[
                    { label: '[OK] Zapisz cel', value: 'save' },
                    { label: '↩️ Powrót do edycji', value: 'back' }
                  ]}
                  onSelect={(item) => {
                    if (item.value === 'save') {
                      handleSubmitGoal();
                    } else {
                      setFormStep('title');
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
        <Text color="cyan" bold>{title}</Text>
        <Box marginTop={1}>
          {renderFormStep()}
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
        return renderGoalsList();
      case 'add':
      case 'edit':
        return renderForm();
      case 'delete-confirm':
        return renderDeleteConfirm();
      default:
        return renderGoalsList();
    }
  };

  if (isLoading && viewState !== 'list') {
    return (
      <Box flexDirection="column">
        <Header />
        <Box 
          borderStyle="round" 
          borderColor="cyan"
          paddingX={2}
          paddingY={1}
          minWidth={60}
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
                              [TARGET] ZARZĄDZAJ CELAMI
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
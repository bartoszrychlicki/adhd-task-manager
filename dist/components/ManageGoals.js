import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goals.js';
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
export const ManageGoals = ({ onBack }) => {
    const [viewState, setViewState] = useState('loading');
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Form state
    const [formStep, setFormStep] = useState('title');
    const [formTitle, setFormTitle] = useState('');
    const [formType, setFormType] = useState('short_term');
    const [formTimeframe, setFormTimeframe] = useState();
    const [formDescription, setFormDescription] = useState('');
    useEffect(() => {
        loadGoals();
    }, []);
    useInput((input, key) => {
        if (key.escape) {
            if (viewState === 'list') {
                onBack();
            }
            else {
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
                }
                else if (key.downArrow) {
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
                }
                else if (input.toLowerCase() === 'd' && currentGoal) {
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
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas ładowania celów:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania celów');
            setViewState('list');
        }
        finally {
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
    const loadGoalToForm = (goal) => {
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
                await updateGoal(selectedGoal.id, goalData);
            }
            else {
                console.log('[SAVE] Tworzenie nowego celu:', goalData);
                await createGoal(goalData);
            }
            await loadGoals();
            resetForm();
            setSelectedGoal(null);
            console.log('[OK] Cel zapisany pomyślnie');
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas zapisywania celu:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania celu');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDeleteGoal = async () => {
        if (!selectedGoal)
            return;
        setIsLoading(true);
        setError(null);
        try {
            console.log('🗑️ Usuwanie celu:', selectedGoal.id);
            await deleteGoal(selectedGoal.id);
            await loadGoals();
            setViewState('list');
            setSelectedGoal(null);
            console.log('[OK] Cel usunięty');
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas usuwania celu:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas usuwania celu');
        }
        finally {
            setIsLoading(false);
        }
    };
    const formatGoalDisplay = (goal) => {
        const typeIcon = goal.type === 'long_term' ? '[TARGET]' : '[CAL]';
        const timeframe = goal.timeframe ? ` (${goal.timeframe})` : '';
        return `${typeIcon} ${goal.title}${timeframe}`;
    };
    const renderGoalsList = () => {
        if (isLoading && goals.length === 0) {
            return (_jsx(Box, { children: _jsx(LoadingSpinner, { message: "\u0141adowanie cel\u00F3w...", type: "dots", color: "yellow" }) }));
        }
        if (goals.length === 0) {
            return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "gray", children: "[TARGET] Nie masz jeszcze \u017Cadnych cel\u00F3w." }), _jsx(Text, { color: "gray", children: "Naci\u015Bnij N aby doda\u0107 pierwszy cel!" }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", children: "N = nowy cel \u2502 Esc = powr\u00F3t do menu" }) })] }));
        }
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Lista cel\u00F3w:" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: goals.map((goal, index) => (_jsx(Box, { marginY: 0, children: _jsxs(Text, { color: index === currentGoalIndex ? 'cyan' : 'white', bold: index === currentGoalIndex, children: [index === currentGoalIndex ? '❯ ' : '  ', formatGoalDisplay(goal)] }) }, goal.id))) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsx(Text, { color: "gray", children: "\u2191\u2193 nawiguj \u2502 N = nowy cel \u2502 E = edytuj \u2502 D = usu\u0144 \u2502 Esc = menu" }) })] }));
    };
    const renderDeleteConfirm = () => {
        if (!selectedGoal)
            return null;
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", bold: true, children: "[DELETE] USU\u0143 CEL" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "white", children: "Czy na pewno chcesz usun\u0105\u0107 cel:" }) }), _jsxs(Box, { marginTop: 1, paddingX: 2, borderLeft: true, borderStyle: "single", borderColor: "yellow", children: [_jsx(Text, { color: "yellow", children: selectedGoal.title }), selectedGoal.description && (_jsx(Text, { color: "gray", children: selectedGoal.description }))] }), _jsx(Box, { marginTop: 2, children: _jsx(SelectInput, { items: [
                            { label: '[ERROR] Tak, usuń ten cel', value: 'confirm' },
                            { label: '[BACK] Nie, powrót do listy', value: 'cancel' }
                        ], onSelect: (item) => {
                            if (item.value === 'confirm') {
                                handleDeleteGoal();
                            }
                            else {
                                setViewState('list');
                                setSelectedGoal(null);
                            }
                        } }) })] }));
    };
    const renderForm = () => {
        const isEditing = viewState === 'edit';
        const title = isEditing ? '✏️ EDYTUJ CEL' : '➕ DODAJ NOWY CEL';
        const renderFormStep = () => {
            switch (formStep) {
                case 'title':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Tytu\u0142 celu:" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: formTitle, onChange: setFormTitle, onSubmit: () => setFormStep('type'), placeholder: "Wpisz tytu\u0142 celu..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - dalej, Esc - anuluj" }) })] }));
                case 'type':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Typ celu:" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: goalTypeOptions, onSelect: (item) => {
                                        setFormType(item.value);
                                        setFormStep('timeframe');
                                    } }) })] }));
                case 'timeframe':
                    const timeframeOptions = formType === 'long_term' ? longTermTimeframes : shortTermTimeframes;
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Horyzont czasowy:" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                        { label: 'Pomiń - bez określonego czasu', value: 'skip' },
                                        ...timeframeOptions
                                    ], onSelect: (item) => {
                                        if (item.value === 'skip') {
                                            setFormTimeframe(undefined);
                                        }
                                        else {
                                            setFormTimeframe(item.value);
                                        }
                                        setFormStep('description');
                                    } }) })] }));
                case 'description':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Opis celu (opcjonalnie):" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: formDescription, onChange: setFormDescription, onSubmit: () => setFormStep('confirm'), placeholder: "Dodaj szczeg\u00F3\u0142y celu..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - dalej, Esc - anuluj" }) })] }));
                case 'confirm':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Podsumowanie celu:" }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Tytu\u0142: " }), _jsx(Text, { color: "cyan", children: formTitle })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Typ: " }), _jsx(Text, { color: "cyan", children: formType === 'long_term' ? 'Długoterminowy' : 'Krótkoterminowy' })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Horyzont: " }), _jsx(Text, { color: "cyan", children: formTimeframe || 'Nieokreślony' })] }), formDescription && (_jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Opis: " }), _jsx(Text, { color: "cyan", children: formDescription })] }))] }), _jsx(Box, { marginTop: 2, children: _jsx(SelectInput, { items: [
                                        { label: '[OK] Zapisz cel', value: 'save' },
                                        { label: '↩️ Powrót do edycji', value: 'back' }
                                    ], onSelect: (item) => {
                                        if (item.value === 'save') {
                                            handleSubmitGoal();
                                        }
                                        else {
                                            setFormStep('title');
                                        }
                                    } }) })] }));
                default:
                    return null;
            }
        };
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: title }), _jsx(Box, { marginTop: 1, children: renderFormStep() })] }));
    };
    const renderCurrentView = () => {
        switch (viewState) {
            case 'loading':
                return (_jsx(Box, { children: _jsx(Text, { color: "yellow", children: "\u23F3 \u0141adowanie..." }) }));
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
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, minWidth: 60, justifyContent: "center", children: _jsx(Text, { color: "yellow", children: "\u23F3 Przetwarzanie..." }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { flexDirection: "column", alignItems: "center", children: _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, minWidth: 70, children: _jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsx(Text, { color: "cyan", bold: true, children: "[TARGET] ZARZ\u0104DZAJ CELAMI" }), error && (_jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsxs(Text, { color: "red", children: ["[ERROR] ", error] }) })), _jsx(Box, { marginTop: 1, children: renderCurrentView() })] }) }) })] }));
};
//# sourceMappingURL=ManageGoals.js.map
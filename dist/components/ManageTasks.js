import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { priorityIcons } from '../utils/theme.js';
import { getTasks, updateTask, deleteTask } from '../services/tasks.js';
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
export const ManageTasks = ({ onBack }) => {
    const [viewState, setViewState] = useState('loading');
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editEnergyLevel, setEditEnergyLevel] = useState();
    const [editTimeNeeded, setEditTimeNeeded] = useState();
    const [editPriority, setEditPriority] = useState();
    const [editStep, setEditStep] = useState('title');
    useEffect(() => {
        loadTasks();
    }, []);
    useInput((input, key) => {
        if (key.escape) {
            if (viewState === 'list') {
                onBack();
            }
            else {
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
            }
            else if (key.downArrow) {
                setCurrentTaskIndex(prev => Math.min(tasks.length - 1, prev + 1));
                return; // Prevent SelectInput from handling it
            }
            const currentTask = tasks[currentTaskIndex];
            if (input.toLowerCase() === 'e' && currentTask) {
                // Edit currently highlighted task
                console.log('[TOOL] Edytowanie zadania:', currentTask.title);
                setSelectedTask(currentTask);
                startEditing(currentTask);
            }
            else if (input.toLowerCase() === 'd' && currentTask) {
                // Delete currently highlighted task
                console.log('🗑️ Usuwanie zadania:', currentTask.title);
                setSelectedTask(currentTask);
                setViewState('delete-confirm');
            }
            else if (key.return && currentTask) {
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
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas ładowania zadań:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas ładowania zadań');
            setViewState('list');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleToggleStatus = async (task) => {
        setIsLoading(true);
        try {
            const newStatus = task.status === 'todo' ? 'done' : 'todo';
            const updates = {
                status: newStatus,
                completed_at: newStatus === 'done' ? new Date().toISOString() : undefined,
                execution_time: newStatus === 'done' ? Math.floor(Math.random() * 30) + 5 : undefined // Placeholder - można później dodać timer
            };
            console.log('🔄 Zmiana statusu zadania:', task.id, 'na', newStatus);
            await updateTask(task.id, updates);
            await loadTasks();
            console.log('[OK] Status zadania zmieniony');
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas zmiany statusu:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas zmiany statusu');
        }
        finally {
            setIsLoading(false);
        }
    };
    const startEditing = (task) => {
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
            const updates = {
                title: editTitle.trim(),
                energy_level: editEnergyLevel,
                time_needed: editTimeNeeded,
                priority: editPriority
            };
            console.log('[SAVE] Zapisywanie zmian zadania:', selectedTask.id, updates);
            await updateTask(selectedTask.id, updates);
            await loadTasks();
            setViewState('list');
            setSelectedTask(null);
            console.log('[OK] Zadanie zaktualizowane');
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas zapisywania:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!selectedTask)
            return;
        setIsLoading(true);
        setError(null);
        try {
            console.log('🗑️ Usuwanie zadania:', selectedTask.id);
            await deleteTask(selectedTask.id);
            await loadTasks();
            setViewState('list');
            setSelectedTask(null);
            console.log('[OK] Zadanie usunięte');
        }
        catch (err) {
            console.error('[ERROR] Błąd podczas usuwania:', err);
            setError(err instanceof Error ? err.message : 'Błąd podczas usuwania');
        }
        finally {
            setIsLoading(false);
        }
    };
    const formatTaskDisplay = (task) => {
        const status = task.status === 'done' ? '[OK]' : '[O]';
        const priority = task.priority ? priorityIcons[task.priority] : '[O]';
        const energy = task.energy_level || '?';
        const time = task.time_needed || '?';
        return `${status} ${priority} ${energy} ${time} │ ${task.title}`;
    };
    const renderTaskList = () => {
        if (isLoading && tasks.length === 0) {
            return (_jsx(Box, { children: _jsx(LoadingSpinner, { message: "\u0141adowanie zada\u0144...", type: "dots", color: "yellow" }) }));
        }
        if (tasks.length === 0) {
            return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "gray", children: "[TASK] Nie masz jeszcze \u017Cadnych zada\u0144." }), _jsx(Text, { color: "gray", children: "Dodaj pierwsze zadanie z menu g\u0142\u00F3wnego!" }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", children: "Esc - powr\u00F3t do menu" }) })] }));
        }
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Lista zada\u0144:" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: tasks.map((task, index) => (_jsx(Box, { marginY: 0, children: _jsxs(Text, { color: index === currentTaskIndex ? 'cyan' : 'white', bold: index === currentTaskIndex, children: [index === currentTaskIndex ? '❯ ' : '  ', formatTaskDisplay(task)] }) }, task.id))) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsx(Text, { color: "gray", children: "\u2191\u2193 nawiguj po li\u015Bcie \u2502 Enter = done/todo \u2502 E = edytuj \u2502 D = usu\u0144 \u2502 Esc = menu" }) })] }));
    };
    const renderEditForm = () => {
        if (!selectedTask)
            return null;
        const renderEditStep = () => {
            switch (editStep) {
                case 'title':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Nazwa zadania:" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: editTitle, onChange: setEditTitle, onSubmit: () => setEditStep('energy') }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - dalej, Esc - anuluj" }) })] }));
                case 'energy':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Energia:" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                        { label: 'Bez zmiany', value: 'keep' },
                                        { label: 'Usuń wartość', value: 'clear' },
                                        ...energyOptions
                                    ], onSelect: (item) => {
                                        if (item.value === 'keep') {
                                            // Keep current value
                                        }
                                        else if (item.value === 'clear') {
                                            setEditEnergyLevel(undefined);
                                        }
                                        else {
                                            setEditEnergyLevel(item.value);
                                        }
                                        setEditStep('time');
                                    } }) })] }));
                case 'time':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Czas:" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                        { label: 'Bez zmiany', value: 'keep' },
                                        { label: 'Usuń wartość', value: 'clear' },
                                        ...timeOptions
                                    ], onSelect: (item) => {
                                        if (item.value === 'keep') {
                                            // Keep current value
                                        }
                                        else if (item.value === 'clear') {
                                            setEditTimeNeeded(undefined);
                                        }
                                        else {
                                            setEditTimeNeeded(item.value);
                                        }
                                        setEditStep('priority');
                                    } }) })] }));
                case 'priority':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Priorytet:" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                        { label: 'Bez zmiany', value: 'keep' },
                                        { label: 'Usuń wartość', value: 'clear' },
                                        ...priorityOptions
                                    ], onSelect: (item) => {
                                        if (item.value === 'keep') {
                                            // Keep current value
                                        }
                                        else if (item.value === 'clear') {
                                            setEditPriority(undefined);
                                        }
                                        else {
                                            setEditPriority(item.value);
                                        }
                                        setEditStep('confirm');
                                    } }) })] }));
                case 'confirm':
                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Podsumowanie zmian:" }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Nazwa: " }), _jsx(Text, { color: "cyan", children: editTitle })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Energia: " }), _jsx(Text, { color: "cyan", children: editEnergyLevel || 'brak' })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Czas: " }), _jsx(Text, { color: "cyan", children: editTimeNeeded || 'brak' })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Priorytet: " }), _jsx(Text, { color: "cyan", children: editPriority || 'brak' })] })] }), _jsx(Box, { marginTop: 2, children: _jsx(SelectInput, { items: [
                                        { label: 'Zapisz zmiany', value: 'save' },
                                        { label: '↩ Powrót do edycji', value: 'back' }
                                    ], onSelect: (item) => {
                                        if (item.value === 'save') {
                                            handleSaveEdit();
                                        }
                                        else {
                                            setEditStep('title');
                                        }
                                    } }) })] }));
                default:
                    return null;
            }
        };
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDCDD EDYCJA ZADANIA" }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: "gray", children: ["Aktualne: ", selectedTask.title] }) }), _jsx(Box, { marginTop: 1, children: renderEditStep() })] }));
    };
    const renderDeleteConfirm = () => {
        if (!selectedTask)
            return null;
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "red", bold: true, children: "\uD83D\uDDD1\uFE0F USU\u0143 ZADANIE" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "white", children: "Czy na pewno chcesz usun\u0105\u0107 zadanie:" }) }), _jsx(Box, { marginTop: 1, paddingX: 2, borderLeft: true, borderStyle: "single", borderColor: "yellow", children: _jsx(Text, { color: "yellow", children: selectedTask.title }) }), _jsx(Box, { marginTop: 2, children: _jsx(SelectInput, { items: [
                            { label: '[ERROR] Tak, usuń to zadanie', value: 'confirm' },
                            { label: '↩️ Nie, powrót do listy', value: 'cancel' }
                        ], onSelect: (item) => {
                            if (item.value === 'confirm') {
                                handleDelete();
                            }
                            else {
                                setViewState('list');
                                setSelectedTask(null);
                            }
                        } }) })] }));
    };
    const renderCurrentView = () => {
        switch (viewState) {
            case 'loading':
                return (_jsx(Box, { children: _jsx(Text, { color: "yellow", children: "\u23F3 \u0141adowanie..." }) }));
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
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { borderStyle: "round", borderColor: "blue", paddingX: 1, paddingY: 1, minWidth: 55, justifyContent: "center", children: _jsx(Text, { color: "yellow", children: "\u23F3 Przetwarzanie..." }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { flexDirection: "column", alignItems: "center", children: _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, minWidth: 70, children: _jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsx(Text, { color: "cyan", bold: true, children: "[INFO] ZARZ\u0104DZAJ ZADANIAMI" }), error && (_jsx(Box, { marginTop: 1, marginBottom: 1, children: _jsxs(Text, { color: "red", children: ["[ERROR] ", error] }) })), _jsx(Box, { marginTop: 1, children: renderCurrentView() })] }) }) })] }));
};
//# sourceMappingURL=ManageTasks.js.map
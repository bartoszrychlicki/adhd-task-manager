import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { startFocusSession, executeQuickAction } from '../services/focus.js';
import { updateTask } from '../services/tasks.js';
const energyOptions = [
    { label: 'XS - Bardzo mała energia (zmęczony, rozkojarzony)', value: 'XS' },
    { label: 'S - Mała energia (lekko zmęczony)', value: 'S' },
    { label: 'M - Średnia energia (normalny stan)', value: 'M' },
    { label: 'L - Duża energia (skupiony, zmotywowany)', value: 'L' },
    { label: 'XL - Bardzo duża energia (pełen energii)', value: 'XL' }
];
export const FocusSession = ({ onBack }) => {
    const [sessionState, setSessionState] = useState('setup');
    const [setupStep, setSetupStep] = useState('time');
    const [sessionConfig, setSessionConfig] = useState({
        availableTime: 60,
        energyLevel: 'M',
        location: '',
        goalContext: ''
    });
    // Active session state
    const [currentTask, setCurrentTask] = useState(null);
    const [sessionMessages, setSessionMessages] = useState([]);
    const [skippedTaskIds, setSkippedTaskIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // Form inputs
    const [timeInput, setTimeInput] = useState('60');
    const [locationInput, setLocationInput] = useState('');
    const [goalInput, setGoalInput] = useState('');
    useInput((input, key) => {
        if (sessionState === 'active') {
            // Simple keyboard shortcuts
            if (input === '1') {
                handleQuickAction('skip');
            }
            else if (input === '2') {
                handleQuickAction('completed');
            }
            else if (input === '3') {
                handleQuickAction('end_session');
            }
        }
        else if (key.escape) {
            // Back to menu from setup/completed
            if (sessionState === 'completed' || sessionState === 'setup') {
                onBack();
            }
        }
    });
    const handleQuickAction = async (action) => {
        if (!currentTask)
            return;
        setIsLoading(true);
        try {
            const taskDuration = Math.floor((Date.now() - currentTask.startTime.getTime()) / 1000 / 60);
            // Add user action message first
            const actionMessages = {
                skip: `[USER] 1 - pomijam to zadanie`,
                completed: `[USER] 2 - zrobiłem to zadanie!`,
                completed_end_session: `[USER] 2 - zrobiłem zadanie, kończę sesję`,
                end_session: `[USER] 3 - kończę sesję teraz`
            };
            setSessionMessages(prev => [...prev, {
                    role: 'user',
                    content: actionMessages[action],
                    timestamp: new Date()
                }]);
            // Update task status in database if completed
            if ((action === 'completed' || action === 'completed_end_session') && currentTask.id) {
                try {
                    await updateTask(currentTask.id, { status: 'completed' });
                    console.log('[OK] Task marked as completed in database:', currentTask.id);
                }
                catch (dbError) {
                    console.error('[ERROR] Failed to update task status:', dbError);
                }
            }
            // Track skipped tasks
            if (action === 'skip' && currentTask.id) {
                setSkippedTaskIds(prev => [...prev, currentTask.id]);
                console.log('[SKIP] Added task to skipped list:', currentTask.id);
            }
            if (action === 'end_session') {
                setSessionMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `[END] Sesja zakończona.`,
                        timestamp: new Date()
                    }]);
                setSessionState('completed');
                setIsLoading(false);
                return;
            }
            // Get next task from AI
            const result = await executeQuickAction(action, {
                currentTask,
                taskDuration,
                sessionConfig,
                chatHistory: sessionMessages,
                skippedTaskIds
            });
            // Add AI response with next task
            if (result.message) {
                setSessionMessages(prev => [...prev, {
                        role: 'assistant',
                        content: result.message,
                        timestamp: new Date()
                    }]);
            }
            // Set next task if available
            if (result.nextTask) {
                setCurrentTask({
                    ...result.nextTask,
                    startTime: new Date()
                });
                // Add task announcement
                setSessionMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `[TARGET] **NASTĘPNE ZADANIE:** ${result.nextTask?.title}${result.nextTask?.description ? `\n\n${result.nextTask.description}` : ''}\n\n[INFO] *Szacowany czas: ${result.nextTask?.estimatedMinutes} min*`,
                        timestamp: new Date()
                    }]);
            }
            else {
                // No more tasks - suggest ending session
                setSessionMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `[END] Nie mamy więcej odpowiednich zadań na dziś. Świetna robota! Może czas zakończyć sesję? (naciśnij 3)`,
                        timestamp: new Date()
                    }]);
                setCurrentTask(null);
            }
        }
        catch (error) {
            console.error('Error in quick action:', error);
            setSessionMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '[ERROR] Przepraszam, wystąpił błąd. Spróbuj ponownie.',
                    timestamp: new Date()
                }]);
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
            setSessionMessages([
                {
                    role: 'assistant',
                    content: result.welcomeMessage,
                    timestamp: new Date()
                },
                {
                    role: 'assistant',
                    content: `[TARGET] **TWOJE PIERWSZE ZADANIE:** ${result.firstTask.title}${result.firstTask.description ? `\n\n${result.firstTask.description}` : ''}`,
                    timestamp: new Date()
                }
            ]);
            setSessionState('active');
        }
        catch (error) {
            console.error('Error starting focus session:', error);
            // Handle error - maybe go back to setup
        }
        setIsLoading(false);
    };
    const renderSetup = () => {
        switch (setupStep) {
            case 'time':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "ILE MASZ CZASU NA T\u0118 SESJ\u0118?" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "white", children: "Wpisz liczb\u0119 minut (np. 60, 90, 120): " }) }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: timeInput, onChange: setTimeInput, onSubmit: () => {
                                    const time = parseInt(timeInput);
                                    if (time > 0) {
                                        setSessionConfig(prev => ({ ...prev, availableTime: time }));
                                        setSetupStep('energy');
                                    }
                                }, placeholder: "60" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - dalej, Esc - powr\u00F3t" }) })] }));
            case 'energy':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "\u26A1 JAKI MASZ POZIOM ENERGII?" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: energyOptions, onSelect: (item) => {
                                    setSessionConfig(prev => ({ ...prev, energyLevel: item.value }));
                                    setSetupStep('location');
                                } }) })] }));
            case 'location':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "GDZIE JESTE\u015A FIZYCZNIE?" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "To pomo\u017Ce AI dobra\u0107 odpowiednie zadania" }) }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: locationInput, onChange: setLocationInput, onSubmit: () => {
                                    setSessionConfig(prev => ({ ...prev, location: locationInput }));
                                    setSetupStep('goal');
                                }, placeholder: "np. biuro, dom, kawiarnia, poci\u0105g..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - dalej, Esc - powr\u00F3t" }) })] }));
            case 'goal':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "[TARGET] MASZ KONKRETNY CEL/KIERUNEK NA T\u0118 SESJ\u0118?" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Opcjonalne - pomaga AI dobra\u0107 priorytetowe zadania" }) }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: goalInput, onChange: setGoalInput, onSubmit: () => {
                                    setSessionConfig(prev => ({ ...prev, goalContext: goalInput }));
                                    handleStartSession();
                                }, placeholder: "np. przygotowanie do prezentacji, sprz\u0105tanie..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - rozpocznij sesj\u0119, Esc - powr\u00F3t" }) })] }));
            case 'starting':
                return (_jsx(Box, { justifyContent: "center", children: _jsx(Text, { color: "yellow", children: "AI przygotowuje Twoj\u0105 sesj\u0119 fokusow\u0105..." }) }));
            default:
                return null;
        }
    };
    const renderActiveSession = () => {
        if (!currentTask)
            return null;
        const taskDuration = Math.floor((Date.now() - currentTask.startTime.getTime()) / 1000 / 60);
        return (_jsxs(Box, { flexDirection: "column", height: "100%", children: [_jsxs(Box, { flexDirection: "column", flexGrow: 1, marginBottom: 2, children: [sessionMessages.map((msg, index) => (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: msg.role === 'user' ? 'blue' :
                                    msg.role === 'system' ? 'yellow' : 'green', children: [msg.role === 'user' ? '[USER] ' :
                                        msg.role === 'system' ? '[AI] ' : '[BRAIN] ', msg.content] }) }, index))), isLoading && (_jsx(Box, { children: _jsx(LoadingSpinner, { message: "AI wybiera zadanie...", type: "dots", color: "gray" }) }))] }), currentTask && !isLoading && (_jsxs(Box, { flexDirection: "column", marginBottom: 2, borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "[AKTUALNE ZADANIE]" }) }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "white", children: currentTask.title }) }), currentTask.description && (_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "gray", children: currentTask.description }) })), _jsx(Box, { children: _jsxs(Text, { color: "yellow", children: ["[TIME] ", taskDuration, " minut"] }) })] })), currentTask && !isLoading && (_jsxs(Box, { flexDirection: "column", alignItems: "center", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "white", bold: true, children: "Co chcesz zrobi\u0107?" }) }), _jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { color: "blue", children: "1 - Pomi\u0144 to zadanie" }), _jsx(Text, { color: "green", children: "2 - Zrobi\u0142em to zadanie!" }), _jsx(Text, { color: "red", children: "3 - Zako\u0144cz sesj\u0119" })] }), _jsx(Box, { children: _jsx(Text, { color: "gray", dimColor: true, children: "Naci\u015Bnij 1, 2 lub 3" }) })] }))] }));
    };
    const renderCompleted = () => {
        return (_jsxs(Box, { flexDirection: "column", alignItems: "center", children: [_jsx(Text, { color: "green", bold: true, children: "[OK] SESJA UKO\u0143CZONA" }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "white", children: "\u015Awietna robota! Sesja fokusowa zosta\u0142a zako\u0144czona." }) }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", children: "Naci\u015Bnij Esc aby wr\u00F3ci\u0107 do menu g\u0142\u00F3wnego" }) })] }));
    };
    return (_jsxs(Box, { flexDirection: "column", height: "100%", children: [_jsx(Header, {}), _jsx(Box, { flexDirection: "column", alignItems: "center", flexGrow: 1, children: _jsx(Box, { borderStyle: "round", borderColor: "grey", paddingX: 1, paddingY: 2, minWidth: 80, width: "100%", children: _jsxs(Box, { flexDirection: "column", width: "100%", children: [sessionState === 'setup' && renderSetup(), sessionState === 'active' && renderActiveSession(), sessionState === 'completed' && renderCompleted()] }) }) })] }));
};
//# sourceMappingURL=FocusSession.js.map
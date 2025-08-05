import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import { createTask } from '../services/tasks.js';
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
export const AddTask = ({ onBack, onTaskAdded }) => {
    const [step, setStep] = useState('title');
    const [title, setTitle] = useState('');
    const [energyLevel, setEnergyLevel] = useState();
    const [timeNeeded, setTimeNeeded] = useState();
    const [priority, setPriority] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
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
                const supabaseError = err;
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
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Nazwa zadania:" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: title, onChange: setTitle, onSubmit: () => setStep('energy'), placeholder: "Wpisz nazw\u0119 zadania..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Enter - dalej, Esc - powr\u00F3t" }) })] }));
            case 'energy':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Potrzebna energia (opcjonalnie):" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'Pomiń - AI ustali później', value: 'skip' },
                                    ...energyOptions
                                ], onSelect: (item) => {
                                    if (item.value === 'skip') {
                                        setEnergyLevel(undefined);
                                    }
                                    else {
                                        setEnergyLevel(item.value);
                                    }
                                    setStep('time');
                                } }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "\u2191\u2193 wybierz, Enter - dalej, Esc - powr\u00F3t" }) })] }));
            case 'time':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Potrzebny czas (opcjonalnie):" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'Pomiń - AI ustali później', value: 'skip' },
                                    ...timeOptions
                                ], onSelect: (item) => {
                                    if (item.value === 'skip') {
                                        setTimeNeeded(undefined);
                                    }
                                    else {
                                        setTimeNeeded(item.value);
                                    }
                                    setStep('priority');
                                } }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "\u2191\u2193 wybierz, Enter - dalej, Esc - powr\u00F3t" }) })] }));
            case 'priority':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Priorytet (opcjonalnie):" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'Pomiń - AI ustali później', value: 'skip' },
                                    ...priorityOptions
                                ], onSelect: (item) => {
                                    if (item.value === 'skip') {
                                        setPriority(undefined);
                                    }
                                    else {
                                        setPriority(item.value);
                                    }
                                    setStep('confirm');
                                } }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "\u2191\u2193 wybierz, Enter - dalej, Esc - powr\u00F3t" }) })] }));
            case 'confirm':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "Podsumowanie zadania:" }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Nazwa: " }), _jsx(Text, { color: "cyan", children: title })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Energia: " }), _jsx(Text, { color: energyLevel ? "cyan" : "gray", children: energyLevel || 'AI ustali' })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Czas: " }), _jsx(Text, { color: timeNeeded ? "cyan" : "gray", children: timeNeeded || 'AI ustali' })] }), _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Priorytet: " }), _jsx(Text, { color: priority ? "cyan" : "gray", children: priority || 'AI ustali' })] })] }), _jsx(Box, { marginTop: 2, children: _jsx(SelectInput, { items: [
                                    { label: '1. Zapisz zadanie', value: 'save' },
                                    { label: '2. Powrót do edycji', value: 'back' }
                                ], onSelect: (item) => {
                                    if (item.value === 'save') {
                                        handleSubmit();
                                    }
                                    else {
                                        setStep('title');
                                    }
                                } }) })] }));
            default:
                return null;
        }
    };
    if (isSubmitting) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, minWidth: 45, justifyContent: "center", children: _jsx(Text, { color: "yellow", children: "\uD83D\uDCBE Zapisywanie zadania..." }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { flexDirection: "column", alignItems: "center", children: _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, minWidth: 45, children: _jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsx(Text, { color: "cyan", bold: true, children: "\u2795 DODAJ NOWE ZADANIE" }), _jsxs(Box, { marginTop: 1, children: [error && (_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: "red", children: ["\u274C ", error] }) })), renderStep()] })] }) }) })] }));
};
//# sourceMappingURL=AddTask.js.map
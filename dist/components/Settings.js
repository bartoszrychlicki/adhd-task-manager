import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
import LoadingSpinner from './LoadingSpinner.js';
import { colors } from '../utils/theme.js';
import { getUserId, setUserId, getConfigPath } from '../services/config.js';
const settingsMenuItems = [
    { label: '👤 Zmień User ID', value: 'change-user-id' },
    { label: 'ℹ️  Informacje o konfiguracji', value: 'info' },
    { label: '↩️  Powrót do menu głównego', value: 'back' }
];
export const Settings = ({ onBack }) => {
    const [state, setState] = useState('menu');
    const [currentUserId, setCurrentUserId] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        const loadCurrentUserId = async () => {
            try {
                const userId = await getUserId();
                setCurrentUserId(userId);
                setNewUserId(userId);
            }
            catch (error) {
                setMessage('Błąd podczas ładowania konfiguracji');
            }
        };
        loadCurrentUserId();
    }, []);
    useInput((input, key) => {
        if (key.escape) {
            if (state === 'menu') {
                onBack();
            }
            else {
                setState('menu');
                setMessage(null);
            }
        }
    });
    const handleMenuSelect = (value) => {
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
        }
        catch (error) {
            setMessage('Błąd podczas zapisywania User ID');
        }
        finally {
            setIsLoading(false);
        }
    };
    const renderCurrentState = () => {
        switch (state) {
            case 'menu':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "[SETTINGS]  USTAWIENIA" }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: "gray", children: ["Obecny User ID: ", colors.primary(currentUserId)] }) }), _jsx(Box, { marginTop: 2, children: _jsx(SelectInput, { items: settingsMenuItems, onSelect: (item) => handleMenuSelect(item.value) }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "\u2191\u2193 wybierz, Enter potwierd\u017A, Esc powr\u00F3t" }) })] }));
            case 'change-user-id':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "[USER] ZMIE\u0143 USER ID" }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: "gray", children: ["Obecny User ID: ", colors.primary(currentUserId)] }) }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "yellow", children: "Nowy User ID (UUID):" }) }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: newUserId, onChange: setNewUserId, onSubmit: handleUserIdSubmit, placeholder: "a49fd6df-c08e-481c-a535-fdf1f50bd509" }) }), message && (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: message.includes('pomyślnie') ? 'green' : 'red', children: [message.includes('pomyślnie') ? '[OK]' : '[ERROR]', " ", message] }) })), isLoading && (_jsx(Box, { marginTop: 1, children: _jsx(LoadingSpinner, { message: "Zapisywanie...", type: "dots", color: "yellow" }) })), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", children: "Enter zapisz, Esc powr\u00F3t" }) })] }));
            case 'info':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "[INFO]  INFORMACJE O KONFIGURACJI" }), _jsxs(Box, { marginTop: 2, flexDirection: "column", children: [_jsxs(Text, { children: [_jsx(Text, { color: "white", children: "User ID: " }), _jsx(Text, { color: "cyan", children: currentUserId })] }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "Plik konfiguracji: " }), _jsx(Text, { color: "cyan", children: getConfigPath() })] }) }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", children: "User ID jest u\u017Cywane do identyfikacji Twoich zada\u0144 w bazie danych. Mo\u017Cesz je zmieni\u0107, aby wsp\u00F3\u0142dzieli\u0107 konfiguracj\u0119 z innymi urz\u0105dzeniami lub przekaza\u0107 dost\u0119p innemu u\u017Cytkownikowi." }) })] }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", children: "Esc powr\u00F3t" }) })] }));
            default:
                return null;
        }
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { flexDirection: "column", alignItems: "center", children: _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, paddingY: 1, minWidth: 60, children: _jsx(Box, { flexDirection: "column", width: "100%", children: renderCurrentState() }) }) })] }));
};
//# sourceMappingURL=Settings.js.map
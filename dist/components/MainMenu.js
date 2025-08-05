import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Header } from './Header.js';
const menuItems = [
    { label: '1. Dodaj nowe zadanie', value: 'add-task', key: '1' },
    { label: '2. Zarządzaj zadaniami', value: 'manage-tasks', key: '2' },
    { label: '3. Zarządzaj celami', value: 'manage-goals', key: '3' },
    { label: '4. Focus Mode', value: 'focus-mode', key: '4' },
    { label: '5. Ustawienia', value: 'settings', key: '5' },
    { label: '6. Wyjście', value: 'exit', key: '6' }
];
export const MainMenu = ({ onSelect }) => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, {}), _jsx(Box, { flexDirection: "column", alignItems: "center", children: _jsx(Box, { borderStyle: "round", borderColor: "green", paddingX: 1, paddingY: 1, minWidth: 55, children: _jsxs(Box, { flexDirection: "column", width: "100%", children: [_jsx(SelectInput, { items: menuItems, onSelect: (item) => onSelect(item.value) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "U\u017Cyj \u2191\u2193 lub cyfr do nawigacji, Enter aby wybra\u0107" }) })] }) }) })] }));
};
//# sourceMappingURL=MainMenu.js.map
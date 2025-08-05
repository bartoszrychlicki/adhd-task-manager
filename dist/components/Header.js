import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Box } from 'ink';
import figlet from 'figlet';
export const Header = () => {
    // Generate ASCII art with figlet - using retro fonts
    const adhdText = figlet.textSync('ADHD', {
        font: 'Computer',
        horizontalLayout: 'fitted',
        verticalLayout: 'default'
    });
    const taskManagerText = figlet.textSync('TASK MANAGER', {
        font: 'Small',
        horizontalLayout: 'fitted',
        verticalLayout: 'default'
    });
    return (_jsxs(Box, { flexDirection: "column", alignItems: "center", marginBottom: 2, children: [_jsx(Text, { color: "cyan", bold: true, children: adhdText }), _jsx(Box, { marginTop: 0, children: _jsx(Text, { color: "yellow", children: taskManagerText }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "magenta", bold: true, children: "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550" }) }), _jsx(Box, { marginY: 1, children: _jsx(Text, { color: "green", children: "\u2605 PRODUCTIVITY SYSTEM v1.0 \u2605 \u00A9 2024 ADHD LABS \u2605 ALL RIGHTS RESERVED \u2605" }) }), _jsx(Box, { children: _jsx(Text, { color: "magenta", bold: true, children: "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "cyan", dimColor: true, children: "[SYSTEM READY] \u2022 [64KB RAM FREE] \u2022 [PRESS ANY KEY TO CONTINUE]" }) })] }));
};
//# sourceMappingURL=Header.js.map
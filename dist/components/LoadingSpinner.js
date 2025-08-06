import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
const LoadingSpinner = ({ message = 'Ładowanie...', type = 'dots', color = 'yellow' }) => {
    const [frame, setFrame] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(prev => prev + 1);
        }, 200);
        return () => clearInterval(interval);
    }, []);
    const getSpinner = () => {
        switch (type) {
            case 'dots':
                const dots = ['.', '..', '...'];
                return dots[frame % dots.length];
            case 'spinner':
                const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                return spinner[frame % spinner.length];
            case 'bar':
                const bar = ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[====]'];
                return bar[frame % bar.length];
            default:
                return '...';
        }
    };
    return (_jsx(Box, { children: _jsxs(Text, { color: color, children: [getSpinner(), " ", message] }) }));
};
export default LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map
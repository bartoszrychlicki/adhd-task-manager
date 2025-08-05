import chalk from 'chalk';
import boxen from 'boxen';
import figlet from 'figlet';
export const colors = {
    primary: chalk.cyan,
    secondary: chalk.yellow,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.hex('#FFA500'),
    info: chalk.blue,
    muted: chalk.gray,
    white: chalk.white,
    bold: chalk.bold,
    dim: chalk.dim
};
export const createBox = (content, title) => {
    return boxen(content, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        title: title ? colors.bold(title) : undefined,
        titleAlignment: 'center'
    });
};
export const createTitle = (text) => {
    return colors.primary(figlet.textSync(text, {
        font: 'Small',
        horizontalLayout: 'fitted'
    }));
};
export const energyColors = {
    XS: chalk.green,
    S: chalk.cyan,
    M: chalk.yellow,
    L: chalk.hex('#FFA500'),
    XL: chalk.red
};
export const priorityColors = {
    A: chalk.red,
    B: chalk.yellow,
    C: chalk.green,
    D: chalk.gray
};
export const priorityIcons = {
    A: '🔴',
    B: '🟡',
    C: '🟢',
    D: '⚪'
};
//# sourceMappingURL=theme.js.map
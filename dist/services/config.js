import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
const CONFIG_DIR = join(homedir(), '.adhd-task-manager');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG = {
    userId: 'a49fd6df-c08e-481c-a535-fdf1f50bd509',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
};
export const ensureConfigDir = async () => {
    try {
        await fs.access(CONFIG_DIR);
    }
    catch {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    }
};
export const loadConfig = async () => {
    try {
        await ensureConfigDir();
        const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(configData);
    }
    catch {
        // If config doesn't exist, create it with default values
        await saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }
};
export const saveConfig = async (config) => {
    await ensureConfigDir();
    const updatedConfig = {
        ...config,
        lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');
};
export const getUserId = async () => {
    console.log('[CONFIG] Pobieranie User ID...');
    try {
        const config = await loadConfig();
        console.log('[OK] User ID pobrane:', config.userId);
        return config.userId;
    }
    catch (err) {
        console.error('[ERROR] Błąd podczas pobierania User ID:', err);
        throw err;
    }
};
export const setUserId = async (userId) => {
    const config = await loadConfig();
    config.userId = userId;
    await saveConfig(config);
};
export const getConfigPath = () => {
    return CONFIG_FILE;
};
//# sourceMappingURL=config.js.map
interface UserConfig {
    userId: string;
    createdAt: string;
    lastUpdated: string;
}
export declare const ensureConfigDir: () => Promise<void>;
export declare const loadConfig: () => Promise<UserConfig>;
export declare const saveConfig: (config: UserConfig) => Promise<void>;
export declare const getUserId: () => Promise<string>;
export declare const setUserId: (userId: string) => Promise<void>;
export declare const getConfigPath: () => string;
export {};
//# sourceMappingURL=config.d.ts.map
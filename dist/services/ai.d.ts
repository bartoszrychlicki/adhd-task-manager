import { Priority, EnergyLevel, TimeNeeded } from '../types/index.js';
interface TaskEnhancementRequest {
    title?: string;
    energy_level?: EnergyLevel;
    time_needed?: TimeNeeded;
    priority?: Priority;
    execution_time?: number;
}
interface TaskEnhancementResponse {
    energy_level?: EnergyLevel;
    time_needed?: TimeNeeded;
    priority?: Priority;
    execution_time?: number;
    reasoning?: string;
}
interface SessionConfig {
    availableTime: number;
    energyLevel: EnergyLevel;
    location: string;
    goalContext: string;
}
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}
interface CurrentTask {
    id?: string;
    title: string;
    description?: string;
    startTime: Date;
}
interface FocusTask {
    id?: string;
    title: string;
    description?: string;
    estimatedMinutes: number;
    reasoning: string;
}
interface SessionStartResult {
    firstTask: FocusTask;
    welcomeMessage: string;
}
interface QuickActionResult {
    nextTask?: FocusTask;
    message: string;
}
/**
 * Funkcja enhanceTask
 * -------------------
 * Uzupełnia brakujące pola zadania na podstawie częściowo wypełnionych danych, korzystając z modelu AI OpenAI.
 *
 * @param {TaskEnhancementRequest} partialTask - Obiekt zawierający częściowe dane zadania (np. tytuł, poziom energii, czas, priorytet, czas wykonania).
 *
 * @returns {Promise<TaskEnhancementResponse>} - Obiekt z uzupełnionymi polami (priorytet, poziom energii, czas, czas wykonania, uzasadnienie).
 *
 * @example
 * const result = await enhanceTask({ title: "Zrobić prezentację", energy_level: "M" });
 * // result = {
 * //   priority: "A",
 * //   time_needed: "25min",
 * //   execution_time: 25,
 * //   reasoning: "Prezentacja wymaga skupienia i jest ważna, dlatego priorytet A..."
 * // }
 *
 * Funkcja buduje prompt w języku polskim, przekazuje go do modelu OpenAI i oczekuje odpowiedzi w formacie JSON.
 * Uzupełnia tylko te pola, które nie zostały podane przez użytkownika.
 *
 * Zastosowanie: automatyczne klasyfikowanie i uzupełnianie zadań w aplikacji do zarządzania zadaniami.
 */
export declare const enhanceTask: (partialTask: TaskEnhancementRequest) => Promise<TaskEnhancementResponse>;
export declare const startFocusSession: (config: SessionConfig) => Promise<SessionStartResult>;
/**
 * Funkcja startFocusSession
 * -------------------------
 * Rozpoczyna nową sesję fokusową z użytkownikiem, wybierając pierwsze zadanie do wykonania na podstawie dostępnych zadań, czasu, energii i celu sesji.
 *
 * Wysyła do modelu OpenAI prompt z listą zadań użytkownika oraz parametrami sesji (czas, energia, cel), prosząc o wybór najlepszego zadania do rozpoczęcia sesji.
 * Odpowiedź AI zawiera wybrane zadanie (id, tytuł, opis pierwszego kroku, szacowany czas, krótkie uzasadnienie) oraz motywującą wiadomość powitalną.
 *
 * W przypadku błędu lub braku odpowiedzi AI, funkcja wybiera pierwsze dostępne zadanie jako fallback.
 *
 * @param {SessionConfig} config - Konfiguracja sesji (czas, energia, lokalizacja, cel)
 * @returns {Promise<{ firstTask: { id: string, title: string, description: string, estimatedMinutes: number, reasoning: string }, welcomeMessage: string }>}
 *
 * Przykład użycia:
 * const result = await startFocusSession({ availableTime: 60, energyLevel: 'M', location: '', goalContext: 'Skończyć prezentację' });
 * // result.firstTask - wybrane zadanie na start sesji
 * // result.welcomeMessage - motywująca wiadomość od AI
 */
export declare const executeQuickAction: (action: "skip" | "completed" | "completed_end_session" | "end_session", context: {
    currentTask: CurrentTask;
    taskDuration: number;
    sessionConfig: SessionConfig;
    chatHistory: ChatMessage[];
    skippedTaskIds: string[];
}) => Promise<QuickActionResult>;
export declare const sendChatMessage: (message: string, context: {
    currentTask: CurrentTask;
    sessionConfig: SessionConfig;
    chatHistory: ChatMessage[];
}) => Promise<string>;
export {};
//# sourceMappingURL=ai.d.ts.map
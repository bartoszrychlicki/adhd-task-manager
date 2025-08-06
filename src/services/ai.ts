import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Task, Priority, EnergyLevel, TimeNeeded } from '../types/index.js';
import { getTasks } from './tasks.js';
import { getGoals } from './goals.js';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('[CONFIG] Environment check:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 8) + '...'
});

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('[ERROR] OPENAI_API_KEY not found in environment variables');
  console.error('[INFO] Please add OPENAI_API_KEY to your .env file');
  throw new Error('OpenAI API key is required');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For development - in production use backend proxy
});

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

// Focus Mode interfaces
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

export const enhanceTask = async (partialTask: TaskEnhancementRequest): Promise<TaskEnhancementResponse> => {
  try {
    // Build prompt based on provided fields
    const providedFields = Object.entries(partialTask)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const prompt = `
Jesteś asystentem AI pomagającym w zarządzaniu zadaniami dla osób z ADHD. 
Otrzymujesz częściowo wypełnione zadanie i musisz uzupełnić brakujące pola.

DANE ZADANIA:
${providedFields}

UZUPEŁNIJ BRAKUJĄCE POLA:

1. PRIORITY (jeśli brak): Określ priorytet jako jedną z wartości:
   - "A": krytyczne, pilne, blokuje inne zadania
   - "B": ważne ale może poczekać kilka dni  
   - "C": przydatne do zrobienia
   - "D": może kiedyś w przyszłości

2. ENERGY_LEVEL (jeśli brak): Oszacuj potrzebną energię:
   - "XS": bardzo mała energia (5 min)
   - "S": mała energia (15 min) 
   - "M": średnia energia (30 min)
   - "L": duża energia (60 min)
   - "XL": bardzo duża energia (90+ min)

3. TIME_NEEDED (jeśli brak): Oszacuj potrzebny czas:
   - "1min": bardzo szybkie (1-5 min)
   - "15min": krótkie (5-15 min)
   - "25min": standardowe (15-30 min)
   - "more": długie (30+ min)

4. EXECUTION_TIME (jeśli brak): Dokładny czas w minutach (5, 15, 25, 45, 60, 90)

ZWRÓĆ ODPOWIEDŹ W FORMACIE JSON:
{
  "priority": "...",
  "energy_level": "...",
  "time_needed": "...", 
  "execution_time": ...,
  "reasoning": "Krótkie wyjaśnienie dlaczego tak uzupełniłeś"
}

WAŻNE: Uzupełnij TYLKO te pola, które były puste. Nie zmieniaj pól już podanych przez użytkownika.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Jesteś ekspertem w produktywności i zarządzaniu zadaniami dla osób z ADHD. Odpowiadasz zawsze w języku polskim i w formacie JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content?.trim();
    if (!responseText) {
      throw new Error('Brak odpowiedzi od AI');
    }

    // Parse JSON response
    let aiResponse: TaskEnhancementResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('Błąd parsowania odpowiedzi AI:', responseText);
      // Fallback - return empty enhancement
      return {};
    }

    // Validate response
    const validPriorities: Priority[] = ['A', 'B', 'C', 'D'];
    const validEnergyLevels: EnergyLevel[] = ['XS', 'S', 'M', 'L', 'XL'];
    const validTimeNeeded: TimeNeeded[] = ['1min', '15min', '25min', 'more'];

    if (aiResponse.priority && !validPriorities.includes(aiResponse.priority)) {
      aiResponse.priority = 'B'; // Default fallback
    }

    if (aiResponse.energy_level && !validEnergyLevels.includes(aiResponse.energy_level)) {
      aiResponse.energy_level = 'M'; // Default fallback
    }

    if (aiResponse.time_needed && !validTimeNeeded.includes(aiResponse.time_needed)) {
      aiResponse.time_needed = '25min'; // Default fallback
    }

    if (aiResponse.execution_time && (aiResponse.execution_time < 1 || aiResponse.execution_time > 480)) {
      aiResponse.execution_time = 25; // Default fallback
    }

    console.log('[AI] AI Enhancement:', {
      input: partialTask,
      output: aiResponse
    });

    return aiResponse;

  } catch (error) {
    console.error('[ERROR] Błąd podczas komunikacji z AI:', error);
    
    // Graceful fallback - zwróć podstawowe wartości
    const fallback: TaskEnhancementResponse = {};
    
    if (!partialTask.priority) {
      fallback.priority = 'B';
    }
    
    if (!partialTask.energy_level) {
      fallback.energy_level = 'M';
    }
    
    if (!partialTask.time_needed) {
      fallback.time_needed = '25min';
    }
    
    if (!partialTask.execution_time) {
      fallback.execution_time = 25;
    }

    return fallback;
  }
};

// Focus Mode AI Functions
export const startFocusSession = async (config: SessionConfig): Promise<SessionStartResult> => {
  try {
    console.log('[AI] Starting AI focus session with config:', config);

    // Get user's tasks and goals for context
    const [tasks, goals] = await Promise.all([
      getTasks(),
      getGoals()
    ]);

    // Filter for todo tasks only
    const availableTasks = tasks.filter(task => task.status === 'todo');
    console.log('[AI] Found', availableTasks.length, 'available todo tasks');
    console.log('[AI] All tasks with status:', tasks.map(t => ({id: t.id, title: t.title, status: t.status})));

    const systemPrompt = `
Jesteś życzliwym ale stanowczym AI coach produktywności dla osoby z ADHD. Pomagasz w sesji fokusowej wybierając najlepsze zadanie do zrobienia teraz, biorąc pod uwagę kontekst uytkownika oraz dostępne zadania.

KONTEKST SESJI:
- Dostępny czas: ${config.availableTime} minut
- Poziom energii: ${config.energyLevel} (XS=bardzo mało energii, XL=bardzo dużo energii)
- Lokalizacja: ${config.location || 'nie podano'}
- Plan/cel sesji: ${config.goalContext || 'ogólna produktywność'}

DŁUGOTERMINOWE I KRÓTKOTERMINOWE CELE UŻYTKOWNIKA:
${goals.length > 0 ? goals.map(g => `- ${g.title}: ${g.description || 'brak opisu'}`).join('\n') : 'Brak zdefiniowanych celów'}

DOSTĘPNE ZADANIA:
${availableTasks.length > 0 ? availableTasks.map(t => 
  `- "${t.title}" | Priorytet: ${t.priority} | Potrzebna energia: ${t.energy_level} | Czas: ${t.time_needed} | Status zadania: ${t.status}`
).join('\n') : 'Brak zadań do zrobienia'}

ZASADY WYBORU ZADANIA (ADHD):
- Wybieraj TYLKO JEDNO zadanie, te które najlepiej zrobić najpierw
- Korzystaj z Matrycy Eisenhowera (ważne/pilne)
- Dopasuj energię zadania do dostępnej energii użytkownika
- Dla ADHD: preferuj zadania które dają szybki sukces
- Unikaj przytłaczania długimi wyjaśnieniami
- Bądź konkretny i zwięzły

ZADANIE:
Wybierz najlepsze zadanie na start sesji fokusowej uwzględniając poziom energii, czas i priorytety.

Odpowiedz w JSON:
{
  "firstTask": {
    "id": "id_zadania_lub_null",
    "title": "tytuł zadania",
    "description": "konkretny pierwszy krok (1 zdanie)",
    "estimatedMinutes": liczba_minut,
    "reasoning": "krótko dlaczego to zadanie (max 1 zdanie)"
  },
  "welcomeMessage": "Krótka motywująca wiadomość (1-2 zdania)"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Rozpocznij moją sesję fokusową!" }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty AI response');
    }

    const result = JSON.parse(responseText);
    console.log('[AI] AI selected task for focus session:', result);

    return result;

  } catch (error) {
    console.error('[ERROR] Error starting focus session:', error);
    
    // Fallback - select first available task
    const tasks = await getTasks();
    const firstTask = tasks.find(t => t.status === 'todo');

    return {
      firstTask: {
        id: firstTask?.id,
        title: firstTask?.title || 'Zorganizuj swoje zadania',
        description: 'Przejrzyj i uporządkuj swoje zadania na dziś',
        estimatedMinutes: 25,
        reasoning: 'Start z organizacją pomoże w lepszym fokusie'
      },
      welcomeMessage: `Witaj w sesji fokusowej! Masz ${config.availableTime} minut na produktywną pracę. Zaczynajmy!`
    };
  }
};

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

export const executeQuickAction = async (
  action: 'skip' | 'completed' | 'completed_end_session' | 'end_session',
  context: {
    currentTask: CurrentTask;
    taskDuration: number;
    sessionConfig: SessionConfig;
    chatHistory: ChatMessage[];
    skippedTaskIds: string[];
  }
): Promise<QuickActionResult> => {
  try {
    if (action === 'completed_end_session' || action === 'end_session') {
      return {
        message: `Świetna robota! Twoja sesja fokusowa została zakończona. Zadanie "${context.currentTask.title}" zajęło Ci ${context.taskDuration} minut.`
      };
    }

    // Get available tasks for next task selection
    const tasks = await getTasks();
    console.log('[AI] executeQuickAction - All tasks:', tasks.map(t => ({id: t.id, title: t.title, status: t.status})));
    
    let availableTasks = tasks.filter(task => task.status === 'todo');
    console.log('[AI] executeQuickAction - Todo tasks:', availableTasks.map(t => ({id: t.id, title: t.title})));
    
    // Exclude current task from selection
    if (context.currentTask.id) {
      availableTasks = availableTasks.filter(task => task.id !== context.currentTask.id);
      console.log('[AI] Excluded current task from selection:', context.currentTask.id);
    }
    
    // Exclude skipped tasks from this session
    if (context.skippedTaskIds.length > 0) {
      availableTasks = availableTasks.filter(task => !context.skippedTaskIds.includes(task.id!));
      console.log('[AI] Excluded', context.skippedTaskIds.length, 'skipped tasks from selection');
    }
    
    console.log('[AI] Found', availableTasks.length, 'available todo tasks for next selection (after excluding current and skipped)');
    console.log('[AI] Current task being processed:', {id: context.currentTask.id, title: context.currentTask.title});
    console.log('[AI] Action being performed:', action);

    const actionMessages = {
      skip: 'Pomijam aktualne zadanie i wybieram następne',
      completed: 'Oznaczam zadanie jako ukończone i wybieram następne'
    };

    const systemPrompt = `
Jesteś życzliwym AI coach w sesji fokusowej. User właśnie: ${actionMessages[action]}

POPRZEDNIE ZADANIE: "${context.currentTask.title}" (${context.taskDuration} min)
POZOSTAŁY CZAS SESJI: ~${Math.max(0, context.sessionConfig.availableTime - context.taskDuration)} minut
ENERGIA: ${context.sessionConfig.energyLevel}

DOSTĘPNE ZADANIA (pominięte zadania z tej sesji zostały wykluczone):
${availableTasks.length > 0 ? availableTasks.map(t => 
  `- "${t.title}" | Priorytet: ${t.priority} | Energia: ${t.energy_level} | Czas: ${t.time_needed}`
).join('\n') : 'Brak więcej zadań'}

${context.skippedTaskIds.length > 0 ? `POMINIĘTE ZADANIA W TEJ SESJI: ${context.skippedTaskIds.length}` : ''}

ZASADY ADHD:
- Wybierz TYLKO JEDNO następne zadanie lub zasugeruj zakończenie
- Chwal za wykonanie zadania! 
- Bądź zwięzły (max 2 zdania)
- Uwzględnij pozostały czas i energię
- Priorytet A > B > C
- NIE wybieraj zadań które już zostały pominięte w tej sesji
- NIE wybieraj ponownie zadania "${context.currentTask.title}" które właśnie zostało ${action === 'completed' ? 'ukończone' : 'pominięte'}

${action === 'completed' ? 'GRATULUJ wykonania zadania!' : 'Pomóż wybrać lepsze zadanie.'}

Odpowiedz w JSON:
{
  "nextTask": {
    "id": "id_zadania_lub_null",
    "title": "tytuł zadania", 
    "description": "konkretny pierwszy krok",
    "estimatedMinutes": liczba_minut,
    "reasoning": "krótko dlaczego to zadanie"
  },
  "message": "Krótka wiadomość z gratulacjami/motywacją (1-2 zdania)"
}

Jeśli brak czasu/zadań, ustaw nextTask na null i zasugeruj zakończenie.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Akcja: ${action}` }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const responseText = completion.choices[0].message.content;
    console.log('[AI] Raw AI response text:', responseText);
    if (!responseText) {
      throw new Error('Empty AI response');
    }

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('[AI] AI quick action result:', result);
    } catch (parseError) {
      console.error('[AI] Failed to parse AI response:', responseText);
      console.error('[AI] Parse error:', parseError);
      throw new Error('AI response is not valid JSON');
    }
    console.log('[AI] Available tasks sent to AI:', availableTasks.map(t => `${t.title} (${t.id})`));
    
    if (!result.nextTask && availableTasks.length > 0) {
      console.warn('[AI] AI returned null nextTask despite having available tasks!');
      console.log('[AI] Fallback: selecting first available task');
      result.nextTask = {
        id: availableTasks[0].id,
        title: availableTasks[0].title,
        description: 'Kontynuuj to zadanie',
        estimatedMinutes: availableTasks[0].execution_time || 25,
        reasoning: 'Fallback task selection'
      };
    }

    return result;

  } catch (error) {
    console.error('[ERROR] Error in quick action:', error);
    
    return {
      message: 'Wystąpił błąd, ale kontynuujemy sesję! Co chcesz robić dalej?'
    };
  }
};

export const sendChatMessage = async (
  message: string,
  context: {
    currentTask: CurrentTask;
    sessionConfig: SessionConfig;
    chatHistory: ChatMessage[];
  }
): Promise<string> => {
  try {
    const systemPrompt = `
Jesteś życzliwym AI coach produktywności w trakcie sesji fokusowej dla osoby z ADHD.

AKTUALNE ZADANIE: "${context.currentTask.title}"
CZAS PRACY NAD ZADANIEM: ${Math.floor((Date.now() - context.currentTask.startTime.getTime()) / 1000 / 60)} minut
ENERGIA USERA: ${context.sessionConfig.energyLevel}
LOKALIZACJA: ${context.sessionConfig.location}

ZASADY KOMUNIKACJI ADHD:
- Bądź pomocny, motywujący ale zwięzły
- Pomagaj z problemami przy aktualnym zadaniu  
- Sugeruj konkretne kroki do wykonania
- KRÓTKO: maksymalnie 2-3 zdania w odpowiedzi
- Unikaj długich wyjaśnień
- Bądź stanowczy gdy trzeba wrócić do zadania

Odpowiadaj bezpośrednio, nie w JSON.
`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...context.chatHistory.slice(-6).map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages,
      temperature: 0.8,
      max_tokens: 150
    });

    const response = completion.choices[0].message.content || 'Przepraszam, nie mogę teraz odpowiedzieć.';
    console.log('[AI] AI chat response:', response);

    return response;

  } catch (error) {
    console.error('[ERROR] Error in chat message:', error);
    return 'Wystąpił błąd podczas komunikacji. Jak mogę Ci pomóc z aktualnym zadaniem?';
  }
};
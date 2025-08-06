# AI Task Enhancement Setup

## Overview
AI automatycznie uzupełnia brakujące pola w zadaniach na podstawie tych, które użytkownik wypełnił.

## Konfiguracja

### 1. Klucz OpenAI
Dodaj swój klucz OpenAI API do pliku `.env`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

### 2. Jak to działa

Kiedy użytkownik tworzy zadanie, AI automatycznie:

1. **Sprawdza** które pola są puste
2. **Analizuje** podany tytuł i wypełnione pola  
3. **Uzupełnia** brakujące pola:
   - `priority`: A/B/C/D na podstawie pilności
   - `energy_level`: XS/S/M/L/XL na podstawie trudności
   - `time_needed`: 1min/15min/25min/more na podstawie typu zadania
   - `execution_time`: dokładny czas w minutach

### 3. Przykłady działania

**Input:** `title: "Zadzwonić do dentysty"`
**AI Output:**
- `priority`: "B" (ważne ale nie pilne)
- `energy_level`: "S" (mała energia)
- `time_needed`: "15min" 
- `execution_time`: 10

**Input:** `title: "Napisać raport kwartalny"`
**AI Output:**
- `priority`: "A" (ważny deadline)
- `energy_level`: "L" (duża koncentracja)
- `time_needed`: "more"
- `execution_time`: 120

### 4. Fallback
Jeśli AI nie działa lub zwraca błędy, system używa bezpiecznych wartości domyślnych:
- `priority`: "B"
- `energy_level`: "M" 
- `time_needed`: "25min"
- `execution_time`: 25

## Implementacja

### Pliki:
- `src/services/ai.ts` - logika AI
- `src/services/tasks.ts` - integracja z tworzeniem zadań
- `.env.example` - przykład konfiguracji

### Koszty:
- Używa GPT-3.5-turbo (~$0.002 za zadanie)
- Średnio 200 tokenów na request
- Koszt: ~$0.40 za 1000 zadań

### Security:
⚠️ **Development**: API key w przeglądarce (dangerouslyAllowBrowser: true)
🔐 **Production**: Przenieś do backend proxy dla bezpieczeństwa

## Testing

Przetestuj tworząc zadanie tylko z tytułem - pozostałe pola powinny zostać automatycznie uzupełnione przez AI.
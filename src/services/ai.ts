// ===========================================
// AI Service for RestoHub
// Supports Groq (free, fast) and Minimax
// ===========================================

import { ScheduleState, AIResponse, ALL_DAYS } from '../types/index';

// API Configuration
const GROQ_API_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const MINIMAX_API_BASE = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

// Get API keys from environment
const getGroqApiKey = (): string => import.meta.env.VITE_GROQ_API_KEY || '';
const getMinimaxApiKey = (): string => import.meta.env.VITE_MINIMAX_API_KEY || '';
const getMinimaxGroupId = (): string => import.meta.env.VITE_MINIMAX_GROUP_ID || '';

// Detect which API to use
type ApiProvider = 'groq' | 'minimax';

const getApiProvider = (): ApiProvider => {
  const groqKey = getGroqApiKey();
  const minimaxKey = getMinimaxApiKey();
  
  if (minimaxKey && minimaxKey.length > 0) {
    return 'minimax';
  }
  if (groqKey && groqKey.length > 0) {
    return 'groq';
  }
  return 'groq';
};

const cleanJsonOutput = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

export const processScheduleRequest = async (
  prompt: string,
  currentState: ScheduleState,
  signal?: AbortSignal
): Promise<AIResponse> => {
  const provider = getApiProvider();
  
  if (provider === 'minimax' && !getMinimaxApiKey()) {
    throw new Error('Minimax API ključ nije pronađen. Dodaj VITE_MINIMAX_API_KEY u .env.local.');
  }
  if (provider === 'groq' && !getGroqApiKey()) {
    throw new Error('Groq API ključ nije pronađen. Dodaj VITE_GROQ_API_KEY u .env.local.');
  }

  const allowedDuties = currentState.duties.map(d => d.label).join(', ');

  const employeesWithAvailability = currentState.employees.map(e => ({
    id: e.id,
    name: e.name,
    role: e.role,
    availability: e.availability || ALL_DAYS
  }));

  const systemMessage = `Ti si RestoHub AI, precizan algoritam za raspoređivanje osoblja u restoranu.

CILJ: Generiši ili ažuriraj JSON objekat koji predstavlja raspored smjena.

PRIORITET 1: KORISNIČKA PRAVILA (OBAVEZNO)
${currentState.aiRules || 'Nema posebnih pravila.'}

PRIORITET 2: OGRANIČENJA
- Dostupnost: Radnik se NE SMIJE dodijeliti smjeni ako dan nije u availability listi.
- Uloge: Poštuj uloge (Chef, Bartender, Server, itd.)

PRIORITET 3: KONTEKST
- Radnici: ${JSON.stringify(employeesWithAvailability)}
- Smjene: ${JSON.stringify(currentState.shifts)}
- Trenutni raspored: ${JSON.stringify(currentState.assignments)}
- Dozvoljene dužnosti: [${allowedDuties}]
- Trenutna sedmica: ${currentState.currentWeekId}

IZLAZ (SAMO JSON, bez markdown):
{
  "message": "Objašnjenje na srpskom/hrvatskom šta je urađeno",
  "newAssignments": [{"shiftId": "id", "employeeId": "id", "specialDuty": "duty"}],
  "employeesToAdd": [{"name": "Ime", "role": "Uloga"}]
}`;

  try {
    let response: Response;
    let responseData: Record<string, unknown>;

    if (provider === 'minimax') {
      // Minimax API call
      response = await fetch(MINIMAX_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getMinimaxApiKey()}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_output_tokens: 4096,
        }),
        signal,
      });
    } else {
      // Groq API call
      response = await fetch(GROQ_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getGroqApiKey()}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
        signal,
      });
    }

    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    if (response.ok) {
      responseData = await response.json();
      
      let content = '';
      if (provider === 'minimax') {
        const minimaxData = responseData as Record<string, unknown>;
        const choices = minimaxData.choices as Array<{ message?: { content?: string } }> | undefined;
        content = choices?.[0]?.message?.content || '';
      } else {
        const groqData = responseData as { choices?: Array<{ message?: { content?: string } }> };
        content = groqData.choices?.[0]?.message?.content || '';
      }
      
      const cleanedText = cleanJsonOutput(content);
      
      try {
        const parsed = JSON.parse(cleanedText);
        return {
          message: parsed.message || 'Raspored je generisan.',
          assignments: parsed.newAssignments || [],
          newEmployees: parsed.employeesToAdd || [],
        };
      } catch {
        throw new Error('Format odgovora nije ispravan.');
      }
    }

    // Error handling
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    const errorData = await response.json().catch(() => ({}));
    const errorObj = errorData as Record<string, { msg?: string; message?: string }>;
    const providerName = provider === 'minimax' ? 'Minimax' : 'Groq';
    console.error(`${providerName} API Error:`, response.status, errorData);
    throw new Error(`API greška (${response.status}): ${errorObj.base_resp?.msg || errorObj.error?.message || 'Nepoznata greška'}`);

  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.message === 'AbortError')) {
      throw error;
    }
    console.error('AI Service Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Došlo je do greške';
    throw new Error(errMsg);
  }
};

// Helper to check if API is configured
export const isAiConfigured = (): boolean => {
  const provider = getApiProvider();
  if (provider === 'minimax') {
    return !!getMinimaxApiKey();
  }
  return !!getGroqApiKey();
};

// Helper to get API status
export const getAiStatus = (): { configured: boolean; message: string; provider: string } => {
  const provider = getApiProvider();
  
  if (provider === 'minimax') {
    const key = getMinimaxApiKey();
    if (!key) {
      return { 
        configured: false, 
        message: 'Minimax API ključ nije podešen. Dodajte VITE_MINIMAX_API_KEY u .env.local',
        provider: 'minimax'
      };
    }
    return { configured: true, message: 'Minimax AI je spreman.', provider: 'minimax' };
  } else {
    const key = getGroqApiKey();
    if (!key) {
      return { 
        configured: false, 
        message: 'Groq API ključ nije podešen. Dodajte VITE_GROQ_API_KEY u .env.local',
        provider: 'groq'
      };
    }
    return { configured: true, message: 'Groq AI je spreman.', provider: 'groq' };
  }
};

// Export ALL_DAYS for use in prompts
export { DayOfWeek, ALL_DAYS } from '../types/index';

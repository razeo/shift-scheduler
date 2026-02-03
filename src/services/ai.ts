// ===========================================
// AI Service for RestoHub
// Handles communication with Groq API (free, fast)
// ===========================================

import { ScheduleState, AIResponse, ALL_DAYS } from '../types/index';

const API_BASE = 'https://api.groq.com/openai/v1/chat/completions';

const getApiKey = (): string => {
  return import.meta.env.VITE_GROQ_API_KEY || '';
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
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API ključ nije pronađen. Dodaj VITE_GROQ_API_KEY u .env.local fajl.');
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
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Fast, free tier available
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal,
    });

    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error:', response.status, errorData);
      throw new Error(`API greška (${response.status}): ${errorData.error?.message || 'Nepoznata greška'}`);
    }

    const data = await response.json();

    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    const content = data.choices?.[0]?.message?.content || '';
    const cleanedText = cleanJsonOutput(content);

    try {
      const parsed = JSON.parse(cleanedText);
      return {
        message: parsed.message || 'Raspored je generisan.',
        assignments: parsed.newAssignments || [],
        newEmployees: parsed.employeesToAdd || [],
      };
    } catch {
      console.error('JSON Parse Error. Raw:', content);
      throw new Error('Format odgovora nije ispravan. Pokušajte ponovo.');
    }
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.message === 'AbortError')) {
      throw error;
    }
    console.error('AI Service Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Došlo je do greške';
    throw new Error(errorMessage || 'Došlo je do greške u komunikaciji sa AI servisom.');
  }
};

// Helper to check if API is configured
export const isAiConfigured = (): boolean => {
  return !!getApiKey();
};

// Helper to get API status
export const getAiStatus = (): { configured: boolean; message: string } => {
  const key = getApiKey();
  if (!key) {
    return { 
      configured: false, 
      message: 'API ključ nije podešen. Dodajte VITE_GROQ_API_KEY u .env.local' 
    };
  }
  return { configured: true, message: 'AI je spreman za korištenje.' };
};

// Export ALL_DAYS for use in prompts
export { DayOfWeek, ALL_DAYS } from '../types/index';

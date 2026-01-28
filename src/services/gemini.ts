import { ScheduleState, Assignment } from "../types";

const API_BASE = "https://api.minimax.io/anthropic/v1/messages";

const getApiKey = (): string => {
  return import.meta.env.VITE_MINIMAX_API_KEY || '';
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
): Promise<{
  message: string;
  assignments: Omit<Assignment, 'id' | 'weekId'>[];
  newEmployees?: { name: string; role: string }[];
}> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      message: "API ključ nije pronađen. Dodaj VITE_MINIMAX_API_KEY u .env.local fajl.",
      assignments: currentState.assignments,
    };
  }

  const allowedDuties = currentState.duties.map(d => d.label).join(", ");

  const simplifiedEmployees = currentState.employees.map(e => ({
    id: e.id,
    name: e.name,
    role: e.role,
    availability: e.availability
  }));

  const simplifiedShifts = currentState.shifts.map(s => ({
    id: s.id,
    label: s.label,
    day: s.day,
    time: `${s.startTime}-${s.endTime}`
  }));

  const simplifiedAssignments = currentState.assignments.map(a => ({
    shiftId: a.shiftId,
    employeeId: a.employeeId,
    specialDuty: a.specialDuty
  }));

  const systemInstruction = `Ti si ShiftMaster AI, precizan algoritam za raspoređivanje osoblja u restoranu.

CILJ: Generiši ili ažuriraj JSON objekat koji predstavlja raspored smjena.

PRIORITET 1: KORISNIČKA PRAVILA (OBAVEZNO)
${currentState.aiRules || "Nema posebnih pravila."}

PRIORITET 2: OGRANIČENJA
- Dostupnost: Radnik se NE SMIJE dodijeliti smjeni ako dan nije u availability listi.
- Uloge: Poštuj uloge (Bartender, Server, Head Waiter, itd.)

PRIORITET 3: KONTEKST
- Radnici: ${JSON.stringify(simplifiedEmployees)}
- Smjene: ${JSON.stringify(simplifiedShifts)}
- Trenutni raspored: ${JSON.stringify(simplifiedAssignments)}
- Dozvoljene dužnosti: [${allowedDuties}]

INSTRUKCIJE ZA IZLAZ:
1. 'newAssignments' MORA sadržavati KOMPLETAN spisak svih dodjela za ovu nedjelju.
   - Prepisi sve postojeće dodjele koje se ne mijenjaju.
   - Dodaj/ukloni prema zahtjevu korisnika.
   - NE VRACAJ samo diff!

2. Vrati SAMO validan JSON (bez markdown), sa ovom strukturom:
{
  "message": "Objašnjenje na srpskom šta je urađeno",
  "newAssignments": [{"shiftId": "id", "employeeId": "id", "specialDuty": "duty"}],
  "employeesToAdd": [{"name": "Ime", "role": "Uloga"}]
}

ZAHTJEV: "${prompt}"`;

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.1',
        max_tokens: 4096,
        temperature: 0.1,
        system: systemInstruction,
        messages: [
          { role: 'user', content: 'Generiši raspored i vrati JSON.' }
        ],
      }),
    });

    if (signal?.aborted) {
      throw new Error("AbortError");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API Error:", response.status, errorText);
      throw new Error(`API greška: ${response.status}`);
    }

    const data = await response.json();

    if (signal?.aborted) {
      throw new Error("AbortError");
    }

    const content = data.content?.[0]?.text || '';
    const cleanedText = cleanJsonOutput(content);

    try {
      const parsed = JSON.parse(cleanedText);
      return {
        message: parsed.message,
        assignments: parsed.newAssignments || [],
        newEmployees: parsed.employeesToAdd || [],
      };
    } catch (parseError) {
      console.error("JSON Parse Error. Raw:", content);
      throw new Error("Format odgovora nije ispravan.");
    }
  } catch (error: any) {
    if (error.message === "AbortError" || signal?.aborted) {
      throw error;
    }
    console.error("AI Service Error:", error);
    return {
      message: "Došlo je do greške u komunikaciji sa AI servisom. Pokušajte ponovo.",
      assignments: currentState.assignments,
    };
  }
};

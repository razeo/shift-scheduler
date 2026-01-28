import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScheduleState, Employee, Shift, Assignment } from "../types";

// Bezbjedan pristup API ključu za browser okruženje
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    console.warn("process.env nije dostupan, koristim prazan ključ.");
    return '';
  }
};

const cleanJsonOutput = (text: string): string => {
  let cleaned = text.trim();
  // Ukloni markdown code blocks ako postoje (```json ... ```)
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "Kratka poruka na srpskom jeziku koja objašnjava šta je urađeno.",
    },
    newAssignments: {
      type: Type.ARRAY,
      description: "THE FULL LIST of assignments for the week. Must include existing assignments + new ones.",
      items: {
        type: Type.OBJECT,
        properties: {
          shiftId: { type: Type.STRING },
          employeeId: { type: Type.STRING },
          specialDuty: { type: Type.STRING },
        },
        required: ["shiftId", "employeeId"],
      },
    },
    employeesToAdd: {
      type: Type.ARRAY,
      description: "List of new employees if explicitly requested.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
        },
        required: ["name", "role"],
      },
    },
  },
  required: ["message", "newAssignments"],
};

export const processScheduleRequest = async (
  prompt: string,
  currentState: ScheduleState,
  signal?: AbortSignal
): Promise<{ 
  message: string; 
  assignments: Omit<Assignment, 'id' | 'weekId'>[]; 
  newEmployees?: { name: string; role: string }[] 
}> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      message: "API ključ nije pronađen. Provjerite konfiguraciju u .env fajlu.",
      assignments: currentState.assignments,
    };
  }

  // Inicijalizacija klijenta unutar funkcije
  const ai = new GoogleGenAI({ apiKey });

  const allowedDuties = currentState.duties.map(d => d.label).join(", ");

  // Pojednostavljeni podaci
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

  // Konstrukcija prompta sa strogim prioritetima
  const systemInstruction = `
    Ti si ShiftMaster AI, precizan algoritam za raspoređivanje osoblja u restoranu.
    
    CILJ: Generiši ili ažuriraj JSON objekat koji predstavlja raspored smjena na osnovu zahtjeva korisnika i strogih pravila.

    --------------------------------------------------------
    PRIORITET 1: KORISNIČKA PRAVILA IZ PODEŠAVANJA (OBAVEZNO)
    ${currentState.aiRules ? currentState.aiRules : "Nema posebnih pravila u podešavanjima."}
    --------------------------------------------------------

    PRIORITET 2: OGRANIČENJA RADNIKA
    1. Dostupnost (Availability): Radnik se NE SMIJE dodijeliti smjeni ako taj dan nije u njegovoj listi dostupnosti.
    2. Uloge (Role): Poštuj uloge (npr. Chef ide u kuhinju) osim ako korisnik izričito ne traži drugačije.

    PRIORITET 3: KONTEKST PODACI
    - Radnici: ${JSON.stringify(simplifiedEmployees)}
    - Smjene: ${JSON.stringify(simplifiedShifts)}
    - Trenutni raspored: ${JSON.stringify(simplifiedAssignments)}
    - Dozvoljene dužnosti (specialDuty): [${allowedDuties}]

    --------------------------------------------------------
    INSTRUKCIJE ZA IZLAZ (CRITICAL):
    1. Polje 'newAssignments' MORA sadržavati KOMPLETAN spisak svih dodjela za ovu nedjelju.
       - Moraš PREPISATI sve postojeće dodjele iz "Trenutni raspored" koje se ne mijenjaju.
       - Dodaj nove dodjele prema zahtjevu.
       - Ukloni one koje korisnik želi da obriše.
       - NE VRAĆAJ samo razlike (diff), jer će to obrisati ostatak rasporeda!
    
    2. Polje 'message' mora biti na srpskom jeziku.
    
    ZAHTJEV KORISNIKA: "${prompt}"
  `;

  try {
    const modelId = "gemini-3-flash-preview"; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: [{ text: "Obradi zahtjev i vrati validan JSON." }]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, 
      },
    });

    if (signal?.aborted) {
      throw new Error("AbortError");
    }

    if (response.text) {
      const cleanedText = cleanJsonOutput(response.text);
      try {
        const data = JSON.parse(cleanedText);
        return {
          message: data.message,
          assignments: data.newAssignments,
          newEmployees: data.employeesToAdd || [],
        };
      } catch (parseError) {
        console.error("JSON Parse Error. Raw text:", response.text);
        throw new Error("Format odgovora nije ispravan. Pokušajte ponovo.");
      }
    }

    throw new Error("Prazan odgovor modela.");
  } catch (error: any) {
    if (error.message === "AbortError" || signal?.aborted) {
      throw error;
    }
    console.error("Gemini AI Error:", error);
    return {
      message: "Došlo je do greške u komunikaciji sa servisom. Molimo pokušajte ponovo.",
      assignments: currentState.assignments,
    };
  }
};
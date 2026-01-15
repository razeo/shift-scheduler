import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScheduleState, Employee, Shift, Assignment } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "A short text response to the user in Serbian, explaining what was done.",
    },
    newAssignments: {
      type: Type.ARRAY,
      description: "Full list of assignments for the CURRENT week being discussed.",
      items: {
        type: Type.OBJECT,
        properties: {
          shiftId: { type: Type.STRING },
          employeeId: { type: Type.STRING },
          specialDuty: { type: Type.STRING, nullable: true },
        },
        required: ["shiftId", "employeeId"],
      },
    },
    employeesToAdd: {
      type: Type.ARRAY,
      description: "List of new employees to add if requested.",
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
  if (!apiKey) {
    return {
      message: "API ključ nedostaje. Provjerite podešavanja.",
      assignments: currentState.assignments,
    };
  }

  const userDefinedRules = currentState.aiRules ? `\n\nPOŠTUJ SLJEDEĆA DODATNA PRAVILA KOJA JE DEFINISAO KORISNIK:\n${currentState.aiRules}` : "";
  const allowedDuties = currentState.duties.map(d => d.label).join(", ");

  const systemInstruction = `
    Ti si ShiftMaster AI asistent za raspored smjena u restoranu.
    Korisnik trenutno gleda radnu nedjelju koja počinje: ${currentState.currentWeekId}.
    
    Tvoj zadatak:
    1. Upravljaš rasporedom isključivo za ovu nedjelju osim ako korisnik ne kaže drugačije.
    2. Korisnik ti šalje upite na srpskom/hrvatskom/bosanskom jeziku.
    3. Ako generišeš raspored, predloži popunjavanje SVIH definisanih smjena.
    
    VAŽNO ZA DUŽNOSTI (specialDuty):
    - Trenutno definisane dozvoljene dužnosti su: [${allowedDuties}]. Koristi ISKLJUČIVO ove nazive za 'specialDuty' osim ako korisnik ne zatraži drugačije.
    - AKO RADNIK VEĆ IMA DODIJELJENU DUŽNOST U KONTEKSTU ISPOD, OBAVEZNO JE ZADRŽI osim ako je korisnik tražio promjenu baš te dužnosti.
    - Nemoj ostavljati 'specialDuty' kao null ako možeš odrediti logičnu ulogu na osnovu dozvoljenih dužnosti.
    
    PRAVILA ZA GENERISANJE RASPOREDA:
    - Svaka smjena (Shift) bi trebala imati barem jednog zaposlenog.
    - POŠTUJ DOSTUPNOST (availability).
    - POŠTUJ ULOGE (role).
    - 'newAssignments' koje vraćaš su KOMPLETAN spisak svih dodijeljenih radnika za cijelu trenutnu nedjelju.${userDefinedRules}
    
    Kontekst:
    Osoblje: ${JSON.stringify(currentState.employees)}
    Smjene: ${JSON.stringify(currentState.shifts)}
    Trenutne dodjele (SA DUŽNOSTIMA KOJE MORAŠ POŠTOVATI): ${JSON.stringify(currentState.assignments)}
  `;

  try {
    const modelId = "gemini-3-flash-preview"; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
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
      const data = JSON.parse(response.text);
      return {
        message: data.message,
        assignments: data.newAssignments,
        newEmployees: data.employeesToAdd || [],
      };
    }

    throw new Error("Prazan odgovor od AI modela");
  } catch (error: any) {
    if (error.message === "AbortError" || signal?.aborted) {
      throw error;
    }
    console.error("Gemini API Error:", error);
    return {
      message: "Došlo je do greške prilikom obrade rasporeda. Pokušajte ponovo.",
      assignments: currentState.assignments,
    };
  }
};

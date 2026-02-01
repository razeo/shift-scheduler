// ===========================================
// Alergen Guide (Alergeni)
// Vodič za alergene i sigurnost gostiju
// ===========================================

import { useState, useRef } from 'react';
import { Printer, Save, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AllergenInfo {
  code: string;
  name: string;
  description: string;
  hiddenIn: string[];
  symptoms: string[];
}

const ALLERGENS: AllergenInfo[] = [
  {
    code: 'G',
    name: 'Gluten',
    description: 'Pšenica, raž, ječam, zob i proizvodi od njih',
    hiddenIn: ['Umaci', 'Dresingi', 'Juhe', 'Prženi namirnice (paniranje)', 'Pivo', 'Vegetarijanski namazi'],
    symptoms: ['Problemi s probavom', 'Otok', 'Osip', 'Teškoće s disanjem', 'Anafilaksija'],
  },
  {
    code: 'D',
    name: 'Mliječni proizvodi',
    description: 'Mlijeko, sir, jogurt, pavlaka, maslac',
    hiddenIn: ['Kruh i peciva', 'Umaci (besamel)', 'Čokolada', 'Kečap', 'Instant proizvodi'],
    symptoms: ['Proljev', 'Nadutost', 'Osip', 'Urtikarija', 'Otežano disanje'],
  },
  {
    code: 'E',
    name: 'Jaja',
    description: 'Kokošja jaja, bjelanjak, žutanjak',
    hiddenIn: ['Majoneza', 'Torte i kolači', 'Puding', 'Šlag', 'Tijesto za prženje'],
    symptoms: ['Osip', 'Svrab', 'Otok usana', 'Problemi s disanjem'],
  },
  {
    code: 'P',
    name: 'Riblji proizvodi',
    description: 'Sva riba i riblji proizvodi',
    hiddenIn: ['Umaci ( Worcestershire)', 'Dresingi', 'Juhe', 'Salate'],
    symptoms: ['Osip', 'Svrab', 'Otok', 'Problemi s disanjem', 'Anafilaksija'],
  },
  {
    code: 'N',
    name: 'Orašasti plodovi',
    description: 'Bademi, lješnjaci, orasi, pistaci, indijski orasi',
    hiddenIn: ['Čokolada', 'Kečap', 'Marcipan', 'Sladoled', 'Kruh'],
    symptoms: ['Otok usta i grla', 'Osip', 'Problemi s disanjem', 'Anafilaksija'],
  },
  {
    code: 'F',
    name: 'Voće',
    description: 'Kivi, jabuka, banana, breskva, marelica',
    hiddenIn: ['Sokovi', 'Smoothie', 'Džemovi', 'Voćne salate'],
    symptoms: ['Svrab usta i grla', 'Otok', 'Osip'],
  },
  {
    code: 'C',
    name: 'Celer',
    description: 'Celer i peršin (korijen i stabljika)',
    hiddenIn: ['Juhe', 'Umaci', 'Salate', 'Začini'],
    symptoms: ['Problemi s probavom', 'Osip', 'Otežano disanje'],
  },
  {
    code: 'Sy',
    name: 'Sezam',
    description: 'Sezam i sezamovo ulje',
    hiddenIn: ['Halva', 'Tahini', 'Kruh', 'Humus', 'Začini'],
    symptoms: ['Osip', 'Otežano disanje', 'Anafilaksija'],
  },
  {
    code: 'Ss',
    name: 'Soja',
    description: 'Zelena soja i sojini proizvodi',
    hiddenIn: ['Tofu', 'Miso', 'Edamame', 'Umaci', 'Čokolada'],
    symptoms: ['Proljev', 'Osip', 'Otežano disanje'],
  },
];

const CROSS_CONTAMINATION = [
  'Korištenje istog pribora za jelo',
  'Prženje u ulju gdje su se prije pržili orašasti plodovi',
  'Dodirivanje alergena rukama pa hrane',
  'Korištenje istih daski za rezanje',
  'Čuvanje hrane u blizini alergena',
];

interface AllergenGuideProps {
  onClose?: () => void;
}

export function AllergenGuide({ onClose }: AllergenGuideProps) {
  const [notes, setNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('allergen_notes') || '';
    } catch {
      return '';
    }
  });
  
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('allergen_selected');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const printRef = useRef<HTMLDivElement>(null);

  const handleSaveNotes = () => {
    localStorage.setItem('allergen_notes', notes);
    localStorage.setItem('allergen_selected', JSON.stringify(selectedAllergens));
  };

  const toggleAllergen = (code: string) => {
    setSelectedAllergens(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handlePrint = () => {
    handleSaveNotes();
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Alergeni</h1>
            <p className="text-xs text-slate-500">Vodič za sigurnost gostiju</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleSaveNotes} className="btn btn-primary flex items-center gap-2">
            <Save size={16} /> Sačuvaj
          </button>
          <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
            <Printer size={16} /> Štampa
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
          
          {/* Print Header */}
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">Vodič za Alergene</h1>
            <p className="text-sm text-slate-500">SIGURNOST GOSTIJU</p>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-700">VAŽNO - SIGURNOST GOSTIJU</h3>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Ako niste 100% sigurni, NIKADA ne garantirajte sigurnost jela gostu!</strong>
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Uvijek provjerite s kuharom ili menadžerom prije nego što potvrdite da je jelo bez alergena.
                </p>
              </div>
            </div>
          </div>

          {/* Allergen Codes */}
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Info size={16} /> Kodovi Alergena (EU 1169/2011)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {ALLERGENS.map(allergen => (
              <div 
                key={allergen.code}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedAllergens.includes(allergen.code) 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => toggleAllergen(allergen.code)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {allergen.code}
                    </span>
                    <span className="font-bold text-slate-700">{allergen.name}</span>
                  </div>
                  {selectedAllergens.includes(allergen.code) && (
                    <CheckCircle size={20} className="text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-2">{allergen.description}</p>
                <details className="text-xs">
                  <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                    Gdje se još krije: {allergen.hiddenIn.join(', ')}
                  </summary>
                  <p className="mt-1 text-red-600">Simptomi: {allergen.symptoms.join(', ')}</p>
                </details>
              </div>
            ))}
          </div>

          {/* Cross Contamination */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Kontaminacija unakrižno (Cross-contamination)
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Čak i ako jelo ne sadrži alergen, može biti kontaminirano kroz:
            </p>
            <ul className="space-y-1">
              {CROSS_CONTAMINATION.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Dnevne napomene / Posebni zahtjevi gostiju
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Upisite posebne zahtjeve gostiju, promjene u jelovniku, itd..."
            />
          </div>

          {/* Selected Allergens Summary */}
          {selectedAllergens.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-amber-700 mb-2">Označeni alergeni za danas:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAllergens.map(code => {
                  const allergen = ALLERGENS.find(a => a.code === code);
                  return (
                    <span 
                      key={code}
                      className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-medium"
                    >
                      {code} - {allergen?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t border-slate-200 pt-4 print:hidden">
            <h4 className="font-bold text-slate-700 mb-3">Brze akcije</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedAllergens(['G', 'D', 'E'])}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
              >
                Najčešći (GDE)
              </button>
              <button 
                onClick={() => setSelectedAllergens(ALLERGENS.map(a => a.code))}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
              >
                Svi
              </button>
              <button 
                onClick={() => setSelectedAllergens([])}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm"
              >
                Očisti
              </button>
            </div>
          </div>

          <div className="hidden print:block mt-4 text-center text-xs text-slate-400">
            Generisano putem Shift Scheduler - SIGURNOST NAŠIH GOSTIJU JE NAŠ PRIORITET
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          textarea { 
            border: none !important; 
            background: transparent !important; 
          }
          textarea:focus { outline: none !important; }
        }
      `}</style>
    </div>
  );
}

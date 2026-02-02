// ===========================================
// Room Service Daily Report
// Praćenje narudžbi po sobama
// ===========================================

import { useState, useRef, useEffect } from 'react';
import { Printer, Save, RotateCcw, Check, X, Bed, ChefHat } from 'lucide-react';
import { formatDateToId } from '../../utils/date';

interface RoomServiceEntry {
  id: string;
  date: string;
  
  orders: {
    id: number;
    roomNumber: string;
    orderReceived: string;
    callReceivedBy: string;
    deliveryTime: string;
    deliveredBy: string;
    cleaningTime: string;
    cleanedBy: string;
    notes: string;
  }[];
  
  totalOrders: number;
  completedOrders: number;
  notes: string;
  
  createdAt: number;
}

interface RoomServiceProps {
  onClose?: () => void;
}

export function RoomService({ onClose }: RoomServiceProps) {
  const [entries, setEntries] = useState<RoomServiceEntry[]>(() => {
    try {
      const stored = localStorage.getItem('roomservice_entries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  
  const [currentEntry, setCurrentEntry] = useState<RoomServiceEntry>({
    id: '',
    date: formatDateToId(new Date()),
    orders: [
      { id: 1, roomNumber: '', orderReceived: '', callReceivedBy: '', deliveryTime: '', deliveredBy: '', cleaningTime: '', cleanedBy: '', notes: '' },
    ],
    totalOrders: 0,
    completedOrders: 0,
    notes: '',
    createdAt: Date.now(),
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = formatDateToId(new Date());
    const existing = entries.find(e => e.date === today);
    if (existing) {
      setCurrentEntry(existing);
    }
  }, [entries]);

  useEffect(() => {
    const completed = currentEntry.orders.filter(o => o.cleanedBy && o.cleanedBy.trim() !== '').length;
    setCurrentEntry(prev => ({
      ...prev,
      totalOrders: prev.orders.length,
      completedOrders: completed,
    }));
  }, [currentEntry.orders]);

  const handleInputChange = (field: keyof RoomServiceEntry, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const addOrder = () => {
    setCurrentEntry(prev => ({
      ...prev,
      orders: [...prev.orders, { 
        id: Date.now(), 
        roomNumber: '', 
        orderReceived: '', 
        callReceivedBy: '', 
        deliveryTime: '', 
        deliveredBy: '', 
        cleaningTime: '', 
        cleanedBy: '', 
        notes: '' 
      }]
    }));
    setIsSaved(false);
  };

  const updateOrder = (id: number, field: string, value: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      orders: prev.orders.map(order => 
        order.id === id ? { ...order, [field]: value } : order
      )
    }));
    setIsSaved(false);
  };

  const removeOrder = (id: number) => {
    if (currentEntry.orders.length > 1) {
      setCurrentEntry(prev => ({
        ...prev,
        orders: prev.orders.filter(o => o.id !== id)
      }));
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    const entry: RoomServiceEntry = {
      ...currentEntry,
      id: currentEntry.id || `rs-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    const updated = entries.filter(e => e.date !== entry.date);
    updated.unshift(entry);
    
    setEntries(updated);
    localStorage.setItem('roomservice_entries', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNew = () => {
    setCurrentEntry({
      id: '',
      date: formatDateToId(new Date()),
      orders: [
        { id: 1, roomNumber: '', orderReceived: '', callReceivedBy: '', deliveryTime: '', deliveredBy: '', cleaningTime: '', cleanedBy: '', notes: '' },
      ],
      totalOrders: 0,
      completedOrders: 0,
      notes: '',
      createdAt: Date.now(),
    });
    setIsSaved(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bed size={20} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Room Service</h1>
            <p className="text-xs text-slate-500">Dnevni izvještaj - narudžbe po sobama</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check size={16} /> Sačuvano
            </span>
          )}
          <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
            <Save size={16} /> Sačuvaj
          </button>
          <button onClick={handleNew} className="btn btn-secondary flex items-center gap-2">
            <RotateCcw size={16} /> Nova
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
        <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-5xl mx-auto">
          
          {/* Print Header */}
          <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">Room Service</h1>
            <p className="text-sm text-slate-500">Dnevni izvještaj - {currentEntry.date}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Datum</label>
              <input
                type="date"
                value={currentEntry.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 w-full">
                <div className="text-center">
                  <span className="text-2xl font-bold text-purple-600">{currentEntry.totalOrders}</span>
                  <span className="text-xs text-purple-500 block">Ukupno narudžbi</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 w-full">
                <div className="text-center">
                  <span className="text-2xl font-bold text-green-600">{currentEntry.completedOrders}</span>
                  <span className="text-xs text-green-500 block">Završeno</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 w-full">
                <div className="text-center">
                  <span className="text-2xl font-bold text-amber-600">{currentEntry.totalOrders - currentEntry.completedOrders}</span>
                  <span className="text-xs text-amber-500 block">Na čekanju</span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-center border border-purple-800 w-16">Soba</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-center border border-purple-800 w-24">Narudžba</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-left border border-purple-800 w-24">Primio poziv</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-center border border-purple-800 w-24">Dostava</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-left border border-purple-800 w-24">Dostavio</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-center border border-purple-800 w-24">Čišćenje</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-left border border-purple-800 w-24">Očistio</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-left border border-purple-800">Napomene</th>
                <th className="bg-purple-800 text-white text-xs uppercase py-2 px-2 text-center border border-purple-800 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentEntry.orders.map((order) => (
                <tr key={order.id} className={order.cleanedBy ? 'bg-green-50' : ''}>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={order.roomNumber}
                      onChange={(e) => updateOrder(order.id, 'roomNumber', e.target.value)}
                      className="w-full py-2 px-2 outline-none font-bold text-center"
                      placeholder="101"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={order.orderReceived}
                      onChange={(e) => updateOrder(order.id, 'orderReceived', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={order.callReceivedBy}
                      onChange={(e) => updateOrder(order.id, 'callReceivedBy', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="Ime"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={order.deliveryTime}
                      onChange={(e) => updateOrder(order.id, 'deliveryTime', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={order.deliveredBy}
                      onChange={(e) => updateOrder(order.id, 'deliveredBy', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="Ime"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="time"
                      value={order.cleaningTime}
                      onChange={(e) => updateOrder(order.id, 'cleaningTime', e.target.value)}
                      className="w-full py-2 px-2 outline-none text-center"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={order.cleanedBy}
                      onChange={(e) => updateOrder(order.id, 'cleanedBy', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="Ime"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      value={order.notes}
                      onChange={(e) => updateOrder(order.id, 'notes', e.target.value)}
                      className="w-full py-2 px-2 outline-none"
                      placeholder="..."
                    />
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    {currentEntry.orders.length > 1 && (
                      <button
                        onClick={() => removeOrder(order.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            onClick={addOrder}
            className="mb-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Dodaj narudžbu
          </button>

          {/* Summary & Notes */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <ChefHat size={14} /> Status
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Ukupno narudžbi:</span>
                  <span className="font-bold">{currentEntry.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Završeno:</span>
                  <span className="font-bold text-green-600">{currentEntry.completedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Na čekanju:</span>
                  <span className="font-bold text-amber-600">{currentEntry.totalOrders - currentEntry.completedOrders}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full mt-2">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${currentEntry.totalOrders > 0 ? (currentEntry.completedOrders / currentEntry.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Napomene / Posebni zahtjevi</label>
              <textarea
                value={currentEntry.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input min-h-[80px] resize-none"
                placeholder="Posebni zahtjevi gostiju, kašnjenja, problemi..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="hidden print:block mt-4 text-center text-xs text-slate-400">
            Generisano putem RestoHub - {currentEntry.date}
          </div>
        </div>

        {/* History */}
        {entries.length > 1 && (
          <div className="mt-6 max-w-5xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-3">Prethodni dani</h3>
            <div className="space-y-2">
              {entries.slice(1, 6).map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => setCurrentEntry(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{entry.date}</span>
                    <span className="text-xs bg-purple-100 px-2 py-0.5 rounded">{entry.totalOrders} narudžbi</span>
                    <span className="text-sm text-green-600">{entry.completedOrders} završeno</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          input, select, textarea { 
            border: none !important; 
            background: transparent !important; 
          }
          input:focus, select:focus, textarea:focus { outline: none !important; }
        }
      `}</style>
    </div>
  );
}

import React, { useState } from 'react';
import { DayOfWeek, Shift, Assignment, Employee, Role, Duty } from '../types';
import { DAYS_ORDER } from '../constants';
import { Clock, Briefcase, Trash, UserPlus, ChevronLeft, ChevronRight, CalendarDays, ChevronDown, ChevronUp, Users, Edit3, FileText, FileSpreadsheet, UserMinus, Ban, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import EditAssignmentModal from './EditAssignmentModal';
import * as XLSX from 'xlsx';

interface ScheduleGridProps {
  shifts: Shift[];
  assignments: Assignment[];
  employees: Employee[];
  duties: Duty[];
  currentWeekStart: Date;
  onRemoveAssignment: (assignmentId: string) => void;
  onManualAssign: (shiftId: string, employeeId: string) => void;
  onUpdateAssignment: (assignmentId: string, duty: string) => void;
  onNavigateWeek: (direction: number) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  shifts, 
  assignments, 
  employees, 
  duties,
  currentWeekStart,
  onRemoveAssignment,
  onManualAssign,
  onUpdateAssignment,
  onNavigateWeek,
  isSidebarOpen,
  onToggleSidebar,
  isChatOpen,
  onToggleChat
}) => {
  const [activeManualAssignShift, setActiveManualAssignShift] = useState<string | null>(null);
  const [expandedShifts, setExpandedShifts] = useState<Set<string>>(new Set());
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const getWeekRangeLabel = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = currentWeekStart.toLocaleDateString('sr-RS', options);
    const endStr = end.toLocaleDateString('sr-RS', { ...options, year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString('sr-RS', { day: 'numeric', month: '2-digit' });
  };

  const getShiftsForDay = (day: DayOfWeek) => {
    return shifts.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getAssignmentsForShift = (shiftId: string) => {
    return assignments
      .filter(a => a.shiftId === shiftId)
      .map(a => {
        const employee = employees.find(e => e.id === a.employeeId);
        return { ...a, employee };
      });
  };

  // Helper funkcija za pronalaženje slobodnih radnika za određeni dan
  const getFreeEmployeesForDay = (day: DayOfWeek) => {
    // 1. Nađi sve smjene za taj dan
    const dayShifts = getShiftsForDay(day);
    const dayShiftIds = dayShifts.map(s => s.id);

    // 2. Nađi ID-eve radnika koji rade u tim smjenama
    const busyEmployeeIds = new Set(
      assignments
        .filter(a => dayShiftIds.includes(a.shiftId))
        .map(a => a.employeeId)
    );

    // 3. Vrati radnike koji nisu zauzeti
    return employees.filter(e => !busyEmployeeIds.has(e.id));
  };

  const handleExportExcel = () => {
    const header1 = ["", "Ime i prezime", ...DAYS_ORDER];
    const header2 = ["", "", ...DAYS_ORDER.map((_, i) => getDateForDay(i))];

    const rows = employees.map((emp, idx) => {
      const rowData = [(idx + 1).toString(), emp.name];
      DAYS_ORDER.forEach((day) => {
        const dayShifts = shifts.filter(s => s.day === day);
        const empAssignment = assignments.find(a => 
          dayShifts.some(s => s.id === a.shiftId) && a.employeeId === emp.id
        );
        if (empAssignment) {
          const shift = shifts.find(s => s.id === empAssignment.shiftId);
          rowData.push(shift ? `${shift.startTime}-${shift.endTime}` : "OFF");
        } else {
          rowData.push("OFF");
        }
      });
      return rowData;
    });

    const worksheetData = [header1, header2, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raspored");
    const fileName = `Raspored_${currentWeekStart.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const toggleShiftExpansion = (shiftId: string) => {
    const newExpanded = new Set(expandedShifts);
    if (newExpanded.has(shiftId)) {
      newExpanded.delete(shiftId);
    } else {
      newExpanded.add(shiftId);
    }
    setExpandedShifts(newExpanded);
  };

  const getRoleColor = (role?: Role) => {
    switch(role) {
      case Role.CHEF: return 'bg-orange-100 text-orange-700 border-orange-200';
      case Role.MANAGER: return 'bg-purple-100 text-purple-700 border-purple-200';
      case Role.SERVER: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Role.HEAD_WAITER: return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case Role.BARTENDER: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case Role.HOST: return 'bg-amber-100 text-amber-700 border-amber-200';
      case Role.DISHWASHER: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {!isSidebarOpen && onToggleSidebar && (
                <button 
                  onClick={onToggleSidebar}
                  className="p-2.5 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all active:scale-95 hidden lg:block"
                  title="Prikaži meni"
                >
                  <PanelLeftOpen size={20} />
                </button>
              )}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-200">
                <CalendarDays size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Planer Smjena</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">ShiftMaster AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-200 shadow-sm w-fit hover:shadow-md transition-shadow">
              <button 
                onClick={() => onNavigateWeek(-1)}
                className="p-2.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-sm font-bold text-slate-700 min-w-[160px] text-center tracking-tight">
                {getWeekRangeLabel()}
              </div>
              <button 
                onClick={() => onNavigateWeek(1)}
                className="p-2.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95 whitespace-nowrap"
            >
              <FileSpreadsheet size={22} />
              Izvezi u Excel
            </button>
            {!isChatOpen && onToggleChat && (
              <button 
                onClick={onToggleChat}
                className="bg-white hover:bg-indigo-50 text-indigo-600 px-4 py-3.5 rounded-xl font-black flex items-center gap-2 transition-all border border-indigo-100 shadow-sm hidden lg:flex"
              >
                <PanelRightOpen size={22} />
                AI Chat
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {DAYS_ORDER.map((day, idx) => {
            const daysShifts = getShiftsForDay(day);
            const dayDate = getDateForDay(idx);
            const freeEmployees = getFreeEmployeesForDay(day);
            
            return (
              <div key={day} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">{day}</h3>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50/50 px-1.5 py-0.5 rounded-md border border-indigo-100/50">
                      {dayDate}
                    </span>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {daysShifts.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {daysShifts.map((shift) => {
                    const shiftAssignments = getAssignmentsForShift(shift.id);
                    const isExpanded = expandedShifts.has(shift.id);
                    
                    return (
                      <div 
                        key={shift.id} 
                        className={`group relative bg-white rounded-2xl border transition-all duration-300 hover-lift ${
                          isExpanded ? 'border-indigo-300 shadow-xl ring-2 ring-indigo-50 z-10' : 'border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-lg'
                        }`}
                      >
                        <div 
                          className="p-4 cursor-pointer select-none"
                          onClick={() => toggleShiftExpansion(shift.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-colors ${
                              isExpanded ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {shift.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="text-[11px] font-black text-slate-400 flex items-center gap-1">
                                  <Clock size={12} className="text-slate-300" />
                                  {shift.startTime} - {shift.endTime}
                                </div>
                                {isExpanded ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-slate-300" />}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                              <Users size={12} className="text-indigo-400" />
                              <span>{shiftAssignments.length} radnika</span>
                            </div>
                            {!isExpanded && shift.notes && (
                              <div className="text-indigo-400 animate-pulse">
                                <FileText size={12} />
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="h-[1px] bg-slate-100 w-full mb-3" />
                            
                            {shift.notes && (
                              <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 mb-3">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                                  <FileText size={10} />
                                  Napomena
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                  {shift.notes}
                                </p>
                              </div>
                            )}

                            <div className="space-y-2.5">
                              {shiftAssignments.map((assigned) => (
                                <div 
                                  key={assigned.id} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAssignment(assigned);
                                  }}
                                  className="group/item flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 transition-all hover:border-indigo-200 hover:bg-indigo-50/20 shadow-sm cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`shrink-0 w-9 h-9 rounded-full shadow-sm flex items-center justify-center text-xs font-black border transition-colors ${getRoleColor(assigned.employee?.role)}`}>
                                      {assigned.employee?.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-slate-800 truncate">{assigned.employee?.name || 'Radnik'}</p>
                                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter hidden sm:block">
                                          {assigned.employee?.role}
                                        </span>
                                      </div>
                                      {assigned.specialDuty ? (
                                        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-lg w-fit mt-1 border border-amber-100 animate-in fade-in slide-in-from-left-1">
                                          <Briefcase size={10} />
                                          <span className="truncate max-w-[130px]">{assigned.specialDuty}</span>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic flex items-center gap-1">
                                          <Edit3 size={10} className="opacity-40" /> Dodaj ulogu...
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveAssignment(assigned.id);
                                    }}
                                    className="text-slate-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-xl"
                                    title="Ukloni radnika"
                                  >
                                    <Trash size={14} />
                                  </button>
                                </div>
                              ))}

                              <div className="relative pt-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveManualAssignShift(activeManualAssignShift === shift.id ? null : shift.id);
                                  }}
                                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[11px] font-black uppercase tracking-wider hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all active:scale-[0.98]"
                                >
                                  <UserPlus size={16} /> Dodaj radnika
                                </button>

                                {activeManualAssignShift === shift.id && (
                                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-56 overflow-y-auto">
                                    <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                      Izaberi radnika
                                    </div>
                                    {employees.map(emp => (
                                      <button
                                        key={emp.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onManualAssign(shift.id, emp.id);
                                          setActiveManualAssignShift(null);
                                        }}
                                        className="w-full text-left p-3.5 hover:bg-indigo-50 text-sm font-black text-slate-700 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                      >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${getRoleColor(emp.role)}`}>
                                          {emp.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                          <span>{emp.name}</span>
                                          <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{emp.role}</span>
                                        </div>
                                      </button>
                                    ))}
                                    {employees.length === 0 && (
                                      <div className="p-6 text-xs text-slate-400 text-center italic">
                                        Nema radnika na spisku
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {daysShifts.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-3xl bg-white/40 text-slate-400 hover:bg-white/60 hover:border-indigo-200 hover:text-indigo-400 transition-all cursor-pointer group">
                      <Clock size={24} className="opacity-10 group-hover:opacity-30 transition-opacity" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-400 transition-colors">Prazan dan</p>
                    </div>
                  )}

                  {/* SEKCIJA SLOBODNI RADNICI */}
                  {freeEmployees.length > 0 && (
                    <div className="pt-2">
                       <div className="flex items-center gap-2 mb-2 px-2">
                          <UserMinus size={12} className="text-slate-400" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slobodni ({freeEmployees.length})</h4>
                       </div>
                       <div className="bg-slate-100/50 rounded-2xl p-2 space-y-1.5 border border-slate-100">
                          {freeEmployees.map(emp => {
                            const isAvailable = emp.availability ? emp.availability.includes(day) : true;
                            
                            return (
                              <div key={emp.id} className={`flex items-center gap-2 p-2 rounded-xl border bg-white ${isAvailable ? 'border-slate-100 opacity-90' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border ${getRoleColor(emp.role)}`}>
                                  {emp.name.charAt(0)}
                                </div>
                                <span className={`text-[11px] font-bold ${isAvailable ? 'text-slate-600' : 'text-slate-400 line-through decoration-slate-300'}`}>
                                  {emp.name}
                                </span>
                                {!isAvailable && (
                                  <div className="ml-auto" title="Nije dostupan">
                                    <Ban size={12} className="text-slate-300" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingAssignment && (
        <EditAssignmentModal
          assignment={editingAssignment}
          employee={employees.find(e => e.id === editingAssignment.employeeId)}
          duties={duties}
          onClose={() => setEditingAssignment(null)}
          onUpdate={onUpdateAssignment}
        />
      )}
    </div>
  );
};

export default ScheduleGrid;
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bot, Calendar, Users, Plus, Check } from 'lucide-react';
import { Employee, Shift, Assignment, Duty, DayOfWeek, Role } from '../../types';
import { formatDateToId, getDayName, dayOfWeekToDate } from '../../utils/date';

export interface ScheduleGridProps {
  shifts: Shift[];
  assignments: Assignment[];
  employees: Employee[];
  duties: Duty[];
  currentWeekStart: Date;
  onRemoveAssignment: (id: string) => void;
  onManualAssign: (shiftId: string, employeeId: string, alreadyAddedIds?: string[]) => boolean;
  onNavigateWeek: (direction: number) => void;
  onToggleSidebar: () => void;
  onToggleChat: () => void;
}

export function ScheduleGrid({
  shifts,
  assignments,
  employees,
  duties,
  currentWeekStart,
  onRemoveAssignment,
  onManualAssign,
  onNavigateWeek,
  onToggleSidebar,
  onToggleChat,
}: ScheduleGridProps) {
  const weekDays = Object.values(DayOfWeek);
  const weekDates = weekDays.map(day => dayOfWeekToDate(currentWeekStart, day));

  // Modal state for manual employee assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedShiftLabel, setSelectedShiftLabel] = useState<string>('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  
  // Drag and drop state
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  // Get assignments for a specific shift AND day
  const getAssignmentsForShift = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return [];
    
    // Only return assignments where the shift's day matches AND same week
    const weekId = formatDateToId(currentWeekStart);
    return assignments.filter(a => a.shiftId === shiftId && a.weekId === weekId);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  const getDutyById = (id: string) => {
    return duties.find(d => d.id === id);
  };

  // Get count of assignments per employee for this shift and day
  const getAssignedEmployeesForShift = (shiftId: string): string[] => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return [];
    
    const weekId = formatDateToId(currentWeekStart);
    return assignments
      .filter(a => a.shiftId === shiftId && a.weekId === weekId)
      .map(a => a.employeeId);
  };

  const handleOpenAssignModal = (shiftId: string, shiftLabel: string) => {
    setSelectedShiftId(shiftId);
    setSelectedShiftLabel(shiftLabel);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedShiftId(null);
    setSelectedShiftLabel('');
    setSelectedEmployeeIds(new Set());
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const assigned = getCurrentAssignedEmployees();
    if (assigned.includes(employeeId)) return;
    
    setSelectedEmployeeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleAddSelectedEmployees = () => {
    if (!selectedShiftId) return;
    
    const alreadyAddedInThisBatch: string[] = [];
    
    selectedEmployeeIds.forEach(id => {
      const added = onManualAssign(selectedShiftId, id, alreadyAddedInThisBatch);
      if (added) {
        alreadyAddedInThisBatch.push(id);
      }
    });
    
    setSelectedEmployeeIds(new Set());
    handleCloseAssignModal();
    
    // Show success message
    if (alreadyAddedInThisBatch.length > 0) {
      console.log(`Dodijeljeno ${alreadyAddedInThisBatch.length} radnika`);
    }
  };

  const handleSelectAllUnassigned = () => {
    const assigned = getCurrentAssignedEmployees();
    const unassigned = employees.filter(e => !assigned.includes(e.id));
    setSelectedEmployeeIds(new Set(unassigned.map(e => e.id)));
  };

  // Get assigned employees for the currently selected shift
  const getCurrentAssignedEmployees = (): string[] => {
    if (!selectedShiftId) return [];
    return getAssignedEmployeesForShift(selectedShiftId);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, shiftId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverCell(shiftId);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, shiftId: string) => {
    e.preventDefault();
    setDragOverCell(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'employee') {
        // Check if already assigned
        const assigned = getAssignedEmployeesForShift(shiftId);
        if (!assigned.includes(data.employeeId)) {
          onManualAssign(shiftId, data.employeeId);
        }
      }
    } catch (err) {
      console.error('Invalid drop data:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Calendar size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              📅 Raspored smjena
            </h1>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigateWeek(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
              {formatDateToId(currentWeekStart)}
            </span>
            <button 
              onClick={() => onNavigateWeek(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleChat}
              className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${true ? 'bg-primary-100 text-primary-600' : 'text-slate-600'}`}
              title="Otvori chat"
            >
              <Bot size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="schedule-grid bg-slate-200 rounded-lg overflow-hidden">
          {/* Header Row - Days */}
          <div className="bg-slate-100 border-b border-slate-300">
            <div className="p-3 font-medium text-slate-600 text-center border-r border-slate-300">
              Smjena
            </div>
          </div>
          {weekDays.map((day, index) => (
            <div key={day} className="schedule-cell-header border-r border-slate-300 last:border-r-0">
              <div className="font-medium">{getDayName(weekDates[index])}</div>
              <div className="text-xs text-slate-400">{formatDateToId(weekDates[index])}</div>
            </div>
          ))}

          {/* Shift Rows */}
          {shifts.map((shift) => (
            <React.Fragment key={shift.id}>
              {/* Shift Label */}
              <div className="p-3 bg-slate-50 border-r border-slate-300 border-t border-slate-200">
                <div className="font-medium text-slate-700">{shift.label}</div>
                <div className="text-xs text-slate-500">{shift.startTime}-{shift.endTime}</div>
              </div>

              {/* Days */}
              {weekDays.map((day) => {
                const shiftAssignments = getAssignmentsForShift(shift.id);
                const isShiftDay = shift.day === day;
                
                return (
                  <div 
                    key={`${shift.id}-${day}`}
                    onDragOver={(e) => handleDragOver(e, shift.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, shift.id)}
                    className={`schedule-cell border-r border-slate-200 last:border-r-0 relative ${!isShiftDay ? 'opacity-50' : ''} ${dragOverCell === shift.id && isShiftDay ? 'bg-primary-100 ring-2 ring-primary-400 ring-inset' : ''}`}
                  >
                    {isShiftDay && shiftAssignments.length > 0 ? (
                      <>
                        {/* Assigned employees */}
                        <div className="space-y-1">
                          {shiftAssignments.map(assignment => {
                            const employee = getEmployeeById(assignment.employeeId);
                            const duty = assignment.specialDuty ? getDutyById(assignment.specialDuty) : null;
                            
                            return (
                              <div
                                key={assignment.id}
                                className="group relative flex items-center gap-1 p-1 rounded bg-primary-100 hover:bg-primary-200 transition-colors"
                              >
                                <span className="text-xs font-medium text-primary-700 truncate">
                                  {employee?.name || '?'}
                                </span>
                                {duty && (
                                  <span className="text-[10px] px-1 rounded bg-primary-200 text-primary-800">
                                    {duty.label}
                                  </span>
                                )}
                                <button
                                  onClick={() => onRemoveAssignment(assignment.id)}
                                  className="absolute -right-1 -top-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {/* Add more button */}
                        <button
                          onClick={() => handleOpenAssignModal(shift.id, shift.label)}
                          className="w-full mt-1 py-1 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors text-xs"
                          title="Dodaj još radnika"
                        >
                          <Plus size={14} className="mr-1" /> Dodaj
                        </button>
                      </>
                    ) : isShiftDay ? (
                      <button
                        onClick={() => handleOpenAssignModal(shift.id, shift.label)}
                        className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all group"
                        title="Klikni za dodavanje radnika"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors mb-1">
                          <Plus size={18} className="group-hover:text-primary-600" />
                        </div>
                        <span className="text-[10px] group-hover:text-primary-600">Dodaj</span>
                      </button>
                    ) : null}
                    
                    {/* Drag hint - only on desktop and empty cells */}
                    {isShiftDay && shiftAssignments.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-slate-300 opacity-0 hover:opacity-100 transition-opacity">
                          <Plus size={24} className="mx-auto mb-1" />
                          <span className="text-xs">Prevuci radnika</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary-100 border border-primary-200"></div>
            <span>Angazovani radnici</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-300" />
            <span>Klikni + za dodavanje</span>
          </div>
          <div className="flex items-center gap-2 hidden lg:flex">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3"/>
            </svg>
            <span>Prevuci radnika (desktop)</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-500">Ukupno smjena</p>
            <p className="text-2xl font-bold text-slate-800">{shifts.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Ukupno radnika</p>
            <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Dodjela ove sedmice</p>
            <p className="text-2xl font-bold text-slate-800">{assignments.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Pokrivenost</p>
            <p className="text-2xl font-bold text-slate-800">
              {shifts.length > 0 
                ? Math.round((assignments.length / (shifts.length * weekDays.length)) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Manual Assignment Modal */}
      {isAssignModalOpen && selectedShiftId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Dodaj radnika</h2>
                <p className="text-sm text-slate-500">{selectedShiftLabel}</p>
              </div>
              <button 
                onClick={handleCloseAssignModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {employees.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  Nema registrovanih radnika
                </p>
              ) : (
                <>
                  {/* Multi-select header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <div>
                      <p className="text-sm text-slate-600">Izaberi radnike:</p>
                      <p className="text-xs text-slate-400">Označavanjem ćeš dodati više radnika odjednom</p>
                    </div>
                    <button
                      onClick={handleSelectAllUnassigned}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Označi sve
                    </button>
                  </div>

                  {/* Employees list with checkboxes */}
                  <div className="space-y-2">
                    {employees.map(employee => {
                      const assigned = getCurrentAssignedEmployees();
                      const isAlreadyAssigned = assigned.includes(employee.id);
                      const isSelected = selectedEmployeeIds.has(employee.id);
                      
                      return (
                        <button
                          key={employee.id}
                          onClick={() => {
                            if (!isAlreadyAssigned) {
                              toggleEmployeeSelection(employee.id);
                            }
                          }}
                          disabled={isAlreadyAssigned}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            isAlreadyAssigned 
                              ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary-50 border-primary-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            isAlreadyAssigned 
                              ? 'border-slate-300 bg-slate-200' 
                              : isSelected
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-slate-300'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                          
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            employee.role === Role.CHEF ? 'bg-orange-100 text-orange-700' :
                            employee.role === Role.MANAGER ? 'bg-purple-100 text-purple-700' :
                            employee.role === Role.BARTENDER ? 'bg-emerald-100 text-emerald-700' :
                            employee.role === Role.SERVER ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {employee.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{employee.name}</p>
                            <p className="text-xs text-slate-500">{employee.role}</p>
                          </div>
                          {isAlreadyAssigned ? (
                            <span className="text-xs text-green-600 font-medium">Već dodan</span>
                          ) : isSelected ? (
                            <span className="text-xs text-primary-600 font-medium">Označen</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected count and add button */}
                  {selectedEmployeeIds.size > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-600">
                          Označeno: <strong>{selectedEmployeeIds.size}</strong> radnika
                        </span>
                        <button
                          onClick={() => setSelectedEmployeeIds(new Set())}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Poništi
                        </button>
                      </div>
                      <button
                        onClick={handleAddSelectedEmployees}
                        className="w-full btn btn-primary flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        Dodaj označene ({selectedEmployeeIds.size})
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Already assigned employees summary */}
              {getCurrentAssignedEmployees().length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-3">
                    Već dodijeljeni ({getCurrentAssignedEmployees().length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentAssignedEmployees().map(empId => {
                      const employee = employees.find(e => e.id === empId);
                      if (!employee) return null;
                      return (
                        <div key={empId} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm">
                          <span>{employee.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Close button at bottom */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={handleCloseAssignModal}
                  className="w-full btn btn-secondary"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper X component for the remove button
function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

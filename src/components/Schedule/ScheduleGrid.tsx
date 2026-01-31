import React from 'react';
import { ChevronLeft, ChevronRight, Bot, Calendar, Users } from 'lucide-react';
import { Employee, Shift, Assignment, Duty, DayOfWeek } from '../../types';
import { formatDateToId, getDayName, dayOfWeekToDate } from '../../utils/date';

export interface ScheduleGridProps {
  shifts: Shift[];
  assignments: Assignment[];
  employees: Employee[];
  duties: Duty[];
  currentWeekStart: Date;
  onRemoveAssignment: (id: string) => void;
  onManualAssign: (shiftId: string, employeeId: string) => void;
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

  const getAssignmentsForShift = (shiftId: string) => {
    return assignments.filter(a => a.shiftId === shiftId);
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  const getDutyById = (id: string) => {
    return duties.find(d => d.id === id);
  };

  // Get count of assignments per employee for this shift
  const getAssignedEmployeesForShift = (shiftId: string): string[] => {
    return assignments
      .filter(a => a.shiftId === shiftId)
      .map(a => a.employeeId);
  };

  const handleAddEmployee = (shiftId: string, _day: DayOfWeek) => {
    if (employees.length === 0) return;
    
    const assignedEmployeeIds = getAssignedEmployeesForShift(shiftId);
    
    // Find next unassigned employee
    const nextEmployee = employees.find(emp => !assignedEmployeeIds.includes(emp.id));
    
    if (nextEmployee) {
      onManualAssign(shiftId, nextEmployee.id);
    } else if (employees.length > assignedEmployeeIds.length) {
      // All current employees assigned, cycle back to first
      onManualAssign(shiftId, employees[0].id);
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
                
                return (
                  <div key={`${shift.id}-${day}`} className="schedule-cell border-r border-slate-200 last:border-r-0">
                    {shiftAssignments.length > 0 ? (
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
                    ) : (
                      <button
                        onClick={() => handleAddEmployee(shift.id, day)}
                        className="w-full h-full flex items-center justify-center text-slate-300 hover:text-slate-400 hover:bg-slate-50 transition-colors"
                      >
                        <Users size={16} />
                      </button>
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
            <span>Prazno (klikni za dodavanje)</span>
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

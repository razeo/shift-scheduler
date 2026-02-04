// ===========================================
// Notion-Style Sidebar for RestoHub
// Clean, organized navigation with collapsible sections
// ===========================================

import React, { useState } from 'react';
import { 
  Calendar, Users, Tag, FileText, Settings,
  ArrowLeftRight, Bed, Trash2, Utensils,
  AlertTriangle, X, ChevronDown, ChevronRight,
  Search, User, LogOut, Shield
} from 'lucide-react';
import { Employee, Shift, Duty, Assignment } from '../../types/index';

export interface SidebarProps {
  employees: Employee[];
  duties: Duty[];
  shifts: Shift[];
  assignments?: Assignment[];
  aiRules: string;
  currentPage?: string;
  onPageChange?: (page: string) => void;
  onAddEmployee?: (employee: Omit<Employee, 'id'>) => void;
  onRemoveEmployee?: (id: string) => void;
  onUpdateEmployee?: (employee: Employee) => void;
  onAddDuty?: (duty: Omit<Duty, 'id'>) => void;
  onRemoveDuty?: (id: string) => void;
  onAddShift?: (shift: Omit<Shift, 'id'>) => void;
  onRemoveShift?: (id: string) => void;
  onUpdateShift?: (shift: Shift) => void;
  onUpdateAiRules?: (rules: string) => void;
  onResetAll?: () => void;
  onImportData?: (data: any) => void;
  onClose?: () => void;
  canManageUsers?: boolean;
  canAccessSettings?: boolean;
}

type TabType = 'employees' | 'shifts' | 'duties' | 'templates' | 'ai';

// Navigation sections - Notion style
interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const navigationSections = (canManageUsers: boolean, canAccessSettings: boolean): NavSection[] => [
  {
    id: 'schedule',
    title: '📅 RASPORED',
    icon: <Calendar size={14} />,
    items: [
      { id: 'schedule', icon: <Calendar size={12} />, label: 'Raspored smjena' },
      { id: 'employees', icon: <Users size={12} />, label: 'Radnici' },
      { id: 'shifts', icon: <Tag size={12} />, label: 'Smjene' },
      { id: 'duties', icon: <FileText size={12} />, label: 'Dužnosti' },
    ],
  },
  {
    id: 'operations',
    title: '🔄 OPERACIJE',
    icon: <ArrowLeftRight size={14} />,
    items: [
      { id: 'handover', icon: <ArrowLeftRight size={12} />, label: 'Primopredaja' },
      { id: 'roomservice', icon: <Bed size={12} />, label: 'Room Service' },
      { id: 'wastelist', icon: <Trash2 size={12} />, label: 'Otpis hrane' },
      { id: 'dailymenu', icon: <Utensils size={12} />, label: 'Dnevni meni' },
    ],
  },
  {
    id: 'safety',
    title: '⚠️ BEZBJEDNOST',
    icon: <AlertTriangle size={14} />,
    items: [
      { id: 'allergens', icon: <AlertTriangle size={12} />, label: 'Alergeni' },
      { id: 'outofstock', icon: <X size={12} />, label: '86 (Nedostaje)' },
    ],
  },
  {
    id: 'reports',
    title: '📊 IZVJEŠTAJI',
    icon: <Shield size={14} />,
    items: [
      { id: 'report', icon: <Shield size={12} />, label: 'Dnevni izvještaj' },
    ],
  },
  {
    id: 'settings',
    title: '⚙️ POSTAVKE',
    icon: <Settings size={14} />,
    items: [
      ...(canManageUsers ? [
        { id: 'users', icon: <User size={12} />, label: 'Korisnici' },
        { id: 'permissions', icon: <Shield size={12} />, label: 'Dozvole' },
      ] : []),
      ...(canAccessSettings ? [
        { id: 'settings', icon: <Settings size={12} />, label: 'Sistem' },
      ] : []),
    ],
  },
];

export function Sidebar({
  employees: _employees,
  duties: _duties,
  shifts: _shifts,
  assignments: _assignments,
  aiRules: _aiRules,
  currentPage = 'schedule',
  onPageChange = () => {},
  onAddEmployee: _onAddEmployee,
  onRemoveEmployee: _onRemoveEmployee,
  onUpdateEmployee: _onUpdateEmployee,
  onAddDuty: _onAddDuty,
  onRemoveDuty: _onRemoveDuty,
  onAddShift: _onAddShift,
  onRemoveShift: _onRemoveShift,
  onUpdateShift: _onUpdateShift,
  onUpdateAiRules: _onUpdateAiRules,
  onResetAll: _onResetAll,
  onImportData: _onImportData,
  onClose: _onClose,
  canManageUsers = false,
  canAccessSettings = false,
}: SidebarProps) {
  const [_activeTab, _setActiveTab] = useState<TabType>('employees');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    schedule: true,
    operations: true,
    safety: true,
    reports: true,
    settings: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const sections = navigationSections(canManageUsers, canAccessSettings);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleAllSections = (expand: boolean) => {
    const allExpanded = sections.reduce((acc, section) => {
      acc[section.id] = expand;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(allExpanded);
  };

  // Filter sections based on search
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex flex-col h-full bg-white w-72 shrink-0 border-r border-slate-200">
      {/* Header with search */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <h1 className="text-lg font-bold text-slate-800">RestoHub</h1>
          </div>
          <button 
            onClick={() => toggleAllSections(!expandedSections['schedule'])}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            {expandedSections['schedule'] ? 'Sklopi' : 'Otvori'}
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.map(section => (
          <div key={section.id} className="border-b border-slate-100">
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{section.icon}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {section.title}
                </span>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown size={12} className="text-slate-400" />
              ) : (
                <ChevronRight size={12} className="text-slate-400" />
              )}
            </button>

            {/* Section items */}
            {expandedSections[section.id] && (
              <div className="pb-2">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full px-4 py-2 pl-9 flex items-center gap-2 transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={currentPage === item.id ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer with user info */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Admin</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg">
            <LogOut size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

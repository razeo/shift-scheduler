// ===========================================
// Employees Page - Full CRUD
// ===========================================

import { useState } from 'react';
import { Employee, Role, DayOfWeek } from '../../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const ROLE_LABELS: Record<Role, string> = {
  [Role.SERVER]: 'Konobar',
  [Role.CHEF]: 'Kuvar',
  [Role.BARTENDER]: 'Barmen',
  [Role.HOST]: 'Hostesa',
  [Role.MANAGER]: 'Menadžer',
  [Role.DISHWASHER]: 'Perac sudova',
  [Role.HEAD_WAITER]: 'Glavni konobar',
};

const ALL_DAYS = [
  { value: DayOfWeek.MONDAY, label: 'Ponedjeljak' },
  { value: DayOfWeek.TUESDAY, label: 'Utorak' },
  { value: DayOfWeek.WEDNESDAY, label: 'Srijeda' },
  { value: DayOfWeek.THURSDAY, label: 'Četvrtak' },
  { value: DayOfWeek.FRIDAY, label: 'Petak' },
  { value: DayOfWeek.SATURDAY, label: 'Subota' },
  { value: DayOfWeek.SUNDAY, label: 'Nedjelja' },
];

interface EmployeesPageProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onRemoveEmployee: (id: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
}

export function EmployeesPage({ employees, onAddEmployee, onRemoveEmployee, onUpdateEmployee }: EmployeesPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    role: Role.SERVER,
    phone: '',
    email: '',
    availability: [] as DayOfWeek[],
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ROLE_LABELS[emp.role].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: Role.SERVER,
      phone: '',
      email: '',
      availability: [],
    });
    setShowModal(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      phone: employee.phone || '',
      email: employee.email || '',
      availability: employee.availability || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        ...formData,
      });
    } else {
      onAddEmployee(formData);
    }
    closeModal();
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day],
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Radnici</h2>
          <p className="text-slate-500">{employees.length} radnika</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Dodaj
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pretraži radnike..."
          className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {employees.length === 0 ? 'Nema radnika. Dodajte prvog radnika.' : 'Nema rezultata pretrage.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Ime</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Uloga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Kontakt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Dostupnost</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{employee.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                      {ROLE_LABELS[employee.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {employee.phone && <div>{employee.phone}</div>}
                    {employee.email && <div className="text-slate-400">{employee.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {employee.availability?.length ? (
                        employee.availability.slice(0, 3).map(day => (
                          <span key={day} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {ALL_DAYS.find(d => d.value === day)?.label.slice(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-sm">Svi dani</span>
                      )}
                      {employee.availability && employee.availability.length > 3 && (
                        <span className="text-slate-400 text-xs">+{employee.availability.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Uredi"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveEmployee(employee.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Obriši"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingEmployee ? 'Uredi radnika' : 'Dodaj radnika'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ime i prezime *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Unesite ime i prezime"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Uloga *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Broj telefona
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="+387 61 123 456"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="email@primjer.com"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dostupnost (dani)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.availability.includes(day.value)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Odustani
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

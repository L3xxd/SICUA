import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Users, Filter, Edit3, RefreshCw } from 'lucide-react';

const EmployeesManagement: React.FC = () => {
  const { users, updateUser, searchQuery } = useApp();
  const { currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [vacTotal, setVacTotal] = useState<number>(0);
  const [vacUsed, setVacUsed] = useState<number>(0);

  const departments = useMemo(() => Array.from(new Set(users.map(u => u.department))).sort(), [users]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users
      .filter(u => (roleFilter ? u.role === roleFilter : true))
      .filter(u => (deptFilter ? u.department === deptFilter : true))
      .filter(u => !q || `${u.name} ${u.department} ${u.position}`.toLowerCase().includes(q));
  }, [users, roleFilter, deptFilter, searchQuery]);

  const openEdit = (id: string) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    setEditId(id);
    setVacTotal(u.vacationDays);
    setVacUsed(u.usedVacationDays);
  };

  const saveEdit = () => {
    if (!editId) return;
    updateUser(editId, { vacationDays: vacTotal, usedVacationDays: Math.min(vacTotal, vacUsed) });
    setEditId(null);
  };

  if (currentUser?.role !== 'hr' && currentUser?.role !== 'director') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Acceso restringido a Recursos Humanos y Dirección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="mt-1 text-sm text-gray-500">Administra vacaciones y datos básicos del personal</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1" htmlFor="role">Rol</label>
            <select id="role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Todos</option>
              <option value="employee">Empleado</option>
              <option value="supervisor">Supervisor</option>
              <option value="hr">RRHH</option>
              <option value="director">Director</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1" htmlFor="dept">Departamento</label>
            <select id="dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Todos</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {(roleFilter || deptFilter) && (
            <button className="text-sm underline text-gray-600" onClick={() => { setRoleFilter(''); setDeptFilter(''); }}>Limpiar</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 border-b">
          <div className="col-span-4">Empleado</div>
          <div className="col-span-3">Departamento</div>
          <div className="col-span-2">Rol</div>
          <div className="col-span-2 text-right">Vacaciones</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>
        {filtered.map(u => (
          <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b last:border-b-0 items-center text-sm">
            <div className="col-span-4">
              <p className="font-medium text-gray-900">{u.name}</p>
              <p className="text-xs text-gray-500">{u.position}</p>
            </div>
            <div className="col-span-3">{u.department}</div>
            <div className="col-span-2 capitalize">{u.role}</div>
            <div className="col-span-2 text-right">{u.usedVacationDays}/{u.vacationDays}</div>
            <div className="col-span-1 text-right">
              <button onClick={() => openEdit(u.id)} className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs hover:bg-gray-50"><Edit3 className="h-3 w-3 mr-1"/>Editar</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500">Sin resultados</div>
        )}
      </div>

      {editId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Editar vacaciones</h3>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">Total
                <input type="number" value={vacTotal} onChange={(e) => setVacTotal(parseInt(e.target.value || '0', 10))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </label>
              <label className="block">Usadas
                <input type="number" value={vacUsed} onChange={(e) => setVacUsed(parseInt(e.target.value || '0', 10))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setVacUsed(0)} className="text-sm text-gray-600 inline-flex items-center"><RefreshCw className="h-4 w-4 mr-1"/>Reiniciar usadas</button>
              <div className="flex gap-2">
                <button onClick={() => setEditId(null)} className="px-3 py-2 text-sm rounded-md border border-gray-300">Cancelar</button>
                <button onClick={saveEdit} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManagement;


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
  const [editName, setEditName] = useState<string>('');
  const [editPosition, setEditPosition] = useState<string>('');
  const [editDept, setEditDept] = useState<string>('');
  const [editSupervisorId, setEditSupervisorId] = useState<string>('');
  const [vacTotal, setVacTotal] = useState<number>(0);
  const [vacUsed, setVacUsed] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const departments = useMemo(() => Array.from(new Set(users.map(u => u.department))).sort(), [users]);
  const supervisors = useMemo(() => users.filter(u => u.role === 'supervisor'), [users]);
  // Conjunto de subordinados (directos e indirectos) del empleado en edición
  const downlineIds = useMemo(() => {
    if (!editId) return new Set<string>();
    const set = new Set<string>();
    const bySupervisor = new Map<string, string[]>();
    users.forEach(u => {
      if (u.supervisorId) {
        const arr = bySupervisor.get(u.supervisorId) || [];
        arr.push(u.id);
        bySupervisor.set(u.supervisorId, arr);
      }
    });
    const stack = [editId];
    while (stack.length) {
      const id = stack.pop()!;
      const children = bySupervisor.get(id) || [];
      for (const child of children) {
        if (!set.has(child)) {
          set.add(child);
          stack.push(child);
        }
      }
    }
    return set;
  }, [users, editId]);

  const supervisorsByDept = useMemo(() => supervisors.filter(s => s.department === editDept && !downlineIds.has(s.id)), [supervisors, editDept, downlineIds]);

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
    setEditName(u.name);
    setEditPosition(u.position);
    setEditDept(u.department);
    setEditSupervisorId(u.supervisorId || '');
    setVacTotal(u.vacationDays);
    setVacUsed(u.usedVacationDays);
  };

  const saveEdit = () => {
    if (!editId) return;
    setConfirmOpen(true);
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
            <h3 className="text-lg font-semibold text-gray-900">Editar empleado</h3>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">Nombre
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </label>
              <label className="block">Puesto
                <input type="text" value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">Departamento
                  <select
                    value={editDept}
                    onChange={(e) => {
                      const nextDept = e.target.value;
                      setEditDept(nextDept);
                      // Si el supervisor actual no pertenece al nuevo depto, limpiarlo
                      const stillValid = supervisors.some(s => s.id === editSupervisorId && s.department === nextDept);
                      if (!stillValid) setEditSupervisorId('');
                    }}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="block">Supervisor
                  <select
                    value={editSupervisorId}
                    onChange={(e) => setEditSupervisorId(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Sin supervisor</option>
                    {supervisorsByDept.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">Vacaciones totales
                  <input type="number" min={0} value={vacTotal} onChange={(e) => setVacTotal(parseInt(e.target.value || '0', 10))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </label>
                <label className="block">Vacaciones usadas
                  <input type="number" min={0} value={vacUsed} onChange={(e) => setVacUsed(parseInt(e.target.value || '0', 10))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </label>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setVacUsed(0)} className="text-sm text-gray-600 inline-flex items-center"><RefreshCw className="h-4 w-4 mr-1"/>Reiniciar usadas</button>
              <div className="flex gap-2">
                <button onClick={() => setEditId(null)} className="px-3 py-2 text-sm rounded-md border border-gray-300">Cancelar</button>
                {(() => {
                  const invalidSelf = editSupervisorId && editSupervisorId === editId;
                  const validSupervisor = !editSupervisorId || supervisors.some(s => s.id === editSupervisorId && s.department === editDept);
                  const invalidDownline = editSupervisorId ? downlineIds.has(editSupervisorId) : false;
                  const canSave = !!editName.trim() && !!editPosition.trim() && validSupervisor && !invalidSelf && !invalidDownline;
                  return (
                    <button onClick={saveEdit} disabled={!canSave} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-60">Guardar</button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm changes modal */}
      {confirmOpen && editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar cambios</h3>
            {(() => {
              const original = users.find(u => u.id === editId)!;
              const changes: Array<{label:string; from:any; to:any}> = [];
              if (original.name !== editName) changes.push({ label: 'Nombre', from: original.name, to: editName });
              if (original.position !== editPosition) changes.push({ label: 'Puesto', from: original.position, to: editPosition });
              if (original.department !== editDept) changes.push({ label: 'Departamento', from: original.department, to: editDept });
              if ((original.supervisorId || '') !== editSupervisorId) changes.push({ label: 'Supervisor', from: original.supervisorId || '—', to: (supervisors.find(s => s.id === editSupervisorId)?.name || '—') });
              if (original.vacationDays !== vacTotal) changes.push({ label: 'Vacaciones totales', from: original.vacationDays, to: vacTotal });
              if (original.usedVacationDays !== vacUsed) changes.push({ label: 'Vacaciones usadas', from: original.usedVacationDays, to: vacUsed });
              return (
                <div className="mt-4">
                  {changes.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay cambios por aplicar.</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {changes.map((c, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="text-gray-700">{c.label}</span>
                          <span className="text-gray-500 line-through mr-2">{String(c.from)}</span>
                          <span className="font-medium">{String(c.to)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}
            <div className="mt-4 text-sm">
              {editSupervisorId === editId && (
                <div className="text-red-600">Un empleado no puede ser su propio supervisor. Selecciona otro supervisor.</div>
              )}
              {editSupervisorId && supervisors.find(s => s.id === editSupervisorId)?.department !== editDept && (
                <div className="text-orange-600">El supervisor seleccionado no pertenece al departamento elegido. Ajusta el supervisor o el departamento.</div>
              )}
              {editSupervisorId && downlineIds.has(editSupervisorId) && (
                <div className="text-red-600">No puedes asignar como supervisor a un subordinado (evita ciclos de reporte).</div>
              )}
            </div>
            <div className="mt-6 text-xs text-gray-500">Los cambios se aplican inmediatamente y no afectan registros históricos.</div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-2 text-sm rounded-md border border-gray-300">Cancelar</button>
              <button
                onClick={() => {
                  updateUser(editId, {
                    name: editName.trim() || undefined,
                    position: editPosition.trim() || undefined,
                    department: editDept,
                    supervisorId: editSupervisorId || undefined,
                    vacationDays: vacTotal,
                    usedVacationDays: Math.min(vacTotal, vacUsed),
                  });
                  setConfirmOpen(false);
                  setEditId(null);
                }}
                disabled={!!(editSupervisorId && (editSupervisorId === editId || supervisors.find(s => s.id === editSupervisorId)?.department !== editDept || downlineIds.has(editSupervisorId)))}
                className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-60"
              >
                Confirmar y guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManagement;

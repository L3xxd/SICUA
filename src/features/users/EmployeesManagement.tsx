import React, { useMemo, useState } from 'react';
import { roleLabel } from '../../shared/utils/labels';
import { useApp } from '../../app/providers/AppContext';
import { useAuth } from '../../app/providers/AuthContext';
import { Users, Filter, Edit3, Plus } from 'lucide-react';
import { getVacationEntitlement } from '../../shared/utils/policies/vacations';
import { DEPARTMENTS } from '../../shared/data/departments';

const EmployeesManagement: React.FC = () => {
  const { users, updateUser, addUser, searchQuery } = useApp();
  const { currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPosition, setEditPosition] = useState<string>('');
  const [editDept, setEditDept] = useState<string>('');
  const [editSupervisorId, setEditSupervisorId] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editHireDate, setEditHireDate] = useState<string>('');
  const [editContractType, setEditContractType] = useState<'fijo'|'temporal'|''>('');
  const [editBarcode, setEditBarcode] = useState<string>('');
  const [editAssignments, setEditAssignments] = useState<Array<{department:string; position:string}>>([]);
  const [editPass, setEditPass] = useState<string>('');
  const [editPass2, setEditPass2] = useState<string>('');
  // Eliminado manejo manual de vacaciones (se calcula por políticas)
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  // Create modal fields
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cRole, setCRole] = useState<'employee'|'supervisor'|'hr'|'director'>('employee');
  const [cDept, setCDept] = useState('');
  const [cPosition, setCPosition] = useState('');
  const [cSupervisorId, setCSupervisorId] = useState('');
  const [cPass, setCPass] = useState('');
  const [cPass2, setCPass2] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cHireDate, setCHireDate] = useState('');
  const [cContractType, setCContractType] = useState<'fijo'|'temporal'|''>('');
  const [cBarcode, setCBarcode] = useState('');
  const [cAssignments, setCAssignments] = useState<Array<{department:string; position:string}>>([]);
  const emailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(cEmail.trim()), [cEmail]);
  const emailExists = useMemo(() => users.some(u => u.email.toLowerCase() === cEmail.trim().toLowerCase()), [users, cEmail]);
  const supervisorsByDeptCreate = useMemo(() => users.filter(u => u.role === 'supervisor' && u.department === cDept), [users, cDept]);

  React.useEffect(() => {
    if (cSupervisorId && !supervisorsByDeptCreate.some(s => s.id === cSupervisorId)) {
      setCSupervisorId('');
    }
  }, [cDept]);

  const departments = useMemo(() => {
    const set = new Set<string>(DEPARTMENTS);
    users.forEach(u => set.add(u.department));
    return Array.from(set).sort();
  }, [users]);
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
    setEditEmail(u.email);
    setEditPosition(u.position);
    setEditDept(u.department);
    setEditSupervisorId(u.supervisorId || '');
    setEditPhone((u as any).phone || '');
    setEditHireDate((u as any).hireDate ? String((u as any).hireDate).slice(0,10) : '');
    setEditContractType((((u as any).contractType as any) || '') as any);
    setEditBarcode((u as any).barcode || '');
    setEditAssignments(((u as any).assignments as any[] | undefined)?.map(a => ({ department: a.department, position: a.position })) || [{ department: u.department, position: u.position }]);
    setEditPass('');
    setEditPass2('');
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

      <div className="bg-white dark:bg-[var(--bg-panel)] rounded-lg border border-gray-200 dark:border-[var(--border)] p-4">
        <div className="flex flex-wrap items-end gap-4 justify-between">
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

          {(currentUser?.role === 'hr' || currentUser?.role === 'director') && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => { setCreateOpen(true); setCDept(cDept || departments[0] || ''); setCSupervisorId(''); }}
                className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar empleado
              </button>
            </div>
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
            <div className="col-span-2">{roleLabel(u.role)}</div>
            <div className="col-span-2 text-right">{u.usedVacationDays}/{getVacationEntitlement(u as any)}</div>
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
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900">Editar empleado</h3>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">Nombre
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </label>
              <label className="block">Correo electrónico
                <input type="email" value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className={`mt-1 w-full border rounded-md px-3 py-2 ${(/[^\s@]+@[^\s@]+\.[^\s@]+/.test(editEmail) && !users.some(u => u.id !== editId && u.email.toLowerCase() === editEmail.toLowerCase())) ? 'border-gray-300' : 'border-red-500'}`} />
                {editEmail && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(editEmail) && (
                  <p className="text-xs text-red-600 mt-1">Formato de correo inválido.</p>
                )}
                {editEmail && users.some(u => u.id !== editId && u.email.toLowerCase() === editEmail.toLowerCase()) && (
                  <p className="text-xs text-red-600 mt-1">Este correo ya está registrado.</p>
                )}
              </label>
              <label className="block">Puesto
                <input type="text" value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">Teléfono
                  <input type="tel" value={editPhone} onChange={(e)=>setEditPhone(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </label>
                <label className="block">Fecha de ingreso
                  <input type="date" value={editHireDate} onChange={(e)=>setEditHireDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </label>
              </div>
              <label className="block">Tipo de contrato
                <select value={editContractType} onChange={(e)=>setEditContractType(e.target.value as any)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Seleccione…</option>
                  <option value="fijo">Fijo</option>
                  <option value="temporal">Temporal</option>
                </select>
              </label>
              <label className="block">Código de barras
                <div className="mt-1 flex gap-2">
                  <input type="text" value={editBarcode} onChange={(e)=>setEditBarcode(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                {editBarcode && users.some(u => u.id !== editId && (u as any).barcode === editBarcode) && (
                  <p className="mt-1 text-xs text-red-600">Este código de barras ya existe.</p>
                )}
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

              {/* Asignaciones múltiples */}
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-700 mb-1">Asignaciones (Depto + Puesto)</div>
                <div className="space-y-2">
                  {editAssignments.map((a, idx) => {
                    const used = new Set(editAssignments.map(x => x.department));
                    const dup = editAssignments.filter(x => x.department === a.department).length > 1;
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <select
                            value={a.department}
                            onChange={e => {
                              const v = e.target.value;
                              setEditAssignments(prev => prev.map((x,i)=> i===idx ? { ...x, department: v } : x));
                            }}
                            className={`w-full border rounded-md px-3 py-2 ${dup ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Selecciona…</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="col-span-6">
                          <input
                            value={a.position}
                            onChange={e => setEditAssignments(prev => prev.map((x,i)=> i===idx ? { ...x, position: e.target.value } : x))}
                            placeholder="Puesto"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button type="button" onClick={() => setEditAssignments(prev => prev.filter((_,i)=>i!==idx))} className="px-2 py-1 text-xs border rounded">-</button>
                        </div>
                        {dup && <div className="col-span-12 text-xs text-red-600">Departamento duplicado; ajusta la selección.</div>}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setEditAssignments(prev => [...prev, { department: '', position: '' }])} className="px-2 py-1 text-xs border rounded">+ Agregar asignación</button>
                  <div className="text-xs text-gray-500">Puedes tener varias asignaciones; no se requiere principal.</div>
                </div>
              </div>
              {/* Campos de vacaciones removidos (se calculan automáticamente) */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">Nueva contraseña (opcional)
                  <input type="password" value={editPass} onChange={(e)=>setEditPass(e.target.value)} className={`mt-1 w-full border rounded-md px-3 py-2 ${editPass && editPass.length < 6 ? 'border-red-500' : 'border-gray-300'}`} placeholder="Mín. 6 caracteres" />
                  {editPass && editPass.length < 6 && (
                    <p className="text-xs text-red-600 mt-1">Debe tener al menos 6 caracteres.</p>
                  )}
                </label>
                <label className="block">Confirmar contraseña
                  <input type="password" value={editPass2} onChange={(e)=>setEditPass2(e.target.value)} className={`mt-1 w-full border rounded-md px-3 py-2 ${(editPass2 && editPass !== editPass2) ? 'border-red-500' : 'border-gray-300'}`} />
                  {editPass2 && editPass !== editPass2 && (
                    <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden.</p>
                  )}
                </label>
              </div>
              {editHireDate && (
                <div className="text-xs text-gray-600">Antigüedad: {(() => {
                  const hd = new Date(editHireDate);
                  const now = new Date();
                  let years = now.getFullYear() - hd.getFullYear();
                  const m = now.getMonth() - hd.getMonth();
                  if (m < 0 || (m === 0 && now.getDate() < hd.getDate())) years--;
                  return `${years} año${years === 1 ? '' : 's'}`;
                })()}</div>
              )}
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 mt-6 py-3 px-0 flex items-center justify-end">
              <div className="flex gap-2">
                <button onClick={() => setEditId(null)} className="px-3 py-2 text-sm rounded-md border border-gray-300">Cancelar</button>
                {(() => {
                  const invalidSelf = editSupervisorId && editSupervisorId === editId;
                  const validSupervisor = !editSupervisorId || supervisors.some(s => s.id === editSupervisorId && s.department === editDept);
                  const invalidDownline = editSupervisorId ? downlineIds.has(editSupervisorId) : false;
                  const barcodeTaken = !!(editBarcode && users.some(u => u.id !== editId && (u as any).barcode === editBarcode));
                  const emailValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(editEmail);
                  const emailTaken = users.some(u => u.id !== editId && u.email.toLowerCase() === editEmail.toLowerCase());
                  const passOk = (!editPass && !editPass2) || (editPass.length >= 6 && editPass === editPass2);
                  const dupAssign = editAssignments.some(a => a.department && editAssignments.filter(x => x.department === a.department).length > 1);
                  const canSave = !!editName.trim() && emailValid && !emailTaken && passOk && validSupervisor && !invalidSelf && !invalidDownline && !barcodeTaken && !dupAssign;
                  return (
                    <button onClick={saveEdit} disabled={!canSave} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-60">Guardar</button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create employee modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white dark:bg-[var(--bg-panel)] rounded-lg border border-gray-200 dark:border-[var(--border)] shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Agregar empleado</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <label className="block">Nombre
                <input className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cName} onChange={e=>setCName(e.target.value)} />
              </label>
              <label className="block">Email
                <input type="email" className={`mt-1 w-full border rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)] ${((!emailValid && cEmail) || emailExists) ? 'border-red-500' : 'border-gray-300 dark:border-[var(--border)]'}`} value={cEmail} onChange={e=>setCEmail(e.target.value)} />
                {!emailValid && cEmail && (
                  <p className="mt-1 text-xs text-red-500">Formato de correo inválido.</p>
                )}
                {emailExists && (
                  <p className="mt-1 text-xs text-red-500">Este correo ya está registrado.</p>
                )}
              </label>
              <label className="block">Teléfono
                <input className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cPhone} onChange={e=>setCPhone(e.target.value)} />
              </label>
              <label className="block">Fecha de ingreso
                <input type="date" className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cHireDate} onChange={e=>setCHireDate(e.target.value)} />
              </label>
              <label className="block">Rol
                <select className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cRole} onChange={e=>setCRole(e.target.value as any)}>
                  <option value="employee">Empleado</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="hr">RRHH</option>
                  <option value="director">Director</option>
                </select>
              </label>
              <label className="block">Departamento
                <select className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cDept} onChange={e=>setCDept(e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">Puesto
                <input className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cPosition} onChange={e=>setCPosition(e.target.value)} />
              </label>
              <label className="block sm:col-span-2">Tipo de contrato
                <select className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cContractType} onChange={e=>setCContractType(e.target.value as any)}>
                  <option value="">Seleccione…</option>
                  <option value="fijo">Fijo</option>
                  <option value="temporal">Temporal</option>
                </select>
              </label>
              <label className="block sm:col-span-2">Código de barras
                <div className="mt-1 flex gap-2">
                  <input className={`w-full border rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)] ${cBarcode && users.some(u => (u as any).barcode === cBarcode) ? 'border-red-500' : 'border-gray-300 dark:border-[var(--border)]'}`} value={cBarcode} onChange={e=>setCBarcode(e.target.value)} />
                  <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300" onClick={()=>{
                    const code = `EMP-${Math.random().toString(36).slice(2,8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
                    setCBarcode(code);
                  }}>Generar</button>
                </div>
                {cBarcode && users.some(u => (u as any).barcode === cBarcode) && (
                  <p className="mt-1 text-xs text-red-500">Este código ya existe. Genera otro.</p>
                )}
              </label>
              <label className="block">Supervisor
                <select className="mt-1 w-full border border-gray-300 dark:border-[var(--border)] rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)]" value={cSupervisorId} onChange={e=>setCSupervisorId(e.target.value)}>
                  <option value="">Sin supervisor</option>
                  {users.filter(u => u.role === 'supervisor' && u.department === cDept).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="block">Contraseña (mín. 6)
                <input type="password" className={`mt-1 w-full border rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)] ${(cPass && cPass.length < 6) ? 'border-red-500' : 'border-gray-300 dark:border-[var(--border)]'}`} value={cPass} onChange={e=>setCPass(e.target.value)} />
                {cPass && cPass.length < 6 && (
                  <p className="mt-1 text-xs text-red-500">La contraseña debe tener al menos 6 caracteres.</p>
                )}
              </label>
              <label className="block">Confirmar contraseña
                <input type="password" className={`mt-1 w-full border rounded-md px-3 py-2 dark:bg-[var(--bg-panel)] dark:text-[var(--text-primary)] ${(cPass2 && cPass != cPass2) ? 'border-red-500' : 'border-gray-300 dark:border-[var(--border)]'}`} value={cPass2} onChange={e=>setCPass2(e.target.value)} />
                {cPass2 && cPass != cPass2 && (
                  <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden.</p>
                )}
              </label>
              {/* Campos de vacaciones retirados para evitar conflictos con el cálculo automático */}
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-[var(--bg-panel)] border-t border-gray-200 dark:border-[var(--border)] mt-4 py-3 flex items-center justify-end gap-2">
              <button onClick={()=>setCreateOpen(false)} className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-[var(--border)]">Cancelar</button>
              <button
                onClick={()=>{
                  addUser({
                    name:cName.trim(),
                    email:cEmail.trim(),
                    password: cPass.trim(),
                    role:cRole,
                    department:cDept,
                    position:cPosition.trim(),
                    supervisorId: cSupervisorId||undefined,
                    vacationDays: 0,
                    usedVacationDays: 0,
                    phone: cPhone || undefined,
                    hireDate: cHireDate ? new Date(cHireDate).toISOString() : undefined,
                    contractType: (cContractType as any) || undefined,
                    barcode: cBarcode || undefined,
                    assignments: cAssignments.filter(a => a.department && a.position),
                  } as any);
                  setCreateOpen(false);
                  setCName(''); setCEmail(''); setCRole('employee'); setCDept(''); setCPosition(''); setCSupervisorId(''); setCPass(''); setCPass2(''); setCPhone(''); setCHireDate(''); setCContractType(''); setCBarcode('');
                  setCAssignments([]);
                }}
                disabled={
                  !cName.trim() ||
                  !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(cEmail.trim()) ||
                  users.some(u => u.email.toLowerCase() === cEmail.trim().toLowerCase()) ||
                  !cDept ||
                  !cContractType ||
                  !cBarcode || users.some(u => (u as any).barcode === cBarcode) ||
                  cPass.length < 6 ||
                  cPass !== cPass2
                }
                className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                Guardar
              </button>
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
                    email: editEmail.trim() || undefined,
                    position: editPosition.trim() || undefined,
                    department: editDept,
                    supervisorId: editSupervisorId || undefined,
                    phone: editPhone || undefined,
                    hireDate: editHireDate ? new Date(editHireDate).toISOString() : undefined,
                    contractType: (editContractType as any) || undefined,
                    barcode: editBarcode || undefined,
                    assignments: editAssignments.filter(a => a.department && a.position),
                    ...(editPass && editPass === editPass2 && editPass.length >= 6 ? { password: editPass } : {}),
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

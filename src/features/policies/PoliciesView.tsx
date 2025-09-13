import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../app/providers/AppContext';
import { useAuth } from '../../app/providers/AuthContext';
import { Settings } from 'lucide-react';

const PoliciesView: React.FC = () => {
  const { policies, updatePolicy, policyHistory, addPolicyHistory } = useApp();
  const { currentUser } = useAuth();

  const canEdit = currentUser?.role === 'hr' || currentUser?.role === 'director';

  const [draft, setDraft] = useState(policies);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Mantener el borrador sincronizado si cambian políticas base
  useEffect(() => {
    setDraft(policies);
  }, [policies]);

  const onDraftChange = (id: string, patch: Partial<typeof policies[number]>) => {
    setDraft(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  // Diferencias entre policies y draft para el resumen
  const diffs = useMemo(() => {
    const list: Array<{ id: string; type: string; changes: Array<{ field: string; from: any; to: any }> }> = [];
    draft.forEach(d => {
      const base = policies.find(p => p.id === d.id);
      if (!base) return;
      const changes: Array<{ field: string; from: any; to: any }> = [];
      if (base.minAdvanceDays !== d.minAdvanceDays) changes.push({ field: 'Días de aviso mínimo', from: base.minAdvanceDays, to: d.minAdvanceDays });
      if (base.maxConsecutiveDays !== d.maxConsecutiveDays) changes.push({ field: 'Máx. días consecutivos', from: base.maxConsecutiveDays, to: d.maxConsecutiveDays });
      if (base.requiresApproval !== d.requiresApproval) changes.push({ field: 'Requiere aprobación', from: base.requiresApproval ? 'Sí' : 'No', to: d.requiresApproval ? 'Sí' : 'No' });
      if (base.approvalLevels.join(',') !== d.approvalLevels.join(',')) changes.push({ field: 'Niveles de aprobación', from: base.approvalLevels.join(', '), to: d.approvalLevels.join(', ') });
      if (changes.length) list.push({ id: d.id, type: d.type, changes });
    });
    return list;
  }, [draft, policies]);

  if (!canEdit) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Settings className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Acceso restringido a Recursos Humanos y Dirección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Políticas</h1>
        <p className="mt-1 text-sm text-gray-500">Configura las reglas de vacaciones, permisos y licencias</p>
      </div>

      <div className="space-y-4">
        {draft.map((p) => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 capitalize">{label(p.type)}</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <label className="block">Días de aviso mínimo
                <input type="number" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" value={p.minAdvanceDays}
                  onChange={(e) => onDraftChange(p.id, { minAdvanceDays: parseInt(e.target.value || '0', 10) })} />
              </label>
              <label className="block">Máx. días consecutivos
                <input type="number" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" value={p.maxConsecutiveDays}
                  onChange={(e) => onDraftChange(p.id, { maxConsecutiveDays: parseInt(e.target.value || '0', 10) })} />
              </label>
              <label className="block">Requiere aprobación
                <select className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" value={String(p.requiresApproval)}
                  onChange={(e) => onDraftChange(p.id, { requiresApproval: e.target.value === 'true' })}>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label className="block">Niveles de aprobación (coma)
                <input type="text" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  value={p.approvalLevels.join(', ')}
                  onChange={(e) => onDraftChange(p.id, { approvalLevels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <button
          disabled={diffs.length === 0}
          onClick={() => setConfirmOpen(true)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          Revisar y confirmar cambios
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar cambios en políticas</h3>
            <p className="mt-1 text-sm text-gray-600">Revisa el resumen antes de aplicar. Esta acción afectará solo solicitudes futuras.</p>

            {diffs.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No hay cambios pendientes.</p>
            ) : (
              <div className="mt-4 space-y-4 max-h-80 overflow-auto">
                {diffs.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-md">
                    <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium capitalize">{label(item.type)}</div>
                    <ul className="p-3 text-sm space-y-1">
                      {item.changes.map((c, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span className="text-gray-700">{c.field}</span>
                          <span className="text-gray-500 line-through mr-2">{String(c.from)}</span>
                          <span className="text-gray-900 font-medium">{String(c.to)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              Leyenda: los cambios aplican inmediatamente después de confirmar y no se aplican de forma retroactiva a solicitudes ya procesadas.
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-2 rounded-md border border-gray-300 text-gray-700">Cancelar</button>
              <button
                onClick={() => {
                  const now = new Date().toISOString();
                  const historyEntries = diffs.flatMap(d => (
                    d.changes.map(c => ({
                      id: d.id,
                      type: d.type as any,
                      field: c.field,
                      from: c.from,
                      to: c.to,
                      actor: currentUser?.name || 'Desconocido',
                      date: now,
                    }))
                  ));
                  addPolicyHistory(historyEntries);
                  diffs.forEach(d => {
                    const next = draft.find(x => x.id === d.id);
                    if (next) updatePolicy(d.id, next);
                  });
                  setConfirmOpen(false);
                }}
                disabled={diffs.length === 0}
                className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
              >
                Confirmar y aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial de cambios */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Historial de cambios</h2>
          <button
            onClick={() => {
              const header = ['Fecha','Actor','Política','Campo','De','A'];
              const rows = policyHistory.map(h => [new Date(h.date).toLocaleString(), h.actor, label(h.type), h.field, String(h.from), String(h.to)]);
              const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'historial_politicas.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Exportar CSV
          </button>
        </div>
        {policyHistory.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">No hay cambios registrados.</p>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Actor</th>
                  <th className="text-left px-3 py-2">Política</th>
                  <th className="text-left px-3 py-2">Campo</th>
                  <th className="text-left px-3 py-2">De</th>
                  <th className="text-left px-3 py-2">A</th>
                </tr>
              </thead>
              <tbody>
                {policyHistory.slice(0, 50).map((h, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2 text-gray-600">{new Date(h.date).toLocaleString()}</td>
                    <td className="px-3 py-2">{h.actor}</td>
                    <td className="px-3 py-2">{label(h.type)}</td>
                    <td className="px-3 py-2">{h.field}</td>
                    <td className="px-3 py-2 text-gray-500">{String(h.from)}</td>
                    <td className="px-3 py-2 font-medium">{String(h.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  function label(t: string) {
    switch (t) {
      case 'vacation': return 'Vacaciones';
      case 'permission': return 'Permisos';
      case 'leave': return 'Licencias';
      default: return t;
    }
  }
};

export default PoliciesView;

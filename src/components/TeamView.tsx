import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { Users, Search, Clock, CheckCircle } from 'lucide-react';

const TeamView: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests, searchQuery } = useApp();
  const [groupByDept, setGroupByDept] = useState<boolean>(false);
  // searchQuery proviene del header

  const isSupervisor = currentUser?.role === 'supervisor';
  const isHRorDirector = currentUser?.role === 'hr' || currentUser?.role === 'director';

  const people = useMemo(() => {
    if (isSupervisor) {
      return mockUsers.filter(u => u.supervisorId === currentUser?.id);
    }
    if (isHRorDirector) {
      return mockUsers.filter(u => u.role === 'employee' || u.role === 'supervisor');
    }
    return mockUsers.filter(u => u.id === currentUser?.id);
  }, [currentUser?.id, isSupervisor, isHRorDirector]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return people;
    return people.filter(p => `${p.name} ${p.department} ${p.position}`.toLowerCase().includes(q));
  }, [people, searchQuery]);

  // Agrupar por departamento (solo RH/Director)
  const grouped = useMemo(() => {
    if (!groupByDept || !(isHRorDirector)) return null;
    const map: Record<string, typeof filtered> = {} as any;
    filtered.forEach(p => {
      map[p.department] = map[p.department] || [];
      map[p.department].push(p);
    });
    // Orden alfabético por nombre de departamento
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupByDept, isHRorDirector]);

  const getStats = (userId: string) => {
    const mine = requests.filter(r => r.employeeId === userId);
    return {
      pending: mine.filter(r => r.status === 'pending' || r.status === 'in_review').length,
      approved: mine.filter(r => r.status === 'approved').length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Equipo</h1>
          <p className="mt-1 text-sm text-gray-500">Personas bajo tu gestión{isHRorDirector ? ' y supervisores' : ''}</p>
          {isHRorDirector && (
            <div className="mt-3">
              <span className="text-xs text-gray-500 mr-2">Vista</span>
              <div className="inline-flex items-center bg-gray-100 rounded-md p-1 text-sm">
                <button
                  className={`px-3 py-1 rounded ${!groupByDept ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  onClick={() => setGroupByDept(false)}
                >
                  Lista
                </button>
                <button
                  className={`px-3 py-1 rounded ${groupByDept ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  onClick={() => setGroupByDept(true)}
                >
                  Por departamento
                </button>
              </div>
            </div>
          )}
        </div>
        {/* sin buscador local: usar el del header */}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron personas con ese criterio.</p>
        </div>
      ) : groupByDept && grouped ? (
        <div className="space-y-6">
          {grouped.map(([dept, people]) => (
            <div key={dept} className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-700">{dept}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{people.length} miembros</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map((p) => renderCard(p))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const initials = p.name.split(' ').map(n => n[0]).join('');
            const stats = getStats(p.id);
            const pct = p.vacationDays > 0 ? Math.min(100, Math.max(0, (p.usedVacationDays / p.vacationDays) * 100)) : 0;
            return (
              renderCard(p)
            );
          })}
        </div>
      )}
    </div>
  );

  function renderCard(p: typeof people[number]) {
    const initials = p.name.split(' ').map(n => n[0]).join('');
    const stats = getStats(p.id);
    const pct = p.vacationDays > 0 ? Math.min(100, Math.max(0, (p.usedVacationDays / p.vacationDays) * 100)) : 0;
    return (
      <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">{initials}</span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500">{p.position} • {p.department}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-orange-600">
            <Clock className="h-4 w-4" /> {stats.pending} pendientes
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" /> {stats.approved} aprobadas
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Vacaciones usadas</span>
            <span className="font-medium text-gray-700">{p.usedVacationDays}/{p.vacationDays}</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }
};

export default TeamView;

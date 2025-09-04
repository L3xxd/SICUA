import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { Users, Search, Clock, CheckCircle } from 'lucide-react';

const TeamView: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests } = useApp();
  const [query, setQuery] = useState('');

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
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(p => `${p.name} ${p.department} ${p.position}`.toLowerCase().includes(q));
  }, [people, query]);

  const getStats = (userId: string) => {
    const mine = requests.filter(r => r.employeeId === userId);
    return {
      pending: mine.filter(r => r.status === 'pending' || r.status === 'in_review').length,
      approved: mine.filter(r => r.status === 'approved').length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Equipo</h1>
          <p className="mt-1 text-sm text-gray-500">Personas bajo tu gestión{isHRorDirector ? ' y supervisores' : ''}</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, área o puesto"
            className="pl-10 pr-3 py-2 w-72 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron personas con ese criterio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
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
          })}
        </div>
      )}
    </div>
  );
};

export default TeamView;


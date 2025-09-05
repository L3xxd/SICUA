import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Users, BarChart3, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

const ExecutiveReports: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests } = useApp();

  if (currentUser?.role !== 'director') {
    return (
      <div className="bg-white dark:bg-[var(--bg-panel)] border border-gray-200 dark:border-[var(--border)] rounded-lg p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-[var(--text-secondary)]">Acceso restringido a Dirección.</p>
      </div>
    );
  }

  const total = requests.length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const pending = requests.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;

  const byDept = useMemo(() => {
    const m = new Map<string, { requests: number; approved: number; pending: number }>();
    requests.forEach(r => {
      const dept = r.department || mockUsers.find(u => u.id === r.employeeId)?.department || 'Sin depto';
      const row = m.get(dept) || { requests: 0, approved: 0, pending: 0 };
      row.requests += 1;
      if (r.status === 'approved') row.approved += 1;
      if (r.status === 'pending' || r.status === 'in_review') row.pending += 1;
      m.set(dept, row);
    });
    return Array.from(m, ([name, stats]) => ({ name, ...stats })).sort((a,b)=>b.requests-a.requests);
  }, [requests]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Reportes Ejecutivos</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-[var(--text-secondary)]">Visión general de la organización</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi icon={Users} color="bg-blue-500" title="Solicitudes totales" value={total} />
        <Kpi icon={CheckCircle} color="bg-green-500" title="Aprobadas" value={approved} />
        <Kpi icon={Clock} color="bg-orange-500" title="En revisión" value={pending} />
        <Kpi icon={BarChart3} color="bg-purple-500" title="Tasa de aprobación" value={`${approvalRate}%`} />
      </div>

      {/* Por departamento */}
      <div className="bg-white dark:bg-[var(--bg-panel)] border border-gray-200 dark:border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)]">Top departamentos</h2>
          <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">Ordenado por volumen</span>
        </div>
        <div className="space-y-3">
          {byDept.slice(0,6).map((d) => {
            const rate = d.requests ? Math.round((d.approved / d.requests) * 100) : 0;
            return (
              <div key={d.name} className="p-3 border border-gray-200 dark:border-[var(--border)] rounded-md">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{d.name}</p>
                  <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">{d.requests} solicitudes</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-[#2C2C2C] rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${rate}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-[var(--text-secondary)]">Aprobación: {rate}% • Pendientes: {d.pending}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Kpi: React.FC<{ icon: any; color: string; title: string; value: React.ReactNode }> = ({ icon: Icon, color, title, value }) => (
  <div className="bg-white dark:bg-[var(--bg-panel)] border border-gray-200 dark:border-[var(--border)] rounded-lg p-6">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  </div>
);

export default ExecutiveReports;


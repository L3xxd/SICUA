import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

const AnalyticsView: React.FC = () => {
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

  const vacations = requests.filter(r => r.type === 'vacation');
  const byMonth = new Map<string, number>();
  vacations.forEach(r => {
    const d = new Date(r.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    byMonth.set(key, (byMonth.get(key) || 0) + 1);
  });
  const series = Array.from(byMonth, ([k,v]) => ({ k, v })).sort((a,b)=>a.k.localeCompare(b.k));
  const last3 = series.slice(-3).map(s=>s.v);
  const forecastNext = last3.length ? Math.round(last3.reduce((a,b)=>a+b,0) / last3.length) : 0;

  const riskDepts = useMemo(() => {
    const m = new Map<string, { used: number; total: number }>();
    mockUsers.forEach(u => {
      const row = m.get(u.department) || { used: 0, total: 0 };
      row.used += u.usedVacationDays;
      row.total += u.vacationDays;
      m.set(u.department, row);
    });
    return Array.from(m, ([dept, s]) => ({ dept, pct: s.total ? Math.round((s.used/s.total)*100) : 0 }))
      .sort((a,b)=>b.pct-a.pct)
      .slice(0,5);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Análisis Predictivo</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-[var(--text-secondary)]">Estimaciones y riesgos operativos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[var(--bg-panel)] border border-gray-200 dark:border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg"><Calendar className="h-6 w-6 text-white" /></div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Pronóstico vacaciones (próximo mes)</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">{forecastNext}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--bg-panel)] border border-gray-200 dark:border-[var(--border)] rounded-lg p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg"><TrendingUp className="h-6 w-6 text-white" /></div>
              <h3 className="ml-4 text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Riesgo por consumo de vacaciones</h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">Top 5</span>
          </div>
          <div className="mt-4 space-y-3">
            {riskDepts.map(r => (
              <div key={r.dept}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 dark:text-[var(--text-primary)]">{r.dept}</span>
                  <span className="text-gray-600 dark:text-[var(--text-secondary)]">{r.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#2C2C2C] h-2 rounded-full">
                  <div className={`h-2 rounded-full ${r.pct >= 80 ? 'bg-red-500' : r.pct >= 60 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;


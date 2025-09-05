import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DirectorDashboard: React.FC = () => {
  const { requests, users, refreshAll } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => { refreshAll().catch(() => {}); }, []);

  const totalEmployees = users.length;
  const totalVacationDays = users.reduce(
    (sum, user) => sum + (user.vacationDays || 0),
    0
  );
  const usedVacationDays = users.reduce(
    (sum, user) => sum + (user.usedVacationDays || 0),
    0
  );

  const utilizationRate =
    totalVacationDays > 0
      ? ((usedVacationDays / totalVacationDays) * 100).toFixed(1)
      : '0';

  const approvalRate =
    requests.length > 0
      ? (
          (requests.filter((r) => r.status === 'approved').length /
            requests.length) *
          100
        ).toFixed(1)
      : '0';

  const kpis = [
    {
      title: 'Empleados Activos',
      value: totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+2.3%',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Tasa de Utilización',
      value: `${utilizationRate}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: '+5.1%',
      onClick: () => navigate('/analytics'),
    },
    {
      title: 'Tasa de Aprobación',
      value: `${approvalRate}%`,
      icon: Target,
      color: 'bg-purple-500',
      trend: '-1.2%',
      onClick: () => navigate('/approvals'),
    },
    {
      title: 'Solicitudes Procesadas',
      value: requests.length,
      icon: BarChart3,
      color: 'bg-orange-500',
      trend: '+12.5%',
      onClick: () => navigate('/reports'),
    },
  ];

  // Data-driven predictive summary for next 3 months
  const predictiveInsights = React.useMemo(() => {
    const now = new Date();
    const result: { period: string; prediction: string; impact: 'Alto'|'Medio'|'Bajo'; recommendation: string }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString(undefined, { month: 'long' });
      const year = d.getFullYear();
      const monthRequests = requests.filter(r => (r.startDate || '').startsWith(ym));
      const count = monthRequests.length;
      let impact: 'Alto'|'Medio'|'Bajo' = 'Bajo';
      if (count >= 15) impact = 'Alto';
      else if (count >= 7) impact = 'Medio';
      const prediction = count === 0
        ? 'Sin picos previstos'
        : `${count} solicitudes programadas`;
      const recommendation = impact === 'Alto'
        ? 'Considerar restricciones temporales'
        : impact === 'Medio'
        ? 'Monitorear cargas críticas'
        : 'Operación normal';
      result.push({ period: `${capitalize(monthName)} ${year}`, prediction, impact, recommendation });
    }
    return result;
  }, [requests]);

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Análisis estratégico y predictivo del personal
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <button
            key={index}
            onClick={kpi.onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    {kpi.title}
                  </h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {kpi.value}
                  </p>
                </div>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  kpi.trend.startsWith('+')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {kpi.trend}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Análisis predictivo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Análisis Predictivo
          </h2>
          <PieChart className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {predictiveInsights.map((insight, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{insight.period}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {insight.prediction}
                  </p>
                  <p className="text-sm text-blue-600 mt-1 font-medium">
                    {insight.recommendation}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    insight.impact === 'Alto'
                      ? 'bg-red-100 text-red-800'
                      : insight.impact === 'Medio'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  Impacto {insight.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Métricas de Productividad
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disponibilidad promedio</span>
              <span className="font-semibold text-gray-900">
                {(() => {
                  const eligible = users.filter(u => (u.vacationDays || 0) > 0);
                  if (eligible.length === 0) return '—';
                  const avg = eligible.reduce((acc, u) => {
                    const used = u.usedVacationDays || 0;
                    const total = u.vacationDays || 0;
                    const avail = total > 0 ? 1 - used / total : 1;
                    return acc + avail;
                  }, 0) / eligible.length;
                  return `${(avg * 100).toFixed(1)}%`;
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiempo de aprobación promedio</span>
              <span className="font-semibold text-gray-900">
                {(() => {
                  const approved = requests.filter(r => r.status === 'approved' && r.requestDate && r.approvedDate);
                  if (approved.length === 0) return '—';
                  const avgDays = approved.reduce((acc, r) => {
                    const start = new Date(r.requestDate as string).getTime();
                    const end = new Date(r.approvedDate as string).getTime();
                    return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
                  }, 0) / approved.length;
                  return `${avgDays.toFixed(1)} días`;
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Solicitudes pendientes actuales</span>
              <span className="font-semibold text-gray-900">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
          </div>
        </div>

        {/* Próximas fechas críticas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Próximas Fechas Críticas
          </h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <Calendar className="h-4 w-4 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Vacaciones Navidad
                </p>
                <p className="text-xs text-red-600">
                  Dic 20-31: 60% ausencias esperadas
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Semana Santa
                </p>
                <p className="text-xs text-orange-600">
                  Mar 28-Apr 4: 45% ausencias esperadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;

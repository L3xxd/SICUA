import React from 'react';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import { Users, FileText, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HRDashboard: React.FC = () => {
  const { requests } = useApp();
  const navigate = useNavigate();

  const totalEmployees = mockUsers.length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;

  const approvalRate =
    totalRequests > 0
      ? (
          (requests.filter((r) => r.status === 'approved').length / totalRequests) *
          100
        ).toFixed(1)
      : '0';

  const stats = [
    {
      title: 'Total de empleados',
      value: totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Solicitudes este mes',
      value: totalRequests,
      icon: FileText,
      color: 'bg-green-500',
      onClick: () => navigate('/requests'),
    },
    {
      title: 'Pendientes de aprobación',
      value: pendingRequests,
      icon: AlertCircle,
      color: 'bg-orange-500',
      onClick: () => navigate('/approvals'),
    },
    {
      title: 'Tasa de aprobación',
      value: `${approvalRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      onClick: () => navigate('/reports'),
    },
  ];

  // Los 12 departamentos acordados
  const departmentStats = [
    { name: 'Agrocibernética',                                   employees: 12, vacationDays: 144, usedDays: 89 },
    { name: 'Biotecnología de Alimentos',                        employees:  8, vacationDays:  96, usedDays: 20 },
    { name: 'Biotecnología Agrícola',                            employees:  6, vacationDays:  72, usedDays: 34 },
    { name: 'Calidad Agroalimentaria e Inocuidad',               employees:  4, vacationDays:  48, usedDays: 23 },
    { name: 'Organismo Certificador',                            employees: 10, vacationDays: 120, usedDays: 23 },
    { name: 'Unidad de Inspección',                              employees: 15, vacationDays: 180, usedDays:  4 },
    { name: 'Unidad de Inspección de Información Comercial',     employees:  2, vacationDays:  24, usedDays: 14 },
    { name: 'Departamento de Comercialización',                  employees:  8, vacationDays:  96, usedDays:  8 },
    { name: 'Unidad de Apoyo Administrativo',                    employees: 10, vacationDays:  22, usedDays: 12 },
    { name: 'Mantenimiento',                                     employees:  2, vacationDays:  24, usedDays:  1 },
    { name: 'Recursos Humanos',                                  employees:  1, vacationDays:  12, usedDays:  0 },
    { name: 'Dirección General',                                 employees:  1, vacationDays:  12, usedDays:  0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Recursos Humanos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vista general del personal y gestión de solicitudes
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Resumen por Departamento (12) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Resumen por Departamento</h2>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {departmentStats.map((dept, index) => {
            const pct =
              dept.vacationDays > 0
                ? Math.min(100, Math.max(0, (dept.usedDays / dept.vacationDays) * 100))
                : 0;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500">{dept.employees} empleados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {dept.usedDays}/{dept.vacationDays} días usados
                  </p>
                  <div className="mt-1 w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          {requests.length > 0 && (
            <button
              onClick={() => navigate('/requests')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todas →
            </button>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="text-gray-500">Sin actividad reciente.</p>
        ) : (
          <div className="space-y-4">
            {requests.slice(0, 5).map((request) => {
              const typeLabel =
                request.type === 'vacation'
                  ? 'vacaciones'
                  : request.type === 'permission'
                  ? 'permiso'
                  : 'licencia';

              const badgeClass =
                request.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : request.status === 'pending'
                  ? 'bg-orange-100 text-orange-800'
                  : request.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800';

              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {request.employeeName.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">{request.employeeName}</p>
                      <p className="text-sm text-gray-500">
                        Solicitó {typeLabel} • {request.days} días
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                      {request.status === 'approved'
                        ? 'Aprobado'
                        : request.status === 'pending'
                        ? 'Pendiente'
                        : request.status === 'rejected'
                        ? 'Rechazado'
                        : 'En revisión'}
                    </span>
                    <span className="text-xs text-gray-500">{request.requestDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;

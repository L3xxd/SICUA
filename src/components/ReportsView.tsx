import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, Users, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';

const ReportsView: React.FC = () => {
  const { requests } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = ['all', 'Desarrollo', 'Ventas', 'Marketing', 'RRHH'];
  
  // Calcular estadísticas
  const totalRequests = requests.length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const reportData = [
    {
      title: 'Total de Solicitudes',
      value: totalRequests,
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+12.5%',
    },
    {
      title: 'Solicitudes Aprobadas',
      value: approvedRequests,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+8.2%',
    },
    {
      title: 'Tasa de Aprobación',
      value: `${((approvedRequests / totalRequests) * 100).toFixed(1)}%`,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+2.1%',
    },
    {
      title: 'Tiempo Promedio',
      value: '2.1 días',
      icon: Clock,
      color: 'bg-orange-500',
      change: '-0.5 días',
    },
  ];

  const typeDistribution = [
    { type: 'Vacaciones', count: requests.filter(r => r.type === 'vacation').length, color: 'bg-blue-500' },
    { type: 'Permisos', count: requests.filter(r => r.type === 'permission').length, color: 'bg-green-500' },
    { type: 'Licencias', count: requests.filter(r => r.type === 'leave').length, color: 'bg-purple-500' },
  ];

  const departmentUsage = departments.slice(1).map(dept => {
    const deptUsers = mockUsers.filter(u => u.department === dept);
    const deptRequests = requests.filter(r => 
      deptUsers.some(u => u.id === r.employeeId)
    );
    return {
      name: dept,
      employees: deptUsers.length,
      requests: deptRequests.length,
      avgDays: deptRequests.length > 0 ? (deptRequests.reduce((sum, r) => sum + r.days, 0) / deptRequests.length).toFixed(1) : '0',
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análisis detallado de ausencias y cumplimiento de políticas
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="monthly">Este mes</option>
            <option value="quarterly">Este trimestre</option>
            <option value="yearly">Este año</option>
          </select>
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'Todos los departamentos' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                item.change.startsWith('-') && item.title === 'Tiempo Promedio' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por tipo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo</h2>
          <div className="space-y-4">
            {typeDistribution.map((item, index) => {
              const percentage = totalRequests > 0 ? (item.count / totalRequests) * 100 : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                    <span className="text-sm text-gray-700">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Uso por departamento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Uso por Departamento</h2>
          <div className="space-y-4">
            {departmentUsage.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{dept.name}</p>
                    <p className="text-xs text-gray-500">{dept.employees} empleados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{dept.requests} solicitudes</p>
                  <p className="text-xs text-gray-500">Promedio: {dept.avgDays} días</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cumplimiento de políticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cumplimiento de Políticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">98%</span>
            </div>
            <h3 className="font-medium text-gray-900">Solicitudes a Tiempo</h3>
            <p className="text-sm text-gray-500">Enviadas con anticipación requerida</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">94%</span>
            </div>
            <h3 className="font-medium text-gray-900">Aprobación Automática</h3>
            <p className="text-sm text-gray-500">Cumplen criterios automáticos</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">2.1</span>
            </div>
            <h3 className="font-medium text-gray-900">Días Promedio</h3>
            <p className="text-sm text-gray-500">Tiempo de procesamiento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
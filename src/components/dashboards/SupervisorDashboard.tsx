import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import { Users, CheckSquare, Calendar, AlertTriangle } from 'lucide-react';

const SupervisorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests } = useApp();

  // Empleados bajo supervisión
  const teamMembers = mockUsers.filter(user => user.supervisorId === currentUser?.id);
  const teamRequests = requests.filter(request => 
    teamMembers.some(member => member.id === request.employeeId)
  );
  const pendingApprovals = teamRequests.filter(r => r.status === 'pending').length;
  const urgentRequests = teamRequests.filter(r => r.urgent && r.status === 'pending').length;

  const stats = [
    {
      title: 'Miembros del equipo',
      value: teamMembers.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Solicitudes pendientes',
      value: pendingApprovals,
      icon: CheckSquare,
      color: 'bg-orange-500',
    },
    {
      title: 'Solicitudes urgentes',
      value: urgentRequests,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Aprobaciones del mes',
      value: teamRequests.filter(r => r.status === 'approved').length,
      icon: Calendar,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Supervisor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las solicitudes de tu equipo
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Solicitudes Pendientes de Aprobación</h2>
        {teamRequests.filter(r => r.status === 'pending').length === 0 ? (
          <p className="text-gray-500">No hay solicitudes pendientes</p>
        ) : (
          <div className="space-y-4">
            {teamRequests.filter(r => r.status === 'pending').map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {request.employeeName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{request.employeeName}</p>
                    <p className="text-sm text-gray-500">
                      {request.type === 'vacation' ? 'Vacaciones' : 
                       request.type === 'permission' ? 'Permiso' : 'Licencia'} • 
                      {request.startDate} - {request.endDate} ({request.days} días)
                    </p>
                    <p className="text-sm text-gray-600">{request.reason}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {request.urgent && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Urgente
                    </span>
                  )}
                  <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                    Aprobar
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors">
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mi Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.position}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vacaciones usadas</span>
                  <span className="font-medium">{member.usedVacationDays}/{member.vacationDays}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(member.usedVacationDays / member.vacationDays) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
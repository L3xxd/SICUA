import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getVacationEntitlement } from '../../utils/policies/vacations';
import { User } from '../../types';

const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests, refreshAll } = useApp();

  React.useEffect(() => { refreshAll().catch(()=>{}); }, []);

  const myRequests = requests.filter(r => r.employeeId === currentUser?.id);

  // Calculate vacation entitlement and remaining days based on policy
  const entitlement = React.useMemo(() => {
    if (!currentUser) return 0;
    return getVacationEntitlement(currentUser as User);
  }, [currentUser]);

  const remainingVacation = React.useMemo(() => {
    if (!currentUser) return 0;
    // Determine current service year bounds
    const hireDate = currentUser.hireDate ? new Date(currentUser.hireDate) : null;
    if (!hireDate) {
      // Fallback to legacy calculation if no hireDate
      const legacy = (currentUser.vacationDays || 0) - (currentUser.usedVacationDays || 0);
      return Math.max(0, legacy);
    }
    const now = new Date();
    const years = now.getFullYear() - hireDate.getFullYear() - (new Date(now.getFullYear(), hireDate.getMonth(), hireDate.getDate()) > now ? 1 : 0);
    const start = new Date(hireDate);
    start.setFullYear(hireDate.getFullYear() + Math.max(0, years));
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + 1);
    // Sum vacation days within this service year (approved or pending reserves)
    const consumed = myRequests.filter(r => r.type === 'vacation' && r.status !== 'rejected')
      .filter(r => {
        const sd = new Date(r.startDate);
        return sd >= start && sd < end;
      })
      .reduce((acc, r) => acc + (r.days || 0), 0);
    return Math.max(0, entitlement - consumed);
  }, [currentUser, myRequests, entitlement]);
  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = myRequests.filter(r => r.status === 'approved').length;

  const stats = [
    {
      title: 'Días de vacaciones disponibles',
      value: remainingVacation,
      icon: Calendar,
      color: 'bg-blue-500',
      total: entitlement,
    },
    {
      title: 'Solicitudes pendientes',
      value: pendingRequests,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Solicitudes aprobadas',
      value: approvedRequests,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Total solicitudes',
      value: myRequests.length,
      icon: FileText,
      color: 'bg-purple-500',
    },
  ];

  const recentRequests = myRequests.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenid@, {currentUser?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tus solicitudes de vacaciones y permisos
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
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                  {stat.total && <span className="text-sm text-gray-500">/{stat.total}</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/requests/new" className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left block">
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Solicitar Vacaciones</h3>
            <p className="text-sm text-gray-500">Programa tus días libres</p>
          </Link>

          <Link to="/requests/new" className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left block">
            <Clock className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Solicitar Permiso</h3>
            <p className="text-sm text-gray-500">Permisos por horas o días</p>
          </Link>

          <Link to="/requests" className="p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left block">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Mis Solicitudes</h3>
            <p className="text-sm text-gray-500">Historial y estado</p>
          </Link>
        </div>
      </div>

      {/* Recent requests */}
      {recentRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Solicitudes Recientes</h2>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    request.type === 'vacation' ? 'bg-blue-100' :
                    request.type === 'permission' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {request.type === 'vacation' ? (
                      <Calendar className={`h-4 w-4 text-blue-600`} />
                    ) : request.type === 'permission' ? (
                      <Clock className={`h-4 w-4 text-green-600`} />
                    ) : (
                      <Clock className={`h-4 w-4 text-purple-600`} />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      {request.type === 'vacation' ? 'Vacaciones' : 
                       request.type === 'permission' ? 'Permiso' : 'Licencia'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.startDate} - {request.endDate} ({request.days} días)
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status === 'approved' ? 'Aprobado' :
                     request.status === 'pending' ? 'Pendiente' :
                     request.status === 'rejected' ? 'Rechazado' : 'En revisión'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;

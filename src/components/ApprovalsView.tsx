import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const ApprovalsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus, addNotification } = useApp();

  // Obtener solicitudes que requieren aprobación
  const getRequestsToApprove = () => {
    if (currentUser?.role === 'supervisor') {
      const teamMembers = mockUsers.filter(user => user.supervisorId === currentUser?.id);
      return requests.filter(request => 
        teamMembers.some(member => member.id === request.employeeId) && 
        request.status === 'pending'
      );
    } else if (currentUser?.role === 'hr' || currentUser?.role === 'director') {
      return requests.filter(r => r.status === 'pending');
    }
    return [];
  };

  const pendingRequests = getRequestsToApprove();

  const handleApprove = (requestId: string, employeeId: string, employeeName: string) => {
    updateRequestStatus(requestId, 'approved', currentUser?.name);
    
    // Notificar al empleado
    addNotification({
      userId: employeeId,
      title: 'Solicitud Aprobada',
      message: `Tu solicitud ha sido aprobada por ${currentUser?.name}`,
      type: 'approval',
      read: false,
      relatedRequestId: requestId,
    });
  };

  const handleReject = (requestId: string, employeeId: string, reason: string = 'No especificado') => {
    updateRequestStatus(requestId, 'rejected', currentUser?.name, reason);
    
    // Notificar al empleado
    addNotification({
      userId: employeeId,
      title: 'Solicitud Rechazada',
      message: `Tu solicitud ha sido rechazada. Motivo: ${reason}`,
      type: 'rejection',
      read: false,
      relatedRequestId: requestId,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aprobaciones Pendientes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisa y gestiona las solicitudes de tu equipo
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
              <p className="text-2xl font-semibold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Urgentes</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingRequests.filter(r => r.urgent).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tiempo Promedio</h3>
              <p className="text-2xl font-semibold text-gray-900">2.1 días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h3>
            <p className="text-gray-500">No hay solicitudes pendientes de aprobación</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{request.employeeName}</h3>
                        {request.urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            URGENTE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getTypeText(request.type)} • {request.startDate} - {request.endDate}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {request.days} {request.days === 1 ? 'día' : 'días'}
                      </p>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Motivo:</span> {request.reason}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Solicitado el {request.requestDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleApprove(request.id, request.employeeId, request.employeeName)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(request.id, request.employeeId)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function getTypeText(type: string): string {
    switch (type) {
      case 'vacation':
        return 'Vacaciones';
      case 'permission':
        return 'Permiso';
      default:
        return 'Licencia';
    }
  }
};

export default ApprovalsView;
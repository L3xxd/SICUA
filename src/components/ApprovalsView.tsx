import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Request } from '../types';

const ApprovalsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests, users, updateRequestStatus, updateRequestStage, addNotification } = useApp();

  // UI state for modals
  const [detailReq, setDetailReq] = useState<Request | null>(null);
  const [rejectReq, setRejectReq] = useState<Request | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Obtener solicitudes que requieren aprobación
  const getRequestsToApprove = () => {
    if (currentUser?.role === 'supervisor') {
      const teamMembers = users.filter(user => user.supervisorId === currentUser?.id);
      return requests.filter(request =>
        teamMembers.some(member => member.id === request.employeeId) &&
        (request.stage ?? 'supervisor') === 'supervisor' && (request.status === 'pending' || request.status === 'in_review')
      );
    } else if (currentUser?.role === 'hr') {
      return requests.filter(r => (r.stage ?? 'supervisor') === 'hr' && (r.status === 'pending' || r.status === 'in_review'));
    } else if (currentUser?.role === 'director') {
      return requests.filter(r => (r.stage ?? 'supervisor') === 'director' && (r.status === 'pending' || r.status === 'in_review'));
    }
    return [];
  };

  const pendingRequests = useMemo(() => getRequestsToApprove(), [requests, users, currentUser]);

  const handleApprove = (requestId: string, employeeId: string, employeeName: string) => {
    // Flujo por etapas: supervisor -> hr -> director -> completed
    if (currentUser?.role === 'supervisor') {
      updateRequestStage(requestId, 'hr');
      // Opcional: notificar al empleado que avanzó de etapa
      addNotification({ userId: employeeId, title: 'Tu solicitud avanzó', message: 'Tu solicitud pasó a Recursos Humanos.', type: 'request', read: false, relatedRequestId: requestId });
    } else if (currentUser?.role === 'hr') {
      updateRequestStage(requestId, 'director');
      addNotification({ userId: employeeId, title: 'Tu solicitud avanzó', message: 'Tu solicitud pasó a Dirección.', type: 'request', read: false, relatedRequestId: requestId });
    } else if (currentUser?.role === 'director') {
      updateRequestStatus(requestId, 'approved', currentUser?.name);
    }
    // Cerrar modales si estuvieran abiertos
    setDetailReq((prev) => (prev && prev.id === requestId ? null : prev));
    setRejectReq((prev) => (prev && prev.id === requestId ? null : prev));
    setRejectReason('');
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

    // Cerrar modales y limpiar
    setDetailReq((prev) => (prev && prev.id === requestId ? null : prev));
    setRejectReq((prev) => (prev && prev.id === requestId ? null : prev));
    setRejectReason('');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      onClick={() => { setRejectReq(request); setRejectReason(''); }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => setDetailReq(request)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                    >
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

      {/* Reject modal */}
      {rejectReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setRejectReq(null); setRejectReason(''); }} />
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Rechazar solicitud</h3>
            <p className="mt-1 text-sm text-gray-600">{rejectReq.employeeName} • {getTypeText(rejectReq.type)} • {rejectReq.startDate} - {rejectReq.endDate}</p>
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-1" htmlFor="rejectReason">Motivo</label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Explica brevemente el motivo del rechazo"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => { setRejectReq(null); setRejectReason(''); }}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                disabled={(rejectReason.trim().length === 0)}
                onClick={() => handleReject(rejectReq.id, rejectReq.employeeId, rejectReason.trim())}
                className="px-3 py-2 text-sm rounded-md bg-red-600 text-white disabled:opacity-60"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details modal */}
      {detailReq && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailReq(null)} />
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Detalle de solicitud</h3>
                <p className="text-sm text-gray-600 mt-1">{detailReq.employeeName} • {getTypeText(detailReq.type)}</p>
              </div>
              {detailReq.urgent && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full h-fit">URGENTE</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Periodo</span>
                <p className="font-medium text-gray-900">{detailReq.startDate} – {detailReq.endDate}</p>
              </div>
              <div>
                <span className="text-gray-500">Días</span>
                <p className="font-medium text-gray-900">{detailReq.days}</p>
              </div>
              {detailReq.supervisorName && (
                <div>
                  <span className="text-gray-500">Supervisor</span>
                  <p className="font-medium text-gray-900">{detailReq.supervisorName}</p>
                </div>
              )}
              {detailReq.department && (
                <div>
                  <span className="text-gray-500">Departamento</span>
                  <p className="font-medium text-gray-900">{detailReq.department}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-gray-500">Motivo</span>
                <p className="font-medium text-gray-900">{detailReq.reason}</p>
              </div>
            </div>
            {/* History (visible solo para RH/Director) */}
            {(currentUser?.role === 'hr' || currentUser?.role === 'director') && (
              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Historial de decisiones</h4>
                {detailReq.history && detailReq.history.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {detailReq.history.map((h, idx) => (
                      <li key={idx} className="flex items-start justify-between border border-gray-200 rounded-md p-2">
                        <span className="text-gray-700 capitalize">{h.action === 'approved' ? 'Aprobado' : 'Rechazado'}</span>
                        <span className="text-gray-500">{new Date(h.date).toLocaleString()}</span>
                        <span className="text-gray-700">por {h.by}</span>
                        {h.reason && <span className="text-gray-500">Motivo: {h.reason}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Sin historial registrado.</p>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setDetailReq(null)}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleApprove(detailReq.id, detailReq.employeeId, detailReq.employeeName)}
                className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Aprobar
              </button>
              <button
                onClick={() => { setRejectReq(detailReq); setRejectReason(''); }}
                className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
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

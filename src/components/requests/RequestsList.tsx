import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, FileText, XCircle ,CheckCircle, Eye} from 'lucide-react';

const RequestsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { requests, updateRequestStatus } = useApp();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const myRequests = requests.filter(r => r.employeeId === currentUser?.id);

  // Filtros
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return myRequests.filter((r) => {
      const matchesType = !typeFilter || r.type === typeFilter;
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const start = new Date(r.startDate);
      const end = new Date(r.endDate || r.startDate);
      const afterFrom = !from || start >= from;
      const beforeTo = !to || end <= to;
      const matchesDate = afterFrom && beforeTo;
      return matchesType && matchesStatus && matchesDate;
    });
  }, [myRequests, typeFilter, statusFilter, fromDate, toDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'En revisión';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation':
        return Calendar;
      case 'permission':
        return Clock;
      default:
        return FileText;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'Vacaciones';
      case 'permission':
        return 'Permiso';
      default:
        return 'Licencia';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Historial y estado de todas tus solicitudes
          </p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/requests/new')}
        >
          Nueva Solicitud
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1" htmlFor="typeFilter">Tipo</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos los tipos</option>
              <option value="vacation">Vacaciones</option>
              <option value="permission">Permisos</option>
              <option value="leave">Licencias</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1" htmlFor="statusFilter">Estado</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1" htmlFor="fromDate">Desde</label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Fecha desde"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1" htmlFor="toDate">Hasta</label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Fecha hasta"
            />
          </div>
          {(typeFilter || statusFilter || fromDate || toDate) && (
            <button
              type="button"
              onClick={() => { setTypeFilter(''); setStatusFilter(''); setFromDate(''); setToDate(''); }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Requests list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes solicitudes</h3>
            <p className="text-gray-500">Crea tu primera solicitud de vacaciones o permiso</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((request) => {
              const TypeIcon = getTypeIcon(request.type);
              return (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        request.type === 'vacation' ? 'bg-blue-100' :
                        request.type === 'permission' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        <TypeIcon className={`h-5 w-5 ${
                          request.type === 'vacation' ? 'text-blue-600' :
                          request.type === 'permission' ? 'text-green-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {getTypeText(request.type)}
                          </h3>
                          {request.urgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.startDate} - {request.endDate} ({request.days} días)
                        </p>
                        {request.approvedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            Aprobado por {request.approvedBy} el {request.approvedDate}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
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

export default RequestsList;

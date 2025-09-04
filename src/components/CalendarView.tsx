import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const CalendarView: React.FC = () => {
  const { requests } = useApp();
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'year'>('month');
  const [scope, setScope] = useState<'personal' | 'asociado'>(() =>
    currentUser?.role === 'employee' ? 'personal' : 'asociado'
  );

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(currentDate.getMonth() - 1);
      } else {
        newDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
      // Navegación por años en vista anual
      newDate.setFullYear(currentDate.getFullYear() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  // Filtrado por alcance según rol y scope seleccionado
  const isEmployeeView = currentUser?.role === 'employee';
  const isSupervisorView = currentUser?.role === 'supervisor';

  const personalUsers = React.useMemo(() => mockUsers.filter(u => u.id === currentUser?.id), [currentUser?.id]);

  const associatedUsers = React.useMemo(() => {
    if (isEmployeeView) return [] as typeof mockUsers;
    if (isSupervisorView) {
      // Departamento a cargo del supervisor (excluye su usuario para evitar duplicar en asociado)
      return mockUsers.filter(u => u.department === currentUser?.department && u.id !== currentUser?.id);
    }
    // RRHH / Director: toda la organización excluyendo el propio usuario en el ámbito asociado
    return mockUsers.filter(u => u.id !== currentUser?.id);
  }, [isEmployeeView, isSupervisorView, currentUser?.department, currentUser?.id]);

  const activeUsers = scope === 'personal' ? personalUsers : associatedUsers;
  const activeUserIds = React.useMemo(() => new Set(activeUsers.map(u => u.id)), [activeUsers]);

  const activeRequests = React.useMemo(() => {
    return requests.filter(r => activeUserIds.has(r.employeeId));
  }, [requests, activeUserIds]);

  const getRequestsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeRequests.filter(request => {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const generateCalendarDays = () => {
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Dataset por mes del año actual (para vista anual)
  const yearlyByMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const groups = Array.from({ length: 12 }, (_, m) => ({ month: m, items: [] as typeof activeRequests }));
    activeRequests.forEach((r) => {
      const d = new Date(r.startDate);
      if (d.getFullYear() === year) {
        groups[d.getMonth()].items.push(r);
      }
    });
    return groups;
  }, [activeRequests, currentDate]);

  // Estadísticas del mes (solicitudes que se solapan con el mes actual)
  const monthlyRequests = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return activeRequests.filter((r) => {
      const s = new Date(r.startDate);
      const e = new Date(r.endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      return e >= start && s <= end;
    });
  }, [activeRequests, currentDate]);

  const approvedThisMonth = monthlyRequests.filter(r => r.status === 'approved').length;
  const pendingThisMonth = monthlyRequests.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const totalThisMonth = monthlyRequests.length;

  // Estadísticas del año (solicitudes que se solapan con el año actual)
  const yearlyRequests = useMemo(() => {
    const y = currentDate.getFullYear();
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31, 23, 59, 59, 999);
    return activeRequests.filter((r) => {
      const s = new Date(r.startDate);
      const e = new Date(r.endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      return e >= start && s <= end;
    });
  }, [activeRequests, currentDate]);
  const approvedThisYear = yearlyRequests.filter(r => r.status === 'approved').length;
  const pendingThisYear = yearlyRequests.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const totalThisYear = yearlyRequests.length;

  // Números mostrados en tarjetas: totales del ámbito seleccionado
  // (coinciden con estilo de los dashboards)
  const baseForStats = activeRequests;
  const pendingShown = baseForStats.filter(r => r.status === 'pending' || r.status === 'in_review').length;
  const approvedShown = baseForStats.filter(r => r.status === 'approved').length;
  const totalShown = baseForStats.length;
  const totalEmployeesOnLeave = new Set(
    activeRequests.filter(r => r.status === 'approved').map(r => r.employeeId)
  ).size;

  return (
    <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario de Ausencias</h1>
            <p className="mt-1 text-sm text-gray-500">Vista general de la disponibilidad del personal</p>
          </div>
        <div className="flex items-center gap-2">
          {/* Scope selector (oculto para empleados) */}
          {!isEmployeeView && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#2C2C2C] rounded-md p-1 mr-2">
              <button
                onClick={() => setScope('personal')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  scope === 'personal'
                    ? 'bg-white text-gray-900 shadow dark:bg-[var(--accent-primary)] dark:text-[var(--text-primary)]'
                    : 'text-gray-600 dark:text-[var(--text-secondary)]'
                }`}
              >
                Mis solicitudes
              </button>
              <button
                onClick={() => setScope('asociado')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  scope === 'asociado'
                    ? 'bg-white text-gray-900 shadow dark:bg-[var(--accent-primary)] dark:text-[var(--text-primary)]'
                    : 'text-gray-600 dark:text-[var(--text-secondary)]'
                }`}
              >
                {isSupervisorView ? 'Equipo' : 'Organización'}
              </button>
            </div>
          )}

          {/* View selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#2C2C2C] rounded-md p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === 'month'
                  ? 'bg-white text-gray-900 shadow dark:bg-[var(--accent-primary)] dark:text-[var(--text-primary)]'
                  : 'text-gray-600 dark:text-[var(--text-secondary)]'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setView('year')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === 'year'
                  ? 'bg-white text-gray-900 shadow dark:bg-[var(--accent-primary)] dark:text-[var(--text-primary)]'
                  : 'text-gray-600 dark:text-[var(--text-secondary)]'
              }`}
            >
              Anual
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {view === 'month' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Solicitudes pendientes</h3>
                <p className="text-2xl font-semibold text-gray-900">{pendingShown}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Solicitudes aprobadas</h3>
                <p className="text-2xl font-semibold text-gray-900">{approvedShown}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total solicitudes</h3>
                <p className="text-2xl font-semibold text-gray-900">{totalShown}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Solicitudes pendientes</h3>
                <p className="text-2xl font-semibold text-gray-900">{pendingShown}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Solicitudes aprobadas</h3>
                <p className="text-2xl font-semibold text-gray-900">{approvedShown}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total solicitudes</h3>
                <p className="text-2xl font-semibold text-gray-900">{totalShown}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {view === 'month' ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : `${currentDate.getFullYear()}`}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              Hoy
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        {view === 'month' ? (
          <>
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-24 p-1"></div>;
                }

                const dayRequests = getRequestsForDate(day);
                const dayApproved = dayRequests.filter(r => r.status === 'approved');
                const dayPending = dayRequests.filter(r => r.status === 'pending' || r.status === 'in_review');
                const hasApproved = dayApproved.length > 0;
                const hasPending = dayPending.length > 0;
                const chips = [...dayPending, ...dayApproved];

                return (
                  <div key={day} className="h-24 p-1">
                    <div className={`h-full rounded-md border ${
                      hasPending
                        ? 'border-orange-300 bg-orange-50'
                        : hasApproved
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } transition-colors cursor-pointer`}>
                      <div className="p-2">
                        <span className="text-sm font-medium text-gray-900">{day}</span>
                        {(hasApproved || hasPending) && (
                          <div className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {chips.slice(0, 2).map((request, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs px-1 py-0.5 rounded text-white truncate max-w-full ${
                                    request.type === 'vacation' ? 'bg-blue-500' :
                                    request.type === 'permission' ? 'bg-green-500' :
                                    'bg-purple-500'
                                  }`}
                                >
                                  {request.employeeName.split(' ')[0]}
                                </div>
                              ))}
                              {chips.length > 2 && (
                                <div className="text-xs text-gray-600">
                                  +{chips.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearlyByMonth.map(({ month, items }) => {
              const approved = items.filter(i => i.status === 'approved').length;
              return (
                <div key={month} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <button
                    className="w-full text-left p-4"
                    onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), month, 1)); setView('month'); }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{monthNames[month]}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{approved} aprob.</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, Math.round((approved / Math.max(1, items.length)) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{items.length} solicitudes totales</p>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Pendientes</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Vacaciones</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Permisos</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Licencias</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

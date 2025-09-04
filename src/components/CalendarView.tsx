import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';

const CalendarView: React.FC = () => {
  const { requests } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getRequestsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return requests.filter(request => {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate && request.status === 'approved';
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

  // Estadísticas del mes
  const monthlyRequests = requests.filter(request => {
    const requestDate = new Date(request.startDate);
    return requestDate.getMonth() === currentDate.getMonth() && 
           requestDate.getFullYear() === currentDate.getFullYear();
  });

  const approvedThisMonth = monthlyRequests.filter(r => r.status === 'approved').length;
  const totalEmployeesOnLeave = new Set(
    requests.filter(r => r.status === 'approved').map(r => r.employeeId)
  ).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Ausencias</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vista general de la disponibilidad del personal
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Ausencias Aprobadas</h3>
              <p className="text-2xl font-semibold text-gray-900">{approvedThisMonth}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Empleados Disponibles</h3>
              <p className="text-2xl font-semibold text-gray-900">{mockUsers.length - totalEmployeesOnLeave}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Disponibilidad</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(((mockUsers.length - totalEmployeesOnLeave) / mockUsers.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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
            const hasRequests = dayRequests.length > 0;

            return (
              <div key={day} className="h-24 p-1">
                <div className={`h-full rounded-md border ${
                  hasRequests ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } transition-colors cursor-pointer`}>
                  <div className="p-2">
                    <span className="text-sm font-medium text-gray-900">{day}</span>
                    {hasRequests && (
                      <div className="mt-1">
                        <div className="flex flex-wrap gap-1">
                          {dayRequests.slice(0, 2).map((request, idx) => (
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
                          {dayRequests.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{dayRequests.length - 2}
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
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
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
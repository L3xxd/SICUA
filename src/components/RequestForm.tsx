import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CalendarDays, Clock, FileText, Save } from 'lucide-react';

const RequestForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { addRequest, addNotification } = useApp();
  
  const [formData, setFormData] = useState({
    type: 'vacation' as 'vacation' | 'permission' | 'leave',
    startDate: '',
    endDate: '',
    reason: '',
    urgent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays(formData.startDate, formData.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!currentUser) return;

    // Agregar solicitud
    addRequest({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      days,
      urgent: formData.urgent,
    });

    // Agregar notificación al supervisor (simulado)
    addNotification({
      userId: currentUser.supervisorId || '2', // ID del supervisor
      title: 'Nueva solicitud recibida',
      message: `${currentUser.name} ha solicitado ${
        formData.type === 'vacation' ? 'vacaciones' : 
        formData.type === 'permission' ? 'permiso' : 'licencia'
      } por ${days} días`,
      type: 'request',
      read: false,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
        urgent: false,
      });
    }, 2000);

    setLoading(false);
  };

  const requestTypes = [
    { value: 'vacation', label: 'Vacaciones', icon: CalendarDays, color: 'blue' },
    { value: 'permission', label: 'Permiso', icon: Clock, color: 'green' },
    { value: 'leave', label: 'Licencia', icon: FileText, color: 'purple' },
  ];

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Save className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Solicitud Enviada</h2>
        <p className="text-gray-600">Tu solicitud ha sido enviada y está pendiente de aprobación.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nueva Solicitud</h2>
        <p className="mt-1 text-sm text-gray-500">
          Completa el formulario para enviar tu solicitud
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de solicitud */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Solicitud
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requestTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as any })}
                className={`p-4 border rounded-lg text-left transition-all ${
                  formData.type === type.value
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <type.icon className={`h-6 w-6 mb-2 ${
                  formData.type === type.value ? `text-${type.color}-600` : 'text-gray-400'
                }`} />
                <h3 className="font-medium text-gray-900">{type.label}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Información calculada */}
        {days > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                Duración: {days} {days === 1 ? 'día' : 'días'}
              </span>
            </div>
          </div>
        )}

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo de la solicitud
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe el motivo de tu solicitud..."
          />
        </div>

        {/* Urgente */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="urgent"
            checked={formData.urgent}
            onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
            Marcar como urgente
          </label>
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.startDate || !formData.endDate || !formData.reason}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
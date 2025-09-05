import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Clock, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

type RequestType = 'vacation' | 'permission' | 'leave';

const dateToISO = (d: Date) => d.toISOString().slice(0, 10);
const todayISO = dateToISO(new Date());

const diffDaysInclusive = (startISO: string, endISO: string) => {
  const s = new Date(startISO);
  const e = new Date(endISO);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const ms = e.getTime() - s.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
};

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addRequest, addNotification } = useApp();

  const [type, setType] = useState<RequestType | ''>('');
  const [startDate, setStartDate] = useState<string>(todayISO);
  const [endDate, setEndDate] = useState<string>(todayISO);
  const [reason, setReason] = useState<string>('');
  const [urgent, setUrgent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const totalDays = useMemo(() => {
    try {
      if (!startDate || !endDate) return 0;
      const days = diffDaysInclusive(startDate, endDate);
      return Number.isFinite(days) ? Math.max(0, days) : 0;
    } catch {
      return 0;
    }
  }, [startDate, endDate]);

  // Auto-rellenar motivo para vacaciones y bloquear edición
  useEffect(() => {
    if (type === 'vacation') {
      setReason('vacaiones'); // según solicitud del cliente (sin tilde ni n)
    }
  }, [type]);

  const validate = () => {
    const errs: string[] = [];
    if (!type) errs.push('Selecciona el tipo de solicitud.');
    if (!startDate) errs.push('Selecciona la fecha de inicio.');
    if (!endDate) errs.push('Selecciona la fecha de fin.');
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.push('La fecha de fin no puede ser anterior a la fecha de inicio.');
    }
    if ((reason ?? '').trim().length < 5) {
      errs.push('El motivo debe tener al menos 5 caracteres.');
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setSubmitting(true);
    try {
      const newId = String(Date.now());
      const safeType = type as RequestType;

      const newRequest = {
        id: newId,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        type: safeType,
        startDate,
        endDate,
        reason: reason.trim(),
        status: 'pending' as const,
        requestDate: new Date().toISOString().slice(0, 16),
        approvedBy: undefined,
        approvedDate: undefined,
        days: totalDays,
        urgent,
      };

      addRequest(newRequest);

      // Nota: id/createdAt los genera AppContext; no los enviamos aquí.
      addNotification({
        userId: currentUser.supervisorId || '2',
        title: 'Nueva solicitud',
        message: `${currentUser.name} ha solicitado ${totalDays} día(s) (${safeType === 'vacation' ? 'vacaciones' : safeType === 'permission' ? 'permiso' : 'licencia'})`,
        type: 'request',
        read: false,
        relatedRequestId: newId,
      });

      navigate('/requests', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completa la información para enviar tu solicitud
        </p>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 max-w-2xl"
      >
        {/* Errores */}
        {errors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <ul className="list-disc list-inside">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de solicitud <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RequestType | '')}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una opción</option>
              <option value="vacation">Vacaciones</option>
              <option value="permission">Permiso</option>
              <option value="leave">Licencia</option>
            </select>
            <FileText className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                min={todayISO}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={startDate || todayISO}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Resumen de días */}
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">Duración:</span>{' '}
          {totalDays} día{totalDays === 1 ? '' : 's'}
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              readOnly={type === 'vacation'}
              rows={3}
              placeholder={type === 'vacation' ? 'vacaiones' : 'Describe brevemente el motivo de tu solicitud'}
              className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                type === 'vacation'
                  ? 'border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed'
                  : 'border-gray-300'
              }`}
            />
            <Clock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-300" />
          </div>
          {type === 'vacation' && (
            <p className="mt-1 text-xs text-gray-500">Para solicitudes de vacaciones, el motivo se establece automáticamente como "vacaiones".</p>
          )}
        </div>

        {/* Urgente */}
        <div className="flex items-center">
          <input
            id="urgent"
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
            Marcar como urgente
          </label>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting}
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>

        {/* Hint / Ayuda */}
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p>
            Recibirás una notificación cuando tu supervisor revise tu solicitud.
            Puedes consultar su estado en <span className="font-medium text-gray-700">Mis Solicitudes</span>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Clock, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getVacationEntitlement, getServiceYearBounds } from '../../utils/policies/vacations';
import { api } from '../../services/api';

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
  const { addRequest, addNotification, requests } = useApp();

  const [type, setType] = useState<RequestType | ''>('');
  const [startDate, setStartDate] = useState<string>(todayISO);
  const [endDate, setEndDate] = useState<string>(todayISO);
  const [reason, setReason] = useState<string>('');
  const [permissionDetails, setPermissionDetails] = useState<string>('');
  const [leaveDetails, setLeaveDetails] = useState<string>('');
  const [permissionFile, setPermissionFile] = useState<File | null>(null);
  const [permissionFileError, setPermissionFileError] = useState<string>('');
  const permissionReasons = ['Salud', 'Fallecimiento de Familiar', 'Motivos Personales'];
  const leaveReasons = [
    'Licencia de maternidad',
    'Licencia por paternidad',
    'Por adopción',
    'Licencia por matrimonio',
    'Licencia por luto',
    'Licencia por examen médico',
  ];
  const [urgent, setUrgent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dateHints, setDateHints] = useState<{ start?: string; end?: string }>({});

  // Helpers para ventana legal de vacaciones (6 meses tras aniversario)
  const serviceYear = React.useMemo(() => {
    if (!currentUser) return null;
    return getServiceYearBounds(currentUser as any);
  }, [currentUser]);

  const vacationWindow = React.useMemo(() => {
    if (!serviceYear) return null;
    const start = new Date(serviceYear.start);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 6);
    return { start, end };
  }, [serviceYear]);

  const entitlement = React.useMemo(() => {
    if (!currentUser) return 0;
    return getVacationEntitlement(currentUser as any);
  }, [currentUser]);

  const consumedThisServiceYear = React.useMemo(() => {
    if (!currentUser || !serviceYear) return 0;
    const { start, end } = serviceYear;
    return requests
      .filter(r => r.employeeId === currentUser.id && r.type === 'vacation' && r.status !== 'rejected')
      .filter(r => {
        const sd = new Date(r.startDate);
        return sd >= start && sd < end;
      })
      .reduce((acc, r) => acc + (r.days || 0), 0);
  }, [requests, currentUser, serviceYear]);

  const remaining = Math.max(0, entitlement - consumedThisServiceYear);

  const totalDays = useMemo(() => {
    try {
      if (!startDate || !endDate) return 0;
      const days = diffDaysInclusive(startDate, endDate);
      return Number.isFinite(days) ? Math.max(0, days) : 0;
    } catch {
      return 0;
    }
  }, [startDate, endDate]);

  // Auto-rellenar motivo para vacaciones y manejo inicial para permisos
  useEffect(() => {
    if (type === 'vacation') {
      setReason('vacaiones'); // según solicitud del cliente (sin tilde ni n)
    } else if (type === 'permission') {
      setReason(''); // forzar selección explícita
      setPermissionDetails('');
    } else if (type === 'leave') {
      setReason('');
      setLeaveDetails('');
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
    if (type === 'permission') {
      if (!(reason ?? '').trim()) errs.push('Selecciona un motivo.');
      if (reason === 'Salud') {
        // Requerir adjunto cuando el motivo es Salud
        if (!permissionFile) errs.push('Debes adjuntar un comprobante médico.');
      }
    } else if (type === 'leave') {
      if (!(reason ?? '').trim()) errs.push('Selecciona un motivo de licencia.');
    } else {
      if ((reason ?? '').trim().length < 5) {
        errs.push('El motivo debe tener al menos 5 caracteres.');
      }
    }
    // Validaciones de políticas para vacaciones
    if (type === 'vacation') {
      if (vacationWindow) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (s < new Date(Math.max(vacationWindow.start.getTime(), new Date().setHours(0,0,0,0)))) {
          errs.push('La fecha de inicio debe estar dentro de los 6 meses posteriores a tu aniversario.');
        }
        if (e > vacationWindow.end) {
          errs.push('La fecha de fin excede la ventana de 6 meses posterior a tu aniversario.');
        }
      }
      if (totalDays > remaining) {
        errs.push(`No tienes días suficientes. Disponibles: ${remaining}.`);
      }
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
      const safeType = type as RequestType;
      const effectiveReason = safeType === 'permission'
        ? [reason.trim(), permissionDetails.trim(), (reason === 'Salud' && permissionFile) ? `(Adjunto: ${permissionFile.name})` : ''].filter(Boolean).join(' — ')
        : safeType === 'leave'
        ? [reason.trim(), leaveDetails.trim()].filter(Boolean).join(' — ')
        : (reason.trim());

      const reqPayload = {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        type: safeType,
        startDate,
        endDate,
        reason: effectiveReason,
        status: 'pending' as const,
        approvedBy: undefined,
        approvedDate: undefined,
        days: totalDays,
        urgent,
      } as const;

      const created = await addRequest(reqPayload as any);

      await addNotification({
        userId: currentUser.supervisorId || '2',
        title: 'Nueva solicitud',
        message: `${currentUser.name} ha solicitado ${totalDays} día(s) (${safeType === 'vacation' ? 'vacaciones' : safeType === 'permission' ? 'permiso' : 'licencia'})`,
        type: 'request',
        read: false,
        relatedRequestId: created.id,
      } as any);

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
                min={(() => {
                  if (type !== 'vacation') return todayISO;
                  if (!vacationWindow) return todayISO;
                  const today = new Date();
                  const minDate = new Date(Math.max(vacationWindow.start.getTime(), new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()));
                  return minDate.toISOString().slice(0,10);
                })()}
                max={(() => {
                  if (type !== 'vacation' || !vacationWindow) return undefined as any;
                  return vacationWindow.end.toISOString().slice(0,10);
                })()}
                onChange={(e) => {
                  const next = e.target.value;
                  if (type === 'vacation' && vacationWindow && next) {
                    const d = new Date(next);
                    let clamped = d;
                    if (d < vacationWindow.start) clamped = vacationWindow.start;
                    const today = new Date(); today.setHours(0,0,0,0);
                    if (clamped < today) clamped = today;
                    const nextISO = clamped.toISOString().slice(0,10);
                    if (nextISO !== next) setDateHints(prev => ({ ...prev, start: 'Ajustado al inicio de la ventana legal.' }));
                    else setDateHints(prev => ({ ...prev, start: undefined }));
                    setStartDate(nextISO);
                    // si fin es anterior a inicio o excede disponibles, reajustar
                    setEndDate(prev => {
                      const sISO = nextISO;
                      if (!prev || new Date(prev) < new Date(sISO)) return sISO;
                      // respetar límite por días disponibles
                      if (type === 'vacation' && remaining > 0) {
                        const maxEnd = (() => {
                          const s = new Date(sISO);
                          const e = new Date(sISO);
                          e.setDate(s.getDate() + Math.max(0, remaining - 1));
                          return e;
                        })();
                        const currEnd = new Date(prev);
                        const windowEnd = vacationWindow.end;
                        const cap = new Date(Math.min(maxEnd.getTime(), windowEnd.getTime()));
                        return (currEnd > cap ? cap.toISOString().slice(0,10) : prev);
                      }
                      return prev;
                    });
                    return;
                  }
                  setDateHints(prev => ({ ...prev, start: undefined }));
                  setStartDate(next);
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {dateHints.start && (<p className="mt-1 text-xs text-orange-600">{dateHints.start}</p>)}
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
                max={(() => {
                  if (type !== 'vacation' || !vacationWindow) return undefined as any;
                  return vacationWindow.end.toISOString().slice(0,10);
                })()}
                onChange={(e) => {
                  const next = e.target.value;
                  if (type === 'vacation' && vacationWindow && next && startDate) {
                    // cap por ventana y por días disponibles
                    const s = new Date(startDate);
                    const eDate = new Date(next);
                    let capped = eDate;
                    if (eDate > vacationWindow.end) {
                      capped = vacationWindow.end;
                    }
                    if (eDate < s) capped = s;
                    if (remaining > 0) {
                      const maxByRemaining = new Date(s);
                      maxByRemaining.setDate(s.getDate() + Math.max(0, remaining - 1));
                      if (capped > maxByRemaining) capped = maxByRemaining;
                    }
                    const cappedISO = capped.toISOString().slice(0,10);
                    if (cappedISO !== next) setDateHints(prev => ({ ...prev, end: 'Ajustado al máximo permitido por política.' }));
                    else setDateHints(prev => ({ ...prev, end: undefined }));
                    setEndDate(cappedISO);
                    return;
                  }
                  setDateHints(prev => ({ ...prev, end: undefined }));
                  setEndDate(next);
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {dateHints.end && (<p className="mt-1 text-xs text-orange-600">{dateHints.end}</p>)}
              <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Resumen de días */}
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">Duración:</span>{' '}
          {totalDays} día{totalDays === 1 ? '' : 's'}
        </div>

        {type === 'vacation' && vacationWindow && (
          <div className="text-xs text-gray-600">
            <span className="font-medium text-gray-900">Ventana legal:</span>{' '}
            {vacationWindow.start.toISOString().slice(0,10)} — {vacationWindow.end.toISOString().slice(0,10)} ·{' '}
            <span className="font-medium text-gray-900">Disponibles:</span> {remaining} / {entitlement}
          </div>
        )}

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo <span className="text-red-500">*</span>
          </label>
          {type === 'permission' ? (
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un motivo</option>
                {permissionReasons.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          ) : type === 'leave' ? (
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un motivo</option>
                {leaveReasons.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          ) : (
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
          )}
          {type === 'vacation' && (
            <p className="mt-1 text-xs text-gray-500">Para solicitudes de vacaciones, el motivo se establece automáticamente como "vacaiones".</p>
          )}
        </div>

        {type === 'permission' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción adicional (opcional)
            </label>
            <textarea
              value={permissionDetails}
              onChange={(e) => setPermissionDetails(e.target.value)}
              rows={3}
              placeholder="Añade contexto: médico, familiar, etc. (opcional)"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Se adjuntará junto al motivo seleccionado.</p>
          </div>
        )}

        {type === 'leave' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción adicional (opcional)
            </label>
            <textarea
              value={leaveDetails}
              onChange={(e) => setLeaveDetails(e.target.value)}
              rows={3}
              placeholder="Añade contexto de la licencia (opcional)"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Se adjuntará junto al motivo seleccionado.</p>
          </div>
        )}

        {type === 'permission' && reason === 'Salud' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comprobante médico (PDF o imagen) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setPermissionFileError('');
                if (f && f.size > 5 * 1024 * 1024) {
                  setPermissionFile(null);
                  setPermissionFileError('El archivo supera 5MB.');
                  return;
                }
                setPermissionFile(f);
              }}
              className="block w-full text-sm"
            />
            {permissionFile && (
              <p className="mt-1 text-xs text-gray-600">Adjunto: {permissionFile.name} ({Math.round((permissionFile.size/1024/1024)*10)/10} MB)</p>
            )}
            {permissionFileError && (
              <p className="mt-1 text-xs text-red-600">{permissionFileError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Este adjunto se referencia en la solicitud. (Persistencia de archivo no habilitada)</p>
          </div>
        )}

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

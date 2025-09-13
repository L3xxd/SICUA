import React, { useMemo } from 'react';
import { useAuth } from '../../app/providers/AuthContext';
import { useApp } from '../../app/providers/AppContext';
import { User as UserIcon, Mail, Phone, Briefcase, Building2, Calendar as CalendarIcon, BadgePercent, CreditCard, Copy, Maximize, X, Printer } from 'lucide-react';
import { api } from '../../shared/services/api';

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  try { return new Date(iso).toISOString().slice(0,10); } catch { return '—'; }
};

const ProfileView: React.FC = () => {
  const { currentUser } = useAuth();
  const { users } = useApp();
  const [scanOpen, setScanOpen] = React.useState(false);
  const [fetchedUser, setFetchedUser] = React.useState<any | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(false);

  const u = useMemo(() => {
    if (!currentUser) return null;
    // Preferir el usuario obtenido de la API si está disponible
    return fetchedUser || users.find(x => x.id === currentUser.id) || currentUser;
  }, [currentUser, users, fetchedUser]);

  // Cargar datos frescos desde la API si está habilitada
  React.useEffect(() => {
    if (!api.isEnabled || !currentUser?.id) return;
    setLoadingUser(true);
    (async () => {
      try {
        const all = await api.getUsers();
        const match = (all as any[]).find(u => u.id === currentUser.id) || null;
        setFetchedUser(match);
      } catch {
        // Ignorar errores; se usa fallback de contexto
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [currentUser?.id]);

  const seniorityText = useMemo(() => {
    if (!u?.hireDate) return '—';
    const hd = new Date(u.hireDate);
    const now = new Date();
    let years = now.getFullYear() - hd.getFullYear();
    const m = now.getMonth() - hd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < hd.getDate())) years--;
    return `${years} año${years === 1 ? '' : 's'}`;
  }, [u?.hireDate]);

  if (!u) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No hay usuario activo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datos Personales</h1>
          <p className="mt-1 text-sm text-gray-500">Información básica de tu perfil</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-semibold">
                {u.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-400" /> {u.name}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {u.position || '—'} · <Building2 className="h-4 w-4" /> {u.department || '—'}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Correo electrónico</div>
              <div className="font-medium text-gray-900">{u.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Teléfono</div>
              <div className="font-medium text-gray-900">{(u as any).phone || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Fecha de ingreso</div>
              <div className="font-medium text-gray-900">{fmtDate((u as any).hireDate)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BadgePercent className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Antigüedad</div>
              <div className="font-medium text-gray-900">{seniorityText}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Tipo de contrato</div>
              <div className="font-medium text-gray-900">{(u as any).contractType ? ((u as any).contractType === 'fijo' ? 'Fijo' : 'Temporal') : '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Código de barras</div>
              <div className="font-medium text-gray-900 break-all">{(u as any).barcode || '—'}</div>
            </div>
          </div>
        </div>

        {(u as any).barcode && (
            <div className="mt-8 flex justify-center">
            <div className="mt-3">
              <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
              >
              <Maximize className="h-4 w-4" /> Mostrar para escanear
              </button>
            </div>
            </div>
        )}
      </div>

      {/* Modal de escaneo (pantalla grande) */}
      {scanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setScanOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-[min(92vw,900px)] p-8 text-center">
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('barcode-scan-container');
                  if (el && el.requestFullscreen) el.requestFullscreen();
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                title="Pantalla completa"
              >
                <Maximize className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                title="Imprimir"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setScanOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                title="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div id="barcode-scan-container" className="mt-2">
              <div className="text-sm text-gray-600 mb-4">Presenta este código en recepción</div>
              <div className="mx-auto w-full bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-4xl sm:text-5xl md:text-6xl font-mono tracking-widest text-gray-900 select-all break-all">
                  {(u as any).barcode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;

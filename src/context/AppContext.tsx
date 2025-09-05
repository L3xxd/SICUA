import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Request, Notification, User, PolicyRule, PolicyChange } from '../types';
import { mockRequests, mockNotifications, mockUsers, mockPolicies } from '../data/mockData';
import { api } from '../services/api';

interface AppContextType {
  requests: Request[];
  notifications: Notification[];
  users: User[];
  policies: PolicyRule[];
  policyHistory: PolicyChange[];
  addRequest: (request: Omit<Request, 'id' | 'requestDate'>) => Promise<Request>;
  updateRequestStatus: (id: string, status: Request['status'], approvedBy?: string, rejectionReason?: string) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  deleteRequest: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updatePolicy: (id: string, patch: Partial<PolicyRule>) => void;
  addPolicyHistory: (entries: PolicyChange[]) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  refreshAll: () => Promise<void>;
}

const REQUESTS_KEY = 'sicua_requests';
const NOTIFICATIONS_KEY = 'sicua_notifications';
const USERS_KEY = 'sicua_users';
const POLICIES_KEY = 'sicua_policies';
const POLICY_HISTORY_KEY = 'sicua_policy_history';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Helpers para cargar y guardar en localStorage
function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>(() => (api.isEnabled ? [] : load(REQUESTS_KEY, mockRequests)));
  const [notifications, setNotifications] = useState<Notification[]>(() => (api.isEnabled ? [] : load(NOTIFICATIONS_KEY, mockNotifications)));
  const [users, setUsers] = useState<User[]>(() => (api.isEnabled ? [] : load(USERS_KEY, mockUsers)));
  const [policies, setPolicies] = useState<PolicyRule[]>(() => (api.isEnabled ? [] : load(POLICIES_KEY, mockPolicies)));
  const [policyHistory, setPolicyHistory] = useState<PolicyChange[]>(() => load(POLICY_HISTORY_KEY, []));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light'|'dark')) || 'light');

  // Sincroniza con localStorage cuando cambian los estados
  useEffect(() => { if (!api.isEnabled) save(REQUESTS_KEY, requests); }, [requests]);
  useEffect(() => { if (!api.isEnabled) save(NOTIFICATIONS_KEY, notifications); }, [notifications]);
  useEffect(() => { if (!api.isEnabled) save(USERS_KEY, users); }, [users]);
  useEffect(() => { if (!api.isEnabled) save(POLICIES_KEY, policies); }, [policies]);
  useEffect(() => { if (!api.isEnabled) save(POLICY_HISTORY_KEY, policyHistory); }, [policyHistory]);

  // Si hay API, cargar datos iniciales desde el backend
  useEffect(() => {
    if (!api.isEnabled) return;
    (async () => {
      try {
        const [usersRes, requestsRes, policiesRes] = await Promise.all([
          api.getUsers(),
          api.getRequests(),
          api.getPolicies(),
        ]);
        setUsers(usersRes as User[]);
        // mapear requests si el backend retorna include employee; aseguramos shape mínimo
        setRequests((requestsRes as any[]).map((r) => ({
          ...r,
          employeeName: r.employeeName || r.employee?.name || '',
          department: r.department || r.employee?.department,
          requestDate: r.requestDate?.split ? r.requestDate.split('T')[0] : r.requestDate,
          approvedDate: r.approvedDate ? (r.approvedDate.split ? r.approvedDate.split('T')[0] : r.approvedDate) : undefined,
        })) as Request[]);
        setPolicies(policiesRes as PolicyRule[]);
        // history
        try {
          const hist = await fetch(`${import.meta.env.VITE_API_URL}/policy-history`).then(r=>r.json());
          setPolicyHistory(hist as PolicyChange[]);
        } catch {}
      } catch (e) {
        console.error('Error cargando datos desde API', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      try { localStorage.setItem('theme', theme); } catch {}
    }
  }, [theme]);

  const addRequest = async (requestData: Omit<Request, 'id' | 'requestDate'>): Promise<Request> => {
    if (api.isEnabled) {
      try {
        // Mapear payload al backend (sin employeeName y con DateTime ISO)
        const startISO = requestData.startDate.includes('T') ? requestData.startDate : `${requestData.startDate}T00:00:00.000Z`;
        const endISO = requestData.endDate.includes('T') ? requestData.endDate : `${requestData.endDate}T00:00:00.000Z`;
        const employee = users.find(u => u.id === requestData.employeeId);
        const payload = {
          employeeId: requestData.employeeId,
          type: requestData.type,
          startDate: startISO,
          endDate: endISO,
          reason: requestData.reason,
          status: requestData.status || 'pending',
          stage: requestData.stage || null,
          supervisorName: requestData.supervisorName || (employee?.supervisorId ? users.find(u => u.id === employee?.supervisorId)?.name : null),
          department: requestData.department || employee?.department || null,
          requestDate: new Date().toISOString(),
          approvedBy: requestData.approvedBy || null,
          approvedDate: requestData.approvedDate || null,
          rejectionReason: requestData.rejectionReason || null,
          days: requestData.days,
          urgent: requestData.urgent,
        } as any;

        const created = await api.createRequest(payload);
        // Normalizar para el estado del front
        const createdNorm: Request = {
          ...(created as any),
          employeeName: (created as any).employee?.name || requestData.employeeName || '',
          department: (created as any).department || employee?.department,
          requestDate: (created as any).requestDate?.split ? (created as any).requestDate.split('T')[0] : (created as any).requestDate,
          startDate: startISO.slice(0,10),
          endDate: endISO.slice(0,10),
        } as Request;
        setRequests(prev => [...prev, createdNorm]);
        return createdNorm;
      } catch (e) {
        console.error('Error creando solicitud', e);
        throw e;
      }
    } else {
      const newRequest: Request = {
        ...requestData,
        id: (requests.length + 1).toString(),
        requestDate: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    }
  };

  const updateRequestStatus = (id: string, status: Request['status'], approvedBy?: string, rejectionReason?: string) => {
    if (api.isEnabled) {
      (async () => {
        try {
          const updated = await api.updateRequestStatus(id, { status, approvedBy, rejectionReason });
          setRequests(prev => prev.map(r => r.id === id ? {
            ...(updated as any),
            requestDate: (updated as any).requestDate?.split ? (updated as any).requestDate.split('T')[0] : (updated as any).requestDate,
            approvedDate: (updated as any).approvedDate?.split ? (updated as any).approvedDate.split('T')[0] : (updated as any).approvedDate,
          } : r));
          // Notificar al empleado
          const reqAfter = (updated as any);
          const notif = status === 'approved'
            ? {
                userId: reqAfter.employeeId,
                title: 'Solicitud aprobada',
                message: `Tu solicitud fue aprobada por ${approvedBy || 'el sistema'}.`,
                type: 'approval',
                read: false,
                relatedRequestId: reqAfter.id,
              }
            : {
                userId: reqAfter.employeeId,
                title: 'Solicitud rechazada',
                message: `Tu solicitud fue rechazada${rejectionReason ? `: ${rejectionReason}` : ''}.`,
                type: 'rejection',
                read: false,
                relatedRequestId: reqAfter.id,
              };
          addNotification(notif as any);
        } catch (e) {
          console.error('Error actualizando estado', e);
        }
      })();
    } else {
      let updatedLocal: Request | null = null;
      setRequests(prev => prev.map(req => {
        if (req.id !== id) return req;
        const nowISO = new Date().toISOString();
        const newEntry = status === 'approved'
          ? { action: 'approved' as const, by: approvedBy || 'Sistema', date: nowISO }
          : { action: 'rejected' as const, by: approvedBy || 'Sistema', date: nowISO, reason: rejectionReason };
        const next: Request = {
          ...req,
          status,
          approvedBy: status === 'approved' ? (approvedBy || req.approvedBy) : req.approvedBy,
          approvedDate: status === 'approved' ? nowISO.split('T')[0] : req.approvedDate,
          rejectionReason: status === 'rejected' ? (rejectionReason || req.rejectionReason) : req.rejectionReason,
          history: [...(req.history || []), newEntry],
        };
        updatedLocal = next;
        return next;
      }));
      if (updatedLocal) {
        const notif = status === 'approved'
          ? {
              userId: updatedLocal.employeeId,
              title: 'Solicitud aprobada',
              message: `Tu solicitud fue aprobada por ${approvedBy || 'el sistema'}.`,
              type: 'approval',
              read: false,
              relatedRequestId: updatedLocal.id,
            }
          : {
              userId: updatedLocal.employeeId,
              title: 'Solicitud rechazada',
              message: `Tu solicitud fue rechazada${rejectionReason ? `: ${rejectionReason}` : ''}.`,
              type: 'rejection',
              read: false,
              relatedRequestId: updatedLocal.id,
            };
        addNotification(notif as any);
      }
    }
  };

  const deleteRequest = async (id: string) => {
    if (api.isEnabled) {
      try { await api.deleteRequest(id); } catch (e) { console.error('Error eliminando solicitud', e); }
    }
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    if (api.isEnabled) {
      (async () => {
        try { await api.updateRequestStatus; } catch {}
        try { await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, { method: 'PUT' }); } catch {}
      })();
    }
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    if (api.isEnabled) {
      (async () => {
        try {
          const created = await api.addNotification(notificationData);
          setNotifications(prev => [...prev, created as any]);
        } catch (e) { console.error('Error creando notificación', e); }
      })();
    } else {
      const newNotification: Notification = {
        ...notificationData,
        id: (notifications.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [...prev, newNotification]);
    }
  };

  const updateUser = (id: string, patch: Partial<User>) => {
    if (api.isEnabled) {
      (async () => {
        try {
          const updated = await api.updateUser(id, patch);
          setUsers(prev => prev.map(u => (u.id === id ? (updated as any) : u)));
        } catch (e) { console.error('Error actualizando usuario', e); }
      })();
    } else {
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
    }
  };

  const addUser = (payload: Omit<User, 'id'>) => {
    if (api.isEnabled) {
      (async () => {
        try {
          const created = await api.createUser(payload);
          setUsers(prev => [...prev, created as any]);
        } catch (e) { console.error('Error creando usuario', e); }
      })();
    } else {
      const nextId = (users.length + 1).toString();
      const user: User = { id: nextId, ...payload } as User;
      setUsers(prev => [...prev, user]);
    }
  };

  const updatePolicy = (id: string, patch: Partial<PolicyRule>) => {
    if (api.isEnabled) {
      (async () => {
        try {
          const actor = 'Sistema';
          const updated = await api.updatePolicy(id, patch, actor);
          setPolicies(prev => prev.map(p => (p.id === id ? (updated as any) : p)));
          try {
            const hist = await fetch(`${import.meta.env.VITE_API_URL}/policy-history`).then(r=>r.json());
            setPolicyHistory(hist as PolicyChange[]);
          } catch {}
        } catch (e) { console.error('Error actualizando política', e); }
      })();
    } else {
      setPolicies(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
    }
  };

  const addPolicyHistory = (entries: PolicyChange[]) => {
    if (api.isEnabled) {
      (async () => {
        try {
          const hist = await fetch(`${import.meta.env.VITE_API_URL}/policy-history`).then(r=>r.json());
          setPolicyHistory(hist as PolicyChange[]);
        } catch {}
      })();
    } else {
      if (!entries || entries.length === 0) return;
      setPolicyHistory(prev => [...entries, ...prev].slice(0, 500));
    }
  };

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  const refreshAll = async () => {
    if (!api.isEnabled) return;
    try {
      const [usersRes, requestsRes, policiesRes] = await Promise.all([
        api.getUsers(),
        api.getRequests(),
        api.getPolicies(),
      ]);
      setUsers(usersRes as User[]);
      setRequests((requestsRes as any[]).map((r) => ({
        ...r,
        employeeName: r.employeeName || r.employee?.name || '',
        department: r.department || r.employee?.department,
        requestDate: r.requestDate?.split ? r.requestDate.split('T')[0] : r.requestDate,
        approvedDate: r.approvedDate ? (r.approvedDate.split ? r.approvedDate.split('T')[0] : r.approvedDate) : undefined,
      })) as Request[]);
      setPolicies(policiesRes as PolicyRule[]);
      try {
        const hist = await fetch(`${import.meta.env.VITE_API_URL}/policy-history`).then(r=>r.json());
        setPolicyHistory(hist as PolicyChange[]);
      } catch {}
    } catch (e) {
      console.error('Error en refreshAll', e);
    }
  };

  return (
    <AppContext.Provider value={{
      requests,
      notifications,
      users,
      policies,
      policyHistory,
      addRequest,
      updateRequestStatus,
      markNotificationAsRead,
      addNotification,
      deleteRequest,
      searchQuery,
      setSearchQuery,
      updateUser,
      addUser,
      updatePolicy,
      addPolicyHistory,
      theme,
      toggleTheme,
      refreshAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

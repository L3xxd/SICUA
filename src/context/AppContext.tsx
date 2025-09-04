import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Request, Notification, User, PolicyRule, PolicyChange } from '../types';
import { mockRequests, mockNotifications, mockUsers, mockPolicies } from '../data/mockData';

interface AppContextType {
  requests: Request[];
  notifications: Notification[];
  users: User[];
  policies: PolicyRule[];
  policyHistory: PolicyChange[];
  addRequest: (request: Omit<Request, 'id' | 'requestDate'>) => void;
  updateRequestStatus: (id: string, status: Request['status'], approvedBy?: string, rejectionReason?: string) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  updatePolicy: (id: string, patch: Partial<PolicyRule>) => void;
  addPolicyHistory: (entries: PolicyChange[]) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [policies, setPolicies] = useState<PolicyRule[]>(mockPolicies);
  const [policyHistory, setPolicyHistory] = useState<PolicyChange[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light'|'dark')) || 'light');

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      try { localStorage.setItem('theme', theme); } catch {}
    }
  }, [theme]);

  const addRequest = (requestData: Omit<Request, 'id' | 'requestDate'>) => {
    const newRequest: Request = {
      ...requestData,
      id: (requests.length + 1).toString(),
      requestDate: new Date().toISOString().split('T')[0],
    };
    setRequests(prev => [...prev, newRequest]);
  };

  const updateRequestStatus = (id: string, status: Request['status'], approvedBy?: string, rejectionReason?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      const nowISO = new Date().toISOString();
      const newEntry = status === 'approved'
        ? { action: 'approved' as const, by: approvedBy || 'Sistema', date: nowISO }
        : { action: 'rejected' as const, by: approvedBy || 'Sistema', date: nowISO, reason: rejectionReason };
      return {
        ...req,
        status,
        approvedBy: status === 'approved' ? (approvedBy || req.approvedBy) : req.approvedBy,
        approvedDate: status === 'approved' ? nowISO.split('T')[0] : req.approvedDate,
        rejectionReason: status === 'rejected' ? (rejectionReason || req.rejectionReason) : req.rejectionReason,
        history: [...(req.history || []), newEntry],
      };
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: (notifications.length + 1).toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const updateUser = (id: string, patch: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
  };

  const updatePolicy = (id: string, patch: Partial<PolicyRule>) => {
    setPolicies(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addPolicyHistory = (entries: PolicyChange[]) => {
    if (!entries || entries.length === 0) return;
    setPolicyHistory(prev => [...entries, ...prev].slice(0, 500));
  };

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

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
      searchQuery,
      setSearchQuery,
      updateUser,
      updatePolicy,
      addPolicyHistory,
      theme,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Request, Notification } from '../types';
import { mockRequests, mockNotifications } from '../data/mockData';

interface AppContextType {
  requests: Request[];
  notifications: Notification[];
  addRequest: (request: Omit<Request, 'id' | 'requestDate'>) => void;
  updateRequestStatus: (id: string, status: Request['status'], approvedBy?: string, rejectionReason?: string) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
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

  const addRequest = (requestData: Omit<Request, 'id' | 'requestDate'>) => {
    const newRequest: Request = {
      ...requestData,
      id: (requests.length + 1).toString(),
      requestDate: new Date().toISOString().split('T')[0],
    };
    setRequests(prev => [...prev, newRequest]);
  };

  const updateRequestStatus = (id: string, status: Request['status'], approvedBy?: string, rejectionReason?: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { 
            ...req, 
            status, 
            approvedBy: approvedBy || req.approvedBy,
            approvedDate: status === 'approved' ? new Date().toISOString().split('T')[0] : req.approvedDate,
            rejectionReason: rejectionReason || req.rejectionReason
          }
        : req
    ));
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

  return (
    <AppContext.Provider value={{
      requests,
      notifications,
      addRequest,
      updateRequestStatus,
      markNotificationAsRead,
      addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
};
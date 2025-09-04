// Tipos principales del sistema
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'supervisor' | 'hr' | 'director';
  department: string;
  position: string;
  supervisorId?: string;
  avatar?: string;
  vacationDays: number;
  usedVacationDays: number;
}

export interface Request {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'permission' | 'leave';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  days: number;
  urgent: boolean;
  history?: Array<{
    action: 'approved' | 'rejected';
    by: string;
    date: string;
    reason?: string;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request' | 'approval' | 'rejection' | 'reminder';
  read: boolean;
  createdAt: string;
  relatedRequestId?: string;
}

export interface CalendarEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'permission' | 'leave';
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending';
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
}

export interface PolicyRule {
  id: string;
  type: 'vacation' | 'permission' | 'leave';
  minAdvanceDays: number;
  maxConsecutiveDays: number;
  requiresApproval: boolean;
  approvalLevels: string[];
}

// Tipos principales del sistema
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'employee' | 'supervisor' | 'hr' | 'director';
  department: string;
  position: string;
  supervisorId?: string;
  avatar?: string;
  vacationDays: number;
  usedVacationDays: number;
  // Campos adicionales de perfil
  // telefono
  phone?: string;
  // fecha de ingreso (ISO yyyy-mm-dd)
  hireDate?: string;
  // antigüedad en años (se recomienda calcularla a partir de hireDate)
  seniorityYears?: number;
  // tipo de contrato (solo 'fijo' o 'temporal')
  contractType?: 'fijo' | 'temporal';
  // código de barras único
  barcode?: string;
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
  stage?: 'supervisor' | 'hr' | 'director' | 'completed';
  supervisorName?: string;
  department?: string;
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

export interface PolicyChange {
  id: string; // policy id
  type: PolicyRule['type'];
  field: string;
  from: string | number | boolean;
  to: string | number | boolean;
  actor: string; // who changed it
  date: string; // ISO timestamp
}

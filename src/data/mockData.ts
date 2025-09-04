import { User, Request, Notification, Department, PolicyRule } from '../types';

// Datos simulados para el sistema
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@empresa.com',
    name: 'María García',
    role: 'hr',
    department: 'Recursos Humanos',
    position: 'Directora de RRHH',
    vacationDays: 25,
    usedVacationDays: 5,
  },
  {
    id: '2',
    email: 'supervisor@empresa.com',
    name: 'Carlos Mendez',
    role: 'supervisor',
    department: 'Desarrollo',
    position: 'Jefe de Desarrollo',
    vacationDays: 22,
    usedVacationDays: 8,
  },
  {
    id: '3',
    email: 'empleado@empresa.com',
    name: 'Ana López',
    role: 'employee',
    department: 'Desarrollo',
    position: 'Desarrolladora Senior',
    supervisorId: '2',
    vacationDays: 20,
    usedVacationDays: 12,
  },
  {
    id: '4',
    email: 'director@empresa.com',
    name: 'Roberto Silva',
    role: 'director',
    department: 'Dirección General',
    position: 'Director General',
    vacationDays: 30,
    usedVacationDays: 3,
  },
];

export const mockRequests: Request[] = [
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Ana López',
    type: 'vacation',
    startDate: '2025-02-15',
    endDate: '2025-02-19',
    reason: 'Vacaciones familiares',
    status: 'pending',
    requestDate: '2025-01-15',
    days: 5,
    urgent: false,
  },
  {
    id: '2',
    employeeId: '3',
    employeeName: 'Ana López',
    type: 'permission',
    startDate: '2025-01-22',
    endDate: '2025-01-22',
    reason: 'Cita médica',
    status: 'approved',
    requestDate: '2025-01-20',
    approvedBy: 'Carlos Mendez',
    approvedDate: '2025-01-21',
    days: 1,
    urgent: true,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Nueva solicitud de vacaciones',
    message: 'Ana López ha solicitado 5 días de vacaciones',
    type: 'request',
    read: false,
    createdAt: '2025-01-15T10:30:00',
    relatedRequestId: '1',
  },
  {
    id: '2',
    userId: '3',
    title: 'Permiso aprobado',
    message: 'Tu solicitud de permiso médico ha sido aprobada',
    type: 'approval',
    read: false,
    createdAt: '2025-01-21T14:15:00',
    relatedRequestId: '2',
  },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Recursos Humanos', headId: '1' },
  { id: '2', name: 'Desarrollo', headId: '2' },
  { id: '3', name: 'Ventas', headId: undefined },
  { id: '4', name: 'Marketing', headId: undefined },
];

export const mockPolicies: PolicyRule[] = [
  {
    id: '1',
    type: 'vacation',
    minAdvanceDays: 15,
    maxConsecutiveDays: 10,
    requiresApproval: true,
    approvalLevels: ['supervisor', 'hr'],
  },
  {
    id: '2',
    type: 'permission',
    minAdvanceDays: 1,
    maxConsecutiveDays: 3,
    requiresApproval: true,
    approvalLevels: ['supervisor'],
  },
  {
    id: '3',
    type: 'leave',
    minAdvanceDays: 30,
    maxConsecutiveDays: 90,
    requiresApproval: true,
    approvalLevels: ['supervisor', 'hr', 'director'],
  },
];
export type AppRole = 'employee' | 'supervisor' | 'hr' | 'director';

export const roleLabel = (role: AppRole | string): string => {
  const map: Record<string, string> = {
    employee: 'Empleado',
    supervisor: 'Supervisor',
    hr: 'RRHH',
    director: 'Director',
  };
  return map[role] ?? role;
};

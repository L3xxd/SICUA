const API_URL = import.meta.env.VITE_API_URL as string | undefined;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function http<T>(path: string, options: { method?: HttpMethod; body?: any; token?: string } = {}): Promise<T> {
  if (!API_URL) throw new Error('API not configured');
  const { method = 'GET', body, token } = options;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  isEnabled: !!API_URL,

  // Auth
  login: (email: string, password: string) => http<{ token: string; user: any }>(`/auth/login`, { method: 'POST', body: { email, password } }),

  // Users
  getUsers: () => http<any[]>(`/users`),
  createUser: (data: any) => http<any>(`/users`, { method: 'POST', body: data }),
  updateUser: (id: string, data: any) => http<any>(`/users/${id}`, { method: 'PUT', body: data }),

  // Requests
  getRequests: () => http<any[]>(`/requests`),
  createRequest: (data: any) => http<any>(`/requests`, { method: 'POST', body: data }),
  updateRequestStatus: (id: string, data: any) => http<any>(`/requests/${id}/status`, { method: 'PUT', body: data }),
  updateRequestStage: (id: string, data: any) => http<any>(`/requests/${id}/stage`, { method: 'PUT', body: data }),
  deleteRequest: (id: string) => http<{ok:true}>(`/requests/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (userId: string) => http<any[]>(`/notifications/${userId}`),
  addNotification: (data: any) => http<any>(`/notifications`, { method: 'POST', body: data }),

  // Policies
  getPolicies: () => http<any[]>(`/policies`),
  updatePolicy: (id: string, patch: any, actor?: string) => http<any>(`/policies/${id}`, { method: 'PUT', body: { patch, actor } }),

  // attendance api removed (reverted)
};

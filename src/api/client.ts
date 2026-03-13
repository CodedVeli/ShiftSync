import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};

export const shiftsApi = {
  getAll: async (params?: { locationId?: string; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get('/shifts', { params });
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/shifts/${id}`);
    return data;
  },
  create: async (shiftData: {
    locationId: string;
    startTime: string;
    endTime: string;
    requiredSkillId: string;
    headcountNeeded: number;
  }) => {
    const { data } = await apiClient.post('/shifts', shiftData);
    return data;
  },
  update: async (id: string, shiftData: Partial<{
    locationId: string;
    startTime: string;
    endTime: string;
    requiredSkillId: string;
    headcountNeeded: number;
  }>) => {
    const { data } = await apiClient.put(`/shifts/${id}`, shiftData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/shifts/${id}`);
    return data;
  },
  assign: async (shiftId: string, staffId: string) => {
    const { data } = await apiClient.post(`/shifts/${shiftId}/assign`, { staffId });
    return data;
  },
  unassign: async (shiftId: string, staffId: string) => {
    const { data } = await apiClient.delete(`/shifts/${shiftId}/assign/${staffId}`);
    return data;
  },
  publishSchedule: async (shiftIds: string[]) => {
    const { data } = await apiClient.post('/shifts/publish', { shiftIds });
    return data;
  },
  override: async (shiftId: string, staffId: string, reason: string, constraintViolated: string) => {
    const { data } = await apiClient.post(`/shifts/${shiftId}/override`, {
      staffId,
      reason,
      constraintViolated,
    });
    return data;
  },
};

export const locationsApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/locations');
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/locations/${id}`);
    return data;
  },
};

export const usersApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/users');
    return data;
  },
  getStaff: async () => {
    const { data } = await apiClient.get('/users/staff/list');
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
};

export const availabilityApi = {
  getMine: async () => {
    const { data } = await apiClient.get('/availability/me');
    return data;
  },
  create: async (availabilityData: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isException?: boolean;
    exceptionDate?: string;
    isAvailable?: boolean;
  }) => {
    const { data } = await apiClient.post('/availability', availabilityData);
    return data;
  },
  update: async (id: string, availabilityData: Partial<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isException: boolean;
    exceptionDate: string;
    isAvailable: boolean;
  }>) => {
    const { data } = await apiClient.put(`/availability/${id}`, availabilityData);
    return data;
  },
  delete: async (id: string) => {
    const { data} = await apiClient.delete(`/availability/${id}`);
    return data;
  },
};

export const swapRequestsApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/swap-requests');
    return data;
  },
  create: async (swapData: {
    shiftId: string;
    type: 'SWAP' | 'DROP';
    targetStaffId?: string;
  }) => {
    const { data } = await apiClient.post('/swap-requests', swapData);
    return data;
  },
  accept: async (id: string) => {
    const { data } = await apiClient.post(`/swap-requests/${id}/accept`);
    return data;
  },
  approve: async (id: string) => {
    const { data } = await apiClient.post(`/swap-requests/${id}/approve`);
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await apiClient.post(`/swap-requests/${id}/cancel`);
    return data;
  },
};

export const analyticsApi = {
  getOvertime: async (params?: { locationId?: string; weekStart?: string }) => {
    const { data } = await apiClient.get('/analytics/overtime', { params });
    return data;
  },
  getFairness: async (params?: { locationId?: string; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get('/analytics/fairness', { params });
    return data;
  },
  getHoursDistribution: async (params?: { locationId?: string; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get('/analytics/hours-distribution', { params });
    return data;
  },
};

export const notificationsApi = {
  getMine: async () => {
    const { data } = await apiClient.get('/notifications/me');
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  },
  markAsRead: async (id: string) => {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
  },
};

export const auditApi = {
  getByShift: async (shiftId: string) => {
    const { data } = await apiClient.get(`/audit/shift/${shiftId}`);
    return data;
  },
  getAll: async (limit?: number) => {
    const { data } = await apiClient.get('/audit', { params: { limit } });
    return data;
  },
  export: async (params?: { startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get('/audit/export', { params });
    return data;
  },
};

export const dashboardApi = {
  getOnDuty: async () => {
    const { data } = await apiClient.get('/dashboard/on-duty');
    return data;
  },
};

export const skillsApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/skills');
    return data;
  },
};

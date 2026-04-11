import axios from 'axios';

const API_URL = 'https://rikkiter.ru';

// 1. Экземпляр axios
const api = axios.create({
  baseURL: API_URL,
});

// 2. Интерцептор ЗАПРОСОВ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Интерцептор ОТВЕТОВ
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        if (res.data.access_token) {
          localStorage.setItem('access_token', res.data.access_token);
          localStorage.setItem('refresh_token', res.data.refresh_token);

          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 4. Объект с методами
export const workspaceApi = {
  login: async (login, password) => {
    const response = await api.post('/auth/sign-in', { login, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  },

  getWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  getMainWorkspace: async () => {
    try {
      const response = await api.get('/workspaces/main');
      return response.data;
    } catch (e) {
      return null;
    }
  },

  getWorkspaceById: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return [];
      throw error;
    }
  },

  getBookingHistory: async () => {
    const response = await api.get('/bookings/history');
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getFavorite: async () => {
    try {
      const response = await api.get('/workspaces/favourite');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  toggleFavorite: async (workspaceId) => {
    const response = await api.post('/workspaces/favourite', { 
      id: Number(workspaceId) 
    });
    return response.data;
  },
};

export default api;
import api from './index';

export const workspaceApi = {
  login: async (login, password) => {
    const response = await api.post('/auth/sign-in', { login, password });
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
    } catch (e) { return null; }
  },

  getFavorite: async () => {
    try {
      const response = await api.get('/workspaces/favourite');
      return response.data;
    } catch (e) { return null; }
  },

  toggleFavorite: async (workspaceId) => {
    const response = await api.post('/workspaces/favourite', { 
      id: Number(workspaceId) 
    });
    return response.data;
  },

  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      return []; // Если 404 — просто возвращаем пустой массив
    }
  },

  getBookingHistory: async () => {
    try {
      const response = await api.get('/bookings/history');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  deleteBooking: async (id) => {
    await api.delete(`/bookings/${id}`);
    return true;
  }
};
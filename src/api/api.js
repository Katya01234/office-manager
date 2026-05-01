import api from './index';

export const workspaceApi = {

  connectVk: async (tokenId) => {
    const response = await api.post('/me/vk', { token_id: tokenId }); 
    return response.data;
  },

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
  },

    getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  getVkStatus: async () => {
    try {
      const response = await api.get('/me/vk/status');
      return response.data;
    } catch (e) {
      return { is_linked: false, message_allowed: false };
    }
  }

};
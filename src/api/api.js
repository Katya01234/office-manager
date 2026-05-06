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
  },

checkAvailability: async (id, start, end) => {
    // Используем 'api' вместо 'axios', чтобы подтянулись базовый URL и интерцепторы
    const response = await api.get(`/workspaces/${id}/availability`, {
        params: {
            start_datetime: start,
            end_datetime: end
        }
    });
    return response.data; // { available: boolean, ... }
},

getWorkspaceDetails: async (id) => {
  const response = await api.get(`/workspaces/${id}`);
  return response.data;
},

getAvailableWorkspaces: async (start, end) => {
    const response = await api.get(`/workspaces/available`, {
      params: {
        start: start,
        end: end
      }
    });
    return response.data;
  },

  rescheduleBooking: async (id, startDatetime, endDatetime) => {
    const response = await api.patch(`/bookings/${id}`, {
      params: {
        start_datetime: startDatetime,
        end_datetime: endDatetime,
    }
    });
    return response.data;
  },

};
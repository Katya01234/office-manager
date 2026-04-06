import BASE_URL, { getHeaders } from './api';

export const workspaceApi = {
  // Авторизация
  login: async (login, password) => {
    const response = await fetch(`${BASE_URL}/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    if (!response.ok) throw new Error('Ошибка входа' + response.status);
    return response.json(); // Вернет access_token и refresh_token 
  },

  // Получить все места 
  getWorkspaces: async () => {
    const response = await fetch(`${BASE_URL}/workspaces`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Ошибка загрузки мест');
    return response.json();
  },

  // Получить историю бронирований 
  getBookingHistory: async () => {
    const response = await fetch(`${BASE_URL}/bookings/history`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Ошибка загрузки истории');
    return response.json();
  },

  // Добавить в избранное 
  toggleFavorite: async (id) => {
    const response = await fetch(`${BASE_URL}/workspaces/favourite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id })
    });
    return response.ok;
  }
};
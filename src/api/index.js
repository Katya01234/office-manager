import axios from 'axios';

const API_URL = 'https://rikkiter.ru';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Очищаем токен от возможных кавычек, если они сохранились случайно
    const cleanToken = token.replace(/['"]+/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error("No refresh token");

        // ВАЖНО: Отправляем именно так, как просит Swagger
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        if (res.data.access_token) {
          localStorage.setItem('access_token', res.data.access_token);
          if (res.data.refresh_token) {
            localStorage.setItem('refresh_token', res.data.refresh_token);
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
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

export default api;
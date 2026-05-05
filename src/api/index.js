import axios from 'axios';

const API_URL = 'https://rikkiter.ru';

const api = axios.create({
  baseURL: API_URL,
});

// Интерцептор запроса
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Безопасная очистка токена
    const cleanToken = String(token).replace(/['"]+/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Интерцептор ответа
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. ПРОВЕРКА: Если ошибка 401 случилась на странице логина, 
    // просто пробрасываем ошибку дальше в компонент Login.jsx
    if (originalRequest.url.includes('/auth/sign-in')) {
      return Promise.reject(error);
    }

    // Проверяем 401 и что это не запрос к самому /auth/refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error("No refresh token");

        const cleanRefreshToken = String(refreshToken).replace(/['"]+/g, '');

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: cleanRefreshToken
        });

        if (res.data.access_token) {
          const newAccessToken = String(res.data.access_token).replace(/['"]+/g, '');
          const newRefreshToken = res.data.refresh_token 
            ? String(res.data.refresh_token).replace(/['"]+/g, '') 
            : null;

          localStorage.setItem('access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если мы здесь, значит сессия реально протухла
        console.error("Refresh session expired:", refreshError);
        localStorage.clear();
        
        // Редирект только если мы не на странице логина
        if (!window.location.pathname.includes('/login')) {
           window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
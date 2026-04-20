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

    // Проверяем 401 и что это не запрос к самому /auth/refresh (чтобы избежать цикла)
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

        // Используем чистый axios, а не наш экземпляр api, 
        // чтобы не зациклить интерцепторы в случае ошибки рефреша
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: cleanRefreshToken
        });

        if (res.data.access_token) {
          const newAccessToken = String(res.data.access_token).replace(/['"]+/g, '');
          const newRefreshToken = res.data.refresh_token 
            ? String(res.data.refresh_token).replace(/['"]+/g, '') 
            : null;

          // Сохраняем новые данные
          localStorage.setItem('access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          // Обновляем заголовок именно в текущем (упавшем) запросе
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Повторяем запрос с обновленным конфигом
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если рефреш протух — полная очистка и редирект
        console.error("Refresh session expired:", refreshError);
        localStorage.clear();
        
        // Используем replace, чтобы нельзя было нажать "назад" в заблокированную сессию
        window.location.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
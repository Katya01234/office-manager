import axios from 'axios';

const API_URL = 'https://rikkiter.ru';

const api = axios.create({
  baseURL: API_URL,
});

// Интерцептор запроса: добавляет access_token в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Очищаем токен от возможных кавычек
    const cleanToken = token.replace(/['"]+/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Интерцептор ответа: обрабатывает 401 ошибку и обновляет токен
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Проверяем на 401 ошибку и что это не повторная попытка
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Если рефреш-токена нет, сразу выходим
        if (!refreshToken) throw new Error("No refresh token");

        const cleanRefreshToken = refreshToken.replace(/['"]+/g, '');

        // 2. Запрос на обновление токена (согласно Swagger)
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: cleanRefreshToken
        });

        // 3. Если получили новый access_token
        if (res.data.access_token) {
          const newAccessToken = res.data.access_token.replace(/['"]+/g, '');
          const newRefreshToken = res.data.refresh_token?.replace(/['"]+/g, '');

          // Сохраняем новые токены
          localStorage.setItem('access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          // 4. ОБЯЗАТЕЛЬНО: Обновляем заголовок в упавшем запросе
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Обновляем заголовок по умолчанию для всех будущих запросов
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          // 5. Повторяем изначальный запрос
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если рефреш не удался (например, он тоже протух)
        console.error("Refresh token failed:", refreshError);
        localStorage.clear();
        window.location.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
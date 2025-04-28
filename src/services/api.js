import axios from 'axios';

// Создаем экземпляр axios с базовым URL и настройками
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API для работы с экспертами
export const ExpertsAPI = {
  // Получение списка экспертов с пагинацией и фильтрацией
  getExperts: (params = {}) => {
    return apiClient.get('/api/v2/experts/', { params });
  },

  // Поиск экспертов
  searchExperts: (params = {}) => {
    return apiClient.get('/api/v2/experts/search', { params });
  },

  // Получение детальной информации об эксперте
  getExpertDetails: (id) => {
    return apiClient.get(`/api/v2/experts/${id}`);
  },

  // Отправка запроса на сотрудничество
  requestCollaboration: (expertId, data) => {
    return apiClient.post(`/api/v2/experts/${expertId}/collaborate`, data);
  },

  // Получение списка специализаций (пример, в реальном проекте может быть другой эндпоинт)
  getSpecializations: () => {
    return apiClient.get('/api/v2/specializations');
  },

  // Получение списка городов (пример, в реальном проекте может быть другой эндпоинт)
  getCities: () => {
    return apiClient.get('/api/v2/cities');
  }
};

// API для работы с аутентификацией
export const AuthAPI = {
  // Регистрация пользователя
  register: (userData) => {
    return apiClient.post('/api/v2/auth/register', userData);
  },

  // Вход пользователя
  login: (credentials) => {
    return apiClient.post('/api/v2/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // Получение информации о текущем пользователе
  getCurrentUser: () => {
    return apiClient.get('/api/v2/auth/me');
  },

  // Выход пользователя (очистка localStorage на клиенте)
  logout: () => {
    localStorage.removeItem('accessToken');
    return Promise.resolve();
  }
};

// Обертка для работы с localStorage
export const StorageService = {
  // Сохранение токена доступа
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
  },

  // Получение токена доступа
  getToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Удаление токена доступа
  removeToken: () => {
    localStorage.removeItem('accessToken');
  },

  // Проверка наличия токена доступа
  hasToken: () => {
    return !!localStorage.getItem('accessToken');
  }
};

export default apiClient;
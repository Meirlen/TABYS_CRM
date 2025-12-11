import axios from 'axios';


export const API_BASE_URL = "https://saryarqajastary.kz";

// Создаем экземпляр axios с базовым URL и настройками
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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


// API для работы с курсами
export const CoursesAPI = {
  // Получение списка всех курсов с пагинацией
  getCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/', { params });
  },

  // Получение рекомендуемых курсов
  getRecommendedCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/recommended', { params });
  },

  // Получение популярных курсов
  getPopularCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/popular', { params });
  },

  // Получение часто ищемых курсов
  getMostSearchedCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/most-searched', { params });
  },

  // Получение бесплатных курсов
  getFreeCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/free', { params });
  },

  // Поиск и фильтрация курсов
  searchCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/search', { params });
  },

  // Получение списка категорий курсов
  getCategories: () => {
    return apiClient.get('/api/v2/courses/categories');
  },

  // Получение детальной информации о курсе
  getCourseDetails: (id) => {
    return apiClient.get(`/api/v2/courses/${id}`);
  },

  // Создание нового курса (с файлами)
  createCourse: (courseData) => {
    const formData = new FormData();

    // Добавляем текстовые поля
    Object.keys(courseData).forEach(key => {
      if (key !== 'cover_image' && key !== 'video_preview' && key !== 'categories') {
        formData.append(key, courseData[key]);
      }
    });

    // Добавляем категории
    if (courseData.categories && Array.isArray(courseData.categories)) {
      courseData.categories.forEach(categoryId => {
        formData.append('categories', categoryId);
      });
    }

    // Добавляем файлы
    if (courseData.cover_image) {
      formData.append('cover_image', courseData.cover_image);
    }

    if (courseData.video_preview) {
      formData.append('video_preview', courseData.video_preview);
    }

    return apiClient.post('/api/v2/courses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Обновление существующего курса
  updateCourse: (id, courseData) => {
    const formData = new FormData();

    // Добавляем текстовые поля
    Object.keys(courseData).forEach(key => {
      if (key !== 'cover_image' && key !== 'video_preview' && key !== 'categories' && courseData[key] !== null) {
        formData.append(key, courseData[key]);
      }
    });

    // Добавляем категории
    if (courseData.categories && Array.isArray(courseData.categories)) {
      courseData.categories.forEach(categoryId => {
        formData.append('categories', categoryId);
      });
    }

    // Добавляем файлы
    if (courseData.cover_image) {
      formData.append('cover_image', courseData.cover_image);
    }

    if (courseData.video_preview) {
      formData.append('video_preview', courseData.video_preview);
    }

    return apiClient.put(`/api/v2/courses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Обновление статуса курса (для администраторов)
  updateCourseStatus: (id, statusData) => {
    return apiClient.patch(`/api/v2/courses/${id}/status`, statusData);
  },

  // Удаление курса
  deleteCourse: (id) => {
    return apiClient.delete(`/api/v2/courses/${id}`);
  },

  // Добавление главы к курсу
  addChapter: (courseId, chapterData) => {
    return apiClient.post(`/api/v2/courses/${courseId}/chapters`, chapterData);
  },

  // Добавление урока к главе
  addLesson: (courseId, chapterId, lessonData) => {
    const formData = new FormData();

    Object.keys(lessonData).forEach(key => {
      if (key !== 'video') {
        formData.append(key, lessonData[key]);
      }
    });

    if (lessonData.video) {
      formData.append('video', lessonData.video);
    }

    return apiClient.post(`/api/v2/courses/${courseId}/chapters/${chapterId}/lessons`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Добавление теста к уроку
  addTest: (courseId, chapterId, lessonId, testData) => {
    const formData = new FormData();

    formData.append('question', testData.question);

    // Добавляем варианты ответов
    testData.answers.forEach(answer => {
      formData.append('answers', answer);
    });

    // Добавляем правильные ответы
    testData.correct_answers.forEach(index => {
      formData.append('correct_answers', index);
    });

    if (testData.image) {
      formData.append('image', testData.image);
    }

    return apiClient.post(
      `/api/v2/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/tests`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
};



export default apiClient;
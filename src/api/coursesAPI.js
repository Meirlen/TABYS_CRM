import axios from 'axios';
import Router from 'next/router';
export const API_BASE_URL = "https://saryarqajastary.kz";

// Создаем экземпляр axios с базовым URL и настройками
const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Важно! Перехватчик должен быть определен ДО экспорта API
// Перехватчик для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    // Проверяем, что мы в браузере
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки 401 ошибок (Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Проверяем, что мы в браузере и это ошибка 401
    if (
      typeof window !== 'undefined' &&
      error.response &&
      error.response.status === 401
    ) {
      console.log('Перехватчик обнаружил ошибку 401, выполняется редирект...');

      // Очищаем токен из localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('phoneNumber');

      // Получаем текущий язык из localStorage или используем дефолтный 'kz'
      const language = localStorage.getItem('language') || 'kz';

      // Проверяем, что мы не на странице логина
      if (!window.location.pathname.includes('/login')) {
        // Сохраняем текущий URL для возврата после логина
        const returnUrl = encodeURIComponent(window.location.pathname);

        // Выполняем редирект напрямую
        window.location.href = `/${language}/login?returnUrl=${returnUrl}`;

        // Важно! Используем пустой Promise, который никогда не разрешится
        // Это предотвратит выполнение кода в компоненте
        return new Promise(() => {});
      }
    }

    // Для всех других ошибок продолжаем стандартную обработку
    return Promise.reject(error);
  }
);

// API для работы с сертификатами
export const CertificatesAPI = {
  // Получение списка всех сертификатов с пагинацией
  getCertificates: (params = {}) => {
    return apiClient.get('/api/v2/certificates', { params });
  },

  // Получение сертификатов текущего пользователя
  getMyCertificates: (params = {}) => {
    return apiClient.get('/api/v2/certificates/my', { params });
  },

  // Получение детальной информации о сертификате
  getCertificateDetails: (id) => {
    return apiClient.get(`/api/v2/certificates/${id}`);
  },

  // Создание нового сертификата
  createCertificate: (certificateData) => {
    const formData = new FormData();

    // Добавляем текстовые поля
    Object.keys(certificateData).forEach(key => {
      if (key !== 'image' && key !== 'pdf_file') {
        formData.append(key, certificateData[key]);
      }
    });

    // Добавляем файлы
    if (certificateData.image) {
      formData.append('image', certificateData.image);
    }

    if (certificateData.pdf_file) {
      formData.append('pdf_file', certificateData.pdf_file);
    }

    return apiClient.post('/api/v2/certificates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Отзыв сертификата (только для администраторов)
  revokeCertificate: (id) => {
    return apiClient.post(`/api/v2/certificates/${id}/revoke`);
  },

  // Удаление сертификата (только для администраторов)
  deleteCertificate: (id) => {
    return apiClient.delete(`/api/v2/certificates/${id}`);
  },

  // Скачивание файла сертификата
  downloadCertificate: (id) => {
    return apiClient.get(`/api/v2/certificates/${id}/download`, {
      responseType: 'blob',
    });
  },

  // Получение изображения сертификата
  getCertificateImage: (id) => {
    return apiClient.get(`/api/v2/certificates/${id}/image`, {
      responseType: 'blob',
    });
  },

  // Верификация сертификата по ID и коду
  verifyCertificate: (id, code) => {
    return apiClient.get(`/api/v2/certificates/verify/${id}/${code}`);
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

  // Получение курсов пользователя (требуется авторизация)
  getUserCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/my', { params });
  },

  // Получение списка категорий курсов
  getCategories: () => {
    return apiClient.get('/api/v2/courses/categories');
  },

  // Создание новой категории
  createCategory: (categoryData) => {
    return apiClient.post('/api/v2/courses/categories', categoryData);
  },

  // Получение завершенных тестов
  getCompletedTests: (courseId) => {
    return apiClient.get(`/api/v2/courses/${courseId}/tests/completed`);
  },

  // Получение детальной информации о курсе
  getCourseDetails: (id) => {
    return apiClient.get(`/api/v2/courses/${id}`);
  },

  // Получение моих курсов (требуется авторизация)
  getMyCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/my', { params });
  },

  // Запись на курс (требуется авторизация)
  enrollInCourse: (courseId) => {
    return apiClient.post(`/api/v2/courses/${courseId}/enroll`);
  },

  // Получение прогресса пользователя по курсу (требуется авторизация)
  getCourseProgress: (courseId) => {
    return apiClient.get(`/api/v2/courses/${courseId}/progress`);
  },

  // Отметка урока как завершенного (требуется авторизация)
  completeLesson: (courseId, lessonId) => {
    return apiClient.post(`/api/v2/courses/${courseId}/lessons/${lessonId}/complete`);
  },

  // Отправка ответов на тест (требуется авторизация)
  submitTestAnswers: (courseId, testId, answers) => {
    return apiClient.post(`/api/v2/courses/${courseId}/tests/${testId}/submit`, answers);
  },

  // Получение курсов, ожидающих модерации
  getPendingCourses: (params = {}) => {
    return apiClient.get('/api/v2/courses/moderation/pending', { params });
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
// Конфигурация для API
// Поместите этот файл в удобное место, например: /utils/apiConfig.js или /config/api.js

// Базовый URL API
export const API_BASE_URL = "https://saryarqajastary.kz";

// Пути API для экспертов
export const EXPERTS_API = {
  LIST: `${API_BASE_URL}/api/v2/experts`,
  SEARCH: `${API_BASE_URL}/api/v2/experts/search`,
  DETAIL: (id) => `${API_BASE_URL}/api/v2/experts/${id}`,
  COLLABORATE: (id) => `${API_BASE_URL}/api/v2/experts/${id}/collaborate`,
  CREATE: `${API_BASE_URL}/api/v2/experts/`
};

// Пути API для вакансий
export const VACANCIES_API = {
  LIST: `${API_BASE_URL}/api/v2/vacancies`,
  SEARCH: `${API_BASE_URL}/api/v2/vacancies/search`,
  DETAIL: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}`,
  APPLY: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}/apply`
};

// Функция для добавления параметров запроса
export const appendQueryParams = (url, params) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};
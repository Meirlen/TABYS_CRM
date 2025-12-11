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

// Эндпоинты API для вакансий
export const VACANCIES_API = {
  LIST: `${API_BASE_URL}/api/v2/vacancies/`,
  SEARCH: `${API_BASE_URL}/api/v2/vacancies/search`,
  DETAILS: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}`,
  CREATE: `${API_BASE_URL}/api/v2/vacancies/`,
  UPDATE: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}`,
  DELETE: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}`,
  APPLY: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}/apply`,
  // Add new endpoint for applications
  APPLICATIONS: (id) => `${API_BASE_URL}/api/v2/vacancies/${id}/applications`,
  APPLICATION_DETAIL: (vacancyId, applicationId) => `${API_BASE_URL}/api/v2/vacancies/${vacancyId}/applications/${applicationId}`,
  DOWNLOAD_RESUME: (vacancyId, applicationId) => `${API_BASE_URL}/api/v2/vacancies/${vacancyId}/applications/${applicationId}/resume`
};

// Эндпоинты API для мероприятий
export const EVENTS_API = {
  LIST: `${API_BASE_URL}/api/v2/events/`,
  SEARCH: `${API_BASE_URL}/api/v2/events/search`,
  DETAILS: (id) => `${API_BASE_URL}/api/v2/events/${id}`,
  CREATE: `${API_BASE_URL}/api/v2/events/`,
  UPDATE: (id) => `${API_BASE_URL}/api/v2/events/${id}`,
  DELETE: (id) => `${API_BASE_URL}/api/v2/events/${id}`,
  PARTICIPATE: (id) => `${API_BASE_URL}/api/v2/events/${id}/participate`,
  PARTICIPANTS: (id) => `${API_BASE_URL}/api/v2/events/${id}/participants`,
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
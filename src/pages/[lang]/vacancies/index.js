import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VACANCIES_API, appendQueryParams } from '../../../utils/apiConfig';
import { formatDate } from '../../../utils/dateUtils';
import AdminLayout from '../../../../components/layouts/AdminLayout';

import {
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Users,
  DollarSign,
  RefreshCw,
  Search
} from 'react-feather';

export default function VacanciesList({ filters, getTranslation, currentLang }) {
  // Add fallback for getTranslation if it's not provided
  const safeGetTranslation = (key) => {
    if (typeof getTranslation === 'function') {
      return getTranslation(key);
    }
    // Fallback translations
    const translations = {
      'vacancies.availablePositions': currentLang === 'kz' ? 'Қолжетімді позициялар' : 'Доступные позиции',
      'vacancies.fetchError': currentLang === 'kz' ? 'Вакансияларды жүктеу кезінде қате' : 'Ошибка при загрузке вакансий',
      'vacancies.loadMore': currentLang === 'kz' ? 'Көбірек жүктеу' : 'Загрузить еще',
      'vacancies.deadline': currentLang === 'kz' ? 'Соңғы мерзім' : 'Срок подачи',
      'vacancies.posted': currentLang === 'kz' ? 'Жарияланды' : 'Опубликовано',
      'vacancies.noVacancies': currentLang === 'kz' ? 'Бос жұмыс орындары табылмады' : 'Вакансии не найдены',
      'vacancies.loading': currentLang === 'kz' ? 'Жүктелуде...' : 'Загрузка...',
      'vacancies.pageTitle': currentLang === 'kz' ? 'Вакансиялар' : 'Вакансии',
      'vacancies.pageDescription': currentLang === 'kz' ? 'Қолжетімді жұмыс орындары тізімі' : 'Список доступных вакансий',
      'vacancies.searchPlaceholder': currentLang === 'kz' ? 'Вакансияларды іздеу...' : 'Поиск вакансий...'
    };
    return translations[key] || key;
  };

  const [vacancies, setVacancies] = useState([]);  // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Логика загрузки вакансий и обработки фильтров остается без изменений
  useEffect(() => {
    const fetchVacancies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Сбрасываем страницу при изменении фильтров
        const currentPage = page === 1 ? 1 : page;

        // Формируем параметры запроса
        const queryParams = {
          ...filters,
          page: currentPage,
          limit: 10,
        };

        // Формируем URL с параметрами
        const url = appendQueryParams(VACANCIES_API.LIST, queryParams);

        // Выполняем запрос
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid JSON response from server');
        }

        // Process the response data to handle both formats (array or {items: []})
        let processedData;

        // If data is already an array, wrap it
        if (Array.isArray(data)) {
          processedData = {
            items: data,
            total: data.length // For proper pagination, server should return total count
          };
        }
        // If data has items property that is an array, use that
        else if (data && Array.isArray(data.items)) {
          processedData = data;
        }
        // Fallback to empty array
        else {
          console.warn('Unexpected API response format:', data);
          processedData = { items: [], total: 0 };
        }

        // Обновляем состояние
        if (page === 1) {
          setVacancies(processedData.items);
        } else {
          setVacancies(prev => [...prev, ...processedData.items]);
        }

        // Store total count
        setTotal(processedData.total);

        // Проверяем, есть ли еще страницы
        setHasMore(processedData.total > page * 10);
      } catch (err) {
        console.error('Error fetching vacancies:', err);
        setError(safeGetTranslation('vacancies.fetchError'));
        // Важно: сохраняем текущие вакансии при ошибке, чтобы не затереть уже загруженные
      } finally {
        setIsLoading(false);
      }
    };

    fetchVacancies();
  }, [filters, page]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  // Функция для получения локализованного значения
  const getLocalizedField = (vacancy, fieldName) => {
    if (!vacancy) return '';

    // Получаем значение с учетом языка (title_kz, title_ru и т.д.)
    const localizedField = `${fieldName}_${currentLang}`;
    return vacancy[localizedField] || vacancy[`${fieldName}_kz`] || vacancy[fieldName] || '';
  };

  // Функция для получения цвета метки типа занятости
  const getEmploymentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'полная занятость':
      case 'толық жұмыс':
        return 'bg-teal-100 text-teal-700';
      case 'частичная занятость':
      case 'ішінара жұмыспен қамту':
        return 'bg-purple-100 text-purple-700';
      case 'проектная работа':
      case 'жобалық жұмыс':
        return 'bg-blue-100 text-blue-700';
      case 'стажировка':
      case 'тәжірибеден өту':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Функция для получения цвета метки типа работы
  const getWorkTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'удаленная работа':
      case 'қашықтықтан жұмыс':
        return 'bg-indigo-100 text-indigo-700';
      case 'офис':
        return 'bg-cyan-100 text-cyan-700';
      case 'гибридный формат':
      case 'гибридті формат':
        return 'bg-violet-100 text-violet-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-full flex justify-center items-center p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-gray-600 font-medium">{safeGetTranslation('vacancies.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-full p-8 bg-white rounded-xl shadow-md">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-md">
            <p className="font-semibold mb-1">Ошибка</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Проверка на пустой массив
  if (!vacancies || vacancies.length === 0) {
    return (
        <AdminLayout title="">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl p-6 mb-8">
          <div className="md:flex md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <Briefcase className="mr-3" size={28} />
                {safeGetTranslation('vacancies.pageTitle') || 'Вакансии'}
              </h1>
              <p className="mt-2 opacity-90">
                {safeGetTranslation('vacancies.pageDescription') || 'Список доступных вакансий'}
              </p>
            </div>

            {/* Быстрый поиск */}
            {filters && filters.search !== undefined && (
              <div className="max-w-xs w-full">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search || ''}
                    onChange={(e) => {
                      if (typeof filters.onChange === 'function') {
                        filters.onChange({
                          target: {
                            name: 'search',
                            value: e.target.value
                          }
                        });
                      }
                    }}
                    placeholder={safeGetTranslation('vacancies.searchPlaceholder') || 'Поиск вакансий...'}
                    className="w-full px-4 pl-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-full flex justify-center items-center p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Briefcase size={32} />
            </div>
            <p className="text-gray-700 font-medium">
              {safeGetTranslation('vacancies.noVacancies')}
            </p>
          </div>
        </div>
      </div>
              </AdminLayout>

    );
  }

  return (

    <AdminLayout title="Добавление эксперта">

    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Заголовок в стиле как у events */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl p-6 mb-8">
        <div className="md:flex md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Briefcase className="mr-3" size={28} />
              {safeGetTranslation('vacancies.pageTitle') || 'Вакансии'}
            </h1>
            <p className="mt-2 opacity-90">
              {safeGetTranslation('vacancies.pageDescription') || 'Список доступных вакансий'}
            </p>
          </div>

          {/* Быстрый поиск */}
          {filters && filters.search !== undefined && (
            <div className="max-w-xs w-full">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search || ''}
                  onChange={(e) => {
                    if (typeof filters.onChange === 'function') {
                      filters.onChange({
                        target: {
                          name: 'search',
                          value: e.target.value
                        }
                      });
                    }
                  }}
                  placeholder={safeGetTranslation('vacancies.searchPlaceholder') || 'Поиск вакансий...'}
                  className="w-full px-4 pl-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Список вакансий */}
      <div className="h-full flex flex-col bg-white rounded-xl shadow-md p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Briefcase size={24} className="text-teal-600 mr-3" />
          {safeGetTranslation('vacancies.availablePositions')}
          <span className="ml-3 bg-teal-100 text-teal-700 text-sm px-2.5 py-0.5 rounded-full font-medium">
            {total}
          </span>
        </h2>

        <div className="space-y-6 flex-grow overflow-y-auto">
          {vacancies.map(vacancy => (
            <Link href={`/${currentLang}/vacancies/${vacancy.id}`} key={vacancy.id} legacyBehavior>
              <a className="block bg-white rounded-xl border border-gray-200 hover:border-teal-300 shadow-sm hover:shadow-md p-6 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-gray-800 hover:text-teal-600 transition-colors mb-3">
                  {getLocalizedField(vacancy, 'title')}
                </h3>

                <div className="mt-4 flex flex-wrap gap-2 mb-4">
                  {vacancy.employment_type && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getEmploymentTypeColor(vacancy.employment_type)}`}>
                      <Users size={14} className="mr-1.5" />
                      {vacancy.employment_type}
                    </span>
                  )}

                  {vacancy.work_type && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getWorkTypeColor(vacancy.work_type)}`}>
                      <Briefcase size={14} className="mr-1.5" />
                      {vacancy.work_type}
                    </span>
                  )}

                  {vacancy.salary && (
                    <span className="inline-flex items-center bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-medium">
                      <DollarSign size={14} className="mr-1.5" />
                      {vacancy.salary}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div className="text-gray-600 flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                    <span>{getLocalizedField(vacancy, 'location')}</span>
                  </div>

                  {vacancy.deadline && (
                    <div className="text-gray-600 flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                      <span>
                        {safeGetTranslation('vacancies.deadline')}: <span className="font-medium">{formatDate(vacancy.deadline, currentLang)}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock size={14} className="mr-1.5" />
                    {safeGetTranslation('vacancies.posted')}: {formatDate(vacancy.created_at, currentLang)}
                  </div>

                  <div className="text-teal-600 font-medium text-sm">
                    Подробнее →
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {isLoading && page > 1 && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-teal-600 font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              {safeGetTranslation('vacancies.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>

    </AdminLayout>
  );
}
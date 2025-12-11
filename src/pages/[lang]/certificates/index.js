import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CertificatesAPI } from '../../../api/coursesAPI';
import { Award, Search, Filter, X, Calendar, ChevronRight } from 'react-feather';

const CertificatesPage = () => {
  const router = useRouter();

  // Состояния для списка сертификатов и UI
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для фильтрации и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Состояние для авторизации
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка авторизации и загрузка данных
useEffect(() => {
  // Проверяем авторизацию при загрузке страницы
  const token = localStorage.getItem('token');
  setIsAuthenticated(!!token);

// Замените функцию fetchCertificates в вашем компоненте на эту версию:

const fetchCertificates = async () => {
  setLoading(true);
  try {
    // Получаем список всех публичных сертификатов
    const response = await CertificatesAPI.getCertificates();
    setCertificates(response.data);
    setFilteredCertificates(response.data);
    setError(null);
  } catch (err) {
    console.error('Ошибка при загрузке сертификатов:', err);

    // ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ: Прямая обработка 401 ошибки в компоненте
    if (err.response && err.response.status === 401) {
      console.log('Ошибка авторизации, перенаправление на страницу входа...');

      // Очищаем токен в localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('phoneNumber');

      // Получаем текущий язык
      const language = localStorage.getItem('language') || 'kz';

      // Путь для редиректа
      const returnUrl = encodeURIComponent(window.location.pathname);
      const loginPath = `/${language}/login?returnUrl=${returnUrl}`;

      // Предотвращаем рендеринг с ошибкой
      setCertificates([]);
      setFilteredCertificates([]);

      // Перенаправляем на страницу логина
      window.location.href = loginPath;

      // Возвращаемся раньше, чтобы не показывать ошибку
      return;
    } else {
      // Обрабатываем другие ошибки как обычно
      setError('Не удалось загрузить сертификаты. Пожалуйста, попробуйте позже.');
      setCertificates([]);
      setFilteredCertificates([]);
    }
  } finally {
    setLoading(false);
  }
};

  fetchCertificates();
}, []);

  // Эффект для фильтрации и поиска
  useEffect(() => {
    if (!certificates) return;

    const filtered = certificates.filter(certificate => {
      // Фильтрация по статусу
      if (statusFilter && certificate.status !== statusFilter) {
        return false;
      }

      // Поиск по названию и описанию
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (certificate.title && certificate.title.toLowerCase().includes(query)) ||
          (certificate.description && certificate.description.toLowerCase().includes(query))
        );
      }

      return true;
    });

    setFilteredCertificates(filtered);
  }, [certificates, searchQuery, statusFilter]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик отправки запроса на сертификацию
  const handleRequestCertification = () => {
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу логина
      router.push(`/${router.query.lang}/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Открываем модальное окно или перенаправляем на форму запроса сертификации
    router.push(`/${router.query.lang}/certificates/request`);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Количество активных фильтров
  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (statusFilter ? 1 : 0);

  // Сброс фильтров
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl p-6 mb-8">
        <div className="md:flex md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Award className="mr-3" size={28} />
              Сертификаты
            </h1>
            <p className="mt-2 opacity-90">
              Официальные подтверждения ваших навыков и квалификации
            </p>
          </div>

          <button
            onClick={handleRequestCertification}
            className="px-5 py-2.5 bg-white text-teal-600 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            Запросить сертификацию
          </button>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="md:hidden mb-4 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Filter size={16} className="mr-2 text-teal-600" />
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </h3>
          <button
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className="text-gray-500 hover:text-teal-600 transition-colors"
          >
            {isFilterVisible ? <X size={18} /> : <Filter size={18} />}
          </button>
        </div>

        <div className={`${isFilterVisible ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">
                Поиск по сертификатам
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="Введите название или ключевое слово..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">
                Статус
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="revoked">Отозванные</option>
              </select>
            </div>
          </div>

          {/* Активные фильтры и кнопка сброса */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="inline-flex items-center bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs">
                    <Search size={12} className="mr-1" />
                    {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 text-teal-500 hover:text-teal-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {statusFilter && (
                  <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    <span className="mr-1">Статус:</span>
                    {statusFilter === 'active' ? 'Активные' : 'Отозванные'}
                    <button
                      onClick={() => setStatusFilter('')}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Сбросить все
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Список сертификатов */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-600 font-medium ml-3">Загрузка сертификатов...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Ошибка:</p>
          <p>{error}</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Сертификаты не найдены</h3>
          <p className="text-gray-600 max-w-md mx-auto">Сертификаты не найдены. Попробуйте изменить параметры поиска или запросите новый сертификат.</p>
          <button
            onClick={handleRequestCertification}
            className="mt-6 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            Запросить сертификацию
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Link
              key={certificate.id}
              href={`/${router.query.lang}/certificates/${certificate.id}`}
              className="block"
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                {/* Изображение сертификата */}
                <div className="relative">
                  {certificate.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={`${API_BASE_URL || 'http://localhost:8000'}/api/certificates/${certificate.id}/image`}
                        alt={certificate.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-teal-500/10 to-blue-600/10 flex items-center justify-center">
                      <Award size={48} className="text-teal-500" />
                    </div>
                  )}

                  {/* Статус сертификата (маркер) */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                    certificate.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {certificate.status === 'active' ? 'Активен' : 'Отозван'}
                  </div>
                </div>

                {/* Информация о сертификате */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition-colors">{certificate.title}</h2>

                  {certificate.description && (
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">{certificate.description}</p>
                  )}

                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500 flex items-center">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      {formatDate(certificate.issue_date)}
                    </span>

                    <span className="text-teal-600 font-medium flex items-center">
                      Подробнее
                      <ChevronRight size={16} className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
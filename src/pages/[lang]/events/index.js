import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EventsList from '../../../components/events/EventsList';
import { translations } from '../../../locales/translations';
import Layout from '../../../components/Layout';
import { Calendar, Search, MapPin, Filter, X } from 'react-feather';
import AdminLayout from '../../../components/layouts/AdminLayout';

export default function EventsPage() {
  const router = useRouter();
  const { lang = 'ru' } = router.query;

  // Состояние для фильтров
  const [filters, setFilters] = useState({
    format: '',
    search: '',
    from_date: '',
    to_date: ''
  });

  // Состояние для мобильных фильтров
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Функция получения перевода
  const getTranslation = (key) => {
    // Проверяем, существует ли указанный язык
    if (!translations[lang]) {
      return key; // Возвращаем ключ, если язык не найден
    }

    // Разбиваем ключ на части (например, 'events.pageTitle' -> ['events', 'pageTitle'])
    const parts = key.split('.');

    // Начинаем с корня переводов для указанного языка
    let result = translations[lang];

    // Проходим по частям ключа
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        return key; // Возвращаем ключ, если перевод не найден
      }
    }

    return result;
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Функция для сброса фильтров
  const resetFilters = () => {
    setFilters({
      format: '',
      search: '',
      from_date: '',
      to_date: ''
    });
  };

  // Проверка, есть ли активные фильтры
  const hasActiveFilters = () => {
    return filters.format || filters.search || filters.from_date || filters.to_date;
  };

  return (
      <AdminLayout title="Мероприятия">


      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок */}


        {/* Мобильная кнопка фильтров */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Filter size={16} className="mr-2 text-teal-600" />
            {getTranslation('events.filters') || 'Фильтры'}
            {hasActiveFilters() && (
              <span className="ml-2 bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </h3>
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="text-gray-500 hover:text-teal-600 transition-colors"
          >
            {isFilterExpanded ? <X size={18} /> : <Filter size={18} />}
          </button>
        </div>

        {/* Фильтры */}
        <div className={`bg-white p-6 rounded-xl shadow-sm mb-8 ${isFilterExpanded ? 'block' : 'hidden md:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Формат */}
            <div>
              <label htmlFor="format" className="block text-xs font-medium text-gray-500 mb-1">
                {getTranslation('events.format') || 'Формат'}
              </label>
              <select
                id="format"
                name="format"
                value={filters.format}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
              >
                <option value="">
                  {getTranslation('events.allFormats') || 'Все форматы'}
                </option>
                <option value="Online">
                  {getTranslation('events.online') || 'Онлайн'}
                </option>
                <option value="Offline">
                  {getTranslation('events.offline') || 'Офлайн'}
                </option>
              </select>
            </div>

            {/* Дата с */}
            <div>
              <label htmlFor="from_date" className="block text-xs font-medium text-gray-500 mb-1">
                {getTranslation('events.fromDate') || 'Дата с'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="from_date"
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                />
              </div>
            </div>

            {/* Дата по */}
            <div>
              <label htmlFor="to_date" className="block text-xs font-medium text-gray-500 mb-1">
                {getTranslation('events.toDate') || 'Дата по'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="to_date"
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                />
              </div>
            </div>

            {/* Кнопка сброса фильтров */}
            <div className="flex items-end">
              {hasActiveFilters() ? (
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <X size={16} className="mr-2" />
                  {getTranslation('events.resetFilters') || 'Сбросить фильтры'}
                </button>
              ) : (
                <div className="w-full text-xs text-gray-500 px-3">
                  {getTranslation('events.filtersHelp') || 'Используйте фильтры для поиска интересующих мероприятий'}
                </div>
              )}
            </div>
          </div>

          {/* Активные фильтры */}
          {hasActiveFilters() && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <div className="inline-flex items-center bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs">
                    <Search size={12} className="mr-1" />
                    {filters.search}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                      className="ml-2 text-teal-500 hover:text-teal-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {filters.format && (
                  <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    <span className="mr-1">Формат:</span>
                    {filters.format === 'Online' ? 'Онлайн' : 'Офлайн'}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, format: '' }))}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {filters.from_date && (
                  <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs">
                    <Calendar size={12} className="mr-1" />
                    С: {filters.from_date}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, from_date: '' }))}
                      className="ml-2 text-indigo-500 hover:text-indigo-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {filters.to_date && (
                  <div className="inline-flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                    <Calendar size={12} className="mr-1" />
                    По: {filters.to_date}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, to_date: '' }))}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Список мероприятий */}
        <EventsList
          filters={filters}
          getTranslation={getTranslation}
          currentLang={lang}
        />
      </div>
    </AdminLayout>
  );
}
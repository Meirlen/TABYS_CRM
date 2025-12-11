import { useState, useEffect } from 'react';
import { MapPin, Users, Filter, X } from 'react-feather';

const ExpertFilter = ({ onFilterChange, getTranslation, currentLang, searchValue }) => {
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [cities, setCities] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Получение списка специализаций и городов для фильтров
  useEffect(() => {
    // Пример статичных данных (замените на запрос API)
    setSpecializations([
      'Юрист',
      'Бухгалтер',
      'Консультант',
      'IT-специалист',
      'Финансовый аналитик'
    ]);

    setCities([
      'Алматы',
      'Астана',
      'Шымкент',
      'Караганда',
      'Атырау'
    ]);
  }, []);

  // Обновление фильтра при изменении поля поиска в шапке
  useEffect(() => {
    if (searchValue !== undefined) {
      onFilterChange({
        specialization,
        city,
        search: searchValue
      });
    }
  }, [searchValue]);

  // Обработчик отправки формы фильтрации
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      specialization,
      city,
      search: searchValue || ''
    });

    // На мобильных устройствах закрываем фильтр после применения
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };

  // Очистка всех фильтров
  const handleClear = () => {
    setSpecialization('');
    setCity('');
    onFilterChange({
      specialization: '',
      city: '',
      // Сохраняем поисковый запрос, если он есть
      search: searchValue || ''
    });
  };

  // Проверка, есть ли активные фильтры
  const hasActiveFilters = () => {
    return specialization || city;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Мобильная кнопка для отображения/скрытия фильтров */}
      <div className="px-4 py-3 md:hidden flex justify-between items-center border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-700 flex items-center">
          <Filter size={16} className="mr-2 text-teal-600" />
          {getTranslation('experts.filter.title', 'Фильтры')}
          {hasActiveFilters() && (
            <span className="ml-2 bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {(specialization ? 1 : 0) + (city ? 1 : 0)}
            </span>
          )}
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-teal-600 transition-colors"
        >
          {isExpanded ? <X size={18} /> : <Filter size={18} />}
        </button>
      </div>

      {/* Содержимое фильтра (скрывается на мобильных, если !isExpanded) */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block p-4`}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Выбор специализации */}
          <div className="md:flex-1">
            <label htmlFor="specialization" className="block text-xs font-medium text-gray-500 mb-1">
              {getTranslation('experts.filter.specialization', 'Специализация')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={16} className="text-gray-400" />
              </div>
              <select
                id="specialization"
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm appearance-none"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="">{getTranslation('experts.filter.allSpecializations', 'Все специализации')}</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Выбор города */}
          <div className="md:flex-1">
            <label htmlFor="city" className="block text-xs font-medium text-gray-500 mb-1">
              {getTranslation('experts.filter.city', 'Город')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <select
                id="city"
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm appearance-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">{getTranslation('experts.filter.allCities', 'Все города')}</option>
                {cities.map((cityName, index) => (
                  <option key={index} value={cityName}>{cityName}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {hasActiveFilters() && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={14} className="md:hidden mr-1 inline" />
                {getTranslation('experts.filter.clear', 'Очистить')}
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              {getTranslation('experts.filter.apply', 'Применить')}
            </button>
          </div>
        </form>

        {/* Показываем текущие активные фильтры, если они есть (только на мобильных) */}
        {hasActiveFilters() && (
          <div className="mt-4 md:hidden border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-2">
              {specialization && (
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                  <Users size={12} className="mr-1" />
                  {specialization}
                  <button
                    onClick={() => {
                      setSpecialization('');
                      onFilterChange({ ...{ search: searchValue || '', city }, specialization: '' });
                    }}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {city && (
                <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">
                  <MapPin size={12} className="mr-1" />
                  {city}
                  <button
                    onClick={() => {
                      setCity('');
                      onFilterChange({ ...{ search: searchValue || '', specialization }, city: '' });
                    }}
                    className="ml-1 text-indigo-500 hover:text-indigo-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertFilter;
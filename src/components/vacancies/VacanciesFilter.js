import { useState, useEffect } from 'react';

const VacanciesFilter = ({ onFilterChange, getTranslation }) => {
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [cities, setCities] = useState([]);

  const [filters, setFilters] = useState({
    employment_type: '',
    work_type: '',
    city: '',
    search: '',
  });

  // В реальном проекте эти данные можно подгружать с сервера
  useEffect(() => {
    // Пример данных для справочников
    setEmploymentTypes(['Полная занятость', 'Частичная занятость', 'Удаленная работа', 'Стажировка']);
    setWorkTypes(['Офис', 'Гибридный формат', 'Удаленно']);
    setCities(['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург']);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      employment_type: '',
      work_type: '',
      city: '',
      search: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{getTranslation('vacancies.filterTitle')}</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslation('vacancies.employmentType')}
            </label>
            <select
              id="employment_type"
              name="employment_type"
              value={filters.employment_type}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{getTranslation('vacancies.allTypes')}</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="work_type" className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslation('vacancies.workType')}
            </label>
            <select
              id="work_type"
              name="work_type"
              value={filters.work_type}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{getTranslation('vacancies.allTypes')}</option>
              {workTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslation('vacancies.location')}
            </label>
            <select
              id="city"
              name="city"
              value={filters.city}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{getTranslation('vacancies.allLocations')}</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslation('vacancies.search')}
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder={getTranslation('vacancies.searchPlaceholder')}
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getTranslation('vacancies.reset')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getTranslation('vacancies.apply')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VacanciesFilter;
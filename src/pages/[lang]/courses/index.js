import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CourseCard from '../../../components/CourseCard';
import { CoursesAPI } from '../../../api/coursesAPI';
import {
  Search,
  Filter,
  X,
  RefreshCw,
  BookOpen,
  Award,
  Bookmark,
  TrendingUp,
  Grid,
  ChevronRight,
  DollarSign,
  Layers,
  Globe
} from 'react-feather';

const CoursesPage = () => {
  const router = useRouter();

  // Состояния для разных типов курсов
  const [allCourses, setAllCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]); // Состояние для курсов пользователя

  // Состояния для UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Состояния для авторизации и прогресса
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enrollments, setEnrollments] = useState({});

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Первичная загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Параллельно загружаем все необходимые данные
        const dataToFetch = [
          CoursesAPI.getCourses(),
          CoursesAPI.getRecommendedCourses(),
          CoursesAPI.getPopularCourses(),
          CoursesAPI.getFreeCourses(),
          CoursesAPI.getCategories()
        ];

        // Если пользователь авторизован, добавляем запрос на получение его курсов
        if (isAuthenticated) {
          dataToFetch.push(CoursesAPI.getUserCourses());
        }

        const responses = await Promise.all(dataToFetch);

        setAllCourses(responses[0].data);

        // Устанавливаем рекомендуемые курсы, гарантируя, что они не будут пустыми
        const recommendedData = responses[1].data;
        setRecommendedCourses(recommendedData.length > 0 ? recommendedData : responses[0].data.slice(0, 4));

        // Устанавливаем популярные курсы, гарантируя, что они не будут пустыми
        const popularData = responses[2].data;
        setPopularCourses(popularData.length > 0 ? popularData : responses[0].data.slice(0, 4));

        setFreeCourses(responses[3].data);
        setCategories(responses[4].data);

        // Загружаем курсы пользователя, если он авторизован
        if (isAuthenticated && responses[5]?.data) {
          // Преобразуем enrollments в формат курсов
          const userCourses = [];

          responses[5].data.forEach(enrollment => {
            // Проверяем наличие объекта курса внутри enrollment
            if (enrollment.course && enrollment.course.id) {
              userCourses.push({
                id: enrollment.course.id,
                title: enrollment.course.title,
                description: enrollment.course.description,
                price: enrollment.course.price,
                currency: enrollment.course.currency,
                duration: enrollment.course.duration,
                level: enrollment.course.level,
                is_free: enrollment.course.is_free,
                cover_image: enrollment.course.cover_image,
                video_preview: enrollment.course.video_preview,
                language: enrollment.course.language,
                skills: enrollment.course.skills,
                // Добавляем данные о прогрессе
                enrollment_progress: enrollment.progress || 0,
                enrollment_date: enrollment.enrollment_date,
                enrollment_id: enrollment.id
              });
            }
          });

          setMyCourses(userCourses);
        }

        // Загрузка данных о прогрессе
        if (isAuthenticated) {
          const enrollmentData = {};

          const enrollmentPromises = [];

          // Получаем прогресс для всех курсов
          responses[0].data.forEach(course => {
            enrollmentPromises.push(
              CoursesAPI.getCourseProgress(course.id)
                .then(response => {
                  enrollmentData[course.id] = response.data;
                })
                .catch(err => {
                  if (err.response?.status !== 404) {
                    console.error(`Ошибка при загрузке прогресса для курса ${course.id}:`, err);
                  }
                })
            );
          });

          await Promise.allSettled(enrollmentPromises);
          setEnrollments(enrollmentData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных курсов:', err);
        setError(err.message || 'Не удалось загрузить курсы');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]); // Зависимость от isAuthenticated для повторной загрузки при изменении статуса авторизации

  // Обработка поиска курсов
  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedLanguage) params.language = selectedLanguage;
      if (showOnlyFree) params.is_free = true;
      if (minPrice) params.price_min = parseFloat(minPrice);
      if (maxPrice) params.price_max = parseFloat(maxPrice);

      const response = await CoursesAPI.searchCourses(params);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Ошибка при поиске курсов:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Сброс всех фильтров
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedLanguage('');
    setMinPrice('');
    setMaxPrice('');
    setShowOnlyFree(false);

    // Если есть активные результаты поиска, выполняем новый поиск без фильтров
    if (searchResults.length > 0) {
      handleSearch();
    }
  };

  // Проверка наличия активных фильтров
  const hasActiveFilters = () => {
    return searchQuery || selectedCategory || selectedLevel || selectedLanguage || minPrice || maxPrice || showOnlyFree;
  };

  // Форматирование цены курса
  const formatPrice = (course) => {
    if (course.is_free) return 'Бесплатно';
    return `${course.price} ${course.currency}`;
  };

  // Рендер секции с курсами
  const renderCourseSection = (title, courses, viewAllLink = null, icon = null) => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {icon}
          <h2 className="text-2xl font-bold text-gray-800 ml-2">{title}</h2>
        </div>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Смотреть все
            <ChevronRight size={16} className="ml-1" />
          </Link>
        )}
      </div>
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              formatPrice={formatPrice}
              enrollment={
                course.enrollment_progress !== undefined
                  ? { progress: course.enrollment_progress }
                  : enrollments[course.id]
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Курсы в этой категории отсутствуют</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-12 bg-white rounded-xl shadow-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Загрузка курсов</h3>
            <p className="text-gray-600">Пожалуйста, подождите, пока мы подготовим для вас лучшие образовательные материалы</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-12 bg-white rounded-xl shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <X size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActiveSearch = hasActiveFilters();

  // Получаем уникальные языки и уровни для фильтров
  const languages = [...new Set(allCourses.map(course => course.language))].filter(Boolean);
  const levels = [...new Set(allCourses.map(course => course.level))].filter(Boolean);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Новый header в стиле Events и Vacancies */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl p-6 mb-8">
          <div className="md:flex md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <BookOpen className="mr-3" size={28} />
                Образовательные курсы
              </h1>
              <p className="mt-2 opacity-90">
                Повышайте свою квалификацию и осваивайте новые навыки с нашими адаптированными курсами
              </p>
            </div>

            {/* Быстрый поиск */}
            <div className="max-w-xs w-full">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск курсов..."
                  className="w-full px-4 pl-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Горизонтальный фильтр для десктопа */}
        <div className="hidden md:block mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Категория */}
              <div>
                <label htmlFor="category" className="block text-xs font-medium text-gray-500 mb-1">
                  <div className="flex items-center">
                    <Layers size={14} className="mr-1 text-teal-600" />
                    Категория
                  </div>
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                >
                  <option value="">Все категории</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Уровень */}
              <div>
                <label htmlFor="level" className="block text-xs font-medium text-gray-500 mb-1">
                  <div className="flex items-center">
                    <Award size={14} className="mr-1 text-teal-600" />
                    Уровень
                  </div>
                </label>
                <select
                  id="level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                >
                  <option value="">Любой уровень</option>
                  {levels.map((level, index) => (
                    <option key={index} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Язык */}
              <div>
                <label htmlFor="language" className="block text-xs font-medium text-gray-500 mb-1">
                  <div className="flex items-center">
                    <Globe size={14} className="mr-1 text-teal-600" />
                    Язык
                  </div>
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                >
                  <option value="">Любой язык</option>
                  {languages.map((language, index) => (
                    <option key={index} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              {/* Цена */}
              <div>
                <label htmlFor="priceFilter" className="block text-xs font-medium text-gray-500 mb-1">
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-1 text-teal-600" />
                    Цена
                  </div>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <input
                      id="showOnlyFree"
                      type="checkbox"
                      checked={showOnlyFree}
                      onChange={(e) => setShowOnlyFree(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showOnlyFree" className="ml-2 block text-sm text-gray-700">
                      Только бесплатные
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                    className="ml-auto text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center"
                  >
                    {isPriceFilterOpen ? 'Скрыть' : 'Диапазон'}
                    <ChevronRight size={14} className={`ml-1 transition-transform ${isPriceFilterOpen ? 'transform rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Расширенные опции цены */}
            {isPriceFilterOpen && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minPrice" className="block text-xs font-medium text-gray-500 mb-1">
                      Минимальная цена
                    </label>
                    <input
                      type="number"
                      id="minPrice"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPrice" className="block text-xs font-medium text-gray-500 mb-1">
                      Максимальная цена
                    </label>
                    <input
                      type="number"
                      id="maxPrice"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      placeholder="Любая"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Кнопки фильтрации */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              {hasActiveFilters() && (
                <button
                  onClick={resetFilters}
                  className="mr-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors text-sm font-medium flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Сбросить
                </button>
              )}
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none transition-colors text-sm font-medium flex items-center"
              >
                <Search size={16} className="mr-2" />
                Применить фильтры
              </button>
            </div>
          </div>
        </div>

        {/* Мобильный фильтр (кнопка) */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Фильтры</h2>
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter size={18} className="mr-2 text-teal-600" />
            Фильтры {hasActiveFilters() && <span className="ml-1 bg-teal-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">!</span>}
          </button>
        </div>

        {/* Мобильный фильтр (развернутый) */}
        {isFilterExpanded && (
          <div className="md:hidden mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Фильтры курсов</h3>
                <button
                  onClick={() => setIsFilterExpanded(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="category-mobile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Layers size={16} className="mr-2 text-teal-600" />
                    Категория
                  </label>
                  <select
                    id="category-mobile"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Все категории</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level-mobile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Award size={16} className="mr-2 text-teal-600" />
                    Уровень
                  </label>
                  <select
                    id="level-mobile"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Любой уровень</option>
                    {levels.map((level, index) => (
                      <option key={index} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="language-mobile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Globe size={16} className="mr-2 text-teal-600" />
                    Язык
                  </label>
                  <select
                    id="language-mobile"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Любой язык</option>
                    {languages.map((language, index) => (
                      <option key={index} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign size={16} className="mr-2 text-teal-600" />
                    Цена
                  </label>

                  <div className="flex items-center mb-3">
                    <input
                      id="showOnlyFree-mobile"
                      type="checkbox"
                      checked={showOnlyFree}
                      onChange={(e) => setShowOnlyFree(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showOnlyFree-mobile" className="ml-2 block text-sm text-gray-700">
                      Только бесплатные
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label htmlFor="minPrice-mobile" className="block text-xs font-medium text-gray-500 mb-1">
                        От
                      </label>
                      <input
                        type="number"
                        id="minPrice-mobile"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="maxPrice-mobile" className="block text-xs font-medium text-gray-500 mb-1">
                        До
                      </label>
                      <input
                        type="number"
                        id="maxPrice-mobile"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="∞"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {hasActiveFilters() ? (
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <X size={16} className="mr-2" />
                    Сбросить
                  </button>
                ) : (
                  <button
                    onClick={() => setIsFilterExpanded(false)}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors text-sm font-medium"
                  >
                    Отмена
                  </button>
                )}
                <button
                  onClick={() => {
                    handleSearch();
                    setIsFilterExpanded(false);
                  }}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Search size={16} className="mr-2" />
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col mb-8">
          {/* Результаты поиска или секции курсов */}
          {isActiveSearch ? (
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Search size={24} className="text-teal-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Результаты поиска
                </h2>
              </div>

              {isSearching ? (
<div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500 mb-4"></div>
                  <p className="text-gray-600 font-medium">Идет поиск подходящих курсов...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      formatPrice={formatPrice}
                      enrollment={enrollments[course.id]}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Курсы не найдены</h3>
                  <p className="text-gray-600 mb-6">К сожалению, не удалось найти курсы по вашему запросу.</p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Отображаем блок "Ваши курсы" только если пользователь авторизован и у него есть курсы */}
              {isAuthenticated && myCourses.length > 0 && (
                renderCourseSection('Ваши курсы', myCourses, `/ru/my/courses`, <Bookmark size={24} className="text-indigo-600" />)
              )}
              {renderCourseSection('Рекомендуемые курсы', recommendedCourses, `/ru/courses/recommended`, <Award size={24} className="text-teal-600" />)}
              {renderCourseSection('Популярные курсы', popularCourses, `/ru/courses/popular`, <TrendingUp size={24} className="text-blue-600" />)}
              {renderCourseSection('Все курсы', allCourses, null, <Grid size={24} className="text-purple-600" />)}
            </>
          )}
        </div>
      </div>

      {/* Секция с призывом к действию */}
      <div className="mt-12 bg-gradient-to-r from-teal-500 to-blue-600 py-16 px-4 rounded-2xl text-white text-center max-w-6xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">Не нашли подходящий курс?</h2>
        <p className="text-lg opacity-90 max-w-3xl mx-auto mb-8">
          Наши эксперты готовы помочь вам подобрать образовательную программу
          или создать индивидуальный план обучения, соответствующий вашим потребностям.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/ru/experts/all" legacyBehavior>
            <a className="px-6 py-3 bg-white text-teal-600 font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300">
              Найти эксперта
            </a>
          </Link>
          <Link href="/ru/contact" legacyBehavior>
            <a className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-teal-600 transition duration-300">
              Связаться с нами
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
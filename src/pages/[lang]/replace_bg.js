import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный

// Типы данных
const Hero = {
  id: Number,
  age: Number,
  gender: String,
  category_name: String,
  photo_url: String,
  photo_type: String
};

const Category = {
  label: String,
  route: String,
  examples: Array,
  content_body: String
};

export default function BackgroundSelectionPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id, category_name, photo_type: urlPhotoType } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  useEffect(() => {
    // Обновляем язык при клиентской навигации (если меняются query-параметры)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Используем существующие переводы
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  // Функция для получения переводов по вложенным ключам (аналог useSimpleTranslation)
  const getTranslation = (key) => {
    try {
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (!result || result[k] === undefined) {
          console.warn(`Translation missing: ${key}`);
          return key;
        }
        result = result[k];
      }

      return typeof result === 'string' ? result : key;
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return key;
    }
  };

  // Локальный список категорий
  const categories = [
    { label: "Үйлену той", route: "wedding", examples: ["https://toitrend.kz/wedding?site_id=60&theme=0"] },
    { label: "Қыз ұзату", route: "bachelorette", examples: [] },
    { label: "Сүндет той", route: "sundet", examples: [], content_body: "Сіз(дер)ді ұлымыз {name} сүндет тойына арналған салтанатты ақ дастарханымыздың қадірлі қонағы болуға шақырамыз." },
    { label: "Тұсаукесер", route: "reception", examples: ["https://toitrend.kz/reception?site_id=60&theme=0"] },
    { label: "Мерей той", route: "merey", examples: [] },
    { label: "Бесік той", route: "besik", examples: [] },
    { label: "Мерей той + Сүндет той", route: "merey-sundet", examples: ["https://toitrend.kz/merey-sundet?site_id=60&theme=0"] },
    { label: "Беташар", route: "betashar", examples: [] },
  ];

  // Получаем название категории для отображения в интерфейсе
  const getCategoryLabel = (route) => {
    if (!route) return "";
    const category = categories.find(cat => cat.route === route);
    return category ? category.label : route;
  };

  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [balance, setBalance] = useState(null);
  const [hasToken, setHasToken] = useState(false);

  // Модальное окно для недостаточного баланса
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Filter states
  const [ageFilter, setAgeFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(category_name);

  // Интервал для проверки статуса
  const intervalRef = useRef(null);

  // Получение баланса пользователя
  const fetchBalance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBalance(null);
        setHasToken(false);
        return;
      }

      setHasToken(true);
      const response = await fetch('https://tyrasoft.kz/api/v1/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      } else {
        console.error('Не удалось получить баланс');
        setBalance(null);
      }
    } catch (error) {
      console.error('Ошибка при получении баланса:', error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка баланса при монтировании компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchBalance();
    }
  }, []);

  // Получение списка героев с фильтрами
  useEffect(() => {
    const fetchHeroes = async () => {
      setLoading(true);
      try {
        let url = `https://tyrasoft.kz/api/v2/story_kid/toitrend/heroes/?limit=100`;

        // Добавляем photo_type если указан в URL
        if (urlPhotoType) {
          url += `&photo_type=${urlPhotoType}`;
        }

        if (ageFilter !== null) {
          url += `&age=${ageFilter}`;
        }

        if (genderFilter !== null) {
          url += `&gender=${genderFilter}`;
        }

        // Используем category_name из URL параметров если он есть
        if (category_name) {
          url += `&category_name=${category_name}`;
        }
        // Иначе используем из состояния фильтра
        else if (categoryFilter !== null) {
          url += `&category_name=${categoryFilter}`;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
          },
        });

        setHeroes(response.data);
      } catch (err) {
        console.error('Error fetching heroes:', err);
        setError('Фондарды жүктеу кезінде қате пайда болды.');
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchHeroes();
    }
  }, [ageFilter, genderFilter, categoryFilter, urlPhotoType, category_name]);

  // Очистка интервала при размонтировании компонента
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Функция для пополнения баланса через WhatsApp
  const handleTopUpBalance = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${currentLang}/login`);
      return;
    }

    // Получаем номер телефона пользователя из localStorage или другого источника
    const userPhone = localStorage.getItem('userPhone') || '';

    // Создаем сообщение для WhatsApp
    const message = encodeURIComponent(`Хочу пополнить баланс. Мой номер: ${userPhone}`);

    // Открываем WhatsApp с предзаполненным сообщением
    window.open(`https://wa.me/77711745741?text=${message}`, '_blank');

    // Закрываем модальное окно
    setShowBalanceModal(false);
  };

  // Выбор героя с проверкой photo_type из URL и баланса
  const handleSelectHero = async (hero) => {
    console.log('Selected hero:', hero);

    // Применяем метод set-hero если photo_type=template в URL (для шаблонов)
    if (urlPhotoType === 'template') {
      try {
        setLoading(true);

        const token = localStorage.getItem('token');

        // Отправляем запрос на установку героя для сайта
        const response = await axios.post(
          'https://tyrasoft.kz/api/v2/story_kid/toitrend/set-hero/',
          {
            site_id: site_id,
            hero_id: hero.id
          },
          {
            headers: {
              'Authorization': `Bearer ${token || ''}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Set hero response:', response.data);

        // Если успешно, перенаправляем на страницу аудио
        if (response.data && response.data.success) {
          router.push(`/${currentLang}/GallerySite?site_id=${site_id}&category_name=${category_name}&type=photo`);
        } else {
          setError('Героя іске қосу кезінде қате пайда болды.');
        }
      } catch (err) {
        console.error('Error setting hero:', err);
        setError('Героя іске қосу кезінде қате пайда болды.');
      } finally {
        setLoading(false);
      }
    } else {
      // Для обычных фото - проверяем баланс
      // Обновляем баланс перед проверкой
      await fetchBalance();

      if (balance !== null && balance < 300) {
        // Если баланс меньше 300 тенге, показываем модальное окно
        setShowBalanceModal(true);
      } else {
        // Баланс достаточный, переходим на FaceSwapApp с hero_id
        if (category_name === 'wedding') {
          router.push(`/${currentLang}/FaceSwapApp2?site_id=${site_id}&hero_id=${hero.id}&category_name=${category_name}&step=1`);
        } else {
          router.push(`/${currentLang}/FaceSwapApp?site_id=${site_id}&hero_id=${hero.id}&category_name=${category_name}`);
        }
      }
    }
  };

  // Сброс фильтров
  const resetFilters = () => {
    setAgeFilter(null);
    setGenderFilter(null);
    setCategoryFilter(category_name); // Сбрасываем до значения из URL
  };

  // Переключение видимости фильтров
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Обработчик изменения категории
  const handleCategoryChange = (newCategory) => {
    setCategoryFilter(newCategory);

    if (newCategory !== category_name) {
      const currentQuery = { ...router.query };

      if (newCategory) {
        currentQuery.category_name = newCategory;
      } else {
        delete currentQuery.category_name;
      }

      router.push({
        pathname: router.pathname,
        query: currentQuery
      }, undefined, { shallow: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{getTranslation('backgroundSelection.title') || 'Фон таңдау'}</title>
        <meta name="description" content={getTranslation('backgroundSelection.subtitle') || 'Сайтыңыз үшін фон таңдаңыз'} />
      </Head>

      {/* HeaderBack вместо кнопки назад */}
      <HeaderBack title={getTranslation('backgroundSelection.title')} />

      <div className="p-4">
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {getTranslation('backgroundSelection.selectBackground') || 'Сайтка фон таңдау'}
            {category_name && ` (${getCategoryLabel(category_name)})`}
          </h1>

          {/* Filter toggle button */}
          <div className="mb-4">
            <button
              onClick={toggleFilters}
              className="w-full py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? (getTranslation('backgroundSelection.hideFilters') || 'Сүзгілерді жасыру') : (getTranslation('backgroundSelection.showFilters') || 'Сүзгілерді көрсету')}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Age filter */}
                <div>
                  <label htmlFor="ageFilter" className="block text-sm text-gray-600 mb-1">{getTranslation('backgroundSelection.filters.age') || 'Жас'}</label>
                  <select
                    id="ageFilter"
                    value={ageFilter || ''}
                    onChange={(e) => setAgeFilter(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">{getTranslation('backgroundSelection.filters.allAges') || 'Барлық жастар'}</option>
                    <option value="3">3 {getTranslation('backgroundSelection.filters.years') || 'жас'}</option>
                    <option value="4">4 {getTranslation('backgroundSelection.filters.years') || 'жас'}</option>
                    <option value="5">5 {getTranslation('backgroundSelection.filters.years') || 'жас'}</option>
                    <option value="6">6 {getTranslation('backgroundSelection.filters.years') || 'жас'}</option>
                    <option value="7">7 {getTranslation('backgroundSelection.filters.years') || 'жас'}</option>
                  </select>
                </div>

                {/* Gender filter */}
                <div>
                  <label htmlFor="genderFilter" className="block text-sm text-gray-600 mb-1">{getTranslation('backgroundSelection.filters.gender') || 'Жыныс'}</label>
                  <select
                    id="genderFilter"
                    value={genderFilter || ''}
                    onChange={(e) => setGenderFilter(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">{getTranslation('backgroundSelection.filters.allGenders') || 'Барлық жыныстар'}</option>
                    <option value="male">{getTranslation('backgroundSelection.filters.male') || 'Ұл'}</option>
                    <option value="female">{getTranslation('backgroundSelection.filters.female') || 'Қыз'}</option>
                    <option value="other">{getTranslation('backgroundSelection.filters.other') || 'Басқа'}</option>
                  </select>
                </div>

                {/* Category filter */}
                <div>
                  <label htmlFor="categoryFilter" className="block text-sm text-gray-600 mb-1">{getTranslation('backgroundSelection.filters.category') || 'Категория'}</label>
                  <select
                    id="categoryFilter"
                    value={categoryFilter || ''}
                    onChange={(e) => handleCategoryChange(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">{getTranslation('backgroundSelection.filters.allCategories') || 'Барлық категориялар'}</option>
                    {categories.map((category) => (
                      <option key={category.route} value={category.route}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset filters button */}
              <button
                onClick={resetFilters}
                className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {getTranslation('backgroundSelection.resetFilters') || 'Сүзгілерді алып тастау'}
              </button>
            </div>
          )}

          {/* Hero grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {heroes.length > 0 ? (
                heroes.map((hero) => (
                  <div
                    key={hero.id}
                    onClick={() => handleSelectHero(hero)}
                    className="relative flex flex-col rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="relative" style={{ aspectRatio: '2/3' }}>
                      <img
                        src={hero.photo_url}
                        alt={`${getTranslation('backgroundSelection.background') || 'Фон'} ${hero.id}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Badge для template */}
                      {hero.photo_type === 'template' && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          {getTranslation('backgroundSelection.template') || 'Шаблон'}
                        </div>
                      )}
                    </div>
                    {/* Текст "Таңдау" внизу блока */}
                    <div
                      className="w-full py-2 text-center text-blue-600 font-medium text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {getTranslation('backgroundSelection.select') || 'Таңдау'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  {getTranslation('backgroundSelection.noBackgroundsFound') || 'Сүзгі шарттарына сәйкес фондар табылмады'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для недостаточного баланса */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-3">{getTranslation('backgroundSelection.modal.title') || 'Бұл мүмкіндікті пайдалану үшін алдымен тарифті төлеу қажет'}</h3>
              <p className="text-gray-700 mt-2">
                {getTranslation('backgroundSelection.modal.message') || 'Құралды пайдалану үшін балансыңызда кемінде 300 теңге болуы керек. Қазіргі балансыңыз:'} {balance !== null ? `${balance.toFixed(0)} ₸` : '0 ₸'}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={handleTopUpBalance}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm1 11a1 1 0 11-2 0 1 1 0 012 0zm0-3a1 1 0 01-2 0V8a1 1 0 012 0v3z" clipRule="evenodd" />
                  </svg>
                  {getTranslation('backgroundSelection.modal.topUpViaWhatsApp') || 'WhatsApp арқылы толтыру'}
                </button>
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                >
                  {getTranslation('backgroundSelection.modal.close') || 'Жабу'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Используем getServerSideProps для получения параметра lang на сервере
export async function getServerSideProps(context) {
  // Получаем параметр lang из URL
  const { lang } = context.params;

  // Проверяем, что язык валидный
  const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';

  // Получаем переводы для этого языка
  const langTranslations = translations[validLang] || translations['kz'];

  // Возвращаем данные в компонент
  return {
    props: {
      lang: validLang,
      translations: langTranslations
    }
  };
}
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const AdminLayout = ({ children, title = 'Админ-панель курсов' }) => {
  const router = useRouter();
  const { lang = 'ru' } = router.query; // Получаем язык из URL или используем 'ru' по умолчанию

  // Состояния для отслеживания статуса авторизации и загрузки
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Определяем, какой раздел должен быть открыт на основе текущего пути
  const getInitialOpenSections = () => {
    // Получаем текущий путь
    const path = router.pathname;

    // Определяем, какой раздел содержит активный пункт
    return {
      courses: path.includes('/admin/courses') ||
               path.includes('/admin/moderation') ||
               path.includes('/admin/statistics') ||
               path.includes('/admin/categories'),
      certificates: path.includes('/admin/certificates'),
      experts: path.includes('/admin/experts') || path.includes('/experts'),
      vacancies: path.includes('/admin/vacancies'),
      events: path.includes('/events')
    };
  };

  // Состояние для отслеживания открытых разделов меню
  const [openSections, setOpenSections] = useState({
    courses: false,
    certificates: false,
    experts: false,
    vacancies: false,
    events: false
  });

  // Обновляем открытые разделы при изменении пути
  useEffect(() => {
    const activeSections = getInitialOpenSections();
    setOpenSections(prev => ({
      ...prev,
      ...activeSections
    }));
  }, [router.pathname]);

  // Переключение разделов меню
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    // Проверяем только на клиенте
    if (typeof window !== 'undefined') {
      // Проверяем наличие токена
      const token = localStorage.getItem('token');

      if (!token) {
        // Если токена нет, перенаправляем на страницу логина
        const returnUrl = encodeURIComponent(router.asPath);
        router.replace(`/${lang}/login?returnUrl=${returnUrl}`);
      } else {
        // Если токен есть, устанавливаем статус авторизации
        setIsAuthorized(true);
      }

      // В любом случае завершаем загрузку
      setIsLoading(false);
    }
  }, [router, lang]);

  // Функция для выхода из системы
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('phoneNumber');
    router.push(`/${lang}/login`);
  };

  // Проверка активной ссылки для стилизации
  const isActive = (path) => {
    return router.pathname === path ? 'bg-blue-700' : '';
  };

  // Если идёт загрузка, показываем индикатор
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
          <p className="mt-3 text-blue-900">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, не рендерим содержимое
  // Вместо этого будет выполнен редирект в useEffect
  if (!isAuthorized) {
    return null;
  }

  // Основной рендеринг для авторизованных пользователей
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Административная панель для управления курсами" />
      </Head>

      {/* Верхняя навигационная панель */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Управление курсами</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Администратор</span>
            <button
              className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded-md text-sm transition-colors"
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Боковое меню с возможностью прокрутки */}
        <aside className="w-64 bg-blue-900 text-white overflow-y-auto">
          <nav className="py-6 sticky top-0">
            <ul className="space-y-1">
              <li>
                <Link href={`/${lang}/admin/dashboard`}
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/dashboard`)}`}>
                  Панель управления
                </Link>
              </li>

              {/* Раздел КУРСЫ */}
              <li>
                <button
                  onClick={() => toggleSection('courses')}
                  className="w-full flex justify-between items-center px-4 py-2 text-blue-300 hover:bg-blue-800 text-sm font-semibold mt-4"
                >
                  <span>КУРСЫ</span>
                  <span className="text-xs">{openSections.courses ? '▼' : '►'}</span>
                </button>
                {openSections.courses && (
                  <ul className="pl-2">
                    <li>
                      <Link href={`/${lang}/admin/courses`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/courses`)}`}>
                        Все курсы
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/admin/courses/create`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/courses/create`)}`}>
                        Создать курс
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/admin/moderation`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/moderation`)}`}>
                        Модерация курсов
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/admin/statistics`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/statistics`)}`}>
                        Статистика по курсам
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/admin/categories`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/categories`)}`}>
                        Категории курсов
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Раздел СЕРТИФИКАТЫ */}
              <li>
                <button
                  onClick={() => toggleSection('certificates')}
                  className="w-full flex justify-between items-center px-4 py-2 text-blue-300 hover:bg-blue-800 text-sm font-semibold mt-2"
                >
                  <span>СЕРТИФИКАТЫ</span>
                  <span className="text-xs">{openSections.certificates ? '▼' : '►'}</span>
                </button>
                {openSections.certificates && (
                  <ul className="pl-2">
                    <li>
                      <Link href={`/${lang}/admin/certificates`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/certificates`)}`}>
                        Все сертификаты
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/admin/certificates/create`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/certificates/create`)}`}>
                        Создать сертификат
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Раздел ЭКСПЕРТЫ */}
              <li>
                <button
                  onClick={() => toggleSection('experts')}
                  className="w-full flex justify-between items-center px-4 py-2 text-blue-300 hover:bg-blue-800 text-sm font-semibold mt-2"
                >
                  <span>ЭКСПЕРТЫ</span>
                  <span className="text-xs">{openSections.experts ? '▼' : '►'}</span>
                </button>
                {openSections.experts && (
                  <ul className="pl-2">
                    <li>
                      <Link href={`/${lang}/admin/experts/create`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/experts/create`)}`}>
                        Создать нового эксперта
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/experts/all`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/experts/all`)}`}>
                        Список экспертов
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Раздел ВАКАНСИИ */}
              <li>
                <button
                  onClick={() => toggleSection('vacancies')}
                  className="w-full flex justify-between items-center px-4 py-2 text-blue-300 hover:bg-blue-800 text-sm font-semibold mt-2"
                >
                  <span>ВАКАНСИИ</span>
                  <span className="text-xs">{openSections.vacancies ? '▼' : '►'}</span>
                </button>
                {openSections.vacancies && (
                  <ul className="pl-2">
                    <li>
                      <Link href={`/${lang}/admin/vacancies`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/admin/vacancies`)}`}>
                        Управление вакансиями
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Раздел МЕРОПРИЯТИЯ */}
              <li>
                <button
                  onClick={() => toggleSection('events')}
                  className="w-full flex justify-between items-center px-4 py-2 text-blue-300 hover:bg-blue-800 text-sm font-semibold mt-2"
                >
                  <span>МЕРОПРИЯТИЯ</span>
                  <span className="text-xs">{openSections.events ? '▼' : '►'}</span>
                </button>
                {openSections.events && (
                  <ul className="pl-2">
                    <li>
                      <Link href={`/${lang}/events`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/events`)}`}>
                        Управление мероприятиями
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${lang}/events/create`}
                        className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive(`/${lang}/events/create`)}`}>
                        Создать новое мероприятие
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>
        </aside>

        {/* Основное содержимое */}
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
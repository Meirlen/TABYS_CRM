import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  Briefcase,
  Award,
  Monitor,
  HelpCircle,
  Globe,
  LogIn,
} from 'react-feather';

// Импортируем переводы из локалей
import { translations } from '../locales/translations';

// Список языков
const languages = [
  { code: 'kz', label: 'Қазақша', flag: '/icons/kz.png' },
  { code: 'ru', label: 'Русский', flag: '/icons/ru.png' },
  { code: 'en', label: 'English', flag: '/icons/usa.png' },
];

const Navigation = () => {
  const router = useRouter();
  // Получаем lang из query
  const { lang } = router.query;
  // Текущий путь: /[lang]/about, /[lang]/home и т.п.
  const pathname = router.pathname;

  // Состояние авторизации
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Инициализируем язык
  const [currentLang, setCurrentLang] = useState(
    typeof lang === 'string' && ['kz', 'ru', 'en'].includes(lang)
      ? lang
      : 'kz'
  );
  // Инициализируем переводы
  const [t, setT] = useState(translations[currentLang] || {});

  // Проверка авторизации при загрузке
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthorized(!!token);
  }, []);

  useEffect(() => {
    if (typeof lang === 'string' && lang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
      setCurrentLang(validLang);
      setT(translations[validLang] || {});
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [lang, currentLang]);

  // Префикс для ссылок вида /kz/home, /ru/home и т.п.
  const langPrefix = `/${currentLang}`;

  // Навигационные пункты с обновленными иконками
  const navItems = [
    {
      path: `${langPrefix}/home`,
      label: t.navigation?.home || 'Главная',
      icon: <Home size={18} className="mr-2" />,
      requiresAuth: false,
    },
    {
      path: `${langPrefix}/experts/all`,
      label: t.navigation?.experts || 'Эксперты',
      icon: <Users size={18} className="mr-2" />,
      requiresAuth: false,
    },
    {
      path: `${langPrefix}/vacancies`,
      label: t.navigation?.vacancies || 'Вакансии',
      icon: <Briefcase size={18} className="mr-2" />,
      requiresAuth: false,
    },
    {
      path: `${langPrefix}/events`,
      label: t.navigation?.events || 'События',
      icon: <HelpCircle size={18} className="mr-2" />,
      requiresAuth: false,
    },
    {
      path: `${langPrefix}/certificates`,
      label: t.navigation?.certificates || 'Сертификация',
      icon: <Award size={18} className="mr-2" />,
      requiresAuth: true, // Требует авторизации
    },
    {
      path: `${langPrefix}/courses`,
      label: t.navigation?.courses || 'Электронные курсы',
      icon: <Monitor size={18} className="mr-2" />,
      requiresAuth: true, // Требует авторизации
    },
  ];

  // Состояния для раскрытия/закрытия меню
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);

  // Обработчик перехода на страницу логина
  const handleLogin = () => {
    router.push(`${langPrefix}/login?returnUrl=${encodeURIComponent(router.asPath)}`);
  };

  // Обработчик навигации для пунктов меню, требующих авторизации
  const handleNavigationClick = (item, e) => {
    if (item.requiresAuth && !isAuthorized) {
      e.preventDefault();
      // Перенаправляем на страницу логина с returnUrl для возврата после авторизации
      router.push(`${langPrefix}/login?returnUrl=${encodeURIComponent(item.path)}`);
    } else {
      // Если пользователь авторизован или пункт не требует авторизации,
      // просто переходим по указанному пути
      router.push(item.path);
    }
  };

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const hamburgerButton = document.getElementById('hamburger-button');
      if (
        mobileMenu &&
        hamburgerButton &&
        !mobileMenu.contains(event.target) &&
        !hamburgerButton.contains(event.target)
      ) {
        setIsOpen(false);
      }
      const langDropdown = document.getElementById('lang-dropdown');
      const langButton = document.getElementById('lang-button');
      if (
        langDropdown &&
        langButton &&
        !langDropdown.contains(event.target) &&
        !langButton.contains(event.target)
      ) {
        setIsLangOpen(false);
      }
      const mobileLangDropdown = document.getElementById('mobile-lang-dropdown');
      const mobileLangButton = document.getElementById('mobile-lang-button');
      if (
        mobileLangDropdown &&
        mobileLangButton &&
        !mobileLangDropdown.contains(event.target) &&
        !mobileLangButton.contains(event.target)
      ) {
        setIsMobileLangOpen(false);
      }
    };

    const handleRouteChange = () => {
      setIsOpen(false);
      setIsLangOpen(false);
      setIsMobileLangOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, isOpen, isLangOpen, isMobileLangOpen]);

  // Проверка активного пункта меню
  const isActive = (path) => pathname === path;

  // Логика переключения языка (десктоп)
  const toggleLangDropdown = () => setIsLangOpen(!isLangOpen);
  const handleLanguageChange = (langCode) => {
    setIsLangOpen(false);
    if (['kz', 'ru', 'en'].includes(langCode)) {
      setCurrentLang(langCode);
      setT(translations[langCode] || {});
      router.push(`/${langCode}${pathname.replace(/^\/[^\/]+/, '')}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  // Логика переключения языка (мобильная версия)
  const toggleMobileLangDropdown = () => setIsMobileLangOpen(!isMobileLangOpen);
  const handleMobileLanguageChange = (langCode) => {
    setIsMobileLangOpen(false);
    if (['kz', 'ru', 'en'].includes(langCode)) {
      setCurrentLang(langCode);
      setT(translations[langCode] || {});
      router.push(`/${langCode}${pathname.replace(/^\/[^\/]+/, '')}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  return (
    <>
      {/* Десктопное меню */}
      <nav className="bg-white shadow-md sticky top-0 z-30 hidden sm:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <div className="flex items-center">
              <Link href={`${langPrefix}/home`} legacyBehavior>
                <a className="flex items-center">
                  <div className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-teal-500 to-blue-600 text-transparent bg-clip-text">
                      TABYS
                    </span>
                  </div>
                </a>
              </Link>
            </div>

            {/* Навигационные ссылки */}
            <div className="hidden sm:flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.requiresAuth ? (
                    // Для пунктов, требующих авторизации, используем обработчик
                    <a
                      href={item.path}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                        isActive(item.path)
                          ? 'bg-teal-50 text-teal-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  ) : (
                    // Для обычных пунктов используем Link
                    <Link href={item.path} legacyBehavior>
                      <a
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                          isActive(item.path)
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    </Link>
                  )}
                </div>
              ))}

              {/* Кнопка Войти (только для неавторизованных) */}
              {!isAuthorized && (
                <button
                  onClick={handleLogin}
                  className="ml-2 px-3 py-2 bg-white text-teal-600 hover:text-teal-700 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-colors duration-300 flex items-center"
                >
                  <LogIn size={18} className="mr-2" />
                  {t.navigation?.login || 'Войти'}
                </button>
              )}

              {/* Селектор языка (десктоп) */}
              <div className="relative ml-2">
                <button
                  id="lang-button"
                  onClick={toggleLangDropdown}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Globe size={18} />
                  <img
                    src={
                      languages.find((l) => l.code === currentLang)?.flag ||
                      '/icons/kz.png'
                    }
                    alt="Selected language"
                    className="w-5 h-5 ml-1"
                  />
                </button>
                {isLangOpen && (
                  <div
                    id="lang-dropdown"
                    className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      {languages.map((langItem) => (
                        <button
                          key={langItem.code}
                          onClick={() => handleLanguageChange(langItem.code)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                        >
                          <img
                            src={langItem.flag}
                            alt={langItem.label}
                            className="w-5 h-5 mr-2"
                          />
                          {langItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <nav className="bg-white shadow-md sm:hidden sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <Link href={`${langPrefix}/home`} legacyBehavior>
              <a className="flex items-center">
                <div className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-teal-500 to-blue-600 text-transparent bg-clip-text">
                    TABYS
                  </span>
                </div>
              </a>
            </Link>

            <div className="flex items-center">
              {/* Мобильный селектор языка */}
              <div className="relative mr-2">
                <button
                  id="mobile-lang-button"
                  onClick={toggleMobileLangDropdown}
                  className="p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-gray-50 focus:outline-none"
                >
                  <img
                    src={
                      languages.find((l) => l.code === currentLang)?.flag ||
                      '/icons/kz.png'
                    }
                    alt="Selected language"
                    className="w-5 h-5"
                  />
                </button>
                {isMobileLangOpen && (
                  <div
                    id="mobile-lang-dropdown"
                    className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      {languages.map((langItem) => (
                        <button
                          key={langItem.code}
                          onClick={() => handleMobileLanguageChange(langItem.code)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                        >
                          <img
                            src={langItem.flag}
                            alt={langItem.label}
                            className="w-5 h-5 mr-2"
                          />
                          {langItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                id="hamburger-button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-gray-50 focus:outline-none"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            id="mobile-menu"
            className="md:hidden bg-white shadow-lg absolute left-0 right-0 z-50"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.requiresAuth ? (
                    // Для пунктов, требующих авторизации, используем обработчик
                    <a
                      href={item.path}
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center ${
                        isActive(item.path)
                          ? 'bg-teal-50 text-teal-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                      }`}
                      onClick={(e) => {
                        setIsOpen(false);
                        handleNavigationClick(item, e);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  ) : (
                    // Для обычных пунктов используем Link
                    <Link href={item.path} legacyBehavior>
                      <a
                        className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors flex items-center ${
                          isActive(item.path)
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    </Link>
                  )}
                </div>
              ))}

              {/* Кнопка Войти для мобильного меню (только для неавторизованных) */}
              {!isAuthorized && (
                <button
                  onClick={handleLogin}
                  className="w-full px-3 py-2 bg-white text-teal-600 hover:text-teal-700 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-colors duration-300 flex items-center"
                >
                  <LogIn size={18} className="mr-2" />
                  {t.navigation?.login || 'Войти'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
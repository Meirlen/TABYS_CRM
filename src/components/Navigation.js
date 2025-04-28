import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  Home,
  Clock,
  Info,
  CreditCard,
  Globe,
  BookOpen,
  Volume2,
  Users,
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

  // Инициализируем язык
  const [currentLang, setCurrentLang] = useState(
    typeof lang === 'string' && ['kz', 'ru', 'en'].includes(lang)
      ? lang
      : 'kz'
  );
  // Инициализируем переводы
  const [t, setT] = useState(translations[currentLang] || {});

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

  // Пример функции для перехода
  const handleCreateClick = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push(`/${currentLang}/login`);
    } else {
      window.location.href = 'https://wa.me/77074256724';
    }
  };

  // Навигационные пункты
  const navItems = [
    {
      path: `${langPrefix}/home`,
      label: t.navigation?.home || 'Home',
      icon: <Home size={18} className="mr-2" />,
    },
    {
      path: `${langPrefix}/my_sites`,
      label: t.navigation?.history || 'History',
      icon: <Clock size={18} className="mr-2" />,
    },
    {
      path: `${langPrefix}/PackageCalculator`,
      label: t.navigation?.partner || 'Partner',
      icon: <Users size={18} className="mr-2" />,
    },
    {
      path: `${langPrefix}/blog`,
      label: 'Блог',
      icon: <BookOpen size={18} className="mr-2" />,
    },
    {
      path: `${langPrefix}/about`,
      label: t.navigation?.about || 'About',
      icon: <Info size={18} className="mr-2" />,
    },
  ];

  // Баланс пользователя
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setBalance(null);
          return;
        }
        // API-запрос для получения баланса
        const response = await fetch('https://tyrasoft.kz/api/v1/balance', {
          headers: { Authorization: `Bearer ${token}` },
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
      }
    };

    fetchBalance();
  }, []);

  // Состояния для раскрытия/закрытия меню
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);

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
      router.push(`/${langCode}/home`);
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
      router.push(`/${langCode}/home`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  return (
    <>
      {/* Десктопное меню */}
      <nav className="bg-white shadow-sm sticky top-0 z-30 hidden sm:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <div className="flex items-center">
              <Link href={`${langPrefix}/home`} legacyBehavior>
                <a className="flex items-center">
                  <div className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-[#3875F6] to-[#00B074] text-transparent bg-clip-text">
                      SHAQYRU
                    </span>
                    <span className="text-[#3875F6]">24</span>
                  </div>
                </a>
              </Link>
            </div>

            {/* Навигационные ссылки */}
            <div className="hidden sm:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link href={item.path} key={item.path} legacyBehavior>
                  <a
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-[#3875F6]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              ))}

              {/* Селектор языка (десктоп) */}
              <div className="relative ml-2">
                <button
                  id="lang-button"
                  onClick={toggleLangDropdown}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
                  <span className="ml-1">
                    {languages.find((l) => l.code === currentLang)?.label || 'Қазақша'}
                  </span>
                </button>
                {isLangOpen && (
                  <div
                    id="lang-dropdown"
                    className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      {languages.map((langItem) => (
                        <button
                          key={langItem.code}
                          onClick={() => handleLanguageChange(langItem.code)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

            {/* Баланс и кнопка пополнения (десктоп) */}
            <div className="hidden sm:flex items-center">
              <div className="mr-4 text-sm text-gray-700">
                <span className="font-medium">{t.navigation?.balance}:</span>{' '}
                {balance !== null ? (
                  <span className="font-bold text-[#3875F6]">
                    {balance.toFixed(0)} ₸
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>
              <button
                onClick={handleCreateClick}
                className="bg-[#3875F6] hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <CreditCard size={16} className="mr-2" />
                {t.navigation?.topUp}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <nav className="bg-white shadow-sm sm:hidden sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <Link href={`${langPrefix}/home`} legacyBehavior>
              <a className="flex items-center">
                <div className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-[#3875F6] to-[#00B074] text-transparent bg-clip-text">
                    SHAQYRU
                  </span>
                  <span className="text-[#3875F6]">24</span>
                </div>
              </a>
            </Link>

            <div className="flex items-center">
              {/* Мобильный селектор языка */}
              <div className="relative mr-2">
                <button
                  id="mobile-lang-button"
                  onClick={toggleMobileLangDropdown}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
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
                    className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      {languages.map((langItem) => (
                        <button
                          key={langItem.code}
                          onClick={() => handleMobileLanguageChange(langItem.code)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

              <div className="mr-3 text-sm">
                <span className="font-medium text-gray-700">
                  {balance !== null ? (
                    <span className="font-bold text-[#3875F6]">
                      {balance.toFixed(0)} ₸
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </span>
              </div>
              <button
                id="hamburger-button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
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
                <Link href={item.path} key={item.path} legacyBehavior>
                  <a
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-[#3875F6]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleCreateClick();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-[#3875F6] hover:bg-blue-600 text-white transition-colors flex items-center"
              >
                <CreditCard size={18} className="mr-2" />
                {t.navigation?.topUp}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;

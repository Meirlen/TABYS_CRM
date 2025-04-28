import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный

// Здесь будем импортировать компоненты по мере их добавления
import LatestSitesBlock from './LatestSitesBlock';
import ExamplesGalleryBlock from './ExamplesGalleryBlock';
import ClothingTransformBlock from './ClothingTransformBlock';
import AdvantagesBlock from './AdvantagesBlock';
import MainInviteBlock from './MainInviteBlock';
import TestimonialsBlock  from './TestimonialsBlock';
import Footer from '../../components/Footer'; // Импортируем компонент Footer

// и так далее...

export default function HomePage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  useEffect(() => {
    // Обновляем язык при клиентской навигации (если меняются query-параметры)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Если указан неправильный язык, перенаправляем на правильный URL
      if (clientLang !== validLang) {
        router.replace(`/${validLang}/home`);
        return;
      }

      // Используем существующие переводы
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang, router]);

  // Функция для перехода на соответствующую страницу с проверкой авторизации
  const handleCreateClick = (route) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Если пользователь не авторизован, перенаправляем на страницу логина
      // с callbackUrl, указывающим куда вернуться после авторизации
      router.push({
        pathname: `/${currentLang}/login`,
        query: { callbackUrl: `/${currentLang}/invite_type` }
      });
    } else {
      // Если пользователь авторизован, сразу переходим на страницу категорий
      router.push(`/${currentLang}${route}`);
    }
  };

  // Функция для получения переводов по вложенным ключам (аналог t из useSimpleTranslation)
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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">{getTranslation('newPage.badge.number1')}</span>
                <span className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">{getTranslation('newPage.badge.count')}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {getTranslation('newPage.title')}
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{getTranslation('newPage.subtitle')}</span>
                {getTranslation('newPage.titleEnd')}
              </h1>

              <p className="text-gray-600 mb-6 text-lg">
                {getTranslation('newPage.description')}
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleCreateClick('/invite_type')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  {getTranslation('newPage.startButton')}
                </button>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-800">1000+</div>
              <div className="text-sm text-gray-600">{getTranslation('newPage.stats.invitations')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-800">98%</div>
              <div className="text-sm text-gray-600">{getTranslation('newPage.stats.clients')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-800">5 {getTranslation('newPage.stats.min')}</div>
              <div className="text-sm text-gray-600">{getTranslation('newPage.stats.time')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Здесь будем добавлять компоненты */}
        <LatestSitesBlock />
        <ExamplesGalleryBlock />
        <ClothingTransformBlock />
        <AdvantagesBlock />
        <MainInviteBlock />
        <TestimonialsBlock />



        {/* Панель поддержки */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{getTranslation('newPage.support.title')}</h3>
              <p className="text-gray-600">{getTranslation('newPage.support.subtitle')}</p>
            </div>

            <a
              href="https://wa.me/77711745741"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              {getTranslation('newPage.support.contactButton')}
            </a>
          </div>
        </div>
      </div>

      <Footer />

    </div>
  );
}

// Используем getServerSideProps для получения параметра lang на сервере
export async function getServerSideProps(context) {
  // Получаем параметр lang из URL
  const { lang } = context.params;

  // Проверяем, что язык валидный (убрали английский)
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  // Если указан неправильный язык, делаем редирект на правильный URL
  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/home`,
        permanent: false,
      },
    };
  }

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
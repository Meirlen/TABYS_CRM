import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../locales/translations'; // Убедитесь, что путь корректный
import Footer from '../../../components/Footer'; // Убедитесь, что путь корректный
import ExpertsList from './ExpertsList'; // Компонент списка
import ExpertFilter from './ExpertFilter'; // Компонент фильтра
import { Users, Search } from 'react-feather';
import AdminLayout from '../../../components/layouts/AdminLayout';

export default function ExpertsPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'ru'); // По умолчанию русский, если сервер не передал
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || (translations[serverLang || 'ru'] || {}));

  // Состояние для фильтров
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    search: ''
  });

  useEffect(() => {
    // Обновляем язык и переводы при клиентской навигации (если меняются query-параметры)
    if (clientLang && typeof clientLang === 'string' && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'ru'; // Фоллбэк на русский
      setCurrentLang(validLang);

      // Если указан неправильный язык в URL, заменяем на правильный
      if (clientLang !== validLang) {
        router.replace(`/${validLang}/experts`, undefined, { shallow: true });
      }

      // Обновляем переводы для нового языка
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      } else if (translations && translations['ru']) { // Фоллбэк на русский, если переводы для validLang отсутствуют
        setT(translations['ru']);
      }

      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    } else if (!clientLang && serverLang && currentLang !== serverLang) {
      // Если clientLang отсутствует (например, первый заход без параметра lang в URL),
      // но serverLang был установлен, убедимся, что currentLang и t соответствуют serverLang.
      setCurrentLang(serverLang);
      if (translations && translations[serverLang]) {
        setT(translations[serverLang]);
      }
    }
  }, [clientLang, currentLang, router, serverLang]);

  // Функция для получения переводов по вложенным ключам
  const getTranslation = (key, fallback) => {
    try {
      if (!t || Object.keys(t).length === 0) {
        return fallback || key;
      }
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (result && typeof result === 'object' && result[k] !== undefined) {
          result = result[k];
        } else {
          return fallback || key;
        }
      }
      return typeof result === 'string' ? result : (fallback || key);
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return fallback || key;
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  // Обработчик изменения поля поиска
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (

        <AdminLayout title="Эксперты">

    <div className="bg-gray-50 min-h-screen font-sans">


      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок в стиле других компонентов */}


        <div className="mb-8">
          <ExpertFilter
            onFilterChange={handleFilterChange}
            getTranslation={getTranslation}
            currentLang={currentLang}
          />
        </div>

        <ExpertsList
          filters={filters}
          getTranslation={getTranslation}
          currentLang={currentLang}
        />
      </div>


    </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const { lang } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'ru'; // Фоллбэк на русский

  if (lang !== validLang && context.res) { // context.res существует только на сервере
    context.res.writeHead(302, { Location: `/${validLang}/experts` });
    context.res.end();
    return { props: {} }; // Нужно вернуть что-то, хотя редирект уже произошел
  }

  const langTranslations = translations[validLang] || (translations['ru'] || {});

  return {
    props: {
      lang: validLang,
      translations: langTranslations,
    },
  };
}
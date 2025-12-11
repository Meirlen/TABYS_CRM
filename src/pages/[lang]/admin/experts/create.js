import AdminExpertCreate from './AdminExpertCreate'; // Скорректируйте путь, если необходимо
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../../locales/translations'; // Убедитесь, что путь корректный
import AdminLayout from '../../../../components/layouts/AdminLayout';

export default function AdminExpertCreatePage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  // Проверка авторизации администратора
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Если пользователь не авторизован, перенаправляем на страницу логина
      router.push({
        pathname: `/${currentLang}/login`,
        query: { callbackUrl: router.asPath } // Используем asPath для точного URL коллбэка
      });
      return;
    }

    // Здесь можно добавить проверку роли пользователя,
    // если в вашем приложении она реализована
    // Например, запрос к API для проверки роли по токену
  }, [currentLang, router]);

  useEffect(() => {
    // Обновляем язык при клиентской навигации (если меняются query-параметры)
    if (clientLang && typeof clientLang === 'string' && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Если указан неправильный язык в URL, заменяем на правильный
      if (clientLang !== validLang) {
        // Заменяем URL без перезагрузки страницы, чтобы сохранить состояние, если это необходимо
        // Однако, если переводы сильно зависят от URL, router.replace может быть лучше.
        // Для согласованности с getServerSideProps, router.replace предпочтительнее.
        router.replace(`/${validLang}/admin/experts/create`, undefined, { shallow: true });
        // Если нужен полный редирект с перезагрузкой getServerSideProps:
        // router.replace(`/${validLang}/admin/experts/create`);
        // return; // Прерываем, если делаем полный редирект
      }

      // Обновляем переводы
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang, router]);

  // Функция для получения переводов по вложенным ключам
  const getTranslation = (key) => {
    try {
      if (!t || Object.keys(t).length === 0) {
        console.warn(`Translations not loaded for lang: ${currentLang}, key: ${key}`);
        return key;
      }
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (result && typeof result === 'object' && result[k] !== undefined) {
          result = result[k];
        } else {
          console.warn(`Translation missing for key: ${key} at part: ${k} in lang: ${currentLang}`);
          return key; // Возвращаем ключ, если перевод не найден
        }
      }
      return typeof result === 'string' ? result : key; // Возвращаем строку или ключ
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return key; // Возвращаем ключ в случае ошибки
    }
  };

  // Проверяем, есть ли токен до рендера компонента формы,
  // чтобы избежать мигания формы перед редиректом.
  if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return <p>{getTranslation('loading') || 'Загрузка... Проверка авторизации...'}</p>; // Или какой-то лоадер
  }

  return <AdminExpertCreate getTranslation={getTranslation} currentLang={currentLang} />;
}

// Используем getServerSideProps для получения параметра lang на сервере
export async function getServerSideProps(context) {
  // Получаем параметр lang из URL
  const { lang } = context.params;

  // Проверяем, что язык валидный
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  // Если указан неправильный язык, делаем редирект на правильный URL
  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/admin/experts/create`,
        permanent: false, // false, так как это может быть ошибка пользователя, а не постоянный редирект
      },
    };
  }

  // Получаем переводы для этого языка
  // Убедитесь, что translations['kz'] существует как фолбэк
  const langTranslations = translations[validLang] || (translations['kz'] || {});


  // Возвращаем данные в компонент
  return {
    props: {
      lang: validLang,
      translations: langTranslations,
    },
  };
}
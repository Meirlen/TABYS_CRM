import ExpertDetail from './ExpertDetail';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../locales/translations'; // Убедитесь, что путь корректный

export default function ExpertDetailPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, expertId } = router.query;

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
        router.replace(`/${validLang}/experts/${expertId}`);
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
  }, [clientLang, currentLang, router, expertId]);

  // Компонент ExpertDetail требует expertId как пропс,
  // поэтому мы берем его из router.query
  return <ExpertDetail
    lang={currentLang}
    translations={t}
    expertId={expertId}
  />;
}

// Используем getServerSideProps для получения параметров на сервере
export async function getServerSideProps(context) {
  // Получаем параметры из URL
  const { lang, expertId } = context.params;

  // Проверяем, что язык валидный
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  // Если указан неправильный язык, делаем редирект на правильный URL
  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/experts/${expertId}`,
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
      translations: langTranslations,
    }
  };
}
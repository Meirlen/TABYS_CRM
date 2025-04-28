import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiMic } from 'react-icons/fi';


import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный



export default function AudioSelectionPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id, category_name, type } = router.query;

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

  // Обработчики навигации
  const handleAddVoice = () => {
    router.push(`/${currentLang}/text-to-speech?site_id=${site_id}&category_name=${category_name}&type=${type}`);
  };

  const handleContinueWithoutVoice = () => {
    router.push(`/${currentLang}/StyleSelectionPage?site_id=${site_id}&category_name=${category_name}&type=${type}`);
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    }}>
      <Head>
        <title>{getTranslation('audioSelectionPage.title') || 'Выбор голоса'}</title>
        <meta name="description" content={getTranslation('audioSelectionPage.description') || 'Выберите, хотите ли вы добавить голос к вашему сайту'} />
      </Head>

      {/* Тулбар вверху */}
      <HeaderBack title={getTranslation('audioSelectionPage.title')} />

      {/* Контейнер для карточки, выровненный по центру по горизонтали */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '40px', // отступ от тулбара
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          {/* Иконка */}
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <FiMic size={32} />
          </div>

          {/* Заголовок */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#111827',
          }}>
            {getTranslation('audioSelectionPage.question')}
          </h2>

          {/* Описание */}
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '30px',
          }}>
            {getTranslation('audioSelectionPage.description')}
          </p>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
          }}>
            <button
              onClick={handleAddVoice}
              style={{
                padding: '16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {getTranslation('audioSelectionPage.addVoice')}
            </button>

            <button
              onClick={handleContinueWithoutVoice}
              style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {getTranslation('audioSelectionPage.continueWithoutVoice')}
            </button>
          </div>
        </div>
      </div>
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
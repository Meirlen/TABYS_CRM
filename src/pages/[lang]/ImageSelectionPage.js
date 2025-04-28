import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiImage, FiUpload } from 'react-icons/fi';
import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный

export default function ImageSelectionPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id, tariff, category_name } = router.query;

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

  // Navigate to thematic images
  const handleSelectThematic = () => {
    router.push(`/${currentLang}/replace_bg?site_id=${site_id}&category_name=${category_name}&photo_type=template&tariff=${tariff}`);
  };

  // Navigate to photo upload/crop
  const handleSelectOwn = () => {
    router.push(`/${currentLang}/image_crop?site_id=${site_id}&category_name=${category_name}&tariff=${tariff}`);
  };

  // Styles for the component
  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '0 0 20px 0',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      color: '#333',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    content: {
      width: '100%',
      maxWidth: '700px',
      marginTop: '20px',
      padding: '0 20px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '30px',
    },
    optionsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      width: '100%',
    },
    optionCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid transparent',
      height: '320px',
    },
    cardIconWrapper: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      textAlign: 'center',
    },
    cardDescription: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '24px',
      lineHeight: '1.5',
    },
    cardButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
      transition: 'all 0.2s ease',
      width: '100%',
      maxWidth: '200px',
    },
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>{getTranslation('imageSelection.title')}</title>
        <meta name="description" content={getTranslation('imageSelection.subtitle')} />
      </Head>

      {/* Header with Back Button */}
      <HeaderBack title={getTranslation('imageSelection.title')} />

      <div style={styles.content}>
        {/* Subtitle */}
        <p style={styles.subtitle}>
          {getTranslation('imageSelection.subtitle')}
        </p>

        {/* Options */}
        <div style={styles.optionsContainer}>
          {/* Thematic image option */}
          <div
            style={styles.optionCard}
            onClick={handleSelectThematic}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              ...styles.cardIconWrapper,
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
            }}>
              <FiImage size={32} />
            </div>
            <h3 style={styles.cardTitle}>{getTranslation('imageSelection.templates.title')}</h3>
            <p style={styles.cardDescription}>
              {getTranslation('imageSelection.templates.description')}
            </p>

            {/* Example image */}
            <div style={{
              width: '100%',
              height: '120px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              overflow: 'hidden',
            }}>
              <svg width="100%" height="100%" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="150" fill="#e0f2fe" />
                <circle cx="80" cy="50" r="30" fill="#7dd3fc" />
                <rect x="170" y="30" width="90" height="90" rx="8" fill="#0ea5e9" />
                <path d="M20,120 Q60,60 100,120 T180,120" stroke="#0284c7" strokeWidth="4" fill="none" />
              </svg>
            </div>

            <button style={styles.cardButton}>
              {getTranslation('imageSelection.buttonSelect')}
            </button>
          </div>

          {/* Own photo option */}
          <div
            style={styles.optionCard}
            onClick={handleSelectOwn}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              ...styles.cardIconWrapper,
              backgroundColor: '#fef2f2',
              color: '#ef4444',
            }}>
              <FiUpload size={32} />
            </div>
            <h3 style={styles.cardTitle}>{getTranslation('imageSelection.ownPhoto.title')}</h3>
            <p style={styles.cardDescription}>
              {getTranslation('imageSelection.ownPhoto.description')}
            </p>

            {/* Example image upload */}
            <div style={{
              width: '100%',
              height: '120px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '2px dashed #cbd5e1',
            }}>
              <FiUpload size={28} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {getTranslation('imageSelection.ownPhoto.uploadLabel')}
              </span>
            </div>

            <button style={styles.cardButton}>
              {getTranslation('imageSelection.buttonSelect')}
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
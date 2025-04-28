import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { translations } from '../../locales/translations';

export default function SendWhatsapp({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id: siteId, style_type: styleType } = router.query;
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  const [t, setT] = useState(serverTranslations || {});
  const [isPreparingWebsite, setIsPreparingWebsite] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clientSiteUrl = typeof window !== 'undefined' ? window.location.search : '';
  const siteIdFromUrl = siteId || (typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('site_id')) || '';

  useEffect(() => {
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  // Функция для получения переводов
  const getTranslation = (key) => {
    try {
      const keys = key.split('.');
      let result = t;
      for (const k of keys) {
        if (!result || result[k] === undefined) return key;
        result = result[k];
      }
      return typeof result === 'string' ? result : key;
    } catch (e) {
      return key;
    }
  };

  // Эффект для анимации загрузки
  useEffect(() => {
    if (isPreparingWebsite) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsPreparingWebsite(false), 500);
            return 100;
          }
          if (prev >= 20 && loadingStep < 1) setLoadingStep(1);
          else if (prev >= 40 && loadingStep < 2) setLoadingStep(2);
          else if (prev >= 65 && loadingStep < 3) setLoadingStep(3);
          else if (prev >= 90 && loadingStep < 4) setLoadingStep(4);
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPreparingWebsite, loadingStep]);

  // Подготовка сообщения для WhatsApp
  const getWhatsAppMessage = () => {
    let message = '';
    if (currentLang === 'kz') {
      message = `Сәлеметсіз бе! Мен сайт сатып алуға хабарласып тұрмын. Менің сайтымның нөмірі: ${siteIdFromUrl}`;
    } else if (currentLang === 'ru') {
      message = `Здравствуйте! Я хочу приобрести сайт. Номер моего сайта: ${siteIdFromUrl}`;
    } else {
      message = `Hello! I would like to purchase a website. My site ID is: ${siteIdFromUrl}`;
    }
    return encodeURIComponent(message);
  };

  // Отправка данных и переход в WhatsApp
  const handleSendAndOpenWhatsApp = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://tyrasoft.kz/toitrend/send_whatsapp_message', {
        client_site_url: clientSiteUrl,
        phone_number: '77074256724',
        site_id: siteIdFromUrl,
        style_type: styleType,
        audio_type: 'music'
      });

      if (response.data?.res) {
        // Google Ads conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16975357099/WQ4fCM6757MaEKvJvZ4_',
            'value': 1.0,
            'currency': 'USD',
            'transaction_id': ''
          });
        }

        // Переход в WhatsApp
        if (typeof window !== 'undefined') {
          const whatsappMessage = getWhatsAppMessage();
          window.location.href = `https://wa.me/77074256724?text=${whatsappMessage}`;
        }
      } else {
        throw new Error('Ошибка соединения с сервером');
      }
    } catch (err) {
      setError(getTranslation('sendWhatsapp.errors.sendingError'));
    } finally {
      setLoading(false);
    }
  };

  // Переход на страницу настроек
  const goToPrivacySettings = () => {
    router.push(`/${currentLang}/site_settings?site_id=${siteIdFromUrl}`);
  };

  const loadingSteps = [
    { text: getTranslation('sendWhatsapp.loadingSteps.preparing'), icon: '🔧' },
    { text: getTranslation('sendWhatsapp.loadingSteps.design'), icon: '💻' },
    { text: getTranslation('sendWhatsapp.loadingSteps.connecting'), icon: '🌐' },
    { text: getTranslation('sendWhatsapp.loadingSteps.creating'), icon: '📱' },
    { text: getTranslation('sendWhatsapp.loadingSteps.ready'), icon: '✅' }
  ];

  // Экран загрузки
  if (isPreparingWebsite) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #f5f7fa, #e9ecef)',
      }}>
        <Head>
          <title>{getTranslation('sendWhatsapp.title') || 'Ваш сайт готов'}</title>
        </Head>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #4C6EF5, #3F51B5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px',
            boxShadow: '0 4px 15px rgba(76, 110, 245, 0.3)',
            fontSize: '32px'
          }}>
            {loadingSteps[loadingStep].icon}
          </div>

          <h3 style={{ marginBottom: '8px', color: '#333' }}>
            {loadingSteps[loadingStep].text}
          </h3>

          <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
            {getTranslation('sendWhatsapp.waitingForSite')}
          </p>

          <div style={{ width: '100%', position: 'relative', height: '8px', backgroundColor: '#f1f3f5', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${loadingProgress}%`,
              background: 'linear-gradient(90deg, #4C6EF5, #3F51B5)',
              borderRadius: '4px',
              transition: 'width 0.3s ease-out'
            }} />
          </div>

          <p style={{ fontSize: '14px', marginTop: '10px', color: '#4C6EF5' }}>
            {loadingProgress}%
          </p>
        </div>
      </div>
    );
  }

  // Основной интерфейс
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f7fa, #e9ecef)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <Head>
        <title>{getTranslation('sendWhatsapp.title') || 'Ваш сайт готов'}</title>
      </Head>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Верхний градиентный блок */}
        <div style={{
          background: 'linear-gradient(135deg, #4C6EF5, #3F51B5)',
          padding: '30px 25px 60px',
          position: 'relative',
        }}>
          <button
            onClick={goToPrivacySettings}
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              width: '40px',
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            🔒
          </button>

          <div style={{
            position: 'absolute',
            bottom: -30,
            right: 30,
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: '#25D366',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            fontSize: '30px'
          }}>
            📱
          </div>

          <h2 style={{
            color: 'white',
            fontWeight: 800,
            fontSize: '28px',
          }}>
            {getTranslation('sendWhatsapp.siteReady') || 'Ваш сайт готов!'}
          </h2>
        </div>

        {/* Основной белый блок */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px 20px 0 0',
          marginTop: '-30px',
          paddingTop: '35px',
          zIndex: 2,
          position: 'relative',
          padding: '0 25px 25px'
        }}>
          {error && (
            <div style={{
              backgroundColor: '#FFE9E9',
              color: '#E03131',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              <div>
                <strong>{getTranslation('sendWhatsapp.error')}</strong>
                <p style={{ margin: '4px 0 0' }}>{error}</p>
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: '#F0F9FF',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #E0F2FE'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '10px 12px',
              borderRadius: '8px',
            }}>
              <span style={{ marginRight: '10px', color: '#0284C7' }}>🆔</span>
              <div>
                <p style={{ margin: 0, color: '#0284C7', fontWeight: '500', fontSize: '14px' }}>
                  {getTranslation('sendWhatsapp.siteIdLabel') || 'ID вашего сайта'}:
                </p>
                <p style={{ margin: '2px 0 0', fontWeight: '600', fontSize: '16px', color: '#0369A1' }}>
                  {siteIdFromUrl || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {getTranslation('sendWhatsapp.purchaseInstructions') || 'Для покупки свяжитесь с нами в WhatsApp'}
          </h3>

          <button
            disabled={loading}
            onClick={handleSendAndOpenWhatsApp}
            style={{
              width: '100%',
              background: '#25D366',
              height: '52px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <span>{getTranslation('sendWhatsapp.connecting') || 'Подключение...'}</span>
            ) : (
              <>
                <span style={{ marginRight: '8px', fontSize: '20px' }}>📱</span>
                <span>{getTranslation('sendWhatsapp.contactViaWhatsapp') || 'Связаться через WhatsApp'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang } = context.params;
  const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
  const langTranslations = translations[validLang] || translations['kz'];

  return {
    props: {
      lang: validLang,
      translations: langTranslations
    }
  };
}
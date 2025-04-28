import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { parseISO } from 'date-fns';
import { translations } from '../../../../locales/translations'; // Убедитесь, что путь корректный

// Определим тип для поддерживаемых языков
// Замечание: TypeScript интерфейсы удалены, так как исходный файл - JavaScript

const API_BASE_URL = "https://tyrasoft.kz";

// Месяцы для трёх языков
const months = {
  kz: [
    'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
    'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
  ],
  ru: [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
};

// Словечко перед временем (например «сағат 15:00», «в 15:00», «at 15:00»)
const hourWord = {
  kz: 'сағат',
  ru: 'в',
  en: 'at'
};

// Названия языков для отображения
const languageLabels = {
  kz: "Қазақша",
  ru: "Русский",
  en: "English"
};

// Универсальная функция форматирования даты/времени под текущий язык
function formatDateTime(isoString, lang) {
  if (!isoString) return '';
  const dateObj = parseISO(isoString);

  const day = dateObj.getDate();
  const monthIndex = dateObj.getMonth();
  const year = dateObj.getFullYear();

  // Подставляем нужный массив месяцев (или default kz, если чего-то нет)
  const monthName = months[lang]?.[monthIndex] || months['kz'][monthIndex];

  // Форматируем время (24-часовой формат)
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  // Собираем в общую строку
  if (lang === 'en') {
    return `${monthName} ${day}, ${hourWord[lang]} ${hours}:${minutes}`;
  } else {
    return `${day} ${monthName}, ${hourWord[lang]} ${hours}:${minutes}`;
  }
}

// Функция для проверки, является ли строка поддерживаемым языком
const isSupportedLanguage = (lang) => {
  return ['kz', 'ru', 'en'].includes(lang);
};

export default function PhotoInvite({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id: siteId, spec_i: specParam } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Состояние для хранения метаданных
  const [metadata, setMetadata] = useState([]);
  const [eventType, setEventType] = useState('');

  // Обновляем язык при клиентской навигации
  useEffect(() => {
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

  // Проверка доступности изображения
  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error("Error checking image:", error);
      return false;
    }
  };

  // Загрузка данных о сайте
  useEffect(() => {
    const fetchSiteData = async () => {
      if (!siteId) {
        setError("Сайт идентификаторы берілмеген.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // Получаем токен из localStorage если он есть
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token');
        }

        // Добавляем язык в запрос
        const response = await axios.get(`${API_BASE_URL}/sites?site_id=${siteId}&language=${currentLang}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (response.status !== 200) {
          throw new Error(`HTTP қатесі! status: ${response.status}`);
        }

        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          setVideoData(data);

          // Обработка метаданных
          if (data.metadata && Array.isArray(data.metadata)) {
            setMetadata(data.metadata);

            // Получаем тип события
            const eventTypeItem = data.metadata.find(item => item.key === 'event_type');
            if (eventTypeItem) {
              setEventType(eventTypeItem.value);
            }
          }

          // Проверяем наличие photo_link
          if (data.photo_link) {
            setBackgroundImage(data.photo_link);
          } else {
            // Если photo_link нет, используем стандартную логику поиска изображения
            loadBackgroundImage(siteId);
          }
        } else {
          setError("Сайт мәліметтері табылмады.");
        }
      } catch (err) {
        setError(err.message);
        console.error("Қате при получении данных сайта:", err);
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSiteData();
    }
  }, [siteId, currentLang]);

  // Функция загрузки фонового изображения стандартным методом
  const loadBackgroundImage = async (siteId) => {
    // Проверяем наличие JPG версии
    const jpgUrl = `https://tyrasoft.kz/uploads/compressed_toitrend_${siteId}.jpg`;
    const jpgExists = await checkImageExists(jpgUrl);

    if (jpgExists) {
      setBackgroundImage(jpgUrl);
      return;
    }

    // Если JPG не найден, проверяем PNG
    const pngUrl = `https://tyrasoft.kz/uploads/compressed_toitrend_${siteId}.png`;
    const pngExists = await checkImageExists(pngUrl);

    if (pngExists) {
      setBackgroundImage(pngUrl);
      return;
    }

    // Если ни один формат не найден, используем заглушку
    setBackgroundImage(null);
    console.warn("Фоновое изображение не найдено");
  };

  useEffect(() => {
    const fetchGuestName = async () => {
      if (specParam) {
        try {
          const response = await axios.get(`${API_BASE_URL}/special-invitations/${specParam}`);
          if (response.data && response.data.guest_name) {
            setGuestName(response.data.guest_name);
          }
        } catch (error) {
          console.error("Қонақ атын алу кезінде қате:", error);
        }
      }
    };

    if (specParam) {
      fetchGuestName();
    }
  }, [specParam]);

  // Обработчик смены языка
  const handleLanguageChange = (lang) => {
    if (isSupportedLanguage(lang)) {
      router.push(`/${lang}/invite/etno/header?site_id=${siteId}${specParam ? `&spec_i=${specParam}` : ''}`,
                  undefined,
                  { shallow: true });
    }
  };

  // Функция для рендеринга метаданных в декоративной рамке
  const renderMetadataText = () => {
    if (!metadata || metadata.length === 0) return null;

    // Для юбилея (merey) - имя на первой строке, возраст - на второй
    if (eventType === 'merey') {
      const celebrantName = metadata.find(item => item.key === 'celebrant_name')?.value || '';
      const age = metadata.find(item => item.key === 'age')?.value || '';

      return (
        <>
          {celebrantName && (
            <div
              style={{
                fontFamily: "KZ_Lobster",
                fontSize: "26px",
                fontWeight: "bold",
                color: "#FFDE7A",
                lineHeight: "1.1",
                letterSpacing: "1px"
              }}
            >
              {celebrantName}
            </div>
          )}
          {age && (
            <div
              style={{
                fontFamily: "KZ_Lobster",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#FFDE7A",
                lineHeight: "1.2",
                marginTop: "2px"
              }}
            >
              {age} жас
            </div>
          )}
        </>
      );
    }

    // Для других типов событий - все на одной строке
    else {
      // Собираем значения метаданных для отображения (исключая event_type)
      const displayValues = metadata
        .filter(item => item.key !== 'event_type')
        .map(item => item.value)
        .filter(Boolean);

      if (displayValues.length === 0) return null;

      return (
        <div
          style={{
            fontFamily: "KZ_Lobster",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#FFDE7A",
            textAlign: "center"
          }}
        >
          {displayValues.join(' ')}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-white text-sm" style={{ fontFamily: "KZ_Nautilus" }}>Жүктелуде...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/20">
        <p className="text-white text-sm px-4 py-2 bg-black/70 rounded-lg" style={{ fontFamily: "KZ_Nautilus" }}>Қате: {error}</p>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/20">
        <p className="text-white text-sm px-4 py-2 bg-black/70 rounded-lg" style={{ fontFamily: "KZ_Nautilus" }}>
          Сайт мәліметтері табылмады.
        </p>
      </div>
    );
  }

  // Берём текущий язык или, если что-то не так, ставим 'kz' по умолчанию
  const lang = isSupportedLanguage(currentLang) ? currentLang : 'kz';

  // Форматированная дата/время в зависимости от языка
  const eventDate = videoData.event_datetime
    ? formatDateTime(videoData.event_datetime, lang)
    : '';

  // Заголовок приглашения
  const displayTitle = videoData.title || 'Тойға шақыру';

  return (
    <>
      <Head>
        <title>{displayTitle}</title>
        <meta name="description" content="Photo Invitation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full font-serif relative overflow-hidden p-0 m-0">
        {/* Переключатель языков */}
        {videoData.available_languages && videoData.available_languages.length > 1 && (
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            {videoData.available_languages.filter(isSupportedLanguage).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 text-xs rounded-md ${
                  currentLang === lang
                    ? 'bg-yellow-500 text-white font-bold'
                    : 'bg-white/80 text-gray-800'
                }`}
                style={{
                  fontFamily: "KZ_Nautilus",
                  border: currentLang === lang ? '1px solid #D4AF37' : '1px solid #e5e7eb',
                  boxShadow: currentLang === lang ? '0 0 5px rgba(212, 175, 55, 0.5)' : 'none'
                }}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>
        )}

        {/* Орнаментальный фон */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(/icons/bg_fon_orn.png)',
            backgroundSize: '100% auto',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        {/* Градиентный оверлей */}
        <div
          className="absolute inset-0 w-full h-full z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,252,245,0.5) 35%, rgba(255,250,240,0.9) 45%, rgba(254,248,235,1) 60%, rgba(252,246,231,1) 100%)'
          }}
        ></div>

        {/* Watermark для неоплаченных приглашений */}
        {!videoData.is_paid && (
          <div
            className="absolute top-4 left-4 z-50 rotate-6"
          >
            <div
              className="bg-red-600/90 text-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap"
              style={{
                fontFamily: "KZ_Nautilus",
                fontSize: "14px",
                border: "2px dashed white"
              }}
            >
              ТАРИФ ТӨЛЕНБЕГЕН!
            </div>
          </div>
        )}

        {/* Контейнер с контентом */}
        <div className="relative z-20 flex flex-col items-center w-full pt-16 px-4 pb-6">
          {/* Блок с фото в рамке и декоративной табличкой для метаданных */}
          <div className="relative" style={{ marginBottom: '20px' }}>
            {/* Фотография с золотой рамкой */}
            <div
              className="rounded-full flex items-center justify-center animate-pulse"
              style={{
                width: '300px',
                height: '300px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffb700 25%, #ffd700 50%, #d4af37 75%, #ffd700 100%)',
                boxShadow: '0 0 15px #ffd700, 0 0 25px rgba(255, 215, 0, 0.6)',
                padding: '8px',
                position: 'relative',
                animation: 'goldPulse 3s infinite'
              }}
            >
              {/* Внутренняя золотая рамка */}
              <div
                className="rounded-full w-full h-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(ellipse at center, #ffd700 0%, #d4af37 60%, #b8860b 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.7)',
                  padding: '6px'
                }}
              >
                {/* Фотография */}
                <div className="rounded-full overflow-hidden w-full h-full relative">
                  <img
                    src={backgroundImage || '/assets/placeholder.jpg'}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />

                  {/* Градиент поверх фото чтобы оно исчезало */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0.9) 100%)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Эффект сверкания */}
              <div
                className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"
                style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}
              ></div>
              <div
                className="absolute top-1/4 right-0 w-2 h-2 bg-white rounded-full animate-ping"
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              ></div>
              <div
                className="absolute bottom-0 right-1/4 w-2 h-2 bg-white rounded-full animate-ping"
                style={{ animationDuration: '1.8s', animationDelay: '0.8s' }}
              ></div>
              <div
                className="absolute bottom-1/4 left-0 w-2 h-2 bg-white rounded-full animate-ping"
                style={{ animationDuration: '2.2s', animationDelay: '1s' }}
              ></div>
            </div>

            {/* Декоративная золотая рамка для метаданных - накладывается на нижнюю часть круга */}
            {metadata && metadata.length > 0 && (
              <div
                className="absolute z-30"
                style={{
                  width: '180px',
                  bottom: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src="/icons/decor_text_bg.png"
                    alt="Декоративная рамка"
                    style={{
                      width: '100%',
                      filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))'
                    }}
                  />

                  {/* Контейнер для текста в центре рамки */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {renderMetadataText()}
                  </div>
                </div>
              </div>
            )}

            {/* Сверкающий эффект только по краю рамки */}
            <div
              className="absolute inset-0 rounded-full animate-spin overflow-hidden pointer-events-none"
              style={{
                width: '300px',
                height: '300px',
                animationDuration: '8s',
                animationTimingFunction: 'linear',
                background: 'none'
              }}
            >
              {/* Верхний светящийся элемент на кольце */}
              <div
                style={{
                  position: 'absolute',
                  top: '0px',
                  left: '42%',
                  width: '50px',
                  height: '12px',
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '50%',
                  filter: 'blur(4px)'
                }}
              ></div>

              {/* Нижний светящийся элемент на кольце */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  left: '42%',
                  width: '50px',
                  height: '12px',
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '50%',
                  filter: 'blur(4px)'
                }}
              ></div>
            </div>
          </div>

          {/* Нижняя часть с текстом - увеличен отступ сверху, чтобы дать место декоративной рамке */}
          <div className="w-full max-w-md text-center" style={{ marginTop: '30px' }}>
            {/* ВАЖНО: Переработанный блок для заголовка и даты, чтобы гарантировать их отображение на разных строках */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 1. Заголовок - в отдельном блоке с display:block */}
              <div style={{ width: '100%', display: 'block', marginBottom: '10px' }}>
                <h1
                  style={{
                    fontSize: "30px",
                    lineHeight: "1.2",
                    fontFamily: "KZ_Lobster",
                    padding: "0 20px",
                    letterSpacing: "1px",
                    zIndex: 2,
                    background: "linear-gradient(to right, #D4AF37, #FFC125, #D4AF37)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: "bold",
                    margin: '0 auto',
                    textAlign: 'center'
                  }}
                >
                  {displayTitle}
                </h1>
              </div>

              {/* 2. Дата/время - в отдельном блоке с display:block */}
              {eventDate && (
                <div style={{ width: '100%', display: 'block', marginBottom: '20px' }}>
                  <div
                    style={{
                      fontFamily: "KZ_Monotype_corsiva",
                      fontSize: "16px",
                      color: '#D4AF37',
                      letterSpacing: "1px",
                      position: "relative",
                      display: "inline-block",
                      padding: "0 20px",
                      margin: '0 auto',
                      textAlign: 'center'
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        zIndex: 2,
                        background: "linear-gradient(to right, #D4AF37, #FFC125, #D4AF37)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textTransform: "uppercase"
                      }}
                    >
                      {eventDate}
                    </span>
                    {/* Декоративные элементы по сторонам */}
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        width: "15px",
                        height: "1px",
                        background: "linear-gradient(to right, transparent, #D4AF37)"
                      }}
                    ></span>
                    <span
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        width: "15px",
                        height: "1px",
                        background: "linear-gradient(to left, transparent, #D4AF37)"
                      }}
                    ></span>
                  </div>
                </div>
              )}
            </div>

            {/* "Құрметті қонақтар!" */}
            <p
              className="mb-3"
              style={{
                fontSize: "20px",
                fontFamily: "KZ_Nautilus",
                color: '#B89A3F',
              }}
            >
              {getTranslation('photoInvite.greetingPrefix')} {guestName || getTranslation('photoInvite.guests')}!
            </p>

            {/* Основной текст приглашения */}
            <p
              className="mb-4"
              style={{
                fontSize: "20px",
                fontFamily: "KZ_Nautilus",
                color: '#B89A3F',
              }}
            >
              {videoData.invitation_text}
            </p>
          </div>
        </div>

        {/* CSS-анимация для рамки */}
        <style jsx>{`
          @keyframes goldPulse {
            0% { box-shadow: 0 0 10px #ffd700, 0 0 20px rgba(255, 215, 0, 0.4); }
            50% { box-shadow: 0 0 20px #ffd700, 0 0 30px rgba(255, 215, 0, 0.7); }
            100% { box-shadow: 0 0 10px #ffd700, 0 0 20px rgba(255, 215, 0, 0.4); }
          }
        `}</style>
      </div>
    </>
  );
}

// Используем getServerSideProps для получения параметра lang на сервере
export async function getServerSideProps(context) {
  // Получаем параметр lang из URL
  const { lang } = context.params;

  // Получаем query параметры
  const { site_id, spec_i } = context.query;

  // Проверяем, что у нас есть необходимые параметры
  if (!site_id) {
    return {
      props: {
        lang: lang || 'kz',
        translations: translations[lang] || translations['kz'],
        error: "Missing site_id parameter"
      }
    };
  }

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
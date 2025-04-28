import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import HeaderBack from '../../components/HeaderBack'; // Adjust the path as needed
import { translations } from '../../locales/translations'; // Adjust the path as needed

export default function ViewVideo({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, video_url, thumbnail, title } = router.query;
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  const [t, setT] = useState(serverTranslations || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);

  // Function to get translations from nested keys
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

  useEffect(() => {
    // Update language when client navigation changes (if query parameters change)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Use existing translations
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Save selected language to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  useEffect(() => {
    if (videoRef.current) {
      // Add event listeners to update state
      videoRef.current.addEventListener('loadeddata', () => setIsLoading(false));
      videoRef.current.addEventListener('error', () => {
        setIsLoading(false);
        setError(getTranslation('viewVideo.errorLoading') || 'Ошибка при загрузке видео');
      });
      videoRef.current.addEventListener('play', () => setIsPlaying(true));
      videoRef.current.addEventListener('pause', () => setIsPlaying(false));

      // Предотвращение сохранения видео (дополнительная защита)
      videoRef.current.addEventListener('contextmenu', e => e.preventDefault());

      // Блокировка правой кнопки мыши на видео
      videoRef.current.onmousedown = (e) => {
        if (e.button === 2) e.preventDefault();
        return false;
      };
    }

    // Блокировка правой кнопки на странице
    document.addEventListener('contextmenu', e => e.preventDefault());

    return () => {
      document.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, [videoRef.current, video_url]);

  const handleBackToResults = () => {
    router.back();
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleBuyClick = () => {
    window.open('https://wa.me/77711745741', '_blank');
  };

  // Получение информации о языке для текста
  const getVideoReadyText = () => {
    if (currentLang === 'kz') {
      return 'Сіздің бейнеңіз дайын! Толық нұсқасын алу үшін WhatsApp-қа жазыңыз';
    } else if (currentLang === 'en') {
      return 'Your video is ready! To get the full version, write to us on WhatsApp';
    } else {
      return 'Ваше видео готово! Чтобы получить полную версию, напишите нам в WhatsApp';
    }
  };

  const getBuyButtonText = () => {
    if (currentLang === 'kz') {
      return 'WhatsApp-қа жазу';
    } else if (currentLang === 'en') {
      return 'Write to WhatsApp';
    } else {
      return 'Написать в WhatsApp';
    }
  };

  // Получаем текст "Ақшасы төленбеген" на разных языках
  const getUnpaidText = () => {
    if (currentLang === 'kz') {
      return 'Ақшасы төленбеген';
    } else if (currentLang === 'en') {
      return 'UNPAID';
    } else {
      return 'НЕОПЛАЧЕНО';
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans">
      <Head>
        <title>{title || getTranslation('viewVideo.title') || 'Просмотр видео'}</title>
        <meta name="description" content={getTranslation('viewVideo.description') || 'Просмотр созданного видео'} />
        {/* Метатеги для предотвращения кэширования */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">
              {getTranslation('viewVideo.loading') || 'Загрузка видео...'}
            </p>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="text-center bg-white p-6 rounded-xl max-w-md mx-auto">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{getTranslation('viewVideo.error') || 'Ошибка'}</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={handleBackToResults}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              {getTranslation('back') || 'Назад'}
            </button>
          </div>
        </div>
      )}

      {/* Верхняя панель с названием и кнопкой назад */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-10">
        <div className="flex items-center">
          <button
            onClick={handleBackToResults}
            className="w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center mr-3"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-medium truncate">
            {title || getTranslation('viewVideo.untitledVideo') || 'Видео'}
          </h1>
        </div>
      </div>

      {/* Видеоплеер на весь экран с наложением водяного знака */}
      <div className="flex-grow flex relative">
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-full h-full absolute">
            {/* Наложение полупрозрачного градиента на видео */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>

            {/* Водяной знак по центру */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-6xl md:text-8xl font-extrabold tracking-widest opacity-40 rotate-[-15deg] select-none"
                   style={{
                     textShadow: '0 0 5px rgba(0,0,0,0.5)',
                     letterSpacing: '0.1em',
                     fontFamily: 'Arial, sans-serif'
                   }}>
                SHAQYRU24
              </div>
            </div>

            {/* Водяной знак внизу */}
            <div className="absolute bottom-28 left-0 right-0 flex flex-col items-center justify-center space-y-1">
              <div className="text-white text-2xl md:text-3xl font-bold opacity-50 select-none"
                   style={{ textShadow: '0 0 3px rgba(0,0,0,0.7)' }}>
                SHAQYRU24
              </div>
            </div>

            {/* Новая красная лента "Ақшасы төленбеген" в правом верхнем углу */}
            <div className="absolute top-0 right-0 overflow-hidden w-40 h-40 z-20 select-none">
              <div className="bg-red-600 text-white font-bold py-2 text-center w-56 absolute top-8 right-[-50px] transform rotate-45"
                   style={{
                     boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                     textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
                   }}>
                {getUnpaidText()}
              </div>
            </div>
          </div>
        </div>

        {video_url && (
          <video
            ref={videoRef}
            src={video_url}
            poster={thumbnail}
            className="w-full h-full object-contain"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            playsInline
            autoPlay
            onClick={handlePlayPause}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          />
        )}

        {/* Кнопка воспроизведения по центру */}
        {!isPlaying && !isLoading && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10"
          >
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        {/* Информационный блок и кнопка внизу */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 z-10">
          <div className="max-w-md mx-auto">
            <div className="text-center text-white mb-4">
              <h2 className="font-bold text-lg mb-2">{getVideoReadyText()}</h2>
            </div>

            <button
              onClick={handleBuyClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-center font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              {getBuyButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use getServerSideProps to get the lang parameter on the server
export async function getServerSideProps(context) {
  // Get the lang parameter from URL
  const { lang } = context.params;

  // Verify it's a valid language
  const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';

  // Get translations for this language
  const langTranslations = translations[validLang] || translations['kz'];

  // Return data to the component
  return {
    props: {
      lang: validLang,
      translations: langTranslations
    }
  };
}
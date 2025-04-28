import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const ClothingTransformBlock = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [translations, setTranslations] = useState({});

  // Simple translation function
  const t = (key) => {
    try {
      const keys = key.split('.');
      let result = translations;

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

  // Load translations
  useEffect(() => {
    if (lang) {
      // Import translations based on language
      import('../../locales/translations').then(({ translations }) => {
        const currentLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
        setTranslations(translations[currentLang] || translations['kz']);
      });
    }
  }, [lang]);

  // Состояние для отслеживания текущей пары изображений и анимации
  const [currentPair, setCurrentPair] = useState(0);
  const [scanPosition, setScanPosition] = useState(-100); // Позиция сканера (-100 значит выше экрана)
  const [animationActive, setAnimationActive] = useState(true);
  // Ref для хранения ID анимации
  const animationRef = useRef(null);

  // Пары изображений (исходное и результат) с абсолютными путями
  const imagePairs = [
    {
      source: "/source_example.jpg", // Абсолютный путь с / в начале
      final: "/final_shaqyru_photo.jpg", // Абсолютный путь с / в начале
    },
    {
      source: "/source_example2.jpg", // Абсолютный путь с / в начале
      final: "/final_shaqyru_photo2.jpg", // Абсолютный путь с / в начале
    }
  ];

  // Функция для анимации сканирования
  const animateScan = () => {
    if (!animationActive) return;

    // Сбрасываем позицию сканера выше видимой области
    setScanPosition(-100);

    let startTime;
    const duration = 2000; // 2 секунды на полное сканирование

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Позиция сканера от -100% до 100% (сверху вниз)
      const newPosition = -100 + progress * 200;
      setScanPosition(newPosition);

      if (progress < 1 && animationActive) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        // После завершения сканирования, ждем 2 секунды и переходим к следующей паре
        setTimeout(() => {
          if (animationActive) {
            setCurrentPair((prev) => (prev + 1) % imagePairs.length);
          }
        }, 2000);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  // Запускаем анимацию при изменении пары или состояния анимации
  useEffect(() => {
    if (animationActive) {
      animateScan();
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentPair, animationActive]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {t('clothingTransform.proFeature')}
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold text-gray-800">
            {t('clothingTransform.title')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{t('clothingTransform.titleHighlight')}</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Анимация преобразования */}
          <div className="w-full md:w-1/2 mb-6 md:mb-0 relative">
            <div className="bg-white p-4 rounded-xl shadow-lg mx-auto max-w-xs sm:max-w-sm">
              {/* Контейнер для изображений с переходом */}
              <div className="relative rounded-lg overflow-hidden mx-auto" style={{ paddingBottom: '115%', width: '100%' }}>
                {/* Исходное фото (на переднем плане) */}
                <img
                  src={imagePairs[currentPair].source}
                  alt="Исходное фото"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Маска для итогового фото, которая будет увеличиваться при сканировании */}
                <div className="absolute inset-0 overflow-hidden"
                     style={{
                       clipPath: `polygon(0 0, 100% 0, 100% ${scanPosition < 0 ? 0 : scanPosition}%, 0 ${scanPosition < 0 ? 0 : scanPosition}%)`
                     }}>
                  {/* Итоговое фото в маске */}
                  <img
                    src={imagePairs[currentPair].final}
                    alt="Результат"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Аккуратный белый сканер */}
                <div
                  className="absolute left-0 right-0 h-2 pointer-events-none"
                  style={{
                    top: `${scanPosition}%`,
                    background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
                    boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                    transform: 'translateY(-50%)',
                    display: scanPosition > 100 ? 'none' : 'block'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Контент справа - более компактный */}
          <div className="md:w-1/2 md:pl-10">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">{t('clothingTransform.features.noPicture')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">{t('clothingTransform.features.noTime')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">{t('clothingTransform.features.changeBackground')}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  const tariffsSection = document.getElementById('tariffsSection');
                  if (tariffsSection) {
                    tariffsSection.scrollIntoView({behavior: 'smooth'});
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                {t('clothingTransform.viewProTariff')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingTransformBlock;
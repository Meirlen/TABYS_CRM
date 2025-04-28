import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const ExamplesGalleryBlock = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  // Получаем текущий язык для URL
  const currentLang = lang || (typeof window !== 'undefined' ? localStorage.getItem('language') : null) || 'kz';

  // Массив примеров сайтов-приглашений
  const siteExamples = [
    { id: 1, image: '/site_example_1.jpg', site_id: 18, url: "invite_kz" },
    { id: 2, image: '/site_example_2.jpg', site_id: 16, url: "invite_etno" },
    { id: 3, image: '/site_example_3.jpg', site_id: 17, url: "invite_photo" },
    { id: 4, image: '/site_example_4.jpg', site_id: 16, url: "invite_etno" },
    { id: 5, image: '/site_example_5.jpg', site_id: 16, url: "invite_digital" },
    { id: 6, image: '/site_example_6.jpg', site_id: 16, url: "invite_gray" },
  ];

  // Открытие предпросмотра
  const handlePreview = (site) => {
    setSelectedSite(site);
    setPreviewLoading(true);
    setShowPreview(true);
  };

  // Закрытие предпросмотра
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // Получение полного URL для предпросмотра через API
  const getPreviewUrl = (site) => {
    return `https://tyrasoft.kz/${currentLang}/${site.url}?site_id=${site.site_id}`;
  };

  return (
    <div className="py-6 bg-white">
      <div className="max-w-4xl mx-auto px-3">
        {/* Простой заголовок */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {t('examplesGallery.title')}
          </h2>
        </div>

        {/* Максимально простая галерея */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {siteExamples.map((example) => (
            <div
              key={example.id}
              className="overflow-hidden rounded-lg shadow-sm"
            >
              <div className="relative pb-[150%]">
                {/* Изображение - используем Next.js Image компонент */}
                <img
                  src={example.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Кнопка */}
                <div className="absolute bottom-2 inset-x-2">
                  <button
                    className="w-full bg-blue-500 text-white text-xs py-1.5 rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => handlePreview({url: example.url, site_id: example.site_id})}
                  >
                    {t('examplesGallery.viewSite')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet для предпросмотра */}
      {showPreview && selectedSite && (
        <div className="fixed inset-0 z-50">
          {/* Затемненный фон */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={handleClosePreview}
          ></div>

          {/* Контент - максимальная высота модального окна */}
          <div className="absolute inset-x-0 bottom-0 top-2 bg-white rounded-t-2xl shadow-xl overflow-hidden transform transition-transform duration-300 ease-out">
            {/* Шапка модалки со стильным заголовком и кнопкой */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-white">
              <div className="flex items-center">
                <h3 className="font-medium text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {t('examplesGallery.demoSite')}
                </h3>
              </div>
              <button
                onClick={handleClosePreview}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                {t('examplesGallery.close')}
              </button>
            </div>

            {/* Индикатор загрузки */}
            {previewLoading && (
              <div className="h-1 w-full bg-gray-100">
                <div className="h-1 bg-blue-500 animate-pulse w-3/5"></div>
              </div>
            )}

            {/* iframe для просмотра через API tyrasoft.kz */}
            <div style={{ height: 'calc(100% - 56px)' }}>
              <iframe
                src={getPreviewUrl(selectedSite)}
                className="w-full h-full border-0"
                title={t('examplesGallery.sitePreview')}
                onLoad={() => setPreviewLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamplesGalleryBlock;
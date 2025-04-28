import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный
import HeaderBack from "../../components/HeaderBack"; // Убедитесь, что путь корректный

// Определение типа шаблона
const Template = {
  id: Number,
  nameKey: String,
  url: String,
  icon: String,
  color: String
};

// Шаблоны
const templates = [
  {
    id: 1,
    nameKey: "styleSelector.templates.ethnicGold",
    url: "invite_etno",
    icon: "✨",
    color: "#F59E0B"
  },
  {
    id: 2,
    nameKey: "styleSelector.templates.ethnicGreen",
    url: "invite_kz",
    icon: "🌿",
    color: "#10B981"
  },
  {
    id: 3,
    nameKey: "styleSelector.templates.modernBlue",
    url: "invite_digital",
    icon: "💎",
    color: "#3B82F6"
  },
  {
    id: 4,
    nameKey: "styleSelector.templates.modernLight",
    url: "invite_photo",
    icon: "🤍",
    color: "#9CA3AF"
  },
  {
    id: 5,
    nameKey: "styleSelector.templates.modernGray",
    url: "invite_gray",
    icon: "🖤",
    color: "#4B5563"
  },
];

export default function StyleSelector({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id: querySiteId, category_name, type } = router.query;

  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [siteId, setSiteId] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

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

  // Получаем site_id из URL
  useEffect(() => {
    if (querySiteId) {
      setSiteId(querySiteId);
    }
  }, [querySiteId]);

  // Открыть предпросмотр
  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewLoading(true);
    setShowPreview(true);
  };

  // Закрыть предпросмотр
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // Построить URL для предпросмотра
  const getPreviewUrl = (template) => {
    return `https://tyrasoft.kz/${currentLang}/${template.url}?site_id=${siteId}`;
  };

  // Обработка выбора шаблона
  const handleSelectTemplate = () => {
    if (!selectedTemplate) return;

    // Формируем URL для перенаправления
    const whatsappUrl = `/${currentLang}/send_whatsapp?site_id=${siteId}&category_name=${category_name || "sundet"}&type=${type || "photo"}&style_type=${selectedTemplate.url}`;

    // Переходим на страницу отправки WhatsApp
    router.push(whatsappUrl);
    console.log(`Selected template: ${getTranslation(selectedTemplate.nameKey)}`);
    handleClosePreview();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <Head>
        <title>{getTranslation('styleSelector.title') || 'Выбор стиля'}</title>
        <meta name="description" content={getTranslation('styleSelector.description') || 'Выберите стиль оформления для вашего сайта'} />
      </Head>

      {/* Top bar */}
      <HeaderBack title={getTranslation('styleSelector.title')} />

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-6">
          {getTranslation('styleSelector.instruction')}
        </p>

        {/* Template list */}
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              <div className="flex items-center p-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                  style={{ backgroundColor: `${template.color}10` }}
                >
                  <span className="text-2xl">{template.icon}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{getTranslation(template.nameKey)}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    {getTranslation('styleSelector.preview')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information */}
        <div className="mt-8 text-xs text-gray-400 text-center">
          {getTranslation('styleSelector.hint')}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 z-50">
          {/* Darkened background */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={handleClosePreview}
          ></div>

          {/* Content - maximum height of modal window */}
          <div className="absolute inset-x-0 bottom-0 top-2 bg-white rounded-t-2xl shadow-xl overflow-hidden transform transition-transform duration-300 ease-out">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-xl mr-2">{selectedTemplate.icon}</span>
                <h3 className="font-medium">{getTranslation(selectedTemplate.nameKey)}</h3>
              </div>
              <button
                onClick={handleClosePreview}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Loading indicator */}
            {previewLoading && (
              <div className="h-1 w-full bg-gray-100">
                <div className="h-1 bg-blue-500 animate-pulse w-3/5"></div>
              </div>
            )}

            {/* External preview frame */}
            <div style={{ height: 'calc(100% - 160px)' }}>
              <iframe
                src={getPreviewUrl(selectedTemplate)}
                className="w-full h-full border-0"
                title={`Preview - ${getTranslation(selectedTemplate.nameKey)}`}
                onLoad={() => setPreviewLoading(false)}
              />
            </div>

            {/* Bottom panel with fixed color button */}
            <div className="p-4 border-t border-gray-100">
              <button
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                onClick={handleSelectTemplate}
              >
                {getTranslation('styleSelector.selectThis')}
              </button>
            </div>
          </div>
        </div>
      )}
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
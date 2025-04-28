import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../components/HeaderBack'; // Adjust the path as needed
import { translations } from '../../locales/translations'; // Adjust the path as needed
import { fetchTemplates } from '../../utils/api';
import TemplateCard from '../../components/TemplateCard';
import VideoModal from '../../components/VideoModal';

export default function TemplatesPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleBackToHome = () => {
    // Redirect to the home page
    router.push(`/${currentLang}/home`);
  };

  useEffect(() => {
    // Update language when client navigation changes
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
    // Fetch templates data from API
    const getTemplates = async () => {
      try {
        setLoading(true);
        const data = await fetchTemplates();
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getTemplates();
  }, []);

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

  const handleWatchClick = (template) => {
    setSelectedTemplate(template);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedTemplate(null);
  };

  // For demo/testing - add sample templates if none exist
  useEffect(() => {
    if (!loading && templates.length === 0 && !error) {
      // Sample templates for testing - YouTube videos
      const sampleTemplates = [];
      for (let i = 0; i < 6; i++) {
        sampleTemplates.push({
          canva_id: `EAGlrQnBsAw${i}`,
          template_name: `Тойға шақыру #${i + 1}`,
          template_type: "mp4",
          category_name: "wedding",
          page_count: 4,
          // Возвращаемся к YouTube ссылкам
          thumbnail: `https://www.youtube.com/shorts/9nZeZfTLbGg`,
          id: i + 1 // Важно! Используем id вместо template_id
        });
      }
      setTemplates(sampleTemplates);
    }
  }, [loading, templates.length, error]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('templates.title') || 'Видео шаблоны'} | Your Site Name</title>
        <meta name="description" content={getTranslation('templates.description') || 'Выберите видео шаблон для вашего проекта'} />
      </Head>

      {/* HeaderBack component with localized title */}
      <HeaderBack
        title={getTranslation('templates.title') || 'Видео шаблоны'}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <p>Ошибка загрузки шаблонов: {error}</p>
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-center">
            <p>Шаблоны не найдены</p>
          </div>
        )}

        {/* Templates grid - плотная сетка с квадратными блоками */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {templates.map((template, index) => (
            <TemplateCard
              key={template.id || template.canva_id || index}
              template={template}
              onWatchClick={handleWatchClick}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedTemplate && (
        <VideoModal
          template={selectedTemplate}
          onClose={closeVideoModal}
          getTranslation={getTranslation}
        />
      )}
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
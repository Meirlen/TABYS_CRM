import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../components/HeaderBack'; // Adjust the path as needed
import { categories } from '../../utils/constants'; // Adjust the path as needed
import { translations } from '../../locales/translations'; // Adjust the path as needed

// Define attractive color gradients for each category
const categoryData = categories;

export default function CategoryPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, type: event_type, tariff, site_id, design_type } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});
  const [showModal, setShowModal] = useState(false);


//  // Внутри компонента CategoryPage добавляем:
//    const handleBackToHome = () => {
//      // Явно перенаправляем на домашнюю страницу вместо предыдущей в истории
//      router.push(`/${currentLang}/home`);
//    };

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

  // Function to get translations from nested keys (similar to t from useSimpleTranslation)
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

  // Category selection handler
  const handleCategorySelect = (route) => {
    // Check if design_type exists and is not empty
    if (design_type) {
      // If design_type exists, navigate to templates with the actual design_type parameter value
      router.push(`/${currentLang}/templates?design_type=${design_type}&?category_name=${route}`);
    } else {
      // Create base URL with language prefix and required parameters
      let url = `/${currentLang}/create_param?category_name=${route}&type=${event_type}&tariff=${tariff}`;

      // If site_id is present, add it to URL
      if (site_id) {
        url += `&site_id=${site_id}`;
      }

      router.push(url);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('category.title')} | Your Site Name</title>
        <meta name="description" content={getTranslation('category.description') || 'Choose a category for your site'} />
      </Head>

      {/* HeaderBack component with localized title */}
      <HeaderBack
        title={getTranslation('category.title')}
//        onBack={handleBackToHome}
      />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Instruction */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start">
          <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-blue-800 text-sm">
            {site_id ?
              getTranslation('category.instruction_edit') || 'Выберите новую категорию для редактирования вашего сайта' :
              getTranslation('category.instruction')}
          </p>
        </div>

        {/* Categories list */}
        <ul className="space-y-3">
          {categoryData.map((category, index) => (
            <li key={index}>
              <button
                onClick={() => handleCategorySelect(category.route)}
                className={`w-full bg-white hover:bg-gradient-to-r ${category.gradient} group hover:text-white text-left rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-center p-4">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-lg bg-gradient-to-r ${category.gradient} flex items-center justify-center mr-4 text-2xl group-hover:bg-white group-hover:bg-opacity-20`}>
                    {category.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800 group-hover:text-white transition-colors">{category.label}</h3>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white group-hover:bg-opacity-20 transition-colors">
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{getTranslation('category.modal.title')}</h2>
            <p className="text-gray-600 mb-6">{getTranslation('category.modal.message')}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-5 rounded-lg transition-colors"
              >
                {getTranslation('category.modal.closeButton')}
              </button>
            </div>
          </div>
        </div>
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
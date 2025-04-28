import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../components/HeaderBack'; // Adjust the path as needed
import { translations } from '../../locales/translations'; // Adjust the path as needed

// Define invitation types without routes (routes will be built with current language)
const getInvitationTypes = (t) => [
  {
    id: 'website',
    routePath: '/CategoryPage?type=photo&tariff=standart',
    title: t?.invitation?.types?.websiteType?.title || 'Сайт шақыру',
    features: t?.invitation?.types?.websiteType?.features || [
      'Пожелания',
      'Ссылка на 2GIS',
      'Фотогалерея',
      'Персонально можно настроить',
      'Несколько видов дизайн'
    ],
    price: t?.invitation?.types?.websiteType?.price || '4900 ₸',
    gradient: 'from-blue-600 to-cyan-400',
    icon: '🌐'
  },
  {
    id: 'video',
    routePath: '/CategoryPage?design_type=mp4',
    title: t?.invitation?.types?.videoType?.title || 'Видео шақыру',
    features: t?.invitation?.types?.videoType?.features || [
      'Более 100 видов видео приглашений',
      'Персональное пригласительное'
    ],
    price: t?.invitation?.types?.videoType?.price || '1500 ₸',
    gradient: 'from-violet-600 to-fuchsia-400',
    icon: '🎬'
  }
];

export default function InvitationTypePage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});
  // Get invitation types based on current translations
  const [invitationTypes, setInvitationTypes] = useState([]);


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
    // Update invitation types whenever translations change
    setInvitationTypes(getInvitationTypes(t));
  }, [t]);


  //  // Внутри компонента CategoryPage добавляем:
   const handleBackToHome = () => {
      // Явно перенаправляем на домашнюю страницу вместо предыдущей в истории
      router.push(`/${currentLang}/home`);
    };

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

  // Handle invitation type selection
  const handleTypeSelect = (route) => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');

    if (!token) {
      // If user is not authenticated, redirect to login page
      // with callbackUrl indicating where to return after auth
      router.push({
        pathname: `/${currentLang}/login`,
        query: { callbackUrl: `/${currentLang}${route}` }
      });
    } else {
      // If user is authenticated, go directly to the category page
      // with current language prefix
      router.push(`/${currentLang}${route}`);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('invitation.types.title') || 'Выбор типа шақыру'} | Your Site Name</title>
        <meta name="description" content={getTranslation('invitation.types.description') || 'Выберите тип шақыру для создания'} />
      </Head>

      {/* HeaderBack component with localized title */}
      <HeaderBack
        title={getTranslation('invitation.types.title') || 'Типы шақыру'}
        onBack={handleBackToHome}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page title with creative design */}


        {/* Invitation types list */}
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {invitationTypes.map((type) => (
            <li key={type.id} className="transform transition-all duration-300 hover:scale-[1.02]">
              <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden h-full flex flex-col relative">
                {/* Better price label that's clearly visible */}
                <div className="absolute top-6 right-0 z-10">
                  <div className={`py-2 px-4 bg-white shadow-md text-lg font-black rounded-l-lg border-l-4 border-${type.id === 'website' ? 'blue' : 'purple'}-600`}>
                    <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">{type.price}</span>
                  </div>
                </div>

                <div className={`w-full h-4 bg-gradient-to-r ${type.gradient}`}></div>
                <div className="p-6 flex flex-col h-full relative">
                  {/* No duplicate price here - removed */}

                  <div className="flex items-center mb-5">
                    <div className={`w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-r ${type.gradient} flex items-center justify-center mr-4 text-3xl text-white shadow-md`}>
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-gray-800">{type.title}</h3>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 pl-4 flex-grow">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleTypeSelect(type.routePath)}
                      className={`w-full py-4 rounded-xl bg-gradient-to-r ${type.gradient} text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center`}
                    >
                      <span>{getTranslation('invitation.types.selectButton') || 'Таңдау'}</span>
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Common description at the bottom with creative style */}
        <div className="mt-12 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          {/* Background design */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"></div>

          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-white opacity-10"></div>
            <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-white opacity-10"></div>
            <div className="absolute left-1/4 bottom-0 w-12 h-12 rounded-full bg-white opacity-10"></div>
            <div className="absolute right-1/4 top-0 w-8 h-8 rounded-full bg-white opacity-10"></div>
          </div>

          {/* Content */}
          <p className="text-white font-bold text-lg relative z-10">
            {getTranslation('invitation.types.bottomDescription') || 'Нарықтағы ең төмен бағалар! 5 минут ішінде заманауи шақыру алыңыз!'}
          </p>
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
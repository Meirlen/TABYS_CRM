import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AdvantagesBlock = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [currentLang, setCurrentLang] = useState('kz');

  // Hardcoded translations
  const hardcodedTranslations = {
    ru: {
      title: "Преимущества",
      items: [
        {
          id: 'speed',
          title: "Быстро готово - 5 минут",
          description: "Ваш сайт будет готов после нескольких кликов",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          ),
          color: 'from-blue-400 to-blue-500'
        },
        {
          id: 'personalized',
          title: "Персонализированные приглашения",
          description: "Создайте индивидуальное приглашение для каждого гостя по имени",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          ),
          color: 'from-yellow-400 to-yellow-500'
        },
        {
          id: 'aiPhoto',
          title: "ИИ улучшает фото",
          description: "Нет необходимости искать профессионального фотографа",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          ),
          color: 'from-green-400 to-green-500'
        },
        {
          id: 'aiVoice',
          title: "Дикторский голос с помощью ИИ",
          description: "Нет необходимости искать дорогого диктора",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          ),
          color: 'from-purple-400 to-purple-500'
        },
        {
          id: 'guestComments',
          title: "Гости могут оставлять комментарии",
          description: "Ответы приду/не приду",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          ),
          color: 'from-pink-400 to-pink-500'
        },
        {
          id: 'mobileDesign',
          title: "Удобный мобильный дизайн",
          description: "Отлично выглядит и на телефоне",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          ),
          color: 'from-indigo-400 to-indigo-500'
        }
      ]
    },
    en: {
      title: "Why Shaqyru24?",
      items: [
        {
          id: 'economic',
          title: "Economical",
          description: "Invitations starting from 2900 tenge. Save compared to traditional printed invitations.",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ),
          color: 'from-green-400 to-green-500'
        },
        {
          id: 'speed',
          title: "Fast and Convenient",
          description: "Create an invitation in 5 minutes — directly from your phone, without downloading any software.",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          ),
          color: 'from-blue-400 to-blue-500'
        },
        {
          id: 'aiTech',
          title: "AI Technologies",
          description: "Photo processing and professional voice creation using advanced AI.",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          ),
          color: 'from-purple-400 to-purple-500'
        },
        {
          id: 'management',
          title: "Easy Management",
          description: "Automatically track the number of attending guests and their responses.",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          ),
          color: 'from-yellow-400 to-yellow-500'
        }
      ]
    },
    kz: {
      title: "Неге SHAQYRU24 таңдаймын?",
      items: [
        {
          id: 'speed',
          title: "5 минутта жасап аласыз",
          description: "Бірнеше рет басу арқылы сайтыңыз дайын болады",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          ),
          color: 'from-blue-400 to-blue-500'
        },
        {
          id: 'personalized',
          title: "Персоналды шақыртулар",
          description: "Әр қонаққа жеке есімімен арнайы шақырту жасай аласыз",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          ),
          color: 'from-yellow-400 to-yellow-500'
        },
        {
          id: 'aiPhoto',
          title: "ИИ фотоны жақсартады",
          description: "ИИ арқылы өз суреттеріңізді өңдеу мүмкіндігі",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          ),
          color: 'from-green-400 to-green-500'
        },
        {
          id: 'aiVoice',
          title: "Диктор дауысы ИИ арқылы",
          description: "ИИ арқылы шынайы диктордың дауысын қоса аласыз",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          ),
          color: 'from-purple-400 to-purple-500'
        },
        {
          id: 'guestComments',
          title: "Қонақтар пікір қалдыра алады",
          description: "Қонақтарыңыздың санын келемін|келмеймін жауаптары арқылы біле аласыз",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          ),
          color: 'from-pink-400 to-pink-500'
        },
        {
          id: 'mobileDesign',
          title: "Ыңғайлы мобильді дизайн",
          description: "Телефонда да керемет көрінеді",
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          ),
          color: 'from-indigo-400 to-indigo-500'
        }
      ]
    }
  };

  useEffect(() => {
    if (lang) {
      // Ensure lang is a string, not an array
      const langValue = Array.isArray(lang) ? lang[0] : lang;
      setCurrentLang(['kz', 'ru', 'en'].includes(langValue) ? langValue : 'kz');
    }
  }, [lang]);

  // Get the current translations
  const translations = hardcodedTranslations[currentLang] || hardcodedTranslations.kz;

  return (
    <div className="my-12">
      {/* Заголовок с декоративными элементами */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
        <h2 className="text-2xl font-bold text-gray-800 bg-gray-50 px-6 relative z-10">
          {translations.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {translations.items.map((advantage) => (
          <div
            key={advantage.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-12 w-12 bg-gradient-to-br ${advantage.color} rounded-lg flex items-center justify-center mr-4 shadow-md`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {advantage.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-lg">{advantage.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{advantage.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvantagesBlock;
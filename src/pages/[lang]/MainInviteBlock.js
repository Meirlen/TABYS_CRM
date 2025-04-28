import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const MainInviteBlock = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [translations, setTranslations] = useState({});
  const [showInviteExample, setShowInviteExample] = useState(false);
  const [showGuestsScreen, setShowGuestsScreen] = useState(false);

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

  const steps = [
    {
      id: 'website',
      step: "1",
      title: t('mainInvite.steps.website.title'),
      description: t('mainInvite.steps.website.description'),
      action: {
        type: 'link',
        url: 'https://shaqyru24.kz/invite_photo?site_id=13',
        label: t('mainInvite.steps.website.action')
      }
    },
    {
      id: 'social',
      step: "2",
      title: t('mainInvite.steps.social.title'),
      description: t('mainInvite.steps.social.description'),
      action: {
        type: 'button',
        handler: () => setShowInviteExample(true),
        label: t('mainInvite.steps.social.action')
      },
      modalTitle: t('mainInvite.steps.social.modalTitle'),
      modalInfo: t('mainInvite.steps.social.modalInfo'),
      advantages: t('mainInvite.steps.social.advantages')
    },
    {
      id: 'guests',
      step: "3",
      title: t('mainInvite.steps.guests.title'),
      description: t('mainInvite.steps.guests.description'),
      action: {
        type: 'button',
        handler: () => setShowGuestsScreen(true),
        label: t('mainInvite.steps.guests.action')
      },
      modalTitle: t('mainInvite.steps.guests.modalTitle'),
      modalInfo: t('mainInvite.steps.guests.modalInfo'),
      advantages: t('mainInvite.steps.guests.advantages')
    }
  ];

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-hidden">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] my-8 flex flex-col shadow-lg relative">
          {/* Fixed position header */}
          <div className="sticky top-0 p-4 flex justify-between items-center border-b flex-shrink-0 bg-white z-10 rounded-t-lg">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="p-4 overflow-y-auto flex-grow">
            {children}
          </div>

          {/* Fixed position footer */}
          <div className="sticky bottom-0 p-4 border-t flex-shrink-0 bg-white z-10 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
            >
              {t('mainInvite.closeButton')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Utility function to safely get the advantages title
  const getAdvantagesTitle = (stepId) => {
    try {
      return stepId === 'social'
        ? t('mainInvite.steps.social.advantages.title')
        : t('mainInvite.steps.guests.advantages.title');
    } catch (e) {
      return '';
    }
  };

  // Utility function to safely get advantages items
  const getAdvantagesItems = (stepId) => {
    try {
      const items = stepId === 'social'
        ? t('mainInvite.steps.social.advantages.items')
        : t('mainInvite.steps.guests.advantages.items');

      // Handle different potential return types
      if (Array.isArray(items)) {
        return items;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
          {t('mainInvite.title')}
        </h1>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={step.action.type === 'button' ? step.action.handler : undefined}
            >
              <div className="mr-4 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {step.step}
                </div>
                <div className="text-xs text-center text-blue-600 font-medium mt-1">
                  {t('mainInvite.stepLabel')}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>

                {step.action.type === 'link' ? (
                  <a
                    href={step.action.url}
                    className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium"
                  >
                    {step.action.label}
                  </a>
                ) : (
                  <button
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium"
                  >
                    {step.action.label}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {steps.filter(s => s.action.type === 'button').map(step => (
        <Modal
          key={step.id}
          show={step.id === 'social' ? showInviteExample : showGuestsScreen}
          onClose={() => step.id === 'social' ? setShowInviteExample(false) : setShowGuestsScreen(false)}
          title={step.modalTitle || ''}
        >
          <div className="rounded-lg overflow-hidden mb-4 border shadow-sm">
            <img
              src={step.id === 'social' ? 'invite_example.png' : 'guests_screen.png'}
              alt={`${step.modalTitle}`}
              className="w-full h-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {step.modalInfo}
          </p>

          {/* Advantages rendering using separate utility functions */}
          <div className="border rounded-lg mb-4">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-medium text-sm">
                {getAdvantagesTitle(step.id)}
              </h4>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {getAdvantagesItems(step.id).length > 0 ? (
                  getAdvantagesItems(step.id).map((advantage, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{advantage}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm">Нет данных</li>
                )}
              </ul>
            </div>
          </div>
        </Modal>
      ))}
    </>
  );
};

export default MainInviteBlock;
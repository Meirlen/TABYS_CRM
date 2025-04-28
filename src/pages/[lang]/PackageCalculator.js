import { useState } from 'react';
import Head from 'next/head';

const PackageCalculator = ({ translations }) => {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(10);

  // Pricing constants
  const REGULAR_PRICE = 2900;
  const DISCOUNT_PRICE = 1900;

  // Helper function to get translation
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

  // Calculate savings
  const calculateSavings = () => {
    const regularTotal = quantity * REGULAR_PRICE;
    const discountTotal = quantity * DISCOUNT_PRICE;
    return regularTotal - discountTotal;
  };

  // Contact via WhatsApp
  const handleContactViaWhatsApp = () => {
    const message = encodeURIComponent(
      t('packageCalculator.contactCta.message')
    );
    window.open(`https://wa.me/77765444666?text=${message}`, '_blank');
    setShowModal(false);
  };

  // Modal component
  const Modal = ({ show, onClose, children }) => {
    if (!show) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  };

  // Open modal handler
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Helper function to get modal selected text with count
  const getSelectedText = () => {
    const baseText = t('packageCalculator.modal.youSelected');
    return baseText.replace('{count}', quantity.toString());
  };

  return (
    <>
      <Head>
        <title>{t('packageCalculator.title')} | Shaqyru24.kz</title>
        <meta name="description" content={t('packageCalculator.mainHeader.description')} />
      </Head>

      <div className="py-12 px-4 md:px-0">
        {/* Header with decorative elements */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
          <h2 className="text-2xl font-bold text-gray-800 bg-white px-6 relative z-10">
            {t('packageCalculator.title')}
          </h2>
        </div>

        {/* Main content */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 max-w-4xl mx-auto">
          <div className="p-6 md:p-8">
            {/* Main header */}
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                {t('packageCalculator.mainHeader.title')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">{t('packageCalculator.mainHeader.titleHighlight')}</span>
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('packageCalculator.mainHeader.description')}
              </p>
            </div>

            {/* Package */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">{t('packageCalculator.standard.title')}</h4>
                    <div className="bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full text-sm">
                      {t('packageCalculator.standard.badge')}
                    </div>
                  </div>

                  {/* Calculator */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-700 mb-3">{t('packageCalculator.standard.chooseLabelText')}</h5>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setQuantity(Math.max(10, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold text-gray-800">{quantity} {t('packageCalculator.standard.countText')}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('packageCalculator.standard.discountedPrice')}</span>
                        <span className="font-medium text-blue-600">{(quantity * DISCOUNT_PRICE).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium text-gray-700">{t('packageCalculator.standard.youSave')}</span>
                        <span className="font-bold text-green-600">{calculateSavings().toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenModal}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    {t('packageCalculator.standard.buyButton')}
                  </button>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                {t('packageCalculator.contactCta.description')}
              </p>
              <button
                onClick={handleContactViaWhatsApp}
                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.9-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                {t('packageCalculator.contactCta.button')}
              </button>
            </div>
          </div>
        </div>

        {/* Modal for purchase details */}
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {t('packageCalculator.standard.title')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-blue-50 border-blue-100 rounded-xl p-4 mb-5 border">
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">
                  {getSelectedText()}
                </p>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span>{t('packageCalculator.modal.discountedPrice')}</span>
                    <span className="font-medium text-blue-600">
                      {(quantity * DISCOUNT_PRICE).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="font-medium">{t('packageCalculator.modal.youSave')}</span>
                    <span className="font-bold text-green-600">
                      {calculateSavings().toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleContactViaWhatsApp}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.9-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                {t('packageCalculator.modal.orderViaWhatsApp')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all"
              >
                {t('packageCalculator.modal.closeButton')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

// Example usage in a page file
export default function PackageCalculatorPage({ translations }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PackageCalculator translations={translations} />
    </div>
  );
}

// Server-side props to get translations
export async function getServerSideProps(context) {
  // Get language from context or use default
  const { locale } = context;
  const lang = locale || 'kz';

  // Import translations (adjust the import based on your project structure)
  const { translations } = await import('../../locales/translations');

  return {
    props: {
      translations: translations[lang] || translations['kz']
    }
  };
}
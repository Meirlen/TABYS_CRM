import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, Map, Edit3, Share2, Users, Settings, Check, XCircle, ChevronRight } from 'react-feather';

const MySites = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
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

  // Theme options
  const themeOptions = [
    { label: 'Ақ фон', value: '0' },
    { label: 'Қараңғы фон', value: '1' },
    { label: 'Үлгімен сары фон', value: '2' },
    { label: 'Гүлді ашық фон', value: '3' },
  ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Check if we're running on the client
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/${lang}/login`);
        return;
      }

      try {
        const sitesResponse = await fetch('https://tyrasoft.kz/sites/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!sitesResponse.ok) {
          throw new Error(`HTTP қатесі! Статус: ${sitesResponse.status}`);
        }
        const sitesData = await sitesResponse.json();
        setSites(sitesData);

        const subResponse = await fetch('https://tyrasoft.kz/api/v1/user_legendo/subscription_status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!subResponse.ok) {
          console.warn('Жазылым статусы табылмады:', subResponse.status);
          setSubscription({
            status: 'expired',
            subscription_expires_at: null,
            remaining_days: 0,
            message: 'Жазылым табылмады немесе мерзімі өткен.',
          });
          return;
        }
        const subData = await subResponse.json();
        setSubscription(subData);
      } catch (err) {
        setError(err.message);
        console.error('Деректерді жүктеу қатесі:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, lang]);

  // Create new site
  const handleCreateSiteClick = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.push(`/${lang}/home`);
      } else {
        router.push(`/${lang}/login`);
      }
    }
  };

  // Open site based on its type
  const handleOpenSite = (siteId) => {
    const site = sites.find((s) => s.id === siteId);
    if (site?.video_link === 'wedding') {
      router.push(`/${lang}/wedding?site_id=${siteId}&theme=0`);
    }
    else if (site?.video_link === 'photo') {
      router.push(`/${lang}/invite_photo?site_id=${siteId}&theme=0`);
    }
    else {
      setSelectedSiteId(siteId);
      setShowThemeSelector(true);
    }
  };

  // Edit site
  const handleEditSite = (siteId, siteType, tariff = 'standart') => {
    router.push(`/${lang}/CategoryPage?type=${siteType}&tariff=${tariff}&site_id=${siteId}`);
  };

  // View admin panel
  const handleAdminClick = (siteId) => {
    router.push(`/${lang}/invite_list?event_id=${siteId}`);
  };

  // Go to settings
  const handleSettingsClick = () => {
    router.push(`/${lang}/Profile`);
  };

  // Share site via WhatsApp
  const handleShareWhatsApp = (siteId, theme) => {
    const shareUrl = `https://toitrend.kz/invite?site_id=${siteId}&theme=${theme}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
    window.open(whatsAppUrl, '_blank');
  };

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('kk-KZ', options);
  };

  // Helper to truncate text
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span>Жүктелуде...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-red-900 p-4 rounded-lg text-center">
          <p>Қате: {error}</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Жазылым туралы ақпарат жүктелуде...</p>
      </div>
    );
  }

  const shouldShowExpirationMessage = subscription.status === 'active' && subscription.remaining_days <= 7;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Subscription warning */}
        {shouldShowExpirationMessage && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-orange-500">
            <div className="flex items-start">
              <div className="mr-2 text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">Тест мерзімі аяқталуға жақын. {subscription.remaining_days} күн қалды!</p>
                {subscription.subscription_expires_at && (
                  <p className="text-sm text-gray-600 mt-1">
                    Аяқталу күні: {new Date(subscription.subscription_expires_at).toLocaleString()}
                  </p>
                )}
                <button
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm transition-colors flex items-center"
                  onClick={() => window.location.href = 'https://wa.me/87711474766'}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                  </svg>
                  WhatsApp: 87711474766
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sites list */}
        {subscription.status === 'active' ? (
          <div className="space-y-4">
            {sites.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">Сізде әлі сайт жоқ.</p>
              </div>
            ) : (
              sites.map((site) => (
                <div key={site.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Site image */}
                    <div className="md:w-1/3">
                      <div className="relative h-48 md:h-full">
                        <img
                          src={site.photo_link || `https://tyrasoft.kz/uploads/compressed_toitrend_${site.id}.jpg`}
                          alt={site.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                        {/* Payment status badge */}
                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium flex items-center ${site.is_paid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {site.is_paid ? (
                            <>
                              <Check size={14} className="mr-1" />
                              <span>Төленген</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="mr-1" />
                              <span>Төленбеген</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Site details */}
                    <div className="p-4 md:w-2/3">
                      <div className="flex justify-between items-start">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {site.title || truncateText(site.invitation_text, 30)}
                        </h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full uppercase">
                          {site.tariff || 'standart'}
                        </span>
                      </div>

                      {/* Site metadata */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          <span>{formatDate(site.event_datetime)}</span>
                        </div>

                        {site.city && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Map size={16} className="mr-2" />
                            <span>{site.city}, {site.address}</span>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 mt-2">
                          {truncateText(site.invitation_text, 100)}
                        </p>
                      </div>

                      {/* Actions - Only Edit and Admin buttons - BIGGER for mobile */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleEditSite(site.id, site.video_link === 'photo' ? 'photo' : 'video', site.tariff)}
                          className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                        >
                          <Edit3 size={20} className="mr-2" />
                          Өзгерту
                        </button>

                        <button
                          onClick={() => handleAdminClick(site.id)}
                          className="py-3 px-4 bg-purple-600 text-white rounded-lg text-base font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                        >
                          <Users size={20} className="mr-2" />
                          Админ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Жазылымыңыз белсенді емес. Жазылым сатып алу үшін бізге хабарласыңыз.</p>
            <button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors inline-flex items-center"
              onClick={() => window.location.href = 'https://wa.me/87711474766'}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
              </svg>
              WhatsApp: 87711474766
            </button>
          </div>
        )}
      </div>

      {/* Theme selector modal */}
      {showThemeSelector && selectedSiteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5">
            <h2 className="text-lg font-semibold mb-4 text-center">Тақырыпты таңдаңыз</h2>
            <div className="space-y-3">
              {themeOptions.map((theme) => (
                <div key={theme.value} className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      router.push(`/${lang}/invite?site_id=${selectedSiteId}&theme=${theme.value}`);
                      setShowThemeSelector(false);
                    }}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {theme.label}
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(selectedSiteId, theme.value)}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                    </svg>
                    WhatsApp
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowThemeSelector(false)}
              className="w-full mt-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Болдырмау
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySites;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Edit3, Users } from 'react-feather'; // Import the icons we need

// Plain JavaScript component with no TypeScript syntax
const LatestSitesBlock = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [latestSite, setLatestSite] = useState(null);
  const [totalSites, setTotalSites] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  useEffect(() => {
    const fetchLatestSites = async () => {
      // Only run in client-side
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      try {
        const response = await fetch('https://tyrasoft.kz/sites/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Set total sites count
          setTotalSites(data.length);
          // Get only the latest site
          if (data.length > 0) {
            setLatestSite(data[0]);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке сайтов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSites();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('kk-KZ', options);
  };

  // Handle edit site click
  const handleEditSite = (e, site) => {
    e.stopPropagation(); // Prevent parent card click
    const siteType = site.video_link === "photo" ? "photo" : "video";
    router.push(`/${lang}/CategoryPage?type=${siteType}&tariff=${site.tariff || 'standart'}&site_id=${site.id}`);
  };

  // Handle admin click
  const handleAdminClick = (e, siteId) => {
    e.stopPropagation(); // Prevent parent card click
    router.push(`/${lang}/invite_list?event_id=${siteId}`);
  };

  // If user is not logged in or has no sites, don't show the block
  if (!isLoggedIn || (!latestSite && !loading)) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-gray-800">Ваши последние сайты</h2>
          <div className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {totalSites}
          </div>
        </div>
        <button
          onClick={() => router.push(`/${lang}/my_sites`)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Смотреть все
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : latestSite ? (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden cursor-pointer"
             onClick={() => router.push(`/${lang}/my_sites?site_id=${latestSite.id}`)}>
          <div className="relative h-32">
            <img
              src={latestSite.photo_link || `https://tyrasoft.kz/uploads/compressed_toitrend_${latestSite.id}.jpg`}
              alt={latestSite.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Handle image loading error
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x200?text=Приглашение';
              }}
            />
            <div
              className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                latestSite.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {latestSite.is_paid ? t('latestSites.paid') || 'Оплачено' : t('latestSites.unpaid') || 'Не оплачено'}
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{latestSite.title}</h3>
            <p className="text-sm text-gray-500 mb-3">
              <span className="inline-block mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              {formatDate(latestSite.event_datetime)}
            </p>

            {/* Action buttons for Edit and Admin */}
            <div className="flex space-x-2 mt-1">
              <button
                onClick={(e) => handleEditSite(e, latestSite)}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors flex items-center justify-center"
              >
                <Edit3 size={14} className="mr-1" />
                {t('latestSites.edit') || 'Өзгерту'}
              </button>

              <button
                onClick={(e) => handleAdminClick(e, latestSite.id)}
                className="flex-1 py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-medium rounded-md transition-colors flex items-center justify-center"
              >
                <Users size={14} className="mr-1" />
                {t('latestSites.admin') || 'Админ'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LatestSitesBlock;
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../../components/HeaderBack';
import { translations } from '../../../locales/translations';

export default function ExpertsListPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, specialization, city, search } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    specialization: specialization || '',
    city: city || '',
    search: search || '',
  });

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

  // Fetch experts on component mount and when filters change
  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        if (filter.specialization) queryParams.append('specialization', filter.specialization);
        if (filter.city) queryParams.append('city', filter.city);
        if (filter.search) queryParams.append('search', filter.search);

        const url = `/api/v2/experts/search?${queryParams.toString()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setExperts(data);
        } else {
          console.error('Failed to fetch experts');
        }
      } catch (error) {
        console.error('Error fetching experts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [filter]);

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams(router.query);

    if (filter.specialization) {
      queryParams.set('specialization', filter.specialization);
    } else {
      queryParams.delete('specialization');
    }

    if (filter.city) {
      queryParams.set('city', filter.city);
    } else {
      queryParams.delete('city');
    }

    if (filter.search) {
      queryParams.set('search', filter.search);
    } else {
      queryParams.delete('search');
    }

    router.replace(
      {
        pathname: `/${currentLang}/experts`,
        query: queryParams.toString()
      },
      undefined,
      { shallow: true }
    );
  }, [filter, currentLang, router]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Filter is already updated on input change, no need to do anything else
  };

  // Handle click on expert card
  const handleExpertClick = (expertId) => {
    router.push(`/${currentLang}/experts/${expertId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('experts.title') || 'Experts'} | Your Site Name</title>
        <meta
          name="description"
          content={getTranslation('experts.description') || 'Find and connect with experts in various fields'}
        />
      </Head>

      {/* HeaderBack component */}
      <HeaderBack
        title={getTranslation('experts.title') || 'Experts'}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and filter section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('experts.search.label') || 'Search'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filter.search}
                    onChange={handleFilterChange}
                    placeholder={getTranslation('experts.search.placeholder') || 'Search by name or expertise...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Specialization filter */}
              <div className="md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('experts.filter.specialization') || 'Specialization'}
                </label>
                <select
                  name="specialization"
                  value={filter.specialization}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{getTranslation('experts.filter.all') || 'All'}</option>
                  <option value="law">Law</option>
                  <option value="finance">Finance</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  {/* Add more options based on your available specializations */}
                </select>
              </div>

              {/* City filter */}
              <div className="md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('experts.filter.city') || 'City'}
                </label>
                <select
                  name="city"
                  value={filter.city}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{getTranslation('experts.filter.all') || 'All'}</option>
                  <option value="almaty">Almaty</option>
                  <option value="nur-sultan">Nur-Sultan</option>
                  <option value="shymkent">Shymkent</option>
                  {/* Add more cities as needed */}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Experts list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : experts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                onClick={() => handleExpertClick(expert.id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-xl font-medium text-white">
                      {expert.full_name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-lg text-gray-800">{expert.full_name}</h3>
                      <p className="text-blue-600">{expert.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {expert.city && (
                      <div className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{expert.city}</span>
                      </div>
                    )}
                    {expert.education && expert.education.length > 0 && (
                      <div className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{expert.education[0].university}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 flex justify-end">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    {getTranslation('experts.viewProfile') || 'View Profile'} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {getTranslation('experts.noResults.title') || 'No experts found'}
            </h3>
            <p className="text-gray-600">
              {getTranslation('experts.noResults.message') || 'Try adjusting your search or filters to find experts'}
            </p>
          </div>
        )}
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
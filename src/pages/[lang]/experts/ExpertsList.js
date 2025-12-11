import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { EXPERTS_API, appendQueryParams } from '../../utils/apiConfig';
import {
  User,
  MapPin,
  Phone,
  Globe,
  AlertTriangle,
  Search
} from 'react-feather';

const UserPlaceholderIcon = () => (
  <svg
    className="h-full w-full text-gray-400"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ExpertsList = ({ filters, getTranslation, currentLang }) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (filters.specialization) params.specialization = filters.specialization;
        if (filters.city) params.city = filters.city;
        if (filters.search) params.search = filters.search;

        params.skip = '0';
        params.limit = '100';

        const url = (filters.specialization || filters.city || filters.search)
          ? appendQueryParams(EXPERTS_API.SEARCH, params)
          : appendQueryParams(EXPERTS_API.LIST, { skip: params.skip, limit: params.limit });

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `${getTranslation('experts.errorPrefix', 'Ошибка запроса')}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setExperts(data);
      } catch (err) {
        console.error(getTranslation('experts.errorLog', 'Ошибка при загрузке экспертов:'), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [filters, getTranslation]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-600 font-medium mt-3">{getTranslation('experts.loading', 'Загрузка экспертов...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl shadow-md my-6" role="alert">
        <div className="flex items-center mb-2">
          <AlertTriangle size={20} className="mr-2" />
          <p className="font-bold">{getTranslation('experts.errorLoadingTitle', 'Ошибка при загрузке')}</p>
        </div>
        <p>{getTranslation('experts.errorLoadingMessage', 'Не удалось загрузить список экспертов:')} {error}</p>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-md text-center my-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
          <Search size={28} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{getTranslation('experts.noResultsTitle', 'Эксперты не найдены')}</h3>
        <p className="text-gray-600 max-w-md mx-auto">{getTranslation('experts.noResultsMessage', 'По вашему запросу экспертов не найдено. Попробуйте изменить критерии поиска.')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {experts.map((expert) => (
        <div
          key={expert.id}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border border-gray-100 hover:border-teal-200 flex flex-col"
        >
          <div className="flex-grow p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-teal-50 to-blue-50">
                {expert.avatar_url ? (
                  <img
                    src={expert.avatar_url}
                    alt={`${getTranslation('experts.avatarAltPrefix', 'Аватар эксперта')} ${expert.full_name}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        const parent = e.target.parentNode;
                        if (parent) {
                            const placeholder = parent.querySelector('.avatar-placeholder');
                            if (placeholder) placeholder.style.display = 'flex';
                        }
                        e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                {(!expert.avatar_url) && (
                   <div className="avatar-placeholder h-full w-full flex items-center justify-center">
                    <UserPlaceholderIcon />
                  </div>
                )}
                 {expert.avatar_url && (
                    <div className="avatar-placeholder h-full w-full items-center justify-center" style={{display: 'none'}}>
                        <UserPlaceholderIcon />
                    </div>
                 )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-1 leading-tight line-clamp-2">
                  {expert.full_name}
                </h3>
                <span className="inline-flex items-center bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">
                  <User size={12} className="mr-1" />
                  {expert.specialization}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-gray-600">
              {expert.city && (
                <div className="flex items-center text-sm">
                  <MapPin size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                  <span>{expert.city}</span>
                </div>
              )}

              {expert.phone && (
                <div className="flex items-center text-sm">
                  <Phone size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${expert.phone}`} className="hover:text-teal-600 transition-colors">{expert.phone}</a>
                </div>
              )}

              {expert.website && (
                <div className="flex items-center text-sm">
                  <Globe size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                  <a
                    href={expert.website.startsWith('http') ? expert.website : `https://${expert.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 truncate transition-colors"
                  >
                    {expert.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 mt-auto border-t border-gray-100">
            <Link
                href={`/${currentLang}/experts/${expert.id}`}
                className="w-full block text-center bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm shadow-sm hover:shadow"
            >
                {getTranslation('experts.viewProfileButton', 'Смотреть профиль')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpertsList;
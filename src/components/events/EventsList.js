import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EVENTS_API, appendQueryParams } from '../../utils/apiConfig';
import {
  Calendar,
  MapPin,
  Clock,
  Video,
  Users,
  RefreshCw,
  Coffee
} from 'react-feather';

export default function EventsList({ filters, getTranslation, currentLang }) {
  // Add fallback for getTranslation if it's not provided
  const safeGetTranslation = (key) => {
    if (typeof getTranslation === 'function') {
      return getTranslation(key);
    }
    // Fallback translations - used only if getTranslation is not provided
    const fallbacks = {
      'events.upcomingEvents': currentLang === 'kz' ? 'Келе жатқан мероприятиялар' : 'Предстоящие мероприятия',
      'events.fetchError': currentLang === 'kz' ? 'Мероприятияларды жүктеу кезінде қате' : 'Ошибка при загрузке мероприятий',
      'events.loadMore': currentLang === 'kz' ? 'Көбірек жүктеу' : 'Загрузить еще',
      'events.date': currentLang === 'kz' ? 'Күні' : 'Дата',
      'events.location': currentLang === 'kz' ? 'Орны' : 'Место проведения',
      'events.format': currentLang === 'kz' ? 'Формат' : 'Формат',
      'events.online': currentLang === 'kz' ? 'Онлайн' : 'Онлайн',
      'events.offline': currentLang === 'kz' ? 'Офлайн' : 'Офлайн',
      'events.noEvents': currentLang === 'kz' ? 'Мероприятиялар табылмады' : 'Мероприятия не найдены',
      'events.noEventsFound': currentLang === 'kz' ? 'Іздеу нәтижелері табылмады' : 'Мероприятия не найдены. Попробуйте изменить параметры поиска.',
      'events.viewDetails': currentLang === 'kz' ? 'Толығырақ' : 'Подробнее'
    };
    return fallbacks[key] || key;
  };

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Загрузка мероприятий с учетом фильтров и пагинации
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Формируем параметры запроса
        const queryParams = {
          ...filters,
          skip: (page - 1) * 10,
          limit: 10,
        };

        // Формируем URL с параметрами
        const url = appendQueryParams(
          filters?.search ? EVENTS_API.SEARCH : EVENTS_API.LIST,
          queryParams
        );

        // Выполняем запрос
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid JSON response from server');
        }

        // Process the response data to handle both formats (array or {items: []})
        let processedData;

        // If data is already an array, wrap it
        if (Array.isArray(data)) {
          processedData = {
            items: data,
            total: data.length // For proper pagination, server should return total count
          };
        }
        // If data has items property that is an array, use that
        else if (data && Array.isArray(data.items)) {
          processedData = data;
        }
        // Fallback to empty array
        else {
          console.warn('Unexpected API response format:', data);
          processedData = { items: [], total: 0 };
        }

        // Обновляем состояние
        if (page === 1) {
          setEvents(processedData.items);
        } else {
          setEvents(prev => [...prev, ...processedData.items]);
        }

        // Store total count
        setTotal(processedData.total);

        // Проверяем, есть ли еще страницы
        setHasMore(processedData.total > page * 10);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(safeGetTranslation('events.fetchError'));
        // Сохраняем текущие мероприятия при ошибке
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filters, page]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(currentLang === 'kz' ? 'kk-KZ' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Функция для форматирования короткой даты (день и месяц)
  const formatShortDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString(currentLang === 'kz' ? 'kk-KZ' : 'ru-RU', { month: 'short' });
      return { day, month };
    } catch (e) {
      console.error('Error formatting short date:', e);
      return { day: '??', month: '???' };
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="h-full flex justify-center items-center p-8 bg-white rounded-xl shadow-sm">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-600 font-medium ml-3">{safeGetTranslation('events.loading', 'Загрузка мероприятий...')}</p>
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="h-full p-8 bg-white rounded-xl shadow-sm">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium mb-1">Ошибка</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Проверка на пустой массив
  if (!events || events.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-12 bg-white rounded-xl shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <Calendar size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{safeGetTranslation('events.noEvents')}</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {safeGetTranslation('events.noEventsFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar size={24} className="text-teal-600 mr-3" />
        {safeGetTranslation('events.upcomingEvents')}
        <span className="ml-3 bg-teal-100 text-teal-700 text-sm px-2.5 py-0.5 rounded-full font-medium">
          {total}
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
        {events.map(event => (
          <Link
            key={event.id}
            href={`/${currentLang}/events/${event.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            {/* Изображение события с датой */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              {event.photo_url ? (
                <img
                  src={event.photo_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-teal-500/10 to-blue-600/10 flex items-center justify-center">
                  {event.format === 'Online' ? (
                    <Video size={48} className="text-teal-500" />
                  ) : (
                    <Coffee size={48} className="text-teal-500" />
                  )}
                </div>
              )}

              {/* Дата события */}
              <div className="absolute top-3 left-3 w-16 h-16 bg-white rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                {(() => {
                  const { day, month } = formatShortDate(event.event_date || event.date);
                  return (
                    <>
                      <span className="text-2xl font-bold text-gray-800">{day}</span>
                      <span className="text-xs font-medium text-gray-600">{month}</span>
                    </>
                  );
                })()}
              </div>

              {/* Формат события */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  event.format === 'Online'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  {event.format === 'Online' ? (
                    <>
                      <Video size={12} className="mr-1" />
                      {safeGetTranslation('events.online')}
                    </>
                  ) : (
                    <>
                      <Users size={12} className="mr-1" />
                      {safeGetTranslation('events.offline')}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Информация о событии */}
            <div className="p-5 flex-grow flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                {event.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>{formatEventDate(event.event_date || event.date)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {event.description}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                <span className="text-teal-600 text-sm font-medium flex items-center group-hover:text-teal-700">
                  {safeGetTranslation('events.viewDetails')}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {isLoading && page > 1 && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-teal-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            {safeGetTranslation('events.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { EVENTS_API } from '../../../utils/apiConfig';
import { translations } from '../../../locales/translations';
import { Calendar, MapPin, Clock, Video, Users, ChevronLeft, ExternalLink } from 'react-feather';

export default function EventDetailPage() {
  const router = useRouter();
  const { lang = 'ru', id } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  // Функция получения перевода
  const getTranslation = (key) => {
    // Проверяем, существует ли указанный язык
    if (!translations[lang]) {
      return key; // Возвращаем ключ, если язык не найден
    }

    // Разбиваем ключ на части (например, 'events.pageTitle' -> ['events', 'pageTitle'])
    const parts = key.split('.');

    // Начинаем с корня переводов для указанного языка
    let result = translations[lang];

    // Проходим по частям ключа
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        return key; // Возвращаем ключ, если перевод не найден
      }
    }

    return result;
  };

  // Fetch event details
  useEffect(() => {
    if (!id) return;

    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(EVENTS_API.DETAILS(id));
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received event data:', data);
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(getTranslation('events.fetchError') || 'Ошибка при загрузке данных мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  // Form change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: 'loading', message: getTranslation('events.submitting') || 'Отправка данных...' });

    try {
      const response = await fetch(EVENTS_API.PARTICIPATE(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Registration successful:', data);

      setSubmitStatus({
        type: 'success',
        message: getTranslation('events.registrationSuccess') || 'Вы успешно зарегистрированы на мероприятие!'
      });

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        company_name: '',
        email: ''
      });

      // Close modal after delay
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting registration:', err);
      setSubmitStatus({
        type: 'error',
        message: getTranslation('events.registrationError') || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.'
      });
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'kz' ? 'kk-KZ' : 'ru-RU', {
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

  if (loading) {
    return (
      <Layout currentLang={lang}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex justify-center items-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-gray-600 font-medium ml-3">{getTranslation('events.loading', 'Загрузка...')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout currentLang={lang}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
            <p className="font-medium mb-1">Ошибка</p>
            <p>{error || (getTranslation('events.notFound') || 'Мероприятие не найдено')}</p>
          </div>
          <div className="mt-4">
            <Link href={`/${lang}/events`} className="text-teal-600 hover:text-teal-800 inline-flex items-center">
              <ChevronLeft size={16} className="mr-1" />
              {getTranslation('events.backToList') || 'Вернуться к списку мероприятий'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentLang={lang}>
      <Head>
        <title>{event.title}</title>
        <meta name="description" content={event.description.substring(0, 160)} />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Хлебные крошки в новом стиле */}
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <Link href={`/${lang}`} className="hover:text-teal-600 transition-colors">
            {getTranslation('common.home') || 'Главная'}
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/${lang}/events`} className="hover:text-teal-600 transition-colors">
            {getTranslation('events.pageTitle') || 'Мероприятия'}
          </Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium truncate">{event.title}</span>
        </div>

        {/* Заголовок и основная информация в новом стиле */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl overflow-hidden shadow-lg mb-6">
          <div className="relative">
            {event.photo_url && (
              <div className="w-full h-64 md:h-80">
                <img
                  src={event.photo_url}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
              </div>
            )}

            <div className="p-6 md:p-8 relative z-10 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formatEventDate(event.date)}</span>
                </div>

                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center">
                  <span className={`flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ${
                    event.format === 'Online'
                      ? 'bg-green-500/20 text-white'
                      : 'bg-blue-500/20 text-white'
                  }`}>
                    {event.format === 'Online' ? <Video className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                    {event.format === 'Online'
                      ? (getTranslation('events.online') || 'Онлайн')
                      : (getTranslation('events.offline') || 'Офлайн')}
                  </span>
                </div>
              </div>

              {/* Кнопка участия */}
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500 shadow-lg"
              >
                {getTranslation('events.participate') || 'Участвовать в мероприятии'}
              </button>
            </div>
          </div>
        </div>
        {/* Контент мероприятия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация в левой колонке */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                {getTranslation('events.description') || 'Описание мероприятия'}
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              </div>
            </div>

            {/* Программа мероприятия */}
            {event.programs && event.programs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <Clock className="w-5 h-5 mr-2 text-teal-600" />
                  {getTranslation('events.program') || 'Программа'}
                </h2>
                <div className="space-y-4">
                  {event.programs.map((program, index) => (
                    <div key={program.id || index} className="flex border-l-4 border-teal-500 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r-lg">
                      <div className="min-w-[60px] text-teal-700 font-medium">
                        {program.time} {getTranslation('events.minutes') || 'мин.'}
                      </div>
                      <div className="text-gray-700 ml-4">{program.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Спикеры в правой колонке */}
          <div>
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <Users className="w-5 h-5 mr-2 text-teal-600" />
                  {getTranslation('events.speakers') || 'Спикеры'}
                </h2>
                <div className="space-y-4">
                  {event.speakers.map((speaker, index) => (
                    <div key={speaker.id || index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        {speaker.photo_url ? (
                          <img
                            src={speaker.photo_url}
                            alt={`${speaker.first_name} ${speaker.last_name}`}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mr-4 text-white">
                            <span className="text-xl font-semibold">
                              {speaker.first_name.charAt(0)}{speaker.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {speaker.last_name} {speaker.first_name} {speaker.middle_name || ''}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">{speaker.bio}</p>

                          {/* Социальные сети */}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно регистрации в новом стиле */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Центрирование модального окна */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Модальное окно */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Заголовок модального окна */}
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-4">
                <h3 className="text-lg leading-6 font-medium" id="modal-title">
                  {getTranslation('events.participate') || 'Участвовать в мероприятии'}
                </h3>
              </div>

              <div className="bg-white px-6 py-4">
                {submitStatus ? (
                  <div className={`p-4 rounded-lg flex items-center ${
                    submitStatus.type === 'success' ? 'bg-green-50 text-green-800' :
                    submitStatus.type === 'error' ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    {submitStatus.type === 'loading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current mr-3"></div>
                    )}
                    {submitStatus.type === 'success' && (
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {submitStatus.type === 'error' && (
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <p>{submitStatus.message}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-3">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Фамилия */}
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                          {getTranslation('events.lastName') || 'Фамилия'} *
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          required
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                        />
                      </div>

                      {/* Имя */}
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                          {getTranslation('events.firstName') || 'Имя'} *
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          required
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                        />
                      </div>

                      {/* Название компании */}
                      <div>
                        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                          {getTranslation('events.companyName') || 'Название компании'} *
                        </label>
                        <input
                          type="text"
                          id="company_name"
                          name="company_name"
                          required
                          value={formData.company_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          {getTranslation('events.email') || 'E-mail'} *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:col-start-1 sm:text-sm"
                      >
                        {getTranslation('common.cancel') || 'Отмена'}
                      </button>
                      <button
                        type="submit"
                        className="mt-3 w-full sm:mt-0 inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:col-start-2 sm:text-sm transition-colors"
                      >
                        {getTranslation('events.register') || 'Зарегистрироваться'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
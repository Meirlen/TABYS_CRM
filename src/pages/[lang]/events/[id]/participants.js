import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import { EVENTS_API } from '../../../../utils/apiConfig';
import { translations } from '../../../../locales/translations';

export default function EventParticipantsPage() {
  const router = useRouter();
  const { lang = 'ru', id } = router.query;

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Для проверки прав доступа

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

  // Проверка на наличие прав администратора
  useEffect(() => {
    // Здесь можно получить данные о пользователе из localStorage или другого хранилища
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Проверяем, имеет ли пользователь права администратора
    setIsAdmin(userRole === 'admin');

    // Если пользователь не админ, перенаправляем на страницу мероприятия
    if (token && id && userRole !== 'admin') {
      router.push(`/${lang}/events/${id}`);
    }
  }, [id, lang, router]);

  // Загрузка данных о мероприятии и его участниках
  useEffect(() => {
    if (!id || !isAdmin) return;

    const fetchEventAndParticipants = async () => {
      setLoading(true);
      setError(null);

      try {
        // Запрос данных о мероприятии
        const eventResponse = await fetch(EVENTS_API.DETAILS(id), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!eventResponse.ok) {
          throw new Error(`HTTP error! Status: ${eventResponse.status}`);
        }

        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Запрос списка участников
        const participantsResponse = await fetch(EVENTS_API.PARTICIPANTS(id), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!participantsResponse.ok) {
          throw new Error(`HTTP error! Status: ${participantsResponse.status}`);
        }

        const participantsData = await participantsResponse.json();
        setParticipants(participantsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(getTranslation('events.fetchError') || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndParticipants();
  }, [id, isAdmin]);

  // Функция для экспорта списка участников в CSV
  const exportToCSV = () => {
    if (!participants.length) return;

    // Формируем заголовки для CSV
    const headers = ['ID', 'Фамилия', 'Имя', 'Компания', 'Email', 'Дата регистрации'];

    // Формируем строки данных
    const csvRows = [];

    // Добавляем заголовки
    csvRows.push(headers.join(','));

    // Добавляем данные
    for (const participant of participants) {
      const values = [
        participant.id,
        participant.last_name,
        participant.first_name,
        participant.company_name,
        participant.email,
        new Date(participant.created_at).toLocaleDateString(lang === 'kz' ? 'kk-KZ' : 'ru-RU')
      ];

      // Экранируем запятые и кавычки
      const escapedValues = values.map(value => {
        // Если строка содержит запятую, кавычку или перенос строки, заключаем в кавычки
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });

      csvRows.push(escapedValues.join(','));
    }

    // Объединяем всё в одну строку
    const csvContent = csvRows.join('\n');

    // Создаем Blob и ссылку для скачивания
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participants_event_${id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Layout currentLang={lang}>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout currentLang={lang}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || (getTranslation('events.notFound') || 'Мероприятие не найдено')}
          </div>
          <div className="mt-4">
            <Link href={`/${lang}/events`} className="text-blue-600 hover:text-blue-800">
              ← {getTranslation('events.backToList') || 'Вернуться к списку мероприятий'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout currentLang={lang}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {getTranslation('common.accessDenied') || 'Доступ запрещен. У вас нет прав для просмотра этой страницы.'}
          </div>
          <div className="mt-4">
            <Link href={`/${lang}/events/${id}`} className="text-blue-600 hover:text-blue-800">
              ← {getTranslation('events.backToEvent') || 'Вернуться к информации о мероприятии'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentLang={lang}>
      <Head>
        <title>
          {getTranslation('events.participantsList') || 'Список участников'} - {event.title}
        </title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Хлебные крошки */}
          <div className="p-4 border-b border-gray-200">
            <nav className="text-sm">
              <Link href={`/${lang}`} className="text-blue-600 hover:text-blue-800">
                {getTranslation('common.home') || 'Главная'}
              </Link>
              <span className="mx-2">→</span>
              <Link href={`/${lang}/events`} className="text-blue-600 hover:text-blue-800">
                {getTranslation('events.pageTitle') || 'Мероприятия'}
              </Link>
              <span className="mx-2">→</span>
              <Link href={`/${lang}/events/${id}`} className="text-blue-600 hover:text-blue-800">
                {event.title}
              </Link>
              <span className="mx-2">→</span>
              <span className="text-gray-700">
                {getTranslation('events.participantsList') || 'Список участников'}
              </span>
            </nav>
          </div>

          {/* Заголовок */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {getTranslation('events.participantsList') || 'Список участников'} - {event.title}
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  disabled={!participants.length}
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {getTranslation('events.exportCSV') || 'Экспорт в CSV'}
                  </span>
                </button>
                <Link
                  href={`/${lang}/events/${id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {getTranslation('events.backToEvent') || 'Вернуться к мероприятию'}
                </Link>
              </div>
            </div>
          </div>

          {/* Содержимое - таблица участников */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700">
                {getTranslation('events.totalParticipants') || 'Всего участников'}: {participants.length}
              </p>
            </div>

            {participants.length === 0 ? (
              <div className="bg-gray-50 p-4 text-center text-gray-500 rounded-md">
                {getTranslation('events.noParticipants') || 'На данное мероприятие еще никто не зарегистрировался.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getTranslation('events.fullName') || 'ФИО'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getTranslation('events.companyName') || 'Компания'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getTranslation('events.email') || 'Email'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getTranslation('events.registrationDate') || 'Дата регистрации'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{participant.last_name} {participant.first_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{participant.company_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={`mailto:${participant.email}`} className="text-blue-600 hover:text-blue-900">
                            {participant.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(participant.created_at).toLocaleDateString(lang === 'kz' ? 'kk-KZ' : 'ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
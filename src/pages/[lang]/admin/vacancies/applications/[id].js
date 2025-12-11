import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { translations } from '../../../../../locales/translations';
import Footer from '../../../../../components/Footer';
import HeaderBack from '../../../../../components/HeaderBack';
import { VACANCIES_API } from '../../../../../utils/apiConfig';
import { formatDate } from '../../../../../utils/dateUtils';

export default function VacancyApplications({ lang: serverLang, translations: serverTranslations, vacancyId }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  // Состояние для данных
  const [vacancy, setVacancy] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'reviewed'

  // Функция для получения переводов
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

  // Загрузка данных о вакансии
  useEffect(() => {
    const fetchVacancyDetails = async () => {
      if (!vacancyId) return;

      try {
        const url = VACANCIES_API.DETAILS(vacancyId);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setVacancy(data);
      } catch (err) {
        console.error('Error fetching vacancy details:', err);
        setError('Ошибка при загрузке информации о вакансии');
      }
    };

    fetchVacancyDetails();
  }, [vacancyId]);

  // Загрузка откликов на вакансию
  useEffect(() => {
    const fetchApplications = async () => {
      if (!vacancyId) return;

      setLoading(true);
      try {
        // Используем новый эндпоинт для получения откликов
        const url = VACANCIES_API.APPLICATIONS(vacancyId);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Ошибка при загрузке откликов на вакансию');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [vacancyId]);

  // Фильтрация откликов по статусу
  const filteredApplications = () => {
    if (activeTab === 'all') return applications;
    if (activeTab === 'new') return applications.filter(app => app.status === 'new' || !app.status);
    if (activeTab === 'reviewed') return applications.filter(app => app.status === 'reviewed');
    return applications;
  };

  // Функция для получения локализованного поля
  const getLocalizedField = (obj, fieldName) => {
    if (!obj) return '';
    const localizedField = `${fieldName}_${currentLang}`;
    return obj[localizedField] || obj[`${fieldName}_ru`] || obj[`${fieldName}_kz`] || obj[fieldName] || '';
  };

  // Функция для скачивания резюме
  const downloadResume = async (applicationId) => {
    try {
      // Используем новый эндпоинт для скачивания резюме
      const url = VACANCIES_API.DOWNLOAD_RESUME(vacancyId, applicationId);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading resume:', err);
      alert('Ошибка при скачивании резюме');
    }
  };

  // Функция для изменения статуса отклика
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      // Используем новый эндпоинт для обновления статуса
      const url = VACANCIES_API.APPLICATION_DETAIL(vacancyId, applicationId);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Обновляем список откликов
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Ошибка при обновлении статуса отклика');
    }
  };

  useEffect(() => {
    // Обновляем язык при клиентской навигации
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      if (clientLang !== validLang) {
        router.replace(`/${validLang}/admin/vacancies/applications/${vacancyId}`);
        return;
      }

      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang, router, vacancyId]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Head>
        <title>{vacancy ? `Отклики на вакансию: ${getLocalizedField(vacancy, 'title')}` : 'Отклики на вакансию'}</title>
      </Head>

      <HeaderBack
        title={vacancy ? `Отклики на вакансию: ${getLocalizedField(vacancy, 'title')}` : 'Отклики на вакансию'}
        onBack={() => router.push(`/${currentLang}/admin/vacancies`)}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Информация о вакансии */}
        {vacancy && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{getLocalizedField(vacancy, 'title')}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {vacancy.employment_type && (
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
                  {vacancy.employment_type}
                </span>
              )}
              {vacancy.salary && (
                <span className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-800">
                  {vacancy.salary}
                </span>
              )}
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                vacancy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {vacancy.is_active ? 'Активна' : 'Неактивна'}
              </span>
            </div>
            <p className="text-gray-900">{getLocalizedField(vacancy, 'location')}</p>
          </div>
        )}

        {/* Табы для фильтрации */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('all')}
            >
              Все отклики ({applications.length})
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'new' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('new')}
            >
              Новые ({applications.filter(app => app.status === 'new' || !app.status).length})
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'reviewed' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-700 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('reviewed')}
            >
              Просмотренные ({applications.filter(app => app.status === 'reviewed').length})
            </button>
          </div>
        </div>

        {/* Список откликов */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : filteredApplications().length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            <p>Отклики не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications().map(application => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{application.first_name} {application.last_name}</h3>
                    <p className="text-gray-900 mt-1">Email: {application.email}</p>
                    {application.phone && <p className="text-gray-900">Телефон: {application.phone}</p>}
                    <p className="text-gray-700 mt-2">Дата отклика: {formatDate(application.created_at, currentLang)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      !application.status || application.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {!application.status || application.status === 'new' ? 'Новый' : 'Просмотрен'}
                    </span>
                  </div>
                </div>

                {application.cover_letter && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900">Сопроводительное письмо:</h4>
                    <p className="mt-1 text-gray-900 whitespace-pre-line">{application.cover_letter}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadResume(application.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Скачать резюме
                  </button>

                  {(!application.status || application.status === 'new') ? (
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Отметить как просмотренное
                    </button>
                  ) : (
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'new')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Отметить как новое
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang, id } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/admin/vacancies/applications/${id}`,
        permanent: false,
      },
    };
  }

  const langTranslations = translations[validLang] || translations['kz'];

  return {
    props: {
      lang: validLang,
      translations: langTranslations,
      vacancyId: id
    }
  };
}
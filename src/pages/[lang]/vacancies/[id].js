import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import { VACANCIES_API } from '../../../utils/apiConfig';
import ApplicationModal from '../../../components/vacancies/ApplicationModal';
import { formatDate } from '../../../utils/dateUtils';
import {
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Users,
  DollarSign,
  AlertTriangle
} from 'react-feather';

export default function VacancyDetailPage() {
  const router = useRouter();
  const { id, lang } = router.query;
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('ru');

  useEffect(() => {
    if (lang && ['kz', 'ru', 'en'].includes(lang)) {
      setCurrentLang(lang);
    }
  }, [lang]);

  useEffect(() => {
    const fetchVacancyDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const url = VACANCIES_API.DETAILS(id);
        const response = await fetch(url);

        if (!response.ok) {
          let errorMsg = `HTTP ошибка! Статус: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (e) {
            // Если тело ответа не JSON или пустое
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setVacancy(data);
      } catch (err) {
        console.error('Ошибка при загрузке деталей вакансии:', err);
        setError(err.message || 'Произошла ошибка при загрузке информации о вакансии');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancyDetails();
  }, [id]);

  const getLocalizedField = (fieldName) => {
    if (!vacancy) return '';
    return vacancy[`${fieldName}_${currentLang}`] || vacancy[`${fieldName}_ru`] || vacancy[`${fieldName}_kz`] || vacancy[fieldName] || '';
  };

  const getTranslation = (key, fallbackText = '') => {
    const translations = {
      'ru': {
        'vacancy.title': 'Детали вакансии',
        'vacancy.backToList': 'Вернуться к списку',
        'vacancy.notFound': 'Вакансия не найдена',
        'vacancy.responsibilities': 'Должностные обязанности',
        'vacancy.requirements': 'Требования',
        'vacancy.apply': 'Подать заявку',
        'vacancy.posted': 'Опубликовано',
        'vacancy.deadline': 'Срок подачи',
        'vacancy.loading': 'Загрузка данных о вакансии...',
        'vacancy.errorTitle': 'Ошибка загрузки',
        'vacancy.location': 'Местоположение',
      },
      'kz': {
        'vacancy.title': 'Бос жұмыс орны туралы мәліметтер',
        'vacancy.backToList': 'Тізімге оралу',
        'vacancy.notFound': 'Бос жұмыс орны табылмады',
        'vacancy.responsibilities': 'Лауазымдық міндеттер',
        'vacancy.requirements': 'Талаптар',
        'vacancy.apply': 'Өтінім жіберу',
        'vacancy.posted': 'Жарияланған күні',
        'vacancy.deadline': 'Өтінім беру мерзімі',
        'vacancy.loading': 'Вакансия туралы деректер жүктелуде...',
        'vacancy.errorTitle': 'Жүктеу қатесі',
        'vacancy.location': 'Орналасқан жері',
      }
    };

    return translations[currentLang]?.[key] || translations['ru']?.[key] || fallbackText || key;
  };

  // Функции для получения цвета меток
  const getEmploymentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'полная занятость':
      case 'толық жұмыс':
        return 'bg-teal-100 text-teal-700';
      case 'частичная занятость':
      case 'ішінара жұмыспен қамту':
        return 'bg-purple-100 text-purple-700';
      case 'проектная работа':
      case 'жобалық жұмыс':
        return 'bg-blue-100 text-blue-700';
      case 'стажировка':
      case 'тәжірибеден өту':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getWorkTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'удаленная работа':
      case 'қашықтықтан жұмыс':
        return 'bg-indigo-100 text-indigo-700';
      case 'офис':
        return 'bg-cyan-100 text-cyan-700';
      case 'гибридный формат':
      case 'гибридті формат':
        return 'bg-violet-100 text-violet-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>{getTranslation('vacancy.loading', 'Загрузка...')}</title>
          <meta name="description" content="Загрузка детали вакансии" />
        </Head>
        <HeaderBack
          title={getTranslation('vacancy.title')}
          onBack={() => router.back()}
        />
        <div className="container mx-auto py-12 px-4">
          <div className="h-full flex justify-center items-center p-8 bg-white rounded-xl shadow-md">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-gray-600 font-medium">{getTranslation('vacancy.loading', 'Загрузка...')}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Head>
          <title>{getTranslation('vacancy.errorTitle')}</title>
          <meta name="description" content="Ошибка загрузки вакансии" />
        </Head>
        <HeaderBack
          title={getTranslation('vacancy.title')}
          onBack={() => router.back()}
        />
        <div className="container mx-auto py-12 px-4">
          <div className="p-8 bg-white rounded-xl shadow-md">
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-md mb-6">
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-red-500 mr-3" />
                <p className="font-semibold text-lg">{getTranslation('vacancy.errorTitle')}</p>
              </div>
              <p className="mt-2">{error}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-teal-600 font-medium hover:bg-gray-50 transition-colors"
            >
              {getTranslation('vacancy.backToList')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!vacancy) {
    return (
      <Layout>
        <Head>
          <title>{getTranslation('vacancy.notFound')}</title>
          <meta name="description" content="Вакансия не найдена" />
        </Head>
        <HeaderBack
          title={getTranslation('vacancy.title')}
          onBack={() => router.back()}
        />
        <div className="container mx-auto py-12 px-4">
          <div className="h-full flex justify-center items-center p-8 bg-white rounded-xl shadow-md">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-6">
                <Briefcase size={32} />
              </div>
              <h1 className="text-xl font-medium text-gray-700 mb-6">
                {getTranslation('vacancy.notFound')}
              </h1>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-teal-600 font-medium hover:bg-gray-50 transition-colors"
              >
                {getTranslation('vacancy.backToList')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{getLocalizedField('title')} | {getTranslation('vacancy.title')}</title>
        <meta name="description" content={getLocalizedField('description')?.substring(0, 160) || getLocalizedField('title')} />
      </Head>

      <HeaderBack
        title={getTranslation('vacancy.title')}
        onBack={() => router.back()}
      />

      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            {getLocalizedField('title')}
          </h1>

          {/* Теги */}
          <div className="flex flex-wrap gap-3 my-6">
            {vacancy.employment_type && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getEmploymentTypeColor(vacancy.employment_type)}`}>
                <Users size={14} className="mr-1.5" />
                {vacancy.employment_type}
              </span>
            )}
            {vacancy.work_type && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getWorkTypeColor(vacancy.work_type)}`}>
                <Briefcase size={14} className="mr-1.5" />
                {vacancy.work_type}
              </span>
            )}
            {vacancy.salary && (
              <span className="inline-flex items-center bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-medium">
                <DollarSign size={14} className="mr-1.5" />
                {vacancy.salary}
              </span>
            )}
          </div>

          {/* Местоположение и срок подачи */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {getLocalizedField('location') && (
              <div className="text-gray-600 flex items-center">
                <MapPin size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                <span>{getLocalizedField('location')}</span>
              </div>
            )}
            {vacancy.deadline && (
              <div className="text-gray-600 flex items-center">
                <Calendar size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                <span>
                  {getTranslation('vacancy.deadline')}: <span className="font-medium text-gray-700">{formatDate(vacancy.deadline, currentLang)}</span>
                </span>
              </div>
            )}
          </div>

          {/* Описание/Обязанности */}
          {getLocalizedField('description') && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">{getTranslation('vacancy.responsibilities')}</h2>
              <div className="prose prose-sm sm:prose max-w-none text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: getLocalizedField('description').replace(/\n/g, '<br />') }} />
              </div>
            </div>
          )}

          {/* Требования */}
          {getLocalizedField('requirements') && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">{getTranslation('vacancy.requirements')}</h2>
              <div className="prose prose-sm sm:prose max-w-none text-gray-700">
                 <div dangerouslySetInnerHTML={{ __html: getLocalizedField('requirements').replace(/\n/g, '<br />') }} />
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              {getTranslation('vacancy.apply')}
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            >
              {getTranslation('vacancy.backToList')}
            </button>
          </div>

          {/* Дата публикации */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 flex items-center">
            <Clock size={14} className="mr-1.5" />
            {getTranslation('vacancy.posted')}: {formatDate(vacancy.created_at, currentLang)}
          </div>
        </div>
      </div>

      {showModal && (
        <ApplicationModal
          vacancyId={vacancy.id}
          vacancyTitle={getLocalizedField('title')}
          onClose={() => setShowModal(false)}
          getTranslation={(key) => {
            const translations = {
              'vacancies.applyFor': currentLang === 'kz' ? 'Өтінім жіберу' : 'Подать заявку на',
              'vacancies.lastName': currentLang === 'kz' ? 'Тегі' : 'Фамилия',
              'vacancies.firstName': currentLang === 'kz' ? 'Аты' : 'Имя',
              'vacancies.email': currentLang === 'kz' ? 'Электрондық пошта' : 'Электронная почта',
              'vacancies.phone': currentLang === 'kz' ? 'Телефон' : 'Телефон',
              'vacancies.coverLetter': currentLang === 'kz' ? 'Ілеспе хат' : 'Сопроводительное письмо',
              'vacancies.resume': currentLang === 'kz' ? 'Түйіндеме' : 'Резюме',
              'vacancies.cancel': currentLang === 'kz' ? 'Болдырмау' : 'Отмена',
              'vacancies.submit': currentLang === 'kz' ? 'Жіберу' : 'Отправить',
              'vacancies.sending': currentLang === 'kz' ? 'Жіберілуде...' : 'Отправка...',
              'vacancies.applicationSent': currentLang === 'kz' ? 'Өтінім жіберілді' : 'Заявка отправлена',
              'vacancies.thankYouForApplication': currentLang === 'kz'
                ? 'Өтініміңіз үшін рахмет! Біз сізбен жақын арада хабарласамыз.'
                : 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.',
              'vacancies.close': currentLang === 'kz' ? 'Жабу' : 'Закрыть',
              'vacancies.fillRequiredFields': currentLang === 'kz'
                ? 'Барлық міндетті өрістерді толтырыңыз'
                : 'Пожалуйста, заполните все обязательные поля',
              'vacancies.applicationError': currentLang === 'kz'
                ? 'Өтінім жіберу кезінде қате орын алды'
                : 'Произошла ошибка при отправке заявки',
              'vacancies.invalidFileFormat': currentLang === 'kz'
                ? 'Файл пішіміне қолдау көрсетілмейді. Тек .doc, .docx немесе .pdf пішімдеріне рұқсат етіледі.'
                : 'Неподдерживаемый формат файла. Разрешены только форматы .doc, .docx или .pdf'
            };
            return translations[key] || key;
          }}
        />
      )}
    </Layout>
  );
}
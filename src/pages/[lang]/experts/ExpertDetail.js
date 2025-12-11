import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../locales/translations';
import Footer from '../../../components/Footer';
import HeaderBack from '../../../components/HeaderBack';
import CollaborationModal from './CollaborationModal';
import { EXPERTS_API } from '../../../utils/apiConfig';
import {
  User,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  Award,
  MessageCircle,
  ChevronLeft
} from 'react-feather';

// Иконка-плейсхолдер для аватара
const UserPlaceholderIcon = ({ className = "h-full w-full text-gray-400" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function ExpertDetail({ lang: serverLang, translations: serverTranslations, expertId }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  const [t, setT] = useState(serverTranslations || (translations[serverLang || 'kz'] || {})); // Инициализация t сразу

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAvatarPlaceholderOnError, setShowAvatarPlaceholderOnError] = useState(false); // Только для случая ошибки загрузки существующего URL

  // Функция для получения переводов по вложенным ключам (возвращаем к простому варианту)
  const getTranslation = (key, fallbackText) => {
    // Проверяем, что t инициализирован
    if (!t || Object.keys(t).length === 0) {
        // Если serverTranslations есть, но t пуст, пробуем инициализировать t снова
        if (serverTranslations && Object.keys(serverTranslations).length > 0 && Object.keys(t).length === 0) {
            setT(serverTranslations); // Попытка установить переводы, если они пришли позже
        }
        return fallbackText || key;
    }
    try {
      const keys = key.split('.');
      let result = t;
      for (const k of keys) {
        if (result && typeof result === 'object' && result.hasOwnProperty(k)) {
          result = result[k];
        } else {
          return fallbackText || key;
        }
      }
      return typeof result === 'string' ? result : (fallbackText || key);
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return fallbackText || key;
    }
  };

  useEffect(() => {
    if (clientLang && typeof clientLang === 'string' && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);
      if (clientLang !== validLang) {
        router.replace(`/${validLang}/experts/${expertId}`, undefined, { shallow: true });
      }
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      } else if (translations && translations['kz']) { // Фоллбэк на казахский, если переводы для validLang отсутствуют
        setT(translations['kz']);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    } else if (!clientLang && serverLang && (currentLang !== serverLang || Object.keys(t).length === 0 )) {
        // Этот блок для инициализации, если clientLang нет, но есть serverLang
        // и текущий язык или переводы не соответствуют серверным
        setCurrentLang(serverLang);
        if (serverTranslations && Object.keys(serverTranslations).length > 0) {
            setT(serverTranslations);
        } else if (translations && translations[serverLang]) {
            setT(translations[serverLang]);
        }
    }
  }, [clientLang, router, expertId, serverLang, currentLang, serverTranslations]); // Добавили currentLang и serverTranslations для большей отзывчивости

  useEffect(() => {
    const fetchExpertDetails = async () => {
      setLoading(true);
      setError(null);
      setShowAvatarPlaceholderOnError(false); // Сброс для нового запроса
      try {
        const response = await fetch(EXPERTS_API.DETAIL(expertId));
        if (!response.ok) {
          // Попытка получить текст ошибки с сервера
          let errorDetail = `Код ошибки: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
          } catch (jsonError) {
            // Оставляем errorDetail как есть, если JSON парсинг не удался
          }
          throw new Error(errorDetail);
        }
        const data = await response.json();
        setExpert(data);
      } catch (err) {
        console.error('Ошибка при загрузке данных эксперта:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (expertId) {
      fetchExpertDetails();
    }
  }, [expertId]); // Убрал getTranslation из зависимостей этого useEffect

  const handleCollaborationRequest = () => {
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'kk-KZ', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-xl shadow-md max-w-md mx-auto">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Загрузка данных</h3>
          <p className="text-gray-600">{getTranslation('expert.loading', 'Загрузка данных эксперта...')}</p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <HeaderBack title={t && Object.keys(t).length > 0 ? getTranslation('expert.errorPageTitle', 'Ошибка') : 'Ошибка'} />
          <div className="bg-white rounded-xl shadow-md p-8 text-center mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t && Object.keys(t).length > 0 ? getTranslation('expert.error', 'Произошла ошибка') : 'Произошла ошибка'}</h3>
            <p className="text-gray-600 mb-6">{error || (t && Object.keys(t).length > 0 ? getTranslation('expert.notFound', 'Эксперт не найден.') : 'Эксперт не найден.')}</p>
            <button
              onClick={() => router.push(`/${currentLang}/experts`)}
              className="inline-flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="mr-1.5" />
              {t && Object.keys(t).length > 0 ? getTranslation('expert.backToList', 'К списку экспертов') : 'К списку экспертов'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Теперь переменная expert точно определена
  const avatarShouldShowPlaceholder = !expert.avatar_url || showAvatarPlaceholderOnError;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{expert.full_name} | {getTranslation('expert.pageTitle', 'Профиль Эксперта')}</title>
        <meta name="description" content={`${getTranslation('expert.metaDescriptionPrefix', 'Информация об эксперте:')} ${expert.full_name} - ${expert.specialization}`} />
      </Head>

      <HeaderBack title={expert.full_name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Основная информация */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 md:p-8 pb-24 md:pb-32">
            <div className="flex items-center">
              <div className="mr-4">
                <User size={28} />
              </div>
              <div>
                <div className="text-sm font-medium opacity-80">{getTranslation('expert.specialization', 'Специализация')}:</div>
                <div className="text-xl font-semibold">{expert.specialization}</div>
              </div>
            </div>
          </div>

          <div className="relative px-6 md:px-8 pb-6 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 -mt-16 md:-mt-20">
              {/* Аватар */}
              <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-full bg-white overflow-hidden border-4 border-white shadow-lg mx-auto md:mx-0">
                {avatarShouldShowPlaceholder ? (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100">
                    <UserPlaceholderIcon className="w-20 h-20 md:w-24 md:h-24 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={expert.avatar_url}
                    alt={`${getTranslation('expert.avatarAlt', 'Аватар')} ${expert.full_name}`}
                    className="h-full w-full object-cover"
                    onError={() => {
                      console.warn("Ошибка загрузки аватара, показываем плейсхолдер.");
                      setShowAvatarPlaceholderOnError(true);
                    }}
                  />
                )}
              </div>

              {/* Информация справа от аватара */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {expert.full_name}
                </h1>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-700 text-sm">
                  {expert.city && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                      <span>{expert.city}</span>
                    </div>
                  )}
                  {expert.address && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>{expert.address}</span>
                    </div>
                  )}
                  {expert.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                      <a href={`tel:${expert.phone}`} className="hover:text-teal-600 transition-colors">{expert.phone}</a>
                    </div>
                  )}
                  {expert.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                      <a
                        href={expert.website.startsWith('http') ? expert.website : `https://${expert.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 transition-colors truncate"
                      >
                        {expert.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleCollaborationRequest}
                    className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <MessageCircle size={18} className="mr-2" />
                    {getTranslation('expert.requestCollaboration', 'Запросить сотрудничество')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Образование */}
        {expert.education && expert.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Award size={20} className="text-teal-600 mr-3" />
                {getTranslation('expert.education.title', 'Образование')}
              </h2>
              <div className="space-y-6">
                {expert.education.map((edu, index) => (
                  <div key={edu.id || index} className={`${index < expert.education.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{edu.university}</h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : getTranslation('expert.date.present', 'по настоящее время')}
                    </p>
                    {edu.specialization && (
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">{getTranslation('expert.education.specialization', 'Специализация')}:</span> {edu.specialization}
                      </p>
                    )}
                    {edu.degree && (
                      <p className="text-gray-700 text-sm mt-1">
                        <span className="font-medium">{getTranslation('expert.education.degree', 'Степень')}:</span> {edu.degree}
                      </p>
                    )}
                    {edu.certificates && (
                      <p className="text-gray-700 text-sm mt-1">
                        <span className="font-medium">{getTranslation('expert.education.certificates', 'Сертификаты')}:</span> {edu.certificates}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Опыт работы */}
        {expert.experience && expert.experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Briefcase size={20} className="text-teal-600 mr-3" />
                {getTranslation('expert.experience.title', 'Опыт работы')}
              </h2>
              <div className="space-y-6">
                {expert.experience.map((exp, index) => (
                  <div key={exp.id || index} className={`${index < expert.experience.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{exp.position}</h3>
                    <p className="text-md text-gray-700 font-medium mb-1">{exp.company_name}</p>
                    <p className="text-sm text-gray-500 mb-3 flex items-center">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : getTranslation('expert.date.present', 'по настоящее время')}
                    </p>
                    {exp.work_description && (
                      <div className="mt-2">
                        <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{exp.work_description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Похожие эксперты (если есть) */}
        {expert.similar_experts && expert.similar_experts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Users size={20} className="text-teal-600 mr-3" />
                {getTranslation('expert.similarExperts', 'Похожие эксперты')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expert.similar_experts.map((similarExpert) => (
                  <div
                    key={similarExpert.id}
                    className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => router.push(`/${currentLang}/experts/${similarExpert.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 mr-3 overflow-hidden">
                        {similarExpert.avatar_url ? (
                          <img
                            src={similarExpert.avatar_url}
                            alt={similarExpert.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <UserPlaceholderIcon className="w-7 h-7" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{similarExpert.full_name}</h3>
                        <p className="text-xs text-gray-500">{similarExpert.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && expert && (
        <CollaborationModal
          expertId={expert.id}
          expertName={expert.full_name}
          onClose={() => setIsModalOpen(false)}
          getTranslation={getTranslation}
          currentLang={currentLang}
        />
      )}

      <Footer getTranslation={getTranslation} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang, expertId } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  if (lang !== validLang && context.res) {
    // Проверяем context.res для предотвращения ошибки на стороне клиента
    context.res.writeHead(302, { Location: `/${validLang}/experts/${expertId}` });
    context.res.end();
    return { props: {} }; // Для Next.js все равно нужно что-то вернуть
  }

  // Инициализируем переводы здесь, чтобы передать в props
  // и чтобы getTranslation работала корректно с самого начала на клиенте
  const langTranslations = translations[validLang] || (translations['kz'] || {});

  return {
    props: {
      lang: validLang,
      translations: langTranslations, // Передаем переводы
      expertId: String(expertId)
    }
  };
}
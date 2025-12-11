import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { translations } from '../../../../locales/translations';
import Footer from '../../../../components/Footer';
import { VACANCIES_API } from '../../../../utils/apiConfig';
import { formatDate } from '../../../../utils/dateUtils';
import AdminLayout from '../../../../components/layouts/AdminLayout';

export default function AdminVacanciesPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  // Состояние для списка вакансий
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для получения переводов по вложенным ключам
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

  // Загрузка списка вакансий
  useEffect(() => {
    const fetchVacancies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(VACANCIES_API.LIST);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Обработка разных форматов ответа
        let processedData = data;
        if (Array.isArray(data)) {
          processedData = data;
        } else if (data && Array.isArray(data.items)) {
          processedData = data.items;
        } else {
          processedData = [];
        }

        setVacancies(processedData);
      } catch (err) {
        console.error('Error fetching vacancies:', err);
        setError('Ошибка при загрузке вакансий');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, []);

  // Функция для получения локализованного значения
  const getLocalizedField = (vacancy, fieldName) => {
    if (!vacancy) return '';
    const localizedField = `${fieldName}_${currentLang}`;
    return vacancy[localizedField] || vacancy[`${fieldName}_ru`] || vacancy[`${fieldName}_kz`] || vacancy[fieldName] || '';
  };

  // Функция для удаления вакансии
  const handleDeleteVacancy = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      return;
    }

    try {
      const response = await fetch(VACANCIES_API.DELETE(id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Обновляем список после удаления
      setVacancies(vacancies.filter(vacancy => vacancy.id !== id));
    } catch (err) {
      console.error('Error deleting vacancy:', err);
      alert('Ошибка при удалении вакансии');
    }
  };

  useEffect(() => {
    // Обновляем язык при клиентской навигации
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      if (clientLang !== validLang) {
        router.replace(`/${validLang}/admin/vacancies`);
        return;
      }

      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang, router]);

  return (
                    <AdminLayout  title="Управление вакансиями">

    <div className="bg-white min-h-screen font-sans">




      <div className="max-w-4xl mx-auto px-4 py-8 bg-white mt-4 shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/${currentLang}/admin/vacancies/create`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Создать вакансию
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && vacancies.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            <p>Список вакансий пуст</p>
          </div>
        )}

        {!loading && !error && vacancies.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Локация
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата публикации
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vacancies.map((vacancy) => (
                  <tr key={vacancy.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getLocalizedField(vacancy, 'title')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getLocalizedField(vacancy, 'location')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(vacancy.created_at, currentLang)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vacancy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vacancy.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/${currentLang}/vacancies/${vacancy.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Просмотр
                      </Link>
                      <Link
                        href={`/${currentLang}/admin/vacancies/applications/${vacancy.id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Отклики
                      </Link>

                      <button
                        onClick={() => handleDeleteVacancy(vacancy.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
                  </AdminLayout>

  );
}

// Используем getServerSideProps для получения параметров на сервере
export async function getServerSideProps(context) {
  const { lang } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/admin/vacancies`,
        permanent: false,
      },
    };
  }

  const langTranslations = translations[validLang] || translations['kz'];

  return {
    props: {
      lang: validLang,
      translations: langTranslations,
    }
  };
}
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../../../locales/translations';
import Footer from '../../../../../components/Footer';
import HeaderBack from '../../../../../components/HeaderBack';
import { VACANCIES_API } from '../../../../../utils/apiConfig';

export default function EditVacancy({ lang: serverLang, translations: serverTranslations, vacancyId }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  // Остальное состояние для формы редактирования вакансии

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

  // Остальной код для редактирования вакансии

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('admin.vacancies.editTitle')}</title>
      </Head>

      <HeaderBack
        title={getTranslation('admin.vacancies.editTitle')}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Форма редактирования вакансии */}
      </div>

      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang, id } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/admin/vacancies/edit/${id}`,
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
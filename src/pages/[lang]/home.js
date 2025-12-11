import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Briefcase,
  Award,
  BookOpen,
  Users,
  ChevronRight
} from 'react-feather';

// Импортируем переводы из локалей
import { translations } from '../../locales/translations';

const Home = () => {
  const router = useRouter();
  const { lang } = router.query;

  // Инициализируем язык
  const [currentLang, setCurrentLang] = useState(
    typeof lang === 'string' && ['kz', 'ru', 'en'].includes(lang)
      ? lang
      : 'kz'
  );

  // Инициализируем переводы
  const [t, setT] = useState(translations[currentLang] || {});

  useEffect(() => {
    if (typeof lang === 'string' && lang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
      setCurrentLang(validLang);
      setT(translations[validLang] || {});
    }
  }, [lang, currentLang]);

  const langPrefix = `/${currentLang}`;

  // Карточки услуг
  const serviceCards = [
    {
      title: 'Найти работу',
      description: 'Вакансии для лиц с ограниченными возможностями',
      icon: <Briefcase size={32} className="text-blue-500" />,
      link: `${langPrefix}/vacancies`,
      color: 'bg-blue-50 hover:bg-blue-100',
      buttonColor: 'text-blue-600 hover:bg-blue-600 hover:text-white'
    },
    {
      title: 'Получить сертификат',
      description: 'Сертификация навыков и квалификации',
      icon: <Award size={32} className="text-teal-500" />,
      link: `${langPrefix}/certificates`,
      color: 'bg-teal-50 hover:bg-teal-100',
      buttonColor: 'text-teal-600 hover:bg-teal-600 hover:text-white'
    },
    {
      title: 'Пройти обучение',
      description: 'Электронные курсы для развития навыков',
      icon: <BookOpen size={32} className="text-purple-500" />,
      link: `${langPrefix}/courses`,
      color: 'bg-purple-50 hover:bg-purple-100',
      buttonColor: 'text-purple-600 hover:bg-purple-600 hover:text-white'
    },
    {
      title: 'Найти эксперта',
      description: 'Консультации специалистов в разных областях',
      icon: <Users size={32} className="text-orange-500" />,
      link: `${langPrefix}/experts/all`,
      color: 'bg-orange-50 hover:bg-orange-100',
      buttonColor: 'text-orange-600 hover:bg-orange-600 hover:text-white'
    }
  ];

  return (
    <>
      <Head>
        <title>Табыс - Возможности для всех</title>
        <meta name="description" content="Платформа для лиц с ограниченными возможностями. Курсы, работа, сертификаты и экспертная поддержка." />
      </Head>

      {/* Главный баннер с видео */}
      <section className="relative bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Раскройте свой потенциал с <span className="text-yellow-300">TABYS</span>
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                Платформа возможностей для людей с особыми потребностями.
                Образование, трудоустройство и поддержка на каждом шагу вашего пути.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href={`${langPrefix}/courses`} legacyBehavior>
                  <a className="px-6 py-3 bg-white text-teal-600 font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300">
                    Начать обучение
                  </a>
                </Link>
                <Link href={`${langPrefix}/experts/all`} legacyBehavior>
                  <a className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-teal-600 transition duration-300">
                    Найти эксперта
                  </a>
                </Link>
              </div>
            </div>

            {/* YouTube Видео контейнер */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm">
              <div className="aspect-video relative">
                <iframe
                  src="https://www.youtube.com/embed/oUpdEYBWUWk?rel=0&showinfo=0&controls=1"
                  title="Промо-видео Табыс"
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Волнообразный разделитель */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-0 transform translate-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="text-white w-full h-16 md:h-24">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Секция услуг */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши возможности</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Мы создали платформу, которая предоставляет доступные инструменты
              для развития, обучения и трудоустройства.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((card, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 transition-all duration-300 ${card.color} group`}
              >
                <div className="mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-gray-700 mb-4">{card.description}</p>
                <Link href={card.link} legacyBehavior>
                  <a className={`inline-flex items-center font-medium rounded-lg px-4 py-2 transition-colors duration-300 border border-current ${card.buttonColor}`}>
                    Подробнее
                    <ChevronRight size={16} className="ml-1" />
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Секция о нас */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <div className="aspect-[4/3]">
                  <img
                    src="/images/about_us.jpg"
                    alt="Сообщество Табыс"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <span className="bg-teal-500 px-3 py-1 rounded-full text-sm font-medium">
                      Наше сообщество
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-teal-600 font-medium">О проекте</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Наша миссия</h2>
              </div>
              <p className="text-gray-700">
                Миссия проекта Табыс — создать инклюзивную среду, где каждый человек
                с особыми потребностями может реализовать свой потенциал. Мы стремимся
                разрушить барьеры, препятствующие полноценному участию в образовательной
                и профессиональной деятельности.
              </p>
              <p className="text-gray-700">
                Наша платформа объединяет возможности обучения, получения сертификатов,
                трудоустройства и консультации экспертов в различных областях,
                чтобы каждый участник мог построить свой путь к успеху.
              </p>
              <Link href={`${langPrefix}/about`} legacyBehavior>
                <a className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700">
                  Узнать больше о нас
                  <ChevronRight size={16} className="ml-1" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Блок призыва к действию */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Готовы начать?</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Присоединяйтесь к нашему сообществу прямо сейчас и откройте
            новые возможности для развития и трудоустройства.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`${langPrefix}/register`} legacyBehavior>
              <a className="px-8 py-4 bg-white text-teal-600 font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300">
                Зарегистрироваться
              </a>
            </Link>
            <Link href={`${langPrefix}/contact`} legacyBehavior>
              <a className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-teal-600 transition duration-300">
                Связаться с нами
              </a>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
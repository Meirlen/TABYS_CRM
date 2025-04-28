import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const TestimonialsBlock = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [translations, setTranslations] = useState({});

  // Simple translation function
  const t = (key) => {
    try {
      const keys = key.split('.');
      let result = translations;

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

  // Load translations
  useEffect(() => {
    if (lang) {
      // Import translations based on language
      import('../../locales/translations').then(({ translations }) => {
        const currentLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
        setTranslations(translations[currentLang] || translations['kz']);
      });
    }
  }, [lang]);

  // Цветовые классы для аватаров
  const colorClasses = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600'
  ];

  // Фиксированные ключи для отзывов вместо числовых индексов
  const reviewKeys = ['review1', 'review2', 'review3', 'review4'];

  // Создаем массив отзывов из переводов с правильными ключами
  const testimonials = reviewKeys.map((key, index) => ({
    id: key,
    name: t(`testimonial.items.${key}.name`),
    initial: t(`testimonial.items.${key}.initial`),
    text: t(`testimonial.items.${key}.text`),
    rating: 5, // Все оценки - 5 звезд
    date: t(`testimonial.items.${key}.date`),
    colorClass: colorClasses[index]
  }));

  // Компонент для отображения звездного рейтинга
  const StarRating = ({ rating }) => {
    return (
      <div className="flex text-yellow-400 mt-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill={i < rating ? 'currentColor' : '#e5e7eb'}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="my-12">
      {/* Заголовок с декоративными элементами */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
        <h2 className="text-2xl font-bold text-gray-900 bg-gray-50 px-6 relative z-10">
          {t('testimonial.title')}
        </h2>
      </div>

      {/* Сетка отзывов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 relative hover:shadow-lg transition-all duration-300"
          >
            {/* Декоративные кавычки */}
            <div className="absolute top-4 right-4 text-gray-200 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.colorClass} rounded-full flex items-center justify-center mr-3 text-base font-bold text-white shadow-md`}>
                {testimonial.initial}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
                <StarRating rating={testimonial.rating} />
              </div>
            </div>

            <p className="text-gray-600 mb-3">{testimonial.text}</p>

            <div className="text-xs text-gray-400">{testimonial.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsBlock;
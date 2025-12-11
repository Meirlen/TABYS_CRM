import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Globe, Award } from 'react-feather';

const CourseCard = ({ course, formatPrice, enrollment }) => {
  // Получаем уровень сложности курса на русском
  const getLevelText = (level) => {
    switch (level) {
      case 'beginner':
        return 'Начинающий';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      case 'expert':
        return 'Эксперт';
      default:
        return '';
    }
  };

  // Получаем цвет для уровня сложности
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-teal-100 text-teal-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
      case 'expert':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Подсчет тестов и их статуса
  const getTestsStatus = () => {
    if (!course.tests || !Array.isArray(course.tests)) {
      return { total: 0, completed: 0 };
    }

    const totalTests = course.tests.length;
    let completedTests = 0;

    if (enrollment && enrollment.completed_tests) {
      completedTests = course.tests.filter(test =>
        enrollment.completed_tests.includes(test.id)
      ).length;
    }

    return { total: totalTests, completed: completedTests };
  };

  // Форматирование статуса тестов
  const formatTestsStatus = () => {
    const { total, completed } = getTestsStatus();
    if (total === 0) return null; // Не показываем, если тестов нет
    return `${completed}/${total} тестов`;
  };

  // Определяем URL для изображения
  const imageUrl = course.cover_image
    ? `${API_BASE_URL}/${course.cover_image}`
    : null;

  // Вычисляем прогресс для индикатора
  const progress = enrollment?.progress || 0;

  return (
    <Link href={`/ru/courses/${course.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer transform hover:-translate-y-1">
        {/* Обложка курса */}
        <div className="relative h-48">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={course.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const placeholder = e.target.nextElementSibling;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : (
            <div className={`h-full w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 ${imageUrl ? 'hidden' : 'flex'}`}>
              <span className="text-white font-bold text-xl">{course.title?.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
          {imageUrl && (
            <div className="absolute inset-0 h-full w-full hidden items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600">
              <span className="text-white font-bold text-xl">{course.title?.substring(0, 2).toUpperCase()}</span>
            </div>
          )}

          {/* Градиент поверх изображения */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

          {/* Бесплатный курс - бейдж */}
          {course.is_free && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              Бесплатно
            </div>
          )}

          {/* Статус тестов - бейдж */}
          {formatTestsStatus() && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {formatTestsStatus()}
            </div>
          )}

          {/* Цена и рейтинг внизу фотографии */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            {/* Цена */}
            <div className="font-medium text-white text-lg bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg">
              {formatPrice(course)}
            </div>

            {/* Рейтинг (если есть и больше 0) */}
            {course.average_rating > 0 && (
              <div className="flex items-center bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-white">{course.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Содержимое карточки */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">{course.title}</h3>

          <div className="text-sm text-gray-600 mb-2 flex items-center">
            {course.author?.user_name && (
              <>
                <Award className="w-4 h-4 mr-1 text-gray-400" />
                <span>{course.author.user_name}</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

          {/* Прогресс, если курс начат */}
          {enrollment && progress > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Прогресс</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Блок с характеристиками курса */}
          <div className="mt-auto">
            <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
              {/* Уровень сложности */}
              {course.level && (
                <div className={`flex items-center ${getLevelColor(course.level)} px-2 py-1 rounded-lg`}>
                  <Award className="w-3 h-3 mr-1" />
                  <span>{getLevelText(course.level)}</span>
                </div>
              )}

              {/* Длительность */}
              {course.duration && (
                <div className="flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{course.duration} ч.</span>
                </div>
              )}

              {/* Язык */}
              {course.language && (
                <div className="flex items-center bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">
                  <Globe className="w-3 h-3 mr-1" />
                  <span>{course.language}</span>
                </div>
              )}
            </div>
          </div>

          {/* Кнопка */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg bg-teal-50 text-teal-600 font-medium text-sm hover:bg-teal-600 hover:text-white transition-colors group-hover:bg-teal-600 group-hover:text-white">
              {enrollment && progress > 0 ? "Продолжить обучение" : "Посмотреть курс"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
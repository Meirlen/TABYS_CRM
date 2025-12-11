import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { CoursesAPI } from '../../../api/coursesAPI';
export const API_BASE_URL = "https://saryarqajastary.kz";

const CourseModeration = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moderationAction, setModerationAction] = useState('approve');
  const [moderationComment, setModerationComment] = useState('');
  const router = useRouter();
  const { lang } = router.query;

  // Загрузка списка курсов на модерации
  useEffect(() => {
    const fetchCourses = async () => {
      if (!lang) return; // Добавляем проверку на существование lang

      setLoading(true);
      try {
        // Здесь мы предполагаем, что API возвращает все курсы, а затем фильтруем только со статусом "pending"
        // В реальности может быть отдельный эндпоинт для получения только курсов на модерации
        const response = await CoursesAPI.getPendingCourses();
        const pendingCourses = response.data.filter(course => course.status === 'pending');
        setCourses(pendingCourses);
      } catch (err) {
        console.error('Ошибка при загрузке курсов на модерации:', err);
        setError(err.message || 'Не удалось загрузить курсы на модерации');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [lang]);

  // Обработчик отправки формы модерации
  const handleSubmitModeration = async (e) => {
    e.preventDefault();

    if (!selectedCourse) return;

    try {
        const newStatus = moderationAction === 'approve' ? 'approved' : 'rejected';
      const response = await CoursesAPI.updateCourseStatus(selectedCourse.id, {
        status: newStatus,
        status_comment: moderationComment
      });

      // Обновляем список курсов, удаляя обработанный
      setCourses(courses.filter(course => course.id !== selectedCourse.id));

      // Закрываем модальное окно и сбрасываем форму
      setShowModal(false);
      setSelectedCourse(null);
      setModerationAction('approve');
      setModerationComment('');

      alert(`Курс ${response.data.title} успешно ${newStatus === 'active' ? 'одобрен' : 'отклонен'}`);
    } catch (err) {
      console.error('Ошибка при модерации курса:', err);
      alert('Не удалось выполнить модерацию курса. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Открытие модального окна модерации
  const openModerationModal = (course, action) => {
    setSelectedCourse(course);
    setModerationAction(action);
    setModerationComment('');
    setShowModal(true);
  };

  // Модальное окно модерации
  const renderModerationModal = () => {
    if (!selectedCourse) return null;

    const isApprove = moderationAction === 'approve';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {isApprove ? 'Одобрение курса' : 'Отклонение курса'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                Вы собираетесь <strong>{isApprove ? 'одобрить' : 'отклонить'}</strong> курс:
              </p>
              <p className="font-medium mt-1">{selectedCourse.title}</p>
            </div>

            <form onSubmit={handleSubmitModeration}>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  {isApprove ? 'Комментарий (опционально)' : 'Причина отклонения *'}
                </label>
                <textarea
                  id="comment"
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  required={!isApprove}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isApprove ? 'Комментарий для автора курса' : 'Укажите причину отклонения курса для автора'}
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md transition-colors ${
                    isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isApprove ? 'Одобрить курс' : 'Отклонить курс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Функция форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <AdminLayout title="Модерация курсов">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Загрузка курсов на модерации...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Модерация курсов">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Попробовать снова
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Модерация курсов">
      <div className="mb-6">
        <span className="text-gray-600">Курсов на модерации: {courses.length}</span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-10 rounded-md text-center">
          <p>Нет курсов, ожидающих модерации</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Автор: {course.author?.user_name || 'Неизвестно'} |
                      Создан: {formatDate(course.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModerationModal(course, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => openModerationModal(course, 'reject')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Язык:</span>
                      <span className="ml-2 text-gray-900">{course.language}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Длительность:</span>
                      <span className="ml-2 text-gray-900">{course.duration} ч</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Уровень:</span>
                      <span className="ml-2 text-gray-900">
                        {course.level === 'beginner' && 'Начинающий'}
                        {course.level === 'intermediate' && 'Средний'}
                        {course.level === 'advanced' && 'Продвинутый'}
                        {course.level === 'expert' && 'Эксперт'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Категории:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.categories && course.categories.length > 0 ? (
                          course.categories.map(category => (
                            <span key={category.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {category.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">Нет категорий</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Цена:</span>
                      <span className="ml-2 text-gray-900">
                        {course.is_free ? (
                          <span className="text-green-600">Бесплатно</span>
                        ) : (
                          `${course.price} ${course.currency}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    {course.cover_image && (
                      <img
                        src={`${API_BASE_URL}/${course.cover_image}`}
                        alt={course.title}
                        className="h-24 w-full object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">Описание:</div>
                  <p className="text-gray-700">{course.description}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/${lang}/admin/courses/${course.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Подробнее о курсе →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно модерации */}
      {showModal && renderModerationModal()}
    </AdminLayout>
  );
};

export default CourseModeration;
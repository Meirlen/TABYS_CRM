import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { CoursesAPI } from '../../../api/coursesAPI';
import {
  ArrowLeft,
  Clock,
  User,
  Globe,
  TrendingUp,
  Eye,
  Play,
  CheckCircle,
  BookOpen,
  Award
} from 'react-feather';

const CourseDetailPage = () => {
  const router = useRouter();
  const { id, lang } = router.query;

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await CoursesAPI.getCourseDetails(id);
        setCourse(response.data);

        // If user is authenticated, check enrollment status
        if (isAuthenticated) {
          try {
            const enrollmentResponse = await CoursesAPI.getCourseProgress(id);
            setEnrollment(enrollmentResponse.data);
          } catch (err) {
            // If 404, user is not enrolled, which is fine
            if (err.response && err.response.status !== 404) {
              console.error('Ошибка при получении информации о записи:', err);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных курса:', err);
        setError(err.message || 'Не удалось загрузить данные курса');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isAuthenticated]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      router.push('/ru/auth/login?redirect=' + encodeURIComponent(`/ru/courses/${id}`));
      return;
    }

    setEnrollmentLoading(true);
    try {
      const response = await CoursesAPI.enrollInCourse(id);
      setEnrollment(response.data);
      alert('Вы успешно записались на курс!');
    } catch (err) {
      console.error('Ошибка при записи на курс:', err);
      alert(err.response?.data?.detail || 'Не удалось записаться на курс');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Format price
  const formatPrice = (course) => {
    if (course.is_free) return 'Бесплатно';
    return `${course.price} ${course.currency}`;
  };

  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours} ч ${mins > 0 ? mins + ' мин' : ''}`;
    }
    return `${mins} мин`;
  };

  // Calculate total lessons count
  const getTotalLessonsCount = (chapters) => {
    if (!chapters) return 0;
    return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  };

  // Calculate completed lessons count
  const getCompletedLessonsCount = (chapters, enrollment) => {
    if (!chapters || !enrollment) return 0;

    // Получаем массив ID завершенных уроков в зависимости от структуры данных
    let completedLessons = [];

    if (Array.isArray(enrollment.completed_lessons)) {
      completedLessons = enrollment.completed_lessons;
    } else if (enrollment.enrollment && Array.isArray(enrollment.enrollment.completed_lessons)) {
      completedLessons = enrollment.enrollment.completed_lessons;
    } else if (enrollment.completed_lessons) {
      completedLessons = enrollment.completed_lessons;
    }

    let count = 0;
    chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        if (completedLessons.includes(lesson.id)) {
          count++;
        }
      });
    });
    return count;
  };

  // Получаем прогресс корректно, учитывая разные возможные структуры данных
  const getProgress = () => {
    // Если enrollment это объект с полем enrollment (вложенная структура)
    if (enrollment && enrollment.enrollment && typeof enrollment.enrollment.progress === 'number') {
      return Math.round(enrollment.enrollment.progress);
    }

    // Если enrollment это объект с прямым полем progress
    if (enrollment && typeof enrollment.progress === 'number') {
      return Math.round(enrollment.progress);
    }

    // Возможная структура из /courses/{id}/progress API
    if (enrollment && typeof enrollment === 'object') {
      if (enrollment.progress) {
        return Math.round(enrollment.progress);
      }

      // Проверяем другую возможную структуру ответа
      if (enrollment.enrollment && enrollment.enrollment.progress) {
        return Math.round(enrollment.enrollment.progress);
      }
    }

    return 0;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Загрузка курса</h3>
          <p className="text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium mb-1">Ошибка</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!course) return null;

  // Calculate total lessons and completed lessons for display purposes
  const totalLessons = getTotalLessonsCount(course.chapters);
  const completedLessons = enrollment ? getCompletedLessonsCount(course.chapters, enrollment) : 0;
  const progressPercentage = getProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Кнопка "Назад к курсам" */}
        <div className="mb-6">
          <Link href={`/${router.query.lang || 'ru'}/courses`} className="inline-flex items-center text-teal-600 hover:text-teal-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку курсов
          </Link>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Course Cover Image */}
            <div className="md:w-1/3 lg:w-1/4 relative">
              {course.cover_image ? (
                <div className="relative h-48 md:h-full">
                  <Image
                    src={course.cover_image.startsWith('/') ? course.cover_image : `/${course.cover_image}`}
                    alt={course.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              ) : (
                <div className="h-48 md:h-full bg-gradient-to-r from-teal-500/30 to-blue-500/30 flex items-center justify-center">
                  <BookOpen size={48} className="text-teal-500" />
                </div>
              )}

              {/* Course Status Badge */}
              {enrollment && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-3 py-1 text-sm rounded-full shadow-sm">
                  {progressPercentage === 100 ? 'Завершено' : 'В процессе'}
                </div>
              )}
            </div>

            <div className="p-6 flex-1">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    {course.author && (
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-teal-600" />
                        {course.author.name}
                      </span>
                    )}

                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-teal-600" />
                      {formatDuration(course.duration)}
                    </span>

                    <span className="flex items-center">
                      <Globe className="h-4 w-4 mr-1.5 text-teal-600" />
                      {course.language}
                    </span>

                    <span className="flex items-center">
                      <Award className="h-4 w-4 mr-1.5 text-teal-600" />
                      {course.level || 'Любой уровень'}
                    </span>

                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1.5 text-teal-600" />
                      {course.views || 0} просмотров
                    </span>
                  </div>

                  {course.categories && course.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.categories.map(category => (
                        <Link
                          href={`/${router.query.lang || 'ru'}/courses/search?category_id=${category.id}`}
                          key={category.id}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700">{course.description}</p>
                  </div>

                  {course.skills && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                        Навыки, которые вы получите:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.split(',').map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Enrollment and Price Card */}
                <div className="md:ml-6 md:w-72 mt-6 md:mt-0">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      {formatPrice(course)}
                    </div>

                    {enrollment ? (
                      <div>
                        <div className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Прогресс</span>
                            <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {completedLessons} из {totalLessons} уроков пройдено
                          </div>
                        </div>
                        <Link
                          href={`/${router.query.lang || 'ru'}/courses/${id}/learn`}
                          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-center block transition-colors shadow-sm"
                        >
                          {progressPercentage === 0 ? 'Начать обучение' : 'Продолжить обучение'}
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrollmentLoading}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm ${enrollmentLoading ? 'bg-gray-400' : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700'} text-white`}
                      >
                        {enrollmentLoading ? 'Записываем...' : 'Записаться на курс'}
                      </button>
                    )}
                    {course.video_preview && (
                      <div className="mt-4">
                        <button
                          onClick={() => window.open(course.video_preview, '_blank')}
                          className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Play className="h-4 w-4 mr-2 text-teal-600" />
                          Смотреть превью
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content - с улучшенным отображением прогресса для уроков и тестов */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-teal-600" />
                Содержание курса
              </h2>

              {enrollment && (
                <div className="flex items-center">
                  <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{progressPercentage}%</span>
                </div>
              )}
            </div>

            {course.chapters && course.chapters.length > 0 ? (
              <div className="space-y-4">
                {course.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                      <h3 className="text-lg font-semibold">Глава {index + 1}: {chapter.title}</h3>
                      {chapter.description && (
                        <p className="text-gray-600 mt-1">{chapter.description}</p>
                      )}
                    </div>

                    {chapter.lessons && chapter.lessons.length > 0 && (
                      <ul className="divide-y divide-gray-200">
                        {chapter.lessons.map((lesson, lessonIndex) => {
                          // Получаем массив ID завершенных уроков
                          let completedLessonIds = [];
                          if (enrollment) {
                            if (Array.isArray(enrollment.completed_lessons)) {
                              completedLessonIds = enrollment.completed_lessons;
                            } else if (enrollment.enrollment && Array.isArray(enrollment.enrollment.completed_lessons)) {
                              completedLessonIds = enrollment.enrollment.completed_lessons;
                            }
                          }

                          const isCompleted = completedLessonIds.includes(lesson.id);

                          return (
                            <li key={lesson.id} className={`p-4 hover:bg-gray-50 transition-colors ${isCompleted ? 'bg-green-50' : ''}`}>
                              <div className="flex items-start">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <span className="text-xs font-medium">{lessonIndex + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-md font-medium text-gray-900 flex items-center">
                                        {lesson.title}
                                        {isCompleted && (
                                          <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                            Выполнено
                                          </span>
                                        )}
                                      </h4>

                                      {lesson.description && (
                                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                                      )}
                                    </div>
                                    {enrollment ? (
                                      <Link
                                        href={`/${router.query.lang || 'ru'}/courses/${id}/learn/${lesson.id}`}
                                        className={`text-sm px-4 py-1.5 rounded-lg font-medium ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700'} transition-colors shadow-sm`}
                                      >
                                        {isCompleted ? 'Повторить' : 'Начать'}
                                      </Link>
                                    ) : (
                                      <span className="text-sm text-gray-500 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Требуется запись
                                      </span>
                                    )}
                                  </div>

                                  {/* Тесты урока */}
                                  {lesson.tests && lesson.tests.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                                      {lesson.tests.length} {lesson.tests.length === 1 ? 'тест' :
                                        lesson.tests.length < 5 ? 'теста' : 'тестов'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Содержание курса еще не добавлено</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
// src/pages/[lang]/courses/[id]/learn/[lessonId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Tests from '../../../../../components/Tests';
import { CoursesAPI } from '../../../../../api/coursesAPI';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Play,
  FileText,
  AlertTriangle
} from 'react-feather';

const LearningPage = () => {
  const router = useRouter();
  const { id, lessonId } = router.query;

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [completedTests, setCompletedTests] = useState([]);
  const [activeTab, setActiveTab] = useState('video');

  // Получение данных о курсе и прогрессе
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Загружаем курс
        const courseResponse = await CoursesAPI.getCourseDetails(id);
        setCourse(courseResponse.data);

        // Пробуем получить прогресс (может завершиться ошибкой, если пользователь не записан)
        try {
          const progressResponse = await CoursesAPI.getCourseProgress(id);
          setProgress(progressResponse.data);

          // Если есть lessonId, проверяем статус завершения урока
          if (lessonId && progressResponse.data && progressResponse.data.completed_lessons) {
            // Важно: конвертируем lessonId в число для корректного сравнения
            const lessonIdInt = parseInt(lessonId);
            const isCompleted = progressResponse.data.completed_lessons.some(
              id => parseInt(id) === lessonIdInt
            );
            setIsLessonCompleted(isCompleted);
            console.log('Урок завершен:', isCompleted, 'ID урока:', lessonIdInt);
          }

          // Получаем информацию о завершенных тестах
          if (progressResponse.data && progressResponse.data.completed_tests) {
            setCompletedTests(progressResponse.data.completed_tests);
          }
        } catch (err) {
          console.log('Пользователь не записан на курс или другая ошибка прогресса:', err);
          // Если ошибка 404, пользователь просто не записан - это нормально
          if (err.response && err.response.status === 404) {
            // Перенаправляем на страницу курса для записи
            router.push(`/${router.query.lang}/courses/${id}`);
            return;
          }
        }

        // Если не указан конкретный урок, перенаправляем на первый
        if (!lessonId && courseResponse.data.chapters.length > 0 &&
            courseResponse.data.chapters[0].lessons.length > 0) {
          const firstLesson = courseResponse.data.chapters[0].lessons[0];
          router.push(`/${router.query.lang}/courses/${id}/learn/${firstLesson.id}`);
          return;
        }

        // Находим текущий урок
        if (lessonId) {
          let foundLesson = null;
          for (const chapter of courseResponse.data.chapters) {
            const lesson = chapter.lessons.find(l => l.id.toString() === lessonId.toString());
            if (lesson) {
              foundLesson = { ...lesson, chapter_id: chapter.id, chapter_title: chapter.title };
              break;
            }
          }

          if (foundLesson) {
            setCurrentLesson(foundLesson);
          } else {
            setError('Урок не найден');
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Не удалось загрузить курс');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, lessonId, router]);

  // Функция для отметки урока как завершенного
  const markLessonCompleted = async () => {
    try {
      const response = await CoursesAPI.completeLesson(id, currentLesson.id);
      setProgress(response.data);
      setIsLessonCompleted(true);

      // Обновляем список завершенных тестов, если он есть в ответе
      if (response.data && response.data.completed_tests) {
        setCompletedTests(response.data.completed_tests);
      }

      // Принудительно обновляем состояние завершенного урока
      if (response.data && response.data.completed_lessons) {
        // Проверяем, что текущий урок отмечен как завершенный на сервере
        const isCompleted = response.data.completed_lessons.includes(parseInt(currentLesson.id));
        setIsLessonCompleted(isCompleted);
      }
    } catch (err) {
      console.error('Ошибка при отметке урока:', err);
      alert('Не удалось отметить урок как завершенный');
    }
  };

  // Обработчик завершения теста
  const handleTestComplete = (testId, passed) => {
    if (passed && !isLessonCompleted) {
      markLessonCompleted();
    }

    // Если тест пройден, добавляем его в список завершенных локально
    // до следующего обновления с сервера
    if (passed && !completedTests.includes(testId)) {
      setCompletedTests([...completedTests, testId]);
    }
  };

  // Проверка, завершен ли тест
  const isTestCompleted = (testId) => {
    return completedTests.includes(parseInt(testId));
  };

  // Проверка, завершены ли все тесты урока
  const areAllTestsCompleted = (lesson) => {
    if (!lesson.tests || lesson.tests.length === 0) return false;
    return lesson.tests.every(test => isTestCompleted(test.id));
  };

  // Проверка, есть ли в уроке тесты
  const hasTests = (lesson) => {
    return lesson.tests && lesson.tests.length > 0;
  };

  // Получение следующего урока для навигации
  const getNextLesson = () => {
    if (!course || !currentLesson) return null;

    let foundCurrentChapter = false;
    let foundCurrentLesson = false;

    for (const chapter of course.chapters) {
      if (foundCurrentLesson) break;

      if (chapter.id === currentLesson.chapter_id) {
        foundCurrentChapter = true;

        for (let i = 0; i < chapter.lessons.length; i++) {
          if (foundCurrentLesson && i < chapter.lessons.length) {
            return chapter.lessons[i];
          }

          if (chapter.lessons[i].id === currentLesson.id) {
            foundCurrentLesson = true;
            if (i + 1 < chapter.lessons.length) {
              return chapter.lessons[i + 1];
            }
          }
        }
      } else if (foundCurrentChapter) {
        if (chapter.lessons.length > 0) {
          return chapter.lessons[0];
        }
      }
    }

    return null; // Нет следующего урока
  };

  // Функция для преобразования URL YouTube в URL для встраивания
  function getYouTubeEmbedUrl(url) {
    // Для ссылок вида: https://www.youtube.com/watch?v=VIDEO_ID
    let videoId = url.match(/v=([^&]*)/);

    // Для ссылок вида: https://youtu.be/VIDEO_ID
    if (!videoId) {
      videoId = url.match(/youtu\.be\/([^?]*)/);
    }

    if (videoId && videoId[1]) {
      return `https://www.youtube.com/embed/${videoId[1]}`;
    }

    // Если не удалось извлечь ID, возвращаем исходный URL
    return url;
  }

  // Функция для преобразования URL ВКонтакте в URL для встраивания
  function getVKEmbedUrl(url) {
    // Пример ссылки: https://vk.com/video-12345_67890
    const videoMatch = url.match(/vk\.com\/video(-?\d+_\d+)/);

    if (videoMatch && videoMatch[1]) {
      return `https://vk.com/video_ext.php?oid=${videoMatch[1].split('_')[0]}&id=${videoMatch[1].split('_')[1]}&hd=1`;
    }

    // Если не удалось извлечь ID, возвращаем исходный URL
    return url;
  }

  // Рендеринг состояния загрузки
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Загрузка урока</h3>
            <p className="text-gray-600">Пожалуйста, подождите, идет загрузка учебных материалов</p>
          </div>
        </div>
      </div>
    );
  }

  // Рендеринг ошибки
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="font-medium">Ошибка</p>
          </div>
          <p className="mt-1">{error}</p>
        </div>
        <Link href={`/${router.query.lang}/courses/${id}`} className="text-teal-600 hover:text-teal-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к странице курса
        </Link>
      </div>
    );
  }

  if (!course || !currentLesson) return null;

  const nextLesson = getNextLesson();

  // Расчет прогресса безопасным способом
  const calculateProgress = () => {
    // Проверяем, есть ли полная информация о прогрессе с enrollment
    if (progress && progress.enrollment && typeof progress.enrollment.progress === 'number') {
      return Math.round(progress.enrollment.progress);
    }

    // Если нет данных об enrollment.progress, но есть массив завершенных уроков
    if (progress && progress.completed_lessons && Array.isArray(progress.completed_lessons)) {
      const totalLessons = getTotalLessonsCount(course.chapters);
      if (totalLessons === 0) return 0;
      return Math.round((progress.completed_lessons.length / totalLessons) * 100);
    }

    // Если нет никакой информации о прогрессе
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Верхняя навигационная панель */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${router.query.lang}/courses/${id}`} className="text-gray-600 hover:text-teal-600 mr-3 p-1 rounded transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-medium truncate max-w-md">{course.title}</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full h-2 w-36 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {calculateProgress()}% завершено
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Сайдбар с содержанием курса */}
        <div className="w-full md:w-1/4 bg-white rounded-xl shadow-sm p-4 mb-6 md:mb-0 md:mr-6 overflow-y-auto max-h-[calc(100vh-9rem)] md:sticky md:top-20">
          <h2 className="text-lg font-medium mb-4">Содержание курса</h2>
          <div className="space-y-4">
            {course.chapters.map((chapter, index) => (
              <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3">
                  <h3 className="text-md font-semibold text-gray-800">Глава {index + 1}: {chapter.title}</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {chapter.lessons.map((lesson) => {
                    const isActive = currentLesson.id === lesson.id;
                    const isCompleted = progress && progress.completed_lessons &&
                                      progress.completed_lessons.some(id => parseInt(id) === parseInt(lesson.id));
                    const hasLessonTests = hasTests(lesson);
                    const allTestsCompleted = areAllTestsCompleted(lesson);

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/${router.query.lang}/courses/${id}/learn/${lesson.id}`}
                          className={`block p-3 hover:bg-gray-50 flex items-center ${isActive ? 'bg-teal-50 text-teal-700 font-medium' : ''}`}
                        >
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{chapter.lessons.indexOf(lesson) + 1}</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <span className="text-sm truncate block">{lesson.title}</span>
                            {hasLessonTests && (
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-500 mr-1">Тесты:</span>
                                {allTestsCompleted ? (
                                  <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-0.5" />
                                    Пройдены
                                  </span>
                                ) : (
                                  <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">
                                    Не пройдены
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Основное содержимое урока */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">{currentLesson.title}</h2>
              <p className="text-gray-600 text-sm">{currentLesson.chapter_title}</p>
            </div>

            {/* Табы для переключения между видео и тестами */}
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-5 py-3 font-medium text-sm flex items-center ${activeTab === 'video' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('video')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Видеоурок
                </button>
                {currentLesson.tests && currentLesson.tests.length > 0 && (
                  <button
                    className={`px-5 py-3 font-medium text-sm flex items-center ${activeTab === 'tests' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('tests')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Тесты ({currentLesson.tests.length})
                    {currentLesson.tests.every(test => isTestCompleted(test.id)) && (
                      <span className="ml-2 inline-block w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Содержимое текущего таба */}
            <div className="p-5">
              {activeTab === 'video' ? (
                <div>
                  {/* Видеоплеер */}
                  <div className="aspect-video bg-black mb-6 rounded-lg overflow-hidden">
                    {currentLesson.video_url && (
                      currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full"
                          src={getYouTubeEmbedUrl(currentLesson.video_url)}
                          title={currentLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : currentLesson.video_url.includes('vk.com') ? (
                        <iframe
                          className="w-full h-full"
                          src={getVKEmbedUrl(currentLesson.video_url)}
                          title={currentLesson.title}
                          allow="autoplay; encrypted-media; fullscreen"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video
                          className="w-full h-full"
                          src={currentLesson.video_url}
                          controls
                          onEnded={() => !isLessonCompleted && markLessonCompleted()}
                        />
                      )
                    )}
                  </div>

                  {/* Описание урока */}
                  {currentLesson.description && (
                    <div className="prose prose-teal max-w-none mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
                        Описание урока
                      </h3>
                      <p className="text-gray-700">{currentLesson.description}</p>
                    </div>
                  )}

                  {/* Кнопки навигации и завершения */}
                  <div className="flex flex-col sm:flex-row justify-between mt-8 pt-4 border-t border-gray-100">
                    <div className="mb-4 sm:mb-0">
                      {!isLessonCompleted ? (
                        <button
                          onClick={markLessonCompleted}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Отметить как выполненный
                        </button>
                      ) : (
                        <div className="inline-flex items-center px-5 py-2.5 bg-green-100 text-green-700 font-medium rounded-lg">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Урок завершён
                        </div>
                      )}
                    </div>
                    {nextLesson && (
                      <Link
                        href={`/${router.query.lang}/courses/${id}/learn/${nextLesson.id}`}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        Следующий урок
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <Tests
                  courseId={id}
                  lessonId={currentLesson.id}
                  tests={currentLesson.tests}
                  completedTests={completedTests}
                  onComplete={handleTestComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Вспомогательная функция для подсчета общего количества уроков
const getTotalLessonsCount = (chapters) => {
  if (!chapters) return 0;
  return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
};

export default LearningPage;
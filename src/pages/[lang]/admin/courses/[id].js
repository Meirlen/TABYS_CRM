import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { CoursesAPI } from '../../../../api/coursesAPI';


const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Состояния для модальных окон
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Состояния для форм
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    order: 0
  });

const [lessonForm, setLessonForm] = useState({
  title: '',
  description: '',
  order: 0,
  video_url: '' // Изменено с video: null на video_url: ''
});

  const [testForm, setTestForm] = useState({
    question: '',
    answers: ['', ''],
    correct_answers: [],
    image: null
  });

  // Загрузка данных курса
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await CoursesAPI.getCourseDetails(id);
        setCourse(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке данных курса:', err);
        setError(err.message || 'Не удалось загрузить данные курса');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Обработчик изменения статуса курса
  const handleStatusChange = async (newStatus, comment = '') => {
    if (!window.confirm(`Вы уверены, что хотите изменить статус курса на "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await CoursesAPI.updateCourseStatus(id, {
        status: newStatus,
        status_comment: comment
      });

      setCourse(response.data);
      alert(`Статус курса успешно изменен на "${newStatus}"`);
    } catch (err) {
      console.error('Ошибка при обновлении статуса курса:', err);
      alert('Не удалось обновить статус курса');
    }
  };

  // Обработчики для глав курса
  const handleAddChapter = async (e) => {
    e.preventDefault();

    try {
      const response = await CoursesAPI.addChapter(id, chapterForm);
      setCourse(response.data);
      setChapterForm({ title: '', description: '', order: 0 });
      setShowChapterModal(false);
    } catch (err) {
      console.error('Ошибка при добавлении главы:', err);
      alert('Не удалось добавить главу курса');
    }
  };

  // Обработчики для уроков
  // Обработчики для уроков
const handleAddLesson = async (e) => {
  e.preventDefault();

  if (!selectedChapter) {
    alert('Выберите главу для добавления урока');
    return;
  }

  try {
    const response = await CoursesAPI.addLesson(id, selectedChapter.id, lessonForm);
    setCourse(response.data);
    setLessonForm({ title: '', description: '', order: 0, video_url: '' });
    setShowLessonModal(false);
  } catch (err) {
    console.error('Ошибка при добавлении урока:', err);
    alert('Не удалось добавить урок');
  }
};


  // Обработчики для тестов
  const handleAddTest = async (e) => {
    e.preventDefault();

    if (!selectedLesson) {
      alert('Выберите урок для добавления теста');
      return;
    }

    try {
      const response = await CoursesAPI.addTest(
        id,
        selectedLesson.chapter_id,
        selectedLesson.id,
        testForm
      );
      setCourse(response.data);
      setTestForm({ question: '', answers: ['', ''], correct_answers: [], image: null });
      setShowTestModal(false);
    } catch (err) {
      console.error('Ошибка при добавлении теста:', err);
      alert('Не удалось добавить тест');
    }
  };

  // Обработчики изменения форм
  const handleChapterChange = (e) => {
    const { name, value } = e.target;
    setChapterForm({ ...chapterForm, [name]: name === 'order' ? parseInt(value) || 0 : value });
  };

const handleLessonChange = (e) => {
  const { name, value } = e.target;
  setLessonForm({
    ...lessonForm,
    [name]: name === 'order' ? parseInt(value) || 0 : value
  });
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
  const handleTestChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image' && files.length > 0) {
      setTestForm({ ...testForm, image: files[0] });
    } else if (name === 'question') {
      setTestForm({ ...testForm, question: value });
    } else if (name.startsWith('answer-')) {
      const index = parseInt(name.split('-')[1]);
      const newAnswers = [...testForm.answers];
      newAnswers[index] = value;
      setTestForm({ ...testForm, answers: newAnswers });
    } else if (name === 'correct_answer') {
      const index = parseInt(value);
      const newCorrectAnswers = [...testForm.correct_answers];

      if (newCorrectAnswers.includes(index)) {
        // Если индекс уже есть в списке, удаляем его
        const indexOfIndex = newCorrectAnswers.indexOf(index);
        newCorrectAnswers.splice(indexOfIndex, 1);
      } else {
        // Иначе добавляем индекс в список
        newCorrectAnswers.push(index);
      }

      setTestForm({ ...testForm, correct_answers: newCorrectAnswers });
    }
  };

  // Добавление/удаление полей ответов в форме теста
  const addAnswerField = () => {
    setTestForm({ ...testForm, answers: [...testForm.answers, ''] });
  };

  const removeAnswerField = (index) => {
    if (testForm.answers.length <= 2) {
      alert('Тест должен содержать минимум 2 варианта ответа');
      return;
    }

    const newAnswers = [...testForm.answers];
    newAnswers.splice(index, 1);

    // Обновляем также правильные ответы
    const newCorrectAnswers = testForm.correct_answers
      .filter(answerIndex => answerIndex !== index) // Удаляем текущий индекс, если он был правильным
      .map(answerIndex => answerIndex > index ? answerIndex - 1 : answerIndex); // Уменьшаем индексы, которые были больше удаленного

    setTestForm({ ...testForm, answers: newAnswers, correct_answers: newCorrectAnswers });
  };

  // Получение класса для статуса курса
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Получение текста статуса курса
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'pending':
        return 'На модерации';
      case 'rejected':
        return 'Отклонен';
      case 'draft':
        return 'Черновик';
      default:
        return 'Неизвестный статус';
    }
  };

  // Отрисовка вкладки с обзором курса
  const renderOverviewTab = () => {
    if (!course) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4 border-b pb-2">Основная информация</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">ID курса:</div>
                  <div className="md:col-span-2 text-gray-900">{course.id}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Название:</div>
                  <div className="md:col-span-2 text-gray-900">{course.title}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Автор:</div>
                  <div className="md:col-span-2 text-gray-900">
                    {course.author?.user_name || 'Неизвестно'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Дата создания:</div>
                  <div className="md:col-span-2 text-gray-900">
                    {new Date(course.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Последнее обновление:</div>
                  <div className="md:col-span-2 text-gray-900">
                    {new Date(course.updated_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Статус:</div>
                  <div className="md:col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                    {course.status_comment && (
                      <div className="mt-1 text-sm text-gray-600">{course.status_comment}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Описание:</div>
                  <div className="md:col-span-2 text-gray-900 whitespace-pre-line">{course.description}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Медиа и статистика */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4 border-b pb-2">Медиа-файлы</h3>

              {course.cover_image && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Обложка курса:</div>
                  <img
                    src={`${API_BASE_URL}/${course.cover_image}`}
                    alt="Обложка курса"
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}

          <div>
  <div className="text-sm font-medium text-gray-700 mb-2">Видео-превью:</div>
  {course.video_preview && (
    course.video_preview.includes('youtube.com') || course.video_preview.includes('youtu.be') ? (
      // Встраиваем YouTube видео
      <iframe
        src={getYouTubeEmbedUrl(course.video_preview)}
        className="w-full aspect-video rounded-md"
        allowFullScreen
        title="Видео превью курса"
      ></iframe>
    ) : course.video_preview.includes('vk.com') ? (
      // Встраиваем видео из ВКонтакте
      <iframe
        src={getVKEmbedUrl(course.video_preview)}
        className="w-full aspect-video rounded-md"
        allowFullScreen
        title="Видео превью курса"
      ></iframe>
    ) : (
      // Для других ссылок, если они уже встраиваемые
      <iframe
        src={course.video_preview}
        className="w-full aspect-video rounded-md"
        allowFullScreen
        title="Видео превью курса"
      ></iframe>
    )
  )}
</div>

              {!course.cover_image && !course.video_preview && (
                <div className="text-gray-500 text-center py-6">
                  Медиа-файлы отсутствуют
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4 border-b pb-2">Статистика</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Просмотров:</span>
                  <span className="font-medium">{course.views || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Зачислений:</span>
                  <span className="font-medium">{course.enrollments_count || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Глав:</span>
                  <span className="font-medium">{course.chapters?.length || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Уроков:</span>
                  <span className="font-medium">
                    {course.chapters?.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0) || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Детали курса */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Детали курса</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="font-medium text-gray-700">Язык:</div>
                <div className="md:col-span-2 text-gray-900">{course.language}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="font-medium text-gray-700">Продолжительность:</div>
                <div className="md:col-span-2 text-gray-900">{course.duration} ч.</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="font-medium text-gray-700">Уровень:</div>
                <div className="md:col-span-2 text-gray-900">
                  {course.level === 'beginner' && 'Начинающий'}
                  {course.level === 'intermediate' && 'Средний'}
                  {course.level === 'advanced' && 'Продвинутый'}
                  {course.level === 'expert' && 'Эксперт'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="font-medium text-gray-700">Стоимость:</div>
                <div className="md:col-span-2 text-gray-900">
                  {course.is_free ? (
                    <span className="text-green-600 font-medium">Бесплатно</span>
                  ) : (
                    `${course.price} ${course.currency}`
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="font-medium text-gray-700">URL курса:</div>
                <div className="md:col-span-2 text-gray-900">
                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {course.course_url}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Категории и навыки</h3>

            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-700 mb-2">Категории:</div>
                <div className="flex flex-wrap gap-2">
                  {course.categories && course.categories.length > 0 ? (
                    course.categories.map(category => (
                      <span key={category.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {category.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Нет категорий</span>
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-700 mb-2">Навыки:</div>
                <div className="flex flex-wrap gap-2">
                  {course.skills && course.skills.split(',').map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4 border-b pb-2">Действия</h3>

          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/courses/edit/${course.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
              Редактировать курс
            </Link>

            {course.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('active')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Одобрить курс
                </button>

                <button
                  onClick={() => {
                    const comment = prompt('Укажите причину отклонения курса:');
                    if (comment) handleStatusChange('rejected', comment);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Отклонить курс
                </button>
              </>
            )}

            {course.status === 'active' && (
              <button
                onClick={() => handleStatusChange('pending', 'Курс отправлен на повторную модерацию')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Отправить на модерацию
              </button>
            )}

            {course.status === 'rejected' && (
              <button
                onClick={() => handleStatusChange('pending', 'Курс отправлен на повторную модерацию')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Повторная модерация
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm('Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.')) {
                  router.push('/admin/courses');
                  CoursesAPI.deleteCourse(course.id).catch(err => {
                    console.error('Ошибка при удалении курса:', err);
                    alert('Не удалось удалить курс');
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Удалить курс
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Отрисовка вкладки с содержимым курса
  const renderContentTab = () => {
    if (!course) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Содержимое курса</h3>
          <button
            onClick={() => setShowChapterModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Добавить главу
          </button>
        </div>

        {(!course.chapters || course.chapters.length === 0) && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
            <p className="text-gray-600">У курса еще нет глав. Добавьте первую главу.</p>
          </div>
        )}

        {course.chapters && course.chapters.length > 0 && (
          <div className="space-y-4">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">
                      Глава {chapter.order}: {chapter.title}
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setShowLessonModal(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm rounded-md transition-colors"
                    >
                      Добавить урок
                    </button>
                  </div>
                  {chapter.description && (
                    <p className="text-gray-600 mt-1">{chapter.description}</p>
                  )}
                </div>

                {(!chapter.lessons || chapter.lessons.length === 0) && (
                  <div className="p-4 text-center text-gray-500">
                    У главы еще нет уроков
                  </div>
                )}

                {chapter.lessons && chapter.lessons.length > 0 && (
                  <ul className="divide-y divide-gray-200">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium">
                              {chapter.order}.{lesson.order} {lesson.title}
                            </h5>
                            {lesson.description && (
                              <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                            )}

                            {/* Тесты урока */}
                            {lesson.tests && lesson.tests.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500">
                                  Тесты: {lesson.tests.length}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {lesson.video_url && (
                              <a
                                href={lesson.video_url}
                                 target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setShowTestModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Добавить тест"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Модальное окно добавления главы
  const renderChapterModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Добавление новой главы</h3>
              <button
                onClick={() => setShowChapterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddChapter}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Название главы *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={chapterForm.title}
                    onChange={handleChapterChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание главы
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={chapterForm.description}
                    onChange={handleChapterChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                    Порядковый номер *
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={chapterForm.order}
                    onChange={handleChapterChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Определяет порядок отображения глав в курсе
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Добавить главу
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Модальное окно добавления урока
  // Модальное окно добавления урока
const renderLessonModal = () => {
  if (!selectedChapter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Добавление урока в главу: {selectedChapter.title}</h3>
            <button
              onClick={() => setShowLessonModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleAddLesson}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Название урока *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={lessonForm.title}
                  onChange={handleLessonChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание урока
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={lessonForm.description}
                  onChange={handleLessonChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Порядковый номер *
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={lessonForm.order}
                  onChange={handleLessonChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Определяет порядок отображения уроков в главе
                </p>
              </div>

              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Ссылка на видео урока (YouTube, ВКонтакте и т.д.) *
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={lessonForm.video_url}
                  onChange={handleLessonChange}
                  required
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Ссылка на видео с YouTube, ВКонтакте или другого видеохостинга
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Добавить урок
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

  // Модальное окно добавления теста
  const renderTestModal = () => {
    if (!selectedLesson) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-y-auto max-h-[90vh]">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Добавление теста для урока: {selectedLesson.title}</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTest}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    Вопрос *
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={testForm.question}
                    onChange={handleTestChange}
                    required
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Изображение для теста (опционально)
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleTestChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Варианты ответов *
                  </label>

                  <div className="space-y-2">
                    {testForm.answers.map((answer, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`correct-${index}`}
                          name="correct_answer"
                          value={index}
                          checked={testForm.correct_answers.includes(index)}
                          onChange={handleTestChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name={`answer-${index}`}
                          value={answer}
                          onChange={handleTestChange}
                          placeholder={`Вариант ответа ${index + 1}`}
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {testForm.answers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeAnswerField(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addAnswerField}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Добавить вариант ответа
                  </button>

                  <p className="mt-2 text-sm text-gray-500">
                    Отметьте галочками правильные варианты ответов
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Добавить тест
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Детали курса">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Загрузка данных курса...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Детали курса">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
        </div>
        <div className="flex">
          <button
            onClick={() => router.push('/admin/courses')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Вернуться к списку курсов
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout title="Курс не найден">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <p>Курс не найден или был удален</p>
        </div>
        <div className="flex">
          <button
            onClick={() => router.push('/admin/courses')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Вернуться к списку курсов
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Курс: ${course.title}`}>
      {/* Вкладки */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Обзор курса
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Содержимое курса
          </button>
        </nav>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'content' && renderContentTab()}

      {/* Модальные окна */}
      {showChapterModal && renderChapterModal()}
      {showLessonModal && renderLessonModal()}
      {showTestModal && renderTestModal()}
    </AdminLayout>
  );
};

export default CourseDetail;
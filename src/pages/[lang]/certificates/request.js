import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CoursesAPI, CertificatesAPI } from '../../../api/coursesAPI';
import { ChevronLeft, Award, Check, AlertCircle, X, Upload, Phone } from 'react-feather';

const RequestCertificatePage = () => {
  const router = useRouter();

  // Состояния формы
  const [courseId, setCourseId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Данные для выбора
  const [courses, setCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);

  // Загрузка данных при монтировании
  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${router.query.lang}/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Получаем список всех курсов и курсов пользователя
        const [coursesResponse, userCoursesResponse] = await Promise.all([
          CoursesAPI.getCourses(),
          CoursesAPI.getUserCourses()
        ]);

        setCourses(coursesResponse.data);
        setUserCourses(userCoursesResponse.data);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить необходимые данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Обработчик изменения загружаемого файла
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUpload(file);

    // Предпросмотр для изображений
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка заполнения обязательных полей
    if (!name || !phone || !reason) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Создаем объект FormData для отправки
      const formData = new FormData();

      if (courseId) {
        formData.append('course_id', courseId);
      }

      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('reason', reason);

      if (additionalInfo) {
        formData.append('additional_info', additionalInfo);
      }

      if (fileUpload) {
        formData.append('attachment', fileUpload);
      }

      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Установка состояния успеха
      setSuccess(true);

      // Перенаправление на страницу сертификатов через 3 секунды
      setTimeout(() => {
        router.push(`/${router.query.lang}/certificates`);
      }, 3000);

    } catch (err) {
      console.error('Ошибка при отправке запроса на сертификацию:', err);
      setError(err.response?.data?.detail || 'Не удалось отправить запрос на сертификацию. Пожалуйста, попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mr-3"></div>
        <p className="text-gray-600 font-medium">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link href={`/${router.query.lang}/certificates`} className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium">
          <ChevronLeft size={16} className="mr-1" />
          Вернуться к сертификатам
        </Link>
      </div>

      {/* Заголовок */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold flex items-center">
          <Award size={24} className="mr-3" />
          Запрос на сертификацию
        </h1>
        <p className="mt-2 opacity-90">
          Заполните форму запроса для получения официального сертификата подтверждающего ваши навыки и квалификацию
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Заявка успешно отправлена!</h3>
          <p className="text-gray-600 mb-2">
            Заявка передана менеджеру проекта. Менеджер свяжется с вами в течение двух рабочих дней.
          </p>
          <p className="text-gray-600 mb-6">
            В случае, если ответ не будет получен, необходимо связаться по адресу <span className="text-teal-600">support@tabys.kz</span> или позвонить по указанным на портале номерам.
          </p>
          <p className="text-sm text-gray-500">Перенаправление на страницу сертификатов...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Личные данные */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                  placeholder="Введите ваше полное имя"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Выбор курса */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Курс (если применимо)
              </label>
              <select
                id="course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm"
              >
                <option value="">Выберите курс</option>
                <optgroup label="Мои курсы">
                  {userCourses.length > 0 ? (
                    userCourses.map((course) => (
                      <option key={`my-${course.id}`} value={course.id}>
                        {course.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>У вас пока нет пройденных курсов</option>
                  )}
                </optgroup>
                <optgroup label="Все курсы">
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Выберите курс, по которому вы хотите получить сертификат. Если запрос не связан с конкретным курсом, оставьте это поле пустым.
              </p>
            </div>

            {/* Причина запроса */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Причина запроса <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                placeholder="Укажите причину, по которой вы запрашиваете сертификат"
              />
            </div>

            {/* Дополнительная информация */}
            <div>
              <label htmlFor="additional-info" className="block text-sm font-medium text-gray-700 mb-1">
                Дополнительная информация
              </label>
              <textarea
                id="additional-info"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                placeholder="Укажите любую дополнительную информацию, которая может быть полезна для рассмотрения вашего запроса"
              />
            </div>

            {/* Загрузка файла */}
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Прикрепить файл
              </label>
              <div className="border border-gray-300 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Перетащите файл сюда или <span className="text-teal-600 font-medium">нажмите для выбора</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Максимальный размер: 10 МБ
                  </p>
                </label>
              </div>

              {filePreview && (
                <div className="mt-3 flex items-center bg-gray-50 p-2 rounded-lg">
                  <img
                    src={filePreview}
                    alt="Предпросмотр"
                    className="h-16 w-16 object-cover rounded-md mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{fileUpload.name}</p>
                    <p className="text-xs text-gray-500">{(fileUpload.size / 1024).toFixed(1)} КБ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileUpload(null);
                      setFilePreview(null);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {fileUpload && !filePreview && (
                <div className="mt-3 flex items-center bg-gray-50 p-2 rounded-lg">
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-md mr-3">
                    <Award size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{fileUpload.name}</p>
                    <p className="text-xs text-gray-500">{(fileUpload.size / 1024).toFixed(1)} КБ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileUpload(null);
                      setFilePreview(null);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Информация о процессе обработки */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="mb-2">
                Заявка передается менеджеру проекта. Менеджер свяжется с вами в течение двух рабочих дней.
              </p>
              <p>
                В случае, если ответ не будет получен, необходимо связаться по адресу <span className="text-teal-600">support@tabys.kz</span> или позвонить по указанным на портале номерам.
              </p>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <Link
                href={`/${router.query.lang}/certificates`}
                className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-colors relative"
              >
                {submitting ? (
                  <>
                    <span className="opacity-0">Отправить запрос</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  'Отправить запрос'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RequestCertificatePage;
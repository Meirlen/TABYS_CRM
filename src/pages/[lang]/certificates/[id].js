import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CertificatesAPI } from '../../../api/coursesAPI';
import { Award, Calendar, ChevronLeft, Download, Phone, User, X } from 'react-feather';

const CertificateDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Состояния для формы запроса на сертификацию
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchCertificateDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await CertificatesAPI.getCertificateDetails(id);
        setCertificate(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке сертификата:', err);
        setError('Не удалось загрузить данные сертификата. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateDetails();
  }, [id]);

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Скачивание сертификата
  const handleDownload = async () => {
    if (!certificate) return;

    try {
      // Проверка авторизации
      if (!isAuthenticated) {
        router.push(`/${router.query.lang}/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      // Получаем файл сертификата
      const response = await CertificatesAPI.downloadCertificate(certificate.id);

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Очистка
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Ошибка при скачивании сертификата:', err);
      alert('Не удалось скачать сертификат. Пожалуйста, попробуйте позже.');
    }
  };

  // Обработчик отправки запроса на сертификацию
  const handleRequestSubmit = (e) => {
    e.preventDefault();

    // Проверяем заполнение формы
    if (!name || !phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    // Имитация отправки запроса на сервер
    setTimeout(() => {
      setIsSubmitting(false);
      setRequestSuccess(true);

      // Очищаем форму
      setName('');
      setPhone('');

      // Закрываем форму через 5 секунд
      setTimeout(() => {
        setShowRequestForm(false);
        setRequestSuccess(false);
      }, 5000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mr-3"></div>
        <p className="text-gray-600 font-medium">Загрузка сертификата...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <X size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{error || 'Сертификат не найден'}</h3>
          <Link href={`/${router.query.lang}/certificates`} className="mt-4 inline-flex items-center text-teal-600 hover:text-teal-700 font-medium">
            <ChevronLeft size={16} className="mr-1" />
            Вернуться к списку сертификатов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link href={`/${router.query.lang}/certificates`} className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Вернуться к списку сертификатов
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        {/* Верхняя часть с инфо и статусом */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <Award size={24} className="mr-3 text-teal-600" />
                {certificate.title}
              </h1>
              {certificate.course_id && (
                <Link
                  href={`/${router.query.lang}/courses/${certificate.course_id}`}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  Перейти к курсу
                </Link>
              )}
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              certificate.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {certificate.status === 'active' ? 'Активен' : 'Отозван'}
            </span>
          </div>
        </div>

        {/* Основной контент */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Изображение сертификата */}
          <div className="flex flex-col">
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
              {certificate.image_url ? (
                <img
                  src={`${API_BASE_URL || 'http://localhost:8000'}/api/certificates/${certificate.id}/image`}
                  alt={certificate.title}
                  className="w-full h-auto"
                />
              ) : certificate.file_url ? (
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-teal-500/10 to-blue-600/10">
                  <Award size={64} className="text-teal-500" />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-teal-500/10 to-blue-600/10">
                  <span className="text-gray-500">Изображение недоступно</span>
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="mt-4 flex space-x-3">
              {certificate.file_url && (
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Скачать сертификат
                </button>
              )}

              <button
                onClick={() => setShowRequestForm(true)}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-2.5 px-4 rounded-lg transition-colors"
              >
                Запросить сертификацию
              </button>
            </div>
          </div>

          {/* Информация о сертификате */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User size={20} className="mr-2 text-teal-600" />
              Информация о сертификате
            </h2>

            <div className="space-y-4">
              {certificate.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Описание</h3>
                  <p className="mt-1 text-gray-700">{certificate.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Дата выдачи</h3>
                  <div className="mt-1 text-gray-700 flex items-center">
                    <Calendar size={16} className="mr-2 text-teal-500" />
                    {formatDate(certificate.issue_date)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID сертификата</h3>
                  <p className="mt-1 text-gray-700">{certificate.id}</p>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Как использовать этот сертификат</h3>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    Скачайте PDF-версию для печати или электронного хранения
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    Используйте уникальный ID для подтверждения подлинности
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    Добавьте сертификат в свое резюме или профиль LinkedIn
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для запроса сертификации */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Запрос на сертификацию</h2>
              <button
                onClick={() => {
                  if (!isSubmitting) {
                    setShowRequestForm(false);
                    setRequestSuccess(false);
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {requestSuccess ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Заявка успешно отправлена!</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Заявка передана менеджеру проекта. Менеджер свяжется с вами в течение двух рабочих дней.
                  </p>
                  <p className="text-sm text-gray-600">
                    В случае, если ответ не будет получен, необходимо связаться по адресу <span className="text-teal-600">support@tabys.kz</span> или позвонить по указанным на портале номерам.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit}>
                  <div className="mb-4">
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
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-4">
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
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-5 bg-gray-50 p-3 rounded-lg">
                    <p className="mb-2">
                      Заявка передается менеджеру проекта. Менеджер свяжется с вами в течение двух рабочих дней.
                    </p>
                    <p>
                      В случае, если ответ не будет получен, необходимо связаться по адресу <span className="text-teal-600">support@tabys.kz</span> или позвонить по указанным на портале номерам.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 rounded-lg shadow-sm text-sm font-medium text-white relative"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="opacity-0">Отправить заявку</span>
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        </>
                      ) : "Отправить заявку"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDetailPage;
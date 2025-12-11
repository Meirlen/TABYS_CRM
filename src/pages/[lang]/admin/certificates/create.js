import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { CertificatesAPI } from '../../../../api/coursesAPI';

const CreateCertificatePage = () => {
  const router = useRouter();

  // Состояния для формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('image'); // 'image' или 'pdf'
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Проверка наличия токена при загрузке страницы
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/ru/login');
    }
  }, [router]);

  // Обработчик изменения типа файла
  const handleFileTypeChange = (type) => {
    setFileType(type);
    setFile(null);
    setImagePreview(null);
  };

  // Обработчик изменения файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Создаем URL для предпросмотра изображения, если тип файла - изображение
      if (fileType === 'image') {
        const previewUrl = URL.createObjectURL(selectedFile);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка заполнения обязательных полей
    if (!title) {
      setError('Пожалуйста, заполните название сертификата.');
      return;
    }

    // Проверка наличия файла
    if (!file) {
      setError('Пожалуйста, загрузите файл сертификата.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Формируем данные для отправки
      const certificateData = {
        title: title,
        description: description
      };

      // Добавляем файл в зависимости от выбранного типа
      if (fileType === 'image') {
        certificateData.image = file;
      } else {
        certificateData.pdf_file = file;
      }

      console.log('Отправляем запрос на создание сертификата...');

      // Используем API для создания сертификата
      await CertificatesAPI.createCertificate(certificateData);

      setSuccess(true);
      console.log('Сертификат успешно создан!');

      // Перенаправляем на страницу со списком сертификатов через 2 секунды
      setTimeout(() => {
        router.push('/ru/admin/certificates');
      }, 2000);

    } catch (err) {
      console.error('Ошибка при создании сертификата:', err);

      // Подробная информация об ошибке для отладки
      if (err.response) {
        console.error('Данные ответа:', err.response.data);
        console.error('Статус ответа:', err.response.status);
        console.error('Заголовки ответа:', err.response.headers);
        setError(`Ошибка ${err.response.status}: ${err.response.data.detail || 'Неизвестная ошибка'}`);
      } else if (err.request) {
        console.error('Запрос отправлен, но ответ не получен', err.request);
        setError('Не удалось получить ответ от сервера. Проверьте подключение к интернету.');
      } else {
        console.error('Ошибка настройки запроса:', err.message);
        setError(`Ошибка: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Создание сертификата">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Сертификат успешно создан! Перенаправление...</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Название сертификата */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название сертификата <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Описание сертификата */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание (необязательно)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Выбор типа файла сертификата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип файла сертификата <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  fileType === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleFileTypeChange('image')}
              >
                Изображение
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  fileType === 'pdf'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleFileTypeChange('pdf')}
              >
                PDF-файл
              </button>
            </div>
          </div>

          {/* Загрузка файла */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              {fileType === 'image' ? 'Изображение сертификата' : 'PDF-файл сертификата'} <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="file"
              accept={fileType === 'image' ? 'image/*' : 'application/pdf'}
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {imagePreview && fileType === 'image' && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Предпросмотр:</p>
                <img src={imagePreview} alt="Предпросмотр" className="max-h-40 border border-gray-300 rounded-md" />
              </div>
            )}
            {file && fileType === 'pdf' && (
              <p className="mt-1 text-sm text-gray-500">
                Выбран файл: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/ru/admin/certificates')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Создание...
                </>
              ) : (
                'Создать сертификат'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateCertificatePage;
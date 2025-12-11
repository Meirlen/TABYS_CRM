import { useState } from 'react';
import { VACANCIES_API } from '../../utils/apiConfig';

const ApplicationModal = ({ vacancyId, vacancyTitle, onClose, getTranslation }) => {
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    phone: '',
    cover_letter: '',
  });

  const [resume, setResume] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка формата файла
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!['doc', 'docx', 'pdf'].includes(fileExt)) {
        setErrorMessage(getTranslation('vacancies.invalidFileFormat'));
        setResume(null);
        e.target.value = '';
      } else {
        setResume(file);
        setErrorMessage('');
      }
    } else {
      setResume(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Валидация обязательных полей
    if (!formData.last_name || !formData.first_name || !formData.email || !resume) {
      setErrorMessage(getTranslation('vacancies.fillRequiredFields'));
      return;
    }

    setLoading(true);

    try {
      // Создаем объект FormData для отправки файла
      const submitData = new FormData();
      submitData.append('last_name', formData.last_name);
      submitData.append('first_name', formData.first_name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone || '');
      submitData.append('cover_letter', formData.cover_letter || '');
      submitData.append('resume', resume);

      // Исправленная строка - APPLY это функция, а не строка с шаблоном
      const url = VACANCIES_API.APPLY(vacancyId);

      // Отправляем запрос на API
      const response = await fetch(url, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при отправке заявки');
      }

      // Успешная отправка
      setSubmitted(true);

    } catch (error) {
      console.error('Error submitting application:', error);
      setErrorMessage(error.message || getTranslation('vacancies.applicationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {getTranslation('vacancies.applyFor')} "{vacancyTitle}"
              </h2>

              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="last_name">
                    {getTranslation('vacancies.lastName')} *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="first_name">
                    {getTranslation('vacancies.firstName')} *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="email">
                    {getTranslation('vacancies.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="phone">
                    {getTranslation('vacancies.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="cover_letter">
                    {getTranslation('vacancies.coverLetter')}
                  </label>
                  <textarea
                    id="cover_letter"
                    name="cover_letter"
                    rows="4"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="resume">
                    {getTranslation('vacancies.resume')} * (.doc, .docx, .pdf)
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                    onChange={handleFileChange}
                    accept=".doc,.docx,.pdf"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {getTranslation('vacancies.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {getTranslation('vacancies.sending')}
                      </span>
                    ) : (
                      getTranslation('vacancies.submit')
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-900">{getTranslation('vacancies.applicationSent')}</h2>
              <p className="text-gray-900 mb-6">{getTranslation('vacancies.thankYouForApplication')}</p>
              <button
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {getTranslation('vacancies.close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
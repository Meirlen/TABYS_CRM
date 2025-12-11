import { useState } from 'react';
import { EXPERTS_API } from '../../utils/apiConfig'; // Импортируем конфигурацию API

const CollaborationModal = ({ expertId, expertName, onClose, getTranslation, currentLang }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку для этого поля, если она была
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = getTranslation('expert.collaboration.errors.nameRequired');
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = getTranslation('expert.collaboration.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.user_email)) {
      newErrors.user_email = getTranslation('expert.collaboration.errors.emailInvalid');
    }

    if (formData.user_phone && !/^\+?[0-9]{10,15}$/.test(formData.user_phone.replace(/\s/g, ''))) {
      newErrors.user_phone = getTranslation('expert.collaboration.errors.phoneInvalid');
    }

    return newErrors;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(EXPERTS_API.COLLABORATE(expertId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || getTranslation('expert.collaboration.errors.submitFailed'));
      }

      setSubmitSuccess(true);
      // Очищаем форму
      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        message: ''
      });

    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок и кнопка закрытия */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {getTranslation('expert.collaboration.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Сообщение об успешной отправке */}
          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              <p>{getTranslation('expert.collaboration.successMessage')}</p>
            </div>
          ) : (
            /* Форма запроса */
            <form onSubmit={handleSubmit}>
              <p className="text-gray-600 mb-4">
                {getTranslation('expert.collaboration.description').replace('{expertName}', expertName)}
              </p>

              {/* Ошибка отправки */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  <p>{submitError}</p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('expert.collaboration.nameLabel')} *
                </label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.user_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={getTranslation('expert.collaboration.namePlaceholder')}
                />
                {errors.user_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('expert.collaboration.emailLabel')} *
                </label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.user_email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={getTranslation('expert.collaboration.emailPlaceholder')}
                />
                {errors.user_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.user_email}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('expert.collaboration.phoneLabel')}
                </label>
                <input
                  type="tel"
                  id="user_phone"
                  name="user_phone"
                  value={formData.user_phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.user_phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={getTranslation('expert.collaboration.phonePlaceholder')}
                />
                {errors.user_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.user_phone}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslation('expert.collaboration.messageLabel')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getTranslation('expert.collaboration.messagePlaceholder')}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {getTranslation('expert.collaboration.cancelButton')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  {getTranslation('expert.collaboration.submitButton')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationModal;
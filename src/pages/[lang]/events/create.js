import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { EVENTS_API } from '../../../utils/apiConfig';
import { translations } from '../../../locales/translations';
import { Calendar, MapPin, Video, Users, Plus, X, ChevronLeft, Save } from 'react-feather';
import AdminLayout from '../../../components/layouts/AdminLayout';

export default function EventCreatePage() {
  const router = useRouter();
  const { lang = 'ru' } = router.query;
  const isEditMode = false;

  // Функция получения перевода (не изменяется)
  const getTranslation = (key) => {
    // Проверяем, существует ли указанный язык
    if (!translations[lang]) {
      return key; // Возвращаем ключ, если язык не найден
    }

    // Разбиваем ключ на части (например, 'events.pageTitle' -> ['events', 'pageTitle'])
    const parts = key.split('.');

    // Начинаем с корня переводов для указанного языка
    let result = translations[lang];

    // Проходим по частям ключа
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        return key; // Возвращаем ключ, если перевод не найден
      }
    }

    return result;
  };

  // Form state (не изменяется)
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    location: '',
    format: 'Offline',
    description: '',
    programs: [{ time: 0, description: '' }],
    speakers: [{
      first_name: '',
      last_name: '',
      middle_name: '',
      bio: '',
      photo_url: '',
      linkedin_url: '',
      instagram_url: '',
      facebook_url: ''
    }]
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Логика обработки формы (без изменений)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProgramChange = (index, e) => {
    const { name, value } = e.target;
    const newPrograms = [...formData.programs];
    newPrograms[index] = {
      ...newPrograms[index],
      [name]: name === 'time' ? parseInt(value, 10) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      programs: newPrograms
    }));
  };

  const handleSpeakerChange = (index, e) => {
    const { name, value } = e.target;
    const newSpeakers = [...formData.speakers];
    newSpeakers[index] = {
      ...newSpeakers[index],
      [name]: value
    };
    setFormData(prev => ({
      ...prev,
      speakers: newSpeakers
    }));
  };

  const addProgram = () => {
    setFormData(prev => ({
      ...prev,
      programs: [...prev.programs, { time: 0, description: '' }]
    }));
  };

  const removeProgram = (index) => {
    if (formData.programs.length > 1) {
      setFormData(prev => ({
        ...prev,
        programs: prev.programs.filter((_, i) => i !== index)
      }));
    }
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, {
        first_name: '',
        last_name: '',
        middle_name: '',
        bio: '',
        photo_url: '',
        linkedin_url: '',
        instagram_url: '',
        facebook_url: ''
      }]
    }));
  };

  const removeSpeaker = (index) => {
    if (formData.speakers.length > 1) {
      setFormData(prev => ({
        ...prev,
        speakers: prev.speakers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Проверяем, что все обязательные поля заполнены
      const requiredFields = ['title', 'event_date', 'location', 'format', 'description'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`${getTranslation(`events.${field}`) || field} is required`);
        }
      }

      // Фильтруем пустые элементы программы
      const filteredPrograms = formData.programs.filter(
        program => program.time > 0 || program.description.trim() !== ''
      );

      // Проверяем, что все программы имеют необходимые поля
      for (const program of filteredPrograms) {
        if (!program.time || !program.description) {
          throw new Error(getTranslation('events.programValidationError') || 'Все пункты программы должны содержать время и описание');
        }
      }

      // Фильтруем пустые элементы спикеров
      const filteredSpeakers = formData.speakers.filter(
        speaker => speaker.first_name.trim() !== '' || speaker.last_name.trim() !== ''
      );

      // Проверяем, что все спикеры имеют необходимые поля
      for (const speaker of filteredSpeakers) {
        if (!speaker.first_name || !speaker.last_name || !speaker.bio) {
          throw new Error(getTranslation('events.speakerValidationError') || 'Все спикеры должны иметь имя, фамилию и информацию');
        }
      }

      // Готовим данные для отправки
      const submitData = {
        ...formData,
        programs: filteredPrograms,
        speakers: filteredSpeakers
      };

      console.log('Отправляемые данные:', submitData);

      // API запрос
      const url = EVENTS_API.CREATE;
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ошибка ответа API:', errorData);
        throw new Error(errorData.detail || `Ошибка: ${response.status}`);
      }

      const data = await response.json();
      console.log('Форма успешно отправлена:', data);

      // Показываем сообщение об успехе
      setSuccessMessage(getTranslation('events.createSuccess') || 'Мероприятие успешно создано!');

      // Редирект после создания
      setTimeout(() => {
        router.push(`/${lang}/events/${data.id}`);
      }, 2000);
    } catch (err) {
      console.error('Ошибка при отправке формы:', err);
      setError(err.message || (getTranslation('events.submitError') || 'Произошла ошибка при сохранении данных'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout currentLang={lang}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex justify-center items-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-gray-600 font-medium ml-3">{getTranslation('events.loading', 'Загрузка...')}</p>
        </div>
      </Layout>
    );
  }

  return (
      <AdminLayout title="Cоздать мероприятие">


      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок */}


        {/* Форма */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
              <p className="font-medium mb-1">Ошибка</p>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md">
              <p className="font-medium mb-1">Успешно</p>
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
    {/* Основная информация */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <Calendar size={20} className="text-teal-600 mr-2" />
                {getTranslation('events.generalInfo') || 'Основная информация'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Название */}
                <div className="col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('events.title') || 'Наименование'} *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                  />
                </div>

                {/* Дата проведения */}
                <div>
                  <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('events.eventDate') || 'Дата проведения'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="event_date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                    />
                  </div>
                </div>

                {/* Формат */}
                <div>
                  <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('events.format') || 'Формат'} *
                  </label>
                  <select
                    id="format"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                  >
                    <option value="Online">
                      {getTranslation('events.online') || 'Онлайн'}
                    </option>
                    <option value="Offline">
                      {getTranslation('events.offline') || 'Офлайн'}
                    </option>
                  </select>
                </div>

                {/* Место проведения */}
                <div className="col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('events.location') || 'Место проведения'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                    />
                  </div>
                </div>

                {/* Описание */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('events.description') || 'Описание мероприятия'} *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Программа */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center text-gray-800">
                  <Calendar size={20} className="text-teal-600 mr-2" />
                  {getTranslation('events.program') || 'Программа'}
                </h2>
                <button
                  type="button"
                  onClick={addProgram}
                  className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center text-sm font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  {getTranslation('events.addProgramItem') || 'Добавить пункт программы'}
                </button>
              </div>

              {formData.programs.map((program, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Calendar size={16} className="text-teal-600 mr-2" />
                      {getTranslation('events.programItem') || 'Пункт программы'} #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeProgram(index)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      disabled={formData.programs.length <= 1}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Время */}
                    <div>
                      <label htmlFor={`program-time-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.time') || 'Время'} *
                      </label>
                      <input
                        type="number"
                        id={`program-time-${index}`}
                        name="time"
                        value={program.time}
                        onChange={(e) => handleProgramChange(index, e)}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    {/* Описание программы */}
                    <div className="md:col-span-3">
                      <label htmlFor={`program-description-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.programDescription') || 'Описание'} *
                      </label>
                      <input
                        type="text"
                        id={`program-description-${index}`}
                        name="description"
                        value={program.description}
                        onChange={(e) => handleProgramChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Спикеры */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center text-gray-800">
                  <Users size={20} className="text-teal-600 mr-2" />
                  {getTranslation('events.speakers') || 'Спикеры'}
                </h2>
                <button
                  type="button"
                  onClick={addSpeaker}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  {getTranslation('events.addSpeaker') || 'Добавить спикера'}
                </button>
              </div>

              {formData.speakers.map((speaker, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Users size={16} className="text-blue-600 mr-2" />
                      {getTranslation('events.speaker') || 'Спикер'} #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      disabled={formData.speakers.length <= 1}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Фамилия */}
                    <div>
                      <label htmlFor={`speaker-last-name-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.lastName') || 'Фамилия'} *
                      </label>
                      <input
                        type="text"
                        id={`speaker-last-name-${index}`}
                        name="last_name"
                        value={speaker.last_name}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    {/* Имя */}
                    <div>
                      <label htmlFor={`speaker-first-name-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.firstName') || 'Имя'} *
                      </label>
                      <input
                        type="text"
                        id={`speaker-first-name-${index}`}
                        name="first_name"
                        value={speaker.first_name}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    {/* Отчество */}
                    <div>
                      <label htmlFor={`speaker-middle-name-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.middleName') || 'Отчество'}
                      </label>
                      <input
                        type="text"
                        id={`speaker-middle-name-${index}`}
                        name="middle_name"
                        value={speaker.middle_name}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    {/* Информация */}
                    <div className="md:col-span-3">
                      <label htmlFor={`speaker-bio-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.speakerBio') || 'Информация о спикере'} *
                      </label>
                      <textarea
                        id={`speaker-bio-${index}`}
                        name="bio"
                        value={speaker.bio}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    {/* Фото */}
                    <div className="md:col-span-3">
                      <label htmlFor={`speaker-photo-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        {getTranslation('events.photo') || 'Фото URL'}
                      </label>
                      <input
                        type="url"
                        id={`speaker-photo-${index}`}
                        name="photo_url"
                        value={speaker.photo_url}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    {/* Социальные сети */}
                    <div>
                      <label htmlFor={`speaker-linkedin-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id={`speaker-linkedin-${index}`}
                        name="linkedin_url"
                        value={speaker.linkedin_url}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor={`speaker-instagram-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        Instagram
                      </label>
                      <input
                        type="url"
                        id={`speaker-instagram-${index}`}
                        name="instagram_url"
                        value={speaker.instagram_url}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        placeholder="https://instagram.com/username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor={`speaker-facebook-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        id={`speaker-facebook-${index}`}
                        name="facebook_url"
                        value={speaker.facebook_url}
                        onChange={(e) => handleSpeakerChange(index, e)}
                        placeholder="https://facebook.com/username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопки формы */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
              <Link
                href={`/${lang}/events`}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                <X size={16} className="mr-2" />
                {getTranslation('common.cancel') || 'Отмена'}
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {getTranslation('common.saving') || 'Сохранение...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {getTranslation('common.create') || 'Создать'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}


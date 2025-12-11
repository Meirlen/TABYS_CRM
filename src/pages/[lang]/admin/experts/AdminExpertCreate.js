import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { EXPERTS_API } from '../../../utils/apiConfig'; // Импортируем конфигурацию API
import AdminLayout from '../../../../components/layouts/AdminLayout';

// Принимаем currentLang, если он нужен для чего-то (например, отправка на API или формирование URL)
const AdminExpertCreate = ({ currentLang }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    phone: '',
    website: '',
    city: '',
    address: '',
    education: [
      {
        university: '',
        start_date: '',
        end_date: '',
        specialization: '',
        degree: '',
        certificates: ''
      }
    ],
    experience: [
      {
        company_name: '',
        position: '',
        start_date: '',
        end_date: '',
        work_description: ''
      }
    ]
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: updatedEducation }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { university: '', start_date: '', end_date: '', specialization: '', degree: '', certificates: '' }
      ]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length === 1) return;
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, education: updatedEducation }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData(prev => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company_name: '', position: '', start_date: '', end_date: '', work_description: '' }
      ]
    }));
  };

  const removeExperience = (index) => {
    if (formData.experience.length === 1) return;
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, experience: updatedExperience }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // router.push(`/${currentLang}/login?callbackUrl=${router.asPath}`); // Если currentLang используется для URL
        router.push(`/login?callbackUrl=${router.asPath}`);
        throw new Error('Необходима авторизация');
      }

      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'education' || key === 'experience') {
          dataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          dataToSend.append(key, formData[key]);
        }
      });

      if (avatarFile) {
        dataToSend.append('avatar', avatarFile);
      }

      const response = await fetch(EXPERTS_API.CREATE, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Ошибка сервера.' }));
        throw new Error(errorData.detail || `Ошибка: ${response.statusText}`);
      }

      const responseData = await response.json();
      setSubmitSuccess(true);
      setAvatarFile(null);
      setAvatarPreview(null);
      // Можно сбросить и остальные поля формы, если нужно
      // setFormData({ full_name: '', specialization: '', ... });


      setTimeout(() => {
        // Перенаправление на список экспертов в админке
        // router.push(`/${currentLang}/admin/experts`); // Если currentLang используется для URL
        router.push(`/admin/experts`);
      }, 2000);

    } catch (error) {
      console.error('Ошибка при создании эксперта:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

        <AdminLayout title="Добавление эксперта">

    <div className="bg-gray-50 min-h-screen font-sans">


      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
              Добавление нового эксперта
            </h1>

            {submitSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Успех!</p>
                <p>Эксперт успешно создан! Перенаправление...</p>
              </div>
            )}

            {submitError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Ошибка</p>
                <p>{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Основная информация
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО *
                    </label>
                    <input
                      type="text" id="full_name" name="full_name" required
                      value={formData.full_name} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                      Специализация *
                    </label>
                    <input
                      type="text" id="specialization" name="specialization" required
                      value={formData.specialization} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон
                    </label>
                    <input
                      type="tel" id="phone" name="phone"
                      value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Веб-сайт
                    </label>
                    <input
                      type="text" id="website" name="website"
                      value={formData.website} onChange={handleChange} placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Город
                    </label>
                    <input
                      type="text" id="city" name="city"
                      value={formData.city} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес
                    </label>
                    <input
                      type="text" id="address" name="address"
                      value={formData.address} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                      Аватар
                    </label>
                    <input
                      type="file" id="avatar" name="avatar"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={handleAvatarChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    {avatarPreview && (
                      <div className="mt-2">
                        <img src={avatarPreview} alt="Предпросмотр аватара" className="h-24 w-24 rounded-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">Образование</h2>
                  <button
                    type="button" onClick={addEducation}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center px-3 py-1.5 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Добавить образование
                  </button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={`edu-${index}`} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50/50 relative">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-700 pt-1">Образование #{index + 1}</h3>
                      {formData.education.length > 1 && (
                        <button
                          type="button" onClick={() => removeEducation(index)} title="Удалить"
                          className="text-red-500 hover:text-red-700 text-xs p-1 rounded-full hover:bg-red-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ВУЗ *</label>
                        <input type="text" required value={edu.university} onChange={(e) => handleEducationChange(index, 'university', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
                        <input type="text" value={edu.specialization} onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала *</label>
                        <input type="date" required value={edu.start_date} onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                        <input type="date" value={edu.end_date} min={edu.start_date || undefined} onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ученая степень</label>
                        <input type="text" value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Сертификаты</label>
                        <input type="text" value={edu.certificates} onChange={(e) => handleEducationChange(index, 'certificates', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">Опыт работы</h2>
                  <button
                    type="button" onClick={addExperience}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center px-3 py-1.5 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Добавить опыт работы
                  </button>
                </div>
                {formData.experience.map((exp, index) => (
                  <div key={`exp-${index}`} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50/50 relative">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-700 pt-1">Опыт работы #{index + 1}</h3>
                      {formData.experience.length > 1 && (
                        <button
                          type="button" onClick={() => removeExperience(index)} title="Удалить"
                          className="text-red-500 hover:text-red-700 text-xs p-1 rounded-full hover:bg-red-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Компания *</label>
                        <input type="text" required value={exp.company_name} onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Должность *</label>
                        <input type="text" required value={exp.position} onChange={(e) => handleExperienceChange(index, 'position', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала *</label>
                        <input type="date" required value={exp.start_date} onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                        <input type="date" value={exp.end_date} min={exp.start_date || undefined} onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Описание работы</label>
                        <textarea rows="3" value={exp.work_description} onChange={(e) => handleExperienceChange(index, 'work_description', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button" onClick={() => router.back()}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  {isSubmitting ? 'Создание...' : 'Создать эксперта'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

          </AdminLayout>

  );
};

export default AdminExpertCreate;
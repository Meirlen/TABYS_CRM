import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import HeaderBack from '../../../../components/HeaderBack';
import { VACANCIES_API } from '../../../../utils/apiConfig';

export default function CreateVacancy() {
  const router = useRouter();

  // Состояние для формы создания вакансии
  const [formData, setFormData] = useState({
    title_kz: '',
    title_ru: '',
    description_kz: '',
    description_ru: '',
    requirements_kz: '',
    requirements_ru: '',
    salary: '',
    location_kz: '',
    location_ru: '',
    is_active: true,
    deadline: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    // Проверяем обязательные поля
    if (!formData.title_kz) newErrors.title_kz = 'Обязательное поле';
    if (!formData.title_ru) newErrors.title_ru = 'Обязательное поле';
    if (!formData.description_kz) newErrors.description_kz = 'Обязательное поле';
    if (!formData.description_ru) newErrors.description_ru = 'Обязательное поле';
    if (!formData.deadline) newErrors.deadline = 'Обязательное поле';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const createEndpoint = VACANCIES_API.CREATE;

      console.log('Отправка запроса на:', createEndpoint);
      console.log('Тело запроса:', JSON.stringify(formData));

      const response = await fetch(createEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();

      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', Object.fromEntries([...response.headers]));
      console.log('Текст ответа:', responseText.slice(0, 200) + '...');

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Не удалось создать вакансию');
        } catch (parseError) {
          console.error('Ошибка парсинга ответа:', parseError);
          throw new Error(
            `Сервер вернул статус ${response.status} с не-JSON ответом. Проверьте API endpoint и логи сервера.`
          );
        }
      }

      let responseData;
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
          console.log('Данные ответа:', responseData);
        } catch (parseError) {
          console.warn('Ответ не является JSON, но запрос выполнен успешно');
        }
      }

      setSubmitSuccess(true);
      // Редирект на страницу с вакансиями после успешного создания
      setTimeout(() => {
        router.push('/ru/admin/vacancies');
      }, 2000);

    } catch (error) {
      console.error('Ошибка при создании вакансии:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>Создать вакансию</title>
      </Head>

      <HeaderBack title="Создать вакансию" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Вакансия успешно создана!
          </div>
        )}

        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Основная информация
            </h3>

            {/* Название вакансии на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title_kz">
                Название вакансии (каз.) *
              </label>
              <input
                id="title_kz"
                type="text"
                name="title_kz"
                className={`shadow appearance-none border ${errors.title_kz ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.title_kz}
                onChange={handleChange}
              />
              {errors.title_kz && <p className="text-red-500 text-xs italic mt-1">{errors.title_kz}</p>}
            </div>

            {/* Название вакансии на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title_ru">
                Название вакансии (рус.) *
              </label>
              <input
                id="title_ru"
                type="text"
                name="title_ru"
                className={`shadow appearance-none border ${errors.title_ru ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.title_ru}
                onChange={handleChange}
              />
              {errors.title_ru && <p className="text-red-500 text-xs italic mt-1">{errors.title_ru}</p>}
            </div>

            {/* Зарплата */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salary">
                Зарплата
              </label>
              <input
                id="salary"
                type="text"
                name="salary"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Например: 200,000 - 300,000 тг"
              />
            </div>

            {/* Местоположение на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_kz">
                Местоположение (каз.)
              </label>
              <input
                id="location_kz"
                type="text"
                name="location_kz"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.location_kz}
                onChange={handleChange}
              />
            </div>

            {/* Местоположение на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_ru">
                Местоположение (рус.)
              </label>
              <input
                id="location_ru"
                type="text"
                name="location_ru"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.location_ru}
                onChange={handleChange}
              />
            </div>

            {/* Срок подачи заявок */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
                Срок подачи заявок *
              </label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                className={`shadow appearance-none border ${errors.deadline ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.deadline}
                onChange={handleChange}
              />
              {errors.deadline && <p className="text-red-500 text-xs italic mt-1">{errors.deadline}</p>}
            </div>

            {/* Активна ли вакансия */}
            <div className="mb-4 flex items-center">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                className="mr-2"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="is_active">
                Вакансия активна
              </label>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Описание вакансии
            </h3>

            {/* Описание на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description_kz">
                Описание (каз.) *
              </label>
              <textarea
                id="description_kz"
                name="description_kz"
                rows="5"
                className={`shadow appearance-none border ${errors.description_kz ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.description_kz}
                onChange={handleChange}
              ></textarea>
              {errors.description_kz && <p className="text-red-500 text-xs italic mt-1">{errors.description_kz}</p>}
            </div>

            {/* Описание на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description_ru">
                Описание (рус.) *
              </label>
              <textarea
                id="description_ru"
                name="description_ru"
                rows="5"
                className={`shadow appearance-none border ${errors.description_ru ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.description_ru}
                onChange={handleChange}
              ></textarea>
              {errors.description_ru && <p className="text-red-500 text-xs italic mt-1">{errors.description_ru}</p>}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Требования к кандидату
            </h3>

            {/* Требования на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements_kz">
                Требования (каз.)
              </label>
              <textarea
                id="requirements_kz"
                name="requirements_kz"
                rows="5"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.requirements_kz}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Требования на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements_ru">
                Требования (рус.)
              </label>
              <textarea
                id="requirements_ru"
                name="requirements_ru"
                rows="5"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.requirements_ru}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push('/ru/admin/vacancies')}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {}
  };
}
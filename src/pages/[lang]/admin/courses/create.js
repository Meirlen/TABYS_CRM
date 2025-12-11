import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { CoursesAPI } from '../../../../api/coursesAPI';

const CourseCreate = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_url: '',
    language: 'ru',
    duration: 0,
    skills: '',
    currency: 'RUB',
    price: 0,
    level: 'beginner',
    is_free: false,
    categories: [],
    cover_image: null,
    video_preview: '' // Изменено с null на пустую строку для ссылки на видео
  });

  // Предпросмотр загруженных файлов
  const [coverPreview, setCoverPreview] = useState(null);
  // Удалили переменную videoPreview, так как теперь мы используем ссылку

  // Загрузка списка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CoursesAPI.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
        setError('Не удалось загрузить категории курсов');
      }
    };

    fetchCategories();
  }, []);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else if (name === 'categories') {
      // Для мультиселекта категорий
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
      setFormData({ ...formData, categories: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Обработчик загрузки файлов
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (files.length === 0) return;

    const file = files[0];
    setFormData({ ...formData, [name]: file });

    // Создаем URL для предпросмотра
    if (name === 'cover_image') {
      const previewURL = URL.createObjectURL(file);
      setCoverPreview(previewURL);
    }
    // Удалили обработку для video_preview
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await CoursesAPI.createCourse(formData);
      setSuccess(true);

      // Перенаправляем на список курсов после короткой задержки
      setTimeout(() => {
        router.push(`/${router.query.lang}/admin/courses`);
      }, 2000);
    } catch (err) {
      console.error('Ошибка при создании курса:', err);
      setError(err.response?.data?.detail || 'Не удалось создать курс. Проверьте введенные данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Создание нового курса">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          <p>Курс успешно создан! Перенаправление на список курсов...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Основная информация */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Основная информация</h3>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Название курса *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание курса *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="course_url" className="block text-sm font-medium text-gray-700 mb-1">
                URL курса *
              </label>
              <input
                type="url"
                id="course_url"
                name="course_url"
                value={formData.course_url}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Детали курса */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Детали курса</h3>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Язык курса *
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ru">Русский</option>
                <option value="en">Английский</option>
                <option value="kz">Казахский</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Продолжительность (в часах) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Уровень сложности
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
                <option value="expert">Эксперт</option>
              </select>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                Навыки (через запятую) *
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: программирование, Python, анализ данных"
              />
            </div>
          </div>

          {/* Цена и категории */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Цена и категории</h3>

            <div className="flex items-start mb-4">
              <div className="flex items-center h-5">
                <input
                  id="is_free"
                  name="is_free"
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is_free" className="font-medium text-gray-700">Бесплатный курс</label>
                <p className="text-gray-500">Отметьте, если курс будет бесплатным</p>
              </div>
            </div>

            {!formData.is_free && (
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Валюта
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RUB">Рубль (₽)</option>
                    <option value="USD">Доллар ($)</option>
                    <option value="EUR">Евро (€)</option>
                    <option value="KZT">Тенге (₸)</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Цена
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={formData.is_free}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                Категории *
              </label>
              <select
                id="categories"
                name="categories"
                multiple
                size="5"
                value={formData.categories}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Удерживайте Ctrl (Cmd для Mac) для выбора нескольких категорий</p>
            </div>
          </div>

          {/* Медиа-файлы */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Медиа-файлы</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
                  Обложка курса (JPG, PNG, GIF)
                </label>
                <input
                  type="file"
                  id="cover_image"
                  name="cover_image"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {coverPreview && (
                  <div className="mt-2">
                    <img src={coverPreview} alt="Предпросмотр обложки" className="h-32 object-cover rounded-md" />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="video_preview" className="block text-sm font-medium text-gray-700 mb-1">
                  Ссылка на видео-превью (YouTube, ВКонтакте и т.д.)
                </label>
                <input
                  type="url"
                  id="video_preview"
                  name="video_preview"
                  value={formData.video_preview}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.video_preview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Предпросмотр видео будет доступен после сохранения курса</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push(`/${router.query.lang}/admin/courses`)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Создание курса...' : 'Создать курс'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CourseCreate;
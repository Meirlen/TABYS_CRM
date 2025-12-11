import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { CoursesAPI } from '../../../api/coursesAPI';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    pendingCourses: 0,
    categories: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Получаем все курсы
        const coursesResponse = await CoursesAPI.getCourses({ limit: 100 });
        const courses = coursesResponse.data || [];

        // Получаем категории
        const categoriesResponse = await CoursesAPI.getCategories();
        const categories = categoriesResponse.data || [];

        // Подсчитываем статистику
        const activeCourses = courses.filter(course => course.status === 'active');
        const pendingCourses = courses.filter(course => course.status === 'pending');

        // Сортируем курсы по дате создания (от новых к старым)
        const sortedCourses = [...courses].sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        // Берем 5 последних курсов
        const recentCourses = sortedCourses.slice(0, 5);

        setStats({
          totalCourses: courses.length,
          activeCourses: activeCourses.length,
          pendingCourses: pendingCourses.length,
          categories: categories.length,
          recentCourses: recentCourses
        });
      } catch (error) {
        console.error('Ошибка при загрузке данных для дашборда:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Функция для отображения статуса курса
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Активен</span>;
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">На модерации</span>;
      case 'rejected':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Отклонен</span>;
      case 'draft':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Черновик</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Неизвестно</span>;
    }
  };

  // Функция форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <AdminLayout title="Панель управления">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Загрузка данных...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Панель управления">
      {/* Карточки со статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Всего курсов</h2>
              <div className="mt-1">
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.totalCourses}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/ru/admin/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Просмотреть все →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Активных курсов</h2>
              <div className="mt-1">
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.activeCourses}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/ru/admin/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Просмотреть все →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">На модерации</h2>
              <div className="mt-1">
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.pendingCourses}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/admin/moderation" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Перейти к модерации →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Категорий</h2>
              <div className="mt-1">
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.categories}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/ru/admin/categories" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Управление категориями →
            </Link>
          </div>
        </div>
      </div>

      {/* Последние добавленные курсы */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Последние добавленные курсы</h3>
          <Link href="/ru/admin/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Все курсы →
          </Link>
        </div>

        {stats.recentCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Нет добавленных курсов</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Автор
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.author?.user_name || 'Неизвестно'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(course.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/ru/admin/courses/${course.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        Просмотр
                      </Link>
                      <Link href={`/ru/admin/courses/edit/${course.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Изменить
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Карточки быстрого доступа */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Создать новый курс</h3>
          <p className="text-gray-600 mb-4">Добавьте новый курс в систему, заполните информацию и загрузите учебные материалы.</p>
          <Link href="/ru/admin/courses/create" className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Создать курс
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Управление категориями</h3>
          <p className="text-gray-600 mb-4">Создавайте и редактируйте категории для организации курсов по темам и направлениям.</p>
          <Link href="/ru/admin/categories" className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
            Категории
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Модерация курсов</h3>
          <p className="text-gray-600 mb-4">Проверьте и одобрите новые курсы или курсы, ожидающие модерации после изменений.</p>
          <Link href="/ru/admin/moderation" className="block text-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors">
            Перейти к модерации
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
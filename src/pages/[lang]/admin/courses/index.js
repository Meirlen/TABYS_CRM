import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { CoursesAPI } from '../../../../api/coursesAPI';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  // Получение списка курсов с учетом пагинации
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const response = await CoursesAPI.getCourses({
          skip: skip,
          limit: itemsPerPage
        });

        setCourses(response.data);

        // Подсчет общего количества страниц (для примера, если API возвращает общее количество)
        // Обычно это делается на основе ответа от сервера, например, из headers или metadata
        // Здесь мы просто для примера устанавливаем 5 страниц
        setTotalPages(5);
      } catch (err) {
        console.error('Ошибка при загрузке курсов:', err);
        setError(err.message || 'Произошла ошибка при загрузке курсов');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage]);

  // Обработчик удаления курса
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      try {
        await CoursesAPI.deleteCourse(courseId);
        // Обновляем список курсов после удаления
        setCourses(courses.filter(course => course.id !== courseId));
      } catch (err) {
        console.error('Ошибка при удалении курса:', err);
        alert('Не удалось удалить курс. Попробуйте еще раз.');
      }
    }
  };

  // Получение класса для статуса курса
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Получение текста статуса курса
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'pending':
        return 'На модерации';
      case 'rejected':
        return 'Отклонен';
      case 'draft':
        return 'Черновик';
      default:
        return 'Неизвестный статус';
    }
  };

  // Отрисовка компонента пагинации
  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-6">
        <nav className="flex items-center">
          <button
            onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
          >
            Пред.
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border-t border-b ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
          >
            След.
          </button>
        </nav>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Список курсов">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Загрузка курсов...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Список курсов">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p>Ошибка: {error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Попробовать снова
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Список курсов">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-gray-600">Всего курсов: {courses.length}</span>
        </div>
        <Link href="/ru/admin/courses/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          Создать новый курс
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-10 rounded-md text-center">
          <p>Курсы не найдены. Создайте новый курс.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                  Язык
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
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
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-500">ID: {course.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.author?.user_name || 'Неизвестно'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.language}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.is_free ? (
                      <span className="text-sm text-green-600 font-medium">Бесплатно</span>
                    ) : (
                      <span className="text-sm text-gray-900">{course.price} {course.currency}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/ru/admin/courses/${course.id}`} className="text-blue-600 hover:text-blue-900">
                        Просмотр
                      </Link>
                      <Link href={`/ru/admin/courses/edit/${course.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Изменить
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация */}
      {courses.length > 0 && renderPagination()}
    </AdminLayout>
  );
};

export default CoursesList;
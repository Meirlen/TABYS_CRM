import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { CertificatesAPI } from '../../../../api/coursesAPI';

const CertificatesList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const itemsPerPage = 10;
  const router = useRouter();

  // Получение списка сертификатов с учетом пагинации
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const params = {
          skip,
          limit: itemsPerPage
        };

        // Добавляем параметры фильтрации, если они указаны
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (filterStatus) {
          params.status = filterStatus;
        }

        const response = await CertificatesAPI.getCertificates(params);
        setCertificates(response.data);

        // Подсчет общего количества страниц (для примера, если API возвращает общее количество)
        // Обычно это делается на основе ответа от сервера, например, из headers или metadata
        // Здесь мы просто для примера устанавливаем 5 страниц
        setTotalPages(5);
      } catch (err) {
        console.error('Ошибка при загрузке сертификатов:', err);
        setError(err.message || 'Произошла ошибка при загрузке сертификатов');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [currentPage, searchQuery, filterStatus]);

  // Обработчик удаления сертификата
  const handleRevokeCertificate = async (certificateId) => {
    if (window.confirm('Вы уверены, что хотите отозвать этот сертификат?')) {
      try {
        const reason = prompt('Укажите причину отзыва сертификата:');
        if (reason) {
          await CertificatesAPI.revokeCertificate(certificateId, reason);
          // Обновляем список сертификатов после отзыва
          setCertificates(certificates.map(cert =>
            cert.id === certificateId
              ? { ...cert, status: 'revoked', revocation_reason: reason }
              : cert
          ));
          alert('Сертификат успешно отозван.');
        }
      } catch (err) {
        console.error('Ошибка при отзыве сертификата:', err);
        alert('Не удалось отозвать сертификат. Попробуйте еще раз.');
      }
    }
  };

  // Получение класса для статуса сертификата
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Получение текста статуса сертификата
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'pending':
        return 'Ожидает выдачи';
      case 'revoked':
        return 'Отозван';
      case 'expired':
        return 'Истек срок';
      default:
        return 'Неизвестный статус';
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Обработчик поиска
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Сбрасываем на первую страницу при новом поиске
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
      <AdminLayout title="Сертификаты">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Загрузка сертификатов...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Сертификаты">
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
    <AdminLayout title="Сертификаты">
      {/* Фильтры и действия */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Поиск сертификатов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="pending">Ожидающие</option>
              <option value="revoked">Отозванные</option>
              <option value="expired">Истекшие</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Применить
          </button>
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/ru/admin/certificates/create" className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Выдать сертификат
          </Link>
          <Link href="/ru/admin/certificates/templates" className="flex-1 sm:flex-none text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
            Шаблоны
          </Link>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-10 rounded-md text-center">
          <p>Сертификаты не найдены.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сертификат
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Курс
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата выдачи
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
              {certificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{certificate.id}</div>
                    <div className="text-sm text-gray-500">{certificate.title || certificate.template?.name || 'Без названия'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{certificate.user?.full_name || 'Неизвестный пользователь'}</div>
                    <div className="text-sm text-gray-500">{certificate.user?.email || 'Нет email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{certificate.course?.title || 'Не указан'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(certificate.issue_date)}</div>
                    {certificate.expiration_date && (
                      <div className="text-sm text-gray-500">
                        Истекает: {formatDate(certificate.expiration_date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(certificate.status)}`}>
                      {getStatusText(certificate.status)}
                    </span>
                    {certificate.status === 'revoked' && certificate.revocation_reason && (
                      <div className="text-xs text-red-600 mt-1">
                        Причина: {certificate.revocation_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/ru/admin/certificates/${certificate.id}`} className="text-blue-600 hover:text-blue-900">
                        Просмотр
                      </Link>
                      <a
                        href={`/api/v2/certificates/${certificate.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        Скачать
                      </a>
                      {certificate.status === 'active' && (
                        <button
                          onClick={() => handleRevokeCertificate(certificate.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Отозвать
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация */}
      {certificates.length > 0 && renderPagination()}
    </AdminLayout>
  );
};

export default CertificatesList;
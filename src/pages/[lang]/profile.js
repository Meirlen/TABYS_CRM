import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet, apiPut } from '../../utils/api';

export default function ProfilePage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;
  const { user, loading: authLoading, requireAuth } = useAuth();

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});

  const [activeTab, setActiveTab] = useState('profile');
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Auth check
  useEffect(() => {
    if (!authLoading) {
      requireAuth();
    }
  }, [authLoading, requireAuth]);

  // Language handling
  useEffect(() => {
    // Update language when client navigation changes (if query parameters change)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Use existing translations
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Save selected language to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  // Function to get translations from nested keys
  const getTranslation = (key) => {
    try {
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (!result || result[k] === undefined) {
          console.warn(`Translation missing: ${key}`);
          return key;
        }
        result = result[k];
      }

      return typeof result === 'string' ? result : key;
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return key;
    }
  };

  // Fetch collaboration requests when tab changes to 'requests'
  useEffect(() => {
    if (activeTab === 'requests' && user) {
      fetchCollaborationRequests();
    }
  }, [activeTab, user]);

  // Fetch collaboration requests
  const fetchCollaborationRequests = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/experts/requests');
      setCollaborationRequests(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching collaboration requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle request status update
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await apiPut(`/experts/requests/${requestId}/status`, { status: newStatus });

      // Update the local state
      setCollaborationRequests(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
      );

      // Show success message
      setSuccessMessage(
        newStatus === 'approved'
          ? getTranslation('profile.requests.approvedSuccess') || 'Request approved successfully!'
          : getTranslation('profile.requests.rejectedSuccess') || 'Request rejected successfully!'
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating request status:', err);
      setError(err.message);
    }
  };

  // Navigate back to home
  const handleBack = () => {
    router.push(`/${currentLang}/home`);
  };

  // If loading auth, show loading state
  if (authLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <HeaderBack title={getTranslation('profile.title') || 'My Profile'} onBack={handleBack} />
        <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If no user, don't render the page content
  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('profile.title') || 'My Profile'} | Your Site Name</title>
        <meta
          name="description"
          content={getTranslation('profile.description') || 'Manage your profile and collaboration requests'}
        />
      </Head>

      <HeaderBack
        title={getTranslation('profile.title') || 'My Profile'}
        onBack={handleBack}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User profile header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="relative h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="p-6 pt-0 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end">
              <div className="h-24 w-24 rounded-xl bg-white p-1 shadow-md mb-4 sm:mb-0">
                <div className="h-full w-full rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-2xl font-medium text-white">
                  {user.full_name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="sm:ml-6">
                <h1 className="text-xl font-bold text-gray-800">{user.full_name}</h1>
                <p className="text-gray-600">{user.email}</p>

                {user.is_admin && (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                    {getTranslation('profile.adminBadge') || 'Administrator'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTranslation('profile.tabs.profile') || 'Profile Information'}
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTranslation('profile.tabs.requests') || 'Collaboration Requests'}
              </button>
            </nav>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              {getTranslation('profile.personalInfo') || 'Personal Information'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {getTranslation('profile.fullName') || 'Full Name'}
                </label>
                <div className="mt-1 text-gray-900">{user.full_name}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {getTranslation('profile.email') || 'Email'}
                </label>
                <div className="mt-1 text-gray-900">{user.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {getTranslation('profile.accountType') || 'Account Type'}
                </label>
                <div className="mt-1 text-gray-900">
                  {user.is_admin
                    ? (getTranslation('profile.adminAccount') || 'Administrator')
                    : (getTranslation('profile.userAccount') || 'Regular User')
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {getTranslation('profile.joinDate') || 'Join Date'}
                </label>
                <div className="mt-1 text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              {getTranslation('profile.requests.title') || 'Collaboration Requests'}
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : collaborationRequests.length > 0 ? (
              <div className="space-y-6">
                {collaborationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{request.user_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.user_email}</p>
                        {request.user_phone && (
                          <p className="text-sm text-gray-600 mt-1">{request.user_phone}</p>
                        )}
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {request.status === 'pending'
                              ? (getTranslation('profile.requests.pending') || 'Pending')
                              : request.status === 'approved'
                              ? (getTranslation('profile.requests.approved') || 'Approved')
                              : (getTranslation('profile.requests.rejected') || 'Rejected')
                            }
                          </span>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex space-x-2 mt-4 sm:mt-0">
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            {getTranslation('profile.requests.approve') || 'Approve'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {getTranslation('profile.requests.reject') || 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>

                    {request.message && (
                      <div className="mt-4 bg-gray-100 p-3 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{request.message}</p>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      {getTranslation('profile.requests.requestedOn') || 'Requested on'}: {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {getTranslation('profile.requests.noRequests') || 'No collaboration requests'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {getTranslation('profile.requests.noRequestsMessage') || 'You have not received any collaboration requests yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Use getServerSideProps to get the lang parameter on the server
export async function getServerSideProps(context) {
  // Get the lang parameter from URL
  const { lang } = context.params;

  // Verify it's a valid language
  const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';

  // Get translations for this language
  const langTranslations = translations[validLang] || translations['kz'];

  // Return data to the component
  return {
    props: {
      lang: validLang,
      translations: langTranslations
    }
  };
}
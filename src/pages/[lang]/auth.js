import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations';

export default function AuthPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, redirect } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  // Handle input changes for the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;

      if (isLogin) {
        // Login request
        response = await fetch('/api/v2/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: formData.email, // API expects username field for email
            password: formData.password,
          }),
        });
      } else {
        // Register request
        response = await fetch('/api/v2/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred');
      }

      if (isLogin) {
        // Save token to localStorage
        localStorage.setItem('token', data.access_token);

        // Redirect to the requested page or default to home
        const redirectPath = redirect || `/${currentLang}/experts`;
        router.push(redirectPath);
      } else {
        // Show success message for registration
        setSuccess(true);
        // Switch to login form after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(false);
          setFormData({
            ...formData,
            password: '',
          });
        }, 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and register forms
  const toggleForm = () => {
    setIsLogin(prev => !prev);
    setError(null);
    setFormData({
      email: '',
      password: '',
      full_name: '',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>
          {isLogin
            ? (getTranslation('auth.login.title') || 'Log In')
            : (getTranslation('auth.register.title') || 'Sign Up')} | Your Site Name
        </title>
        <meta
          name="description"
          content={isLogin
            ? (getTranslation('auth.login.description') || 'Log in to your account')
            : (getTranslation('auth.register.description') || 'Create a new account')}
        />
      </Head>

      <HeaderBack
        title={isLogin
          ? (getTranslation('auth.login.title') || 'Log In')
          : (getTranslation('auth.register.title') || 'Sign Up')}
        onBack={() => router.push(`/${currentLang}/home`)}
      />

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                {getTranslation('auth.register.success.title') || 'Registration Successful!'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {getTranslation('auth.register.success.message') || 'Your account has been created successfully. You can now log in.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    className={`py-2 px-4 text-sm font-medium rounded-l-lg border ${isLogin ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setIsLogin(true)}
                  >
                    {getTranslation('auth.login.tab') || 'Log In'}
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 text-sm font-medium rounded-r-lg border ${!isLogin ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => setIsLogin(false)}
                  >
                    {getTranslation('auth.register.tab') || 'Sign Up'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                      {getTranslation('auth.register.fullName') || 'Full Name'}*
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('auth.email') || 'Email'}*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('auth.password') || 'Password'}*
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {getTranslation('auth.processing') || 'Processing...'}
                      </>
                    ) : isLogin ? (
                      getTranslation('auth.login.button') || 'Log In'
                    ) : (
                      getTranslation('auth.register.button') || 'Sign Up'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-sm">
                {isLogin ? (
                  <p className="text-gray-600">
                    {getTranslation('auth.login.noAccount') || "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {getTranslation('auth.login.signUpLink') || 'Sign up'}
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    {getTranslation('auth.register.hasAccount') || 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {getTranslation('auth.register.logInLink') || 'Log in'}
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
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
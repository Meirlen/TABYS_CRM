import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

// Define the translations interface
interface Translations {
  title: string;
  subtitle: string;
  phoneLabel: string;
  phoneHelper: string;
  loginButton: string;
  loadingText: string;
  errorEmptyPhone: string;
  errorInvalidPhone: string;
  errorWrongNumber: string;
  errorGeneric: string;
}

interface LoginProps {
  translations: Translations;
}

// This function will run on the server for each request
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Get the language from the URL
  const lang = params?.lang || 'kk'; // Default to Kazakh if not specified

  // In a real app, you would load translations from a file or API
  // Here we're just hardcoding Kazakh and Russian translations
  const translations = {
    kk: {
      title: 'Shaqyru24',
      subtitle: 'Сайтқа кіру үшін нөміріңізді енгізіңіз',
      phoneLabel: 'WhatsApp нөміріңіз:',
      phoneHelper: 'Маңызды: Өзіңіздің WhatsApp нөміріңізді көрсетіңіз, өйткені барлық материалдар сол нөмірге жіберіледі.',
      loginButton: 'Кіру',
      loadingText: 'Кіру...',
      errorEmptyPhone: 'Номер телефоныңызды енгізіңіз.',
      errorInvalidPhone: 'Нөмір дұрыс емес.',
      errorWrongNumber: 'Нөмір қате.',
      errorGeneric: 'Кіру кезінде қате.'
    },
    ru: {
      title: 'Shaqyru24',
      subtitle: 'Введите ваш номер для входа на сайт',
      phoneLabel: 'Ваш WhatsApp номер:',
      phoneHelper: 'Важно: Укажите ваш WhatsApp номер, так как все материалы будут отправлены на этот номер.',
      loginButton: 'Войти',
      loadingText: 'Вход...',
      errorEmptyPhone: 'Введите номер телефона.',
      errorInvalidPhone: 'Неверный номер.',
      errorWrongNumber: 'Неверный номер.',
      errorGeneric: 'Ошибка при входе.'
    }
  };

  // Validate lang parameter
  const validLang = (lang as string) in translations ? (lang as string) : 'kk';

  // Return the props for the component
  return {
    props: {
      translations: translations[validLang as keyof typeof translations]
    }
  };
};

const Login: React.FC<LoginProps> = ({ translations }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { lang } = router.query;

  // Function to format the phone number
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');

    // Format the phone number
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 1) return `+${phoneNumber}`;
    if (phoneNumber.length <= 4) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`;
    if (phoneNumber.length <= 7) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (phoneNumber.length <= 9) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };
const handleLogin = async () => {
  setLoading(true);
  setError(null);

  if (!phone) {
    setError(translations.errorEmptyPhone);
    setLoading(false);
    return;
  }

  // Проверка номера телефона
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 11) {
    setError(translations.errorInvalidPhone);
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post(API_BASE_URL + '/api/v2/auth/login', {
      phone_number: digitsOnly,
    });

    const token = response.data?.data?.token;
    if (token) {
      // Сохраняем токен и номер телефона в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('phoneNumber', digitsOnly);
      }
    }

    // Получаем параметр callbackUrl из URL, если он есть
    const { callbackUrl } = router.query;

    // Если есть callbackUrl, перенаправляем туда
    if (callbackUrl && typeof callbackUrl === 'string') {
      router.push(callbackUrl);
    } else {
      // Иначе перенаправляем на домашнюю страницу
      router.push(`/${lang}/admin/dashboard`);
    }
  } catch (err: any) {
    console.error('Login error:', err);
    if (err.response?.status === 403 || err.response?.status === 401) {
      setError(translations.errorWrongNumber);
    } else {
      const detail = err.response?.data?.detail;
      setError(detail || translations.errorGeneric);
    }
  } finally {
    setLoading(false);
  }
};
  // Simple dynamic icon components
  const PhoneIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );

  const AlertIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginRight: '8px', color: '#ef4444' }}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  const LoaderIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        marginRight: '8px',
        animation: 'spin 1s linear infinite',
      }}
    >
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  );

  // Styles
  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '400px',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '24px',
    },
    logo: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2563eb',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
    },
    inputGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#4b5563',
    },
    inputWrapper: {
      position: 'relative' as const,
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 40px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      color: '#000000', // Changed to black color for the input text
    },
    inputFocus: {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
    },
    inputError: {
      borderColor: '#ef4444',
    },
    helperText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px',
      textAlign: 'center' as const,
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #fee2e2',
    },
    errorText: {
      fontSize: '14px',
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      fontSize: '16px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    buttonHover: {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.15)',
    },
    buttonDisabled: {
      backgroundColor: '#93c5fd',
      cursor: 'not-allowed',
    }
  };

  // Add keyframe animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{translations.title} - {translations.loginButton}</title>
        <meta name="description" content={translations.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <div style={styles.logo}>{translations.title}</div>
            <div style={styles.subtitle}>{translations.subtitle}</div>
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <AlertIcon />
              <div style={styles.errorText}>{error}</div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label htmlFor="phone" style={styles.label}>
              {translations.phoneLabel}
            </label>
            <div style={styles.inputWrapper}>
              <PhoneIcon />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                id="phone"
                style={{
                  ...styles.input,
                  ...(error ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <p style={styles.helperText}>
              {translations.phoneHelper}
            </p>
          </div>

          <button
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onClick={handleLogin}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <LoaderIcon />
                {translations.loadingText}
              </>
            ) : translations.loginButton}
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
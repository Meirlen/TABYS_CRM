import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import Head from 'next/head';

// Импортируем компоненты шагов
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';
import Step4 from '../../components/Step4';
import Step5 from '../../components/Step5';
import HeaderBack from "../../components/HeaderBack";

// Импортируем общие данные и стили
import { categories, styles } from '../../utils/constants';
import { translations } from '../../locales/translations';

/**
 * Компонент модального окна для завершения
 * @param {Object} props - Параметры компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Функция закрытия окна
 * @param {Function} props.onGoToMySites - Функция перехода на страницу "Мои сайты"
 */
const Modal = ({ isOpen, onClose, onGoToMySites }) => {
  const router = useRouter();
  const { lang } = router.query;
  const currentLang = Array.isArray(lang) ? lang[0] : lang || 'kz';

  // Функция для получения переводов по вложенным ключам
  const getTranslation = (key) => {
    try {
      const langData = translations[currentLang] || translations['kz'];
      const keys = key.split('.');
      let result = langData;

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

  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>{getTranslation('wizard.modal.title')}</h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>{getTranslation('wizard.modal.message')}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            style={styles.modalButton}
            onClick={onGoToMySites}
          >
            {getTranslation('wizard.modal.mySitesButton')}
          </button>
          <button
            style={{ ...styles.modalButton, backgroundColor: '#f3f4f6', color: '#4b5563' }}
            onClick={onClose}
          >
            {getTranslation('wizard.modal.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Основной компонент мастера создания сайта
export default function SiteCreationWizard({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, category_name, type } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    // Обновляем язык при клиентской навигации (если меняются query-параметры)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang.toString()) ? clientLang.toString() : 'kz';
      setCurrentLang(validLang);

      // Используем существующие переводы
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  useEffect(() => {
    const categoryName = Array.isArray(category_name) ? category_name[0] : category_name;
    const eventType = Array.isArray(type) ? type[0] : type;

    const category = categories.find(c => c.route === categoryName);
    setCategoryData(category || null);

    setFormData((prev) => ({
      ...prev,
      categoryName: categoryName || '',
      type: eventType || '',
    }));
  }, [category_name, type]);

  // Функция для получения переводов по вложенным ключам
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

  const handleNext = (data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(prev => prev + 1);
    // Прокрутка к верху при смене шагов
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    // Прокрутка к верху при смене шагов
    window.scrollTo(0, 0);
  };

  const handleComplete = async () => {
    setIsModalOpen(true);
    return Promise.resolve(); // Возвращаем Promise для соответствия типу
  };

  const handleGoToMySites = () => {
    setIsModalOpen(false);
    // Навигация с учетом языкового префикса
    router.push(`/${currentLang}/my_sites`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            onNext={handleNext}
            categoryData={categoryData}
            formData={formData}
          />
        );
      case 2:
        return (
          <Step2
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 3:
        return (
          <Step3
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
          />
        );
      case 4:
        return (
          <Step4
            onNext={(data) => {
              // Добавляем onNext для соответствия интерфейсу Step4Props
              setFormData({ ...formData, ...data });
            }}
            onComplete={(data) => {
              // Обновляем данные и переходим к следующему шагу
              setFormData({ ...formData, ...data });
              setCurrentStep(prev => prev + 1);
              window.scrollTo(0, 0);
              return Promise.resolve(); // Возвращаем Promise для соответствия типу
            }}
            onBack={handleBack}
            formData={formData}
            categoryData={categoryData}
          />
        );
      case 5:
        return (
          <Step5
            onNext={(data) => {
              // Этот обработчик нужен, чтобы удовлетворить требования интерфейса StepProps
              // Можно оставить его пустым, так как Step5 - последний шаг
              setFormData({ ...formData, ...data });
            }}
            onComplete={handleComplete}
            onBack={handleBack}
            formData={formData}
            categoryData={categoryData} // Добавляем categoryData для последовательности
          />
        );
      default:
        return <div>{getTranslation('wizard.stepNotFound')}</div>;
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = 5;

    return (
      <div style={styles.stepIndicator}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;

          return (
            <React.Fragment key={stepNumber}>
              {index > 0 && (
                <div
                  style={{
                    ...styles.stepConnector,
                    ...(isPast || isActive ? styles.activeStepConnector : {})
                  }}
                />
              )}
              <div
                style={{
                  ...styles.stepCircle,
                  ...(isActive || isPast ? styles.activeStepCircle : {}),
                }}
              >
                {isPast ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>{getTranslation('wizard.title')} | Your Site Name</title>
        <meta name="description" content={getTranslation('wizard.description') || 'Создание сайта'} />
      </Head>

      {/* Кнопка назад вверху */}
      <HeaderBack title={getTranslation('wizard.title')} />

      {/* Индикатор шагов и форма */}
      <div style={{ marginTop: '40px', width: '100%', maxWidth: '640px' }}>
        {renderStepIndicator()}
        {renderStep()}
      </div>

      {/* Текст помощи */}
      <div style={{ marginTop: '24px', color: '#6b7280', fontSize: '14px', textAlign: 'center', maxWidth: '600px' }}>
        <p>{getTranslation('wizard.helpText')} <a href="https://wa.me/77711745741" style={{ color: '#2563eb', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
      </div>

      {/* Модальное окно успеха */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoToMySites={handleGoToMySites}
      />
    </div>
  );
}

// Используем getServerSideProps для получения параметра lang на сервере
export async function getServerSideProps(context) {
  // Получаем параметр lang из URL
  const { lang } = context.params;

  // Проверяем, что язык валидный
  const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';

  // Получаем переводы для этого языка
  const langTranslations = translations[validLang] || translations['kz'];

  // Возвращаем данные в компонент
  return {
    props: {
      lang: validLang,
      translations: langTranslations
    }
  };
}
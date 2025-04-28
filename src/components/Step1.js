import React, { useState, useEffect } from 'react';
import { FiUser, FiUsers } from 'react-icons/fi';
import { styles } from '../utils/constants';
import { useRouter } from 'next/router';
import { translations } from '../locales/translations';

/**
 * Компонент первого шага: Название мероприятия и имена участников
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onNext - Функция для перехода к следующему шагу
 * @param {Object} props.categoryData - Данные выбранной категории
 * @param {Object} props.formData - Существующие данные формы
 */
const Step1 = ({ onNext, categoryData, formData }) => {
  const router = useRouter();
  const { lang } = router.query;
  const currentLang = Array.isArray(lang) ? lang[0] : lang || 'kz';

  const [title, setTitle] = useState(formData?.title || '');
  const [nameFields, setNameFields] = useState(formData?.nameFields || {});

  // Функция для получения переводов
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

  // Для сокращения записи
  const t = getTranslation;

  useEffect(() => {
    // Устанавливаем название по умолчанию из метки категории, если название пусто
    if (categoryData && categoryData.label && !title) {
      setTitle(categoryData.label);
    }
  }, [categoryData, title]);

  const handleNameFieldChange = (index, value) => {
    setNameFields(prev => ({
      ...prev,
      [`name${index === 0 ? '' : index + 1}`]: value
    }));
  };

  const handleNext = () => {
    onNext({
      title,
      nameFields
    });
  };

  // Валидация формы
  const isFormValid = () => {
    if (!title) return false;
    if (categoryData && categoryData.fields) {
      for (let i = 0; i < categoryData.fields.length; i++) {
        const fieldName = `name${i === 0 ? '' : i + 1}`;
        if (!nameFields[fieldName]) return false;
      }
    }
    return true;
  };

  return (
    <div style={styles.stepContainer}>
      <h1 style={styles.heading}>{t('steps.step1.title')}</h1>

      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label htmlFor="event-title" style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4b5563'
        }}>
          {t('steps.step1.eventTitle')}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="event-title"
            style={styles.input}
            type="text"
            placeholder={t('steps.step1.placeholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Динамические поля имен в зависимости от выбранной категории */}
      {categoryData && categoryData.fields && categoryData.fields.map((fieldPlaceholder, index) => (
        <div key={index} style={{ width: '100%', marginBottom: '20px' }}>
          <label htmlFor={`name-field-${index}`} style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563'
          }}>
            {fieldPlaceholder}
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '12px',
              color: '#6b7280'
            }}>
              <FiUser />
            </div>
            <input
              id={`name-field-${index}`}
              style={{ ...styles.input, paddingLeft: '36px' }}
              type="text"
              placeholder={fieldPlaceholder}
              value={nameFields[`name${index === 0 ? '' : index + 1}`] || ''}
              onChange={(e) => handleNameFieldChange(index, e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        style={{
          ...styles.mainButton,
          ...(isFormValid() ? {} : styles.disabledButton),
          marginTop: '10px'
        }}
        onClick={handleNext}
        disabled={!isFormValid()}
      >
        {t('steps.step1.nextButton')}
      </button>
    </div>
  );
};

export default Step1;
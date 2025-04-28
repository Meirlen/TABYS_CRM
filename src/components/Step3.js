import React, { useState } from 'react';
import { FiMapPin, FiGlobe, FiLink } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { styles } from '../utils/constants';
import { translations } from '../locales/translations';

/**
 * Компонент третьего шага: Информация об адресе
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onNext - Функция для перехода к следующему шагу
 * @param {Function} props.onBack - Функция для возврата к предыдущему шагу
 * @param {Object} props.formData - Существующие данные формы
 */
const Step3 = ({ onNext, onBack, formData }) => {
  const router = useRouter();
  const { lang } = router.query;
  const currentLang = Array.isArray(lang) ? lang[0] : lang || 'kz';

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

  // Используем сохраненные значения при возврате к этому шагу
  const [address, setAddress] = useState(formData?.address || '');
  const [city, setCity] = useState(formData?.city || '');
  // 2GIS ссылка опциональна
  const [addressLink, setAddressLink] = useState(formData?.addressLink || '');

  const handleNext = () => {
    onNext({ address, city, addressLink });
  };

  // Проверяем обязательные поля: адрес и город
  const isFormValid = address && city;

  return (
    <div style={styles.stepContainer}>
      <h1 style={styles.heading}>{t('steps.step3.title')}</h1>



      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label htmlFor="city" style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4b5563'
        }}>
          {t('steps.step3.city.label')}
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '12px',
            color: '#6b7280'
          }}>
            <FiGlobe />
          </div>
          <input
            id="city"
            style={{ ...styles.input, paddingLeft: '36px' }}
            type="text"
            placeholder={t('steps.step3.city.placeholder')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>


      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label htmlFor="address" style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4b5563'
        }}>
          {t('steps.step3.address.label')}
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '12px',
            color: '#6b7280'
          }}>
            <FiMapPin />
          </div>
          <input
            id="address"
            style={{ ...styles.input, paddingLeft: '36px' }}
            type="text"
            placeholder={t('steps.step3.address.placeholder')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label htmlFor="address-link" style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4b5563',
          gap: '4px'
        }}>
          {t('steps.step3.addressLink.label')} <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>{t('steps.step3.addressLink.optional')}</span>
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '12px',
            color: '#6b7280'
          }}>
            <FiLink />
          </div>
          <input
            id="address-link"
            style={{ ...styles.input, paddingLeft: '36px' }}
            type="text"
            placeholder={t('steps.step3.addressLink.placeholder')}
            value={addressLink}
            onChange={(e) => setAddressLink(e.target.value)}
          />
        </div>
      </div>

      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fee2e2',
        width: '100%'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#b91c1c' }}>
          {t('steps.step3.note.text')}
        </p>
        <a
          href="https://youtube.com/shorts/V6TZlKEhiXI?feature=share"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#ef4444',
            fontSize: '14px',
            marginTop: '8px',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
            <path d="M21 12L14 19V15C7 14 4 18 3 22C3 17 6 9 14 9V5L21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('steps.step3.note.linkText')}
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
        <button
          style={{
            ...styles.mainButton,
            ...(isFormValid ? {} : styles.disabledButton)
          }}
          onClick={handleNext}
          disabled={!isFormValid}
        >
          {t('steps.step3.nextButton')}
        </button>
        {onBack && (
          <button
            style={styles.secondaryButton}
            onClick={onBack}
          >
            {t('steps.step3.backButton')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Step3;
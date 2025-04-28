import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUsers, FiLoader, FiGlobe, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { styles } from '../utils/constants';
import { categories } from '../utils/constants';
import { translations } from '../locales/translations';

const fixedStyles = {
  ...styles,
  textArea: {
    ...styles.textArea,
    resize: 'vertical'
  },
  languageButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  activeLanguageButton: {
    backgroundColor: '#f0f9ff',
    borderColor: '#93c5fd',
    color: '#2563eb'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    color: 'white',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    fontSize: '12px',
    marginLeft: '8px'
  },
  optionBox: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectedOption: {
    borderColor: '#93c5fd',
    backgroundColor: '#f0f9ff',
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  optionDescription: {
    fontSize: '14px',
    color: '#6b7280',
  }
};

// Функция для создания метаданных на основе данных формы и категории
const createMetadata = (formData, categoryName) => {
  const metadata = [];

  // Добавляем тип события
  metadata.push({ key: "event_type", value: categoryName });

  // Логирование для отладки
  console.log('Формирование метаданных. Категория:', categoryName);
  console.log('nameFields:', formData.nameFields);

  // Проверяем наличие nameFields
  if (formData.nameFields) {
    // Проходимся по всем полям имён
    Object.entries(formData.nameFields).forEach(([key, value]) => {
      // Определяем тип поля на основе ключа
      let metadataKey = "";

      // Определение ключа метаданных в зависимости от категории
      if (categoryName === "wedding") {
        if (key === "name") metadataKey = "groom_name";
        if (key === "name2") metadataKey = "bride_name";
      }
      else if (categoryName === "merey") {
        if (key === "name") metadataKey = "celebrant_name";
        if (key === "name2") metadataKey = "age";
      }
      else if (["sundet", "reception", "besik", "tilashar"].includes(categoryName)) {
        if (key === "name") metadataKey = "child_name";
      }
      else if (["bachelorette", "betashar"].includes(categoryName)) {
        if (key === "name") metadataKey = "bride_name";
      }
      else if (categoryName === "merey-sundet") {
        if (key === "name") metadataKey = "celebrant_name";
        if (key === "name2") metadataKey = "child_name";
      }
      else if (categoryName === "birthday") {
        if (key === "name") metadataKey = "celebrant_name";
      }
      else {
        // Для других категорий или неизвестных полей используем общий формат
        metadataKey = key;
      }

      // Добавляем метаданные только если ключ определён и значение не пустое
      if (metadataKey && value) {
        metadata.push({ key: metadataKey, value: value });
      }
    });
  }

  console.log('Сформированные метаданные:', metadata);
  return metadata;
};

// Проверка статуса оплаты
const checkProPaymentStatus = async (tariffParam) => {
  if (tariffParam !== 'pro') {
    return true;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const response = await fetch('https://tyrasoft.kz/api/v1/balance', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.balance >= 4900;
    }

    return false;
  } catch (error) {
    console.error('Ошибка при проверке баланса:', error);
    return false;
  }
};

/**
 * Компонент пятого шага: Выбор языков и создание сайта
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onComplete - Функция для завершения шага
 * @param {Function} props.onBack - Функция для возврата к предыдущему шагу
 * @param {Object} props.formData - Существующие данные формы
 */
const Step5 = ({ onComplete, onBack, formData }) => {
  const router = useRouter();
  const { lang, site_id: siteIdQuery, category_name: categoryNameQuery, type: typeQuery, tariff: tariffQuery } = router.query;
  const currentLang = Array.isArray(lang) ? lang[0] : lang || 'kz';
  const siteId = Array.isArray(siteIdQuery) ? siteIdQuery[0] : siteIdQuery;

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

  // Данные о тексте приглашения из предыдущего шага
  const invitationText = formData.invitationText || '';
  const hostText = formData.hostText || '';

  // Состояние для выбора переводов
  const [needRussianTranslation, setNeedRussianTranslation] = useState(false);
  const [translationsList, setTranslationsList] = useState([]); // Переименовано, чтобы избежать конфликта
  const [russianTitle, setRussianTitle] = useState('');
  const [russianInvitation, setRussianInvitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Проверяем наличие site_id в URL и устанавливаем режим обновления
  useEffect(() => {
    if (siteId) {
      setIsUpdateMode(true);
    }
  }, [siteId]);

  // Инициализация русского перевода из шаблона при загрузке
  useEffect(() => {
    // По умолчанию используем казахский заголовок как стартовую точку
    setRussianTitle(formData.title || '');

    // Если есть поле content_body_ru в категории, используем его как шаблон для русского перевода
    const categoryObject = categories.find((c) => c.route === formData.categoryName);
    if (categoryObject?.content_body_ru) {
      let text = categoryObject.content_body_ru;

      // Обработка имён для русского перевода
      if (formData.nameFields) {
        Object.entries(formData.nameFields).forEach(([key, value]) => {
          const val = value || '';
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
        });
      }

      setRussianInvitation(text);
    }
  }, [formData]);

  // Создаём или обновляем сайт
  const handleSaveOrUpdateSite = async () => {
    // Проверяем данные перевода если выбран русский перевод
    if (needRussianTranslation) {
      if (!russianTitle.trim() || !russianInvitation.trim()) {
        setError('Заполните все поля для русского перевода');
        return;
      }

      // Добавляем перевод
      setTranslationsList([
        {
          language_code: 'ru',
          title: russianTitle,
          invitation_text: russianInvitation
        }
      ]);
    }

    setLoading(true);
    setError(null);

    // Используем window, только если мы в браузере
    if (typeof window === 'undefined') {
      setError('Требуется браузерное окружение');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Требуется авторизация');
      setLoading(false);
      return;
    }

    try {
      const {
        siteType,
        address,
        addressLink,
        title,
        eventDate,
        city,
        categoryName,
        tariff,
        type: event_type
      } = formData;

      // Получаем тариф из URL если он не указан в formData
      const tariffParam = tariffQuery || tariff || 'standart';

      // Проверяем статус оплаты для тарифа Pro
      const isPaid = await checkProPaymentStatus(tariffParam);

      const categoryObject = categories.find((c) => c.route === categoryName);
      let finalVideoLink;
      if (event_type === "photo") {
        finalVideoLink = "photo";
      } else {
        finalVideoLink = categoryObject
          ? categoryObject.video_link
          : "https://www.youtube.com/watch?v=defaultvideo";
      }

      // Готовим переводы
      const translationsToSend = needRussianTranslation && russianTitle.trim() && russianInvitation.trim()
        ? [{
            language_code: 'ru',
            title: russianTitle,
            invitation_text: russianInvitation
          }]
        : [];

      // Создаём метаданные из информации о категории и полях имён
      const metadata = formData.categoryName
        ? createMetadata(formData, formData.categoryName)
        : [];

      // Формируем тело запроса
      const requestBody = {
        site_type: siteType,
        video_format: 'shorts',
        video_link: finalVideoLink,
        address: address,
        address_link: addressLink,
        invitation_text: invitationText,
        category: categoryName,
        host_text: hostText,
        title: title,
        event_datetime: eventDate,
        city: city,
        tariff: tariffParam,
        is_paid: isPaid,
        // Добавляем переводы, если они есть
        translations: translationsToSend.length > 0 ? translationsToSend : undefined,
        // Добавляем метаданные
        metadata: metadata
      };

      console.log(`Отправка данных (${isUpdateMode ? 'обновление' : 'создание'}):`, requestBody);

      let response;
      let responseData;

      // Выбираем метод и URL в зависимости от режима (обновление/создание)
      if (isUpdateMode && siteId) {
        // Обновление существующего сайта
        response = await fetch(`https://tyrasoft.kz/sites/${siteId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      } else {
        // Создание нового сайта
        response = await fetch('https://tyrasoft.kz/sites/new', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('steps.step5.errors.default'));
      }

      responseData = await response.json();
      const resultingSiteId = siteId || responseData.id;

      // Если type = 'photo', идём к выбору/обрезке фото
      // Иначе - к отправке WhatsApp
      if (event_type === 'photo') {
        router.push(`/${currentLang}/ImageSelectionPage?site_id=${resultingSiteId}&category_name=${categoryName}&tariff=${tariffParam}`);
      } else {
        router.push(`/${currentLang}/send_whatsapp?site_id=${resultingSiteId}&category_name=${categoryNameQuery}&type=${typeQuery}&tariff=${tariffParam}`);
      }

      // Вызовем onComplete если сайт успешно создан/обновлен
//      onComplete && onComplete(formData);

    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={fixedStyles.stepContainer}>
      <h1 style={fixedStyles.heading}>
        {isUpdateMode
          ? t('steps.step3.step5_title_update') || 'Обновите языки приглашения'
          : t('steps.step3.step5_title') || 'Выберите языки приглашения'}
      </h1>

      {/* Опции выбора язык/переводы */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div
          style={{
            ...fixedStyles.optionBox,
            ...(!needRussianTranslation ? fixedStyles.selectedOption : {}),
            flex: 1
          }}
          onClick={() => setNeedRussianTranslation(false)}
        >
          <div style={fixedStyles.optionTitle}>
            <FiGlobe style={{ marginRight: '8px' }} /> {t('steps.step3.step5_option_kazakh') || 'Только на казахском'}
            {!needRussianTranslation && <span style={fixedStyles.badge}><FiCheck size={12} /></span>}
          </div>
          <div style={fixedStyles.optionDescription}>
           {t('steps.step3.step5_kazakhOnly_description') || 'Приглашение будет доступно только на казахском языке'}
          </div>
        </div>

        <div
          style={{
            ...fixedStyles.optionBox,
            ...(needRussianTranslation ? fixedStyles.selectedOption : {}),
            flex: 1
          }}
          onClick={() => setNeedRussianTranslation(true)}
        >
          <div style={fixedStyles.optionTitle}>
            <FiGlobe style={{ marginRight: '8px' }} /> {t('steps.step3.step5_kazakhRussian_title') || 'Казахский и русский'}
            {needRussianTranslation && <span style={fixedStyles.badge}><FiCheck size={12} /></span>}
          </div>
          <div style={fixedStyles.optionDescription}>
            {t('steps.step3.step5_kazakhRussian_description') || 'Приглашение будет доступно на двух языках'}
          </div>
        </div>
      </div>

      {/* Показываем блок с русским переводом, если он выбран */}
      {needRussianTranslation && (
        <div style={{ width: '100%', marginBottom: '24px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0284c7', marginTop: 0, marginBottom: '16px' }}>
            <FiGlobe style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Перевод на русский
          </h3>

          {/* Заголовок на русском */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4b5563'
            }}>
              Заголовок
            </label>
            <input
              type="text"
              style={{
                ...fixedStyles.textArea,
                height: 'auto',
                padding: '8px 12px',
                width: '100%'
              }}
              placeholder="Название мероприятия на русском"
              value={russianTitle}
              onChange={(e) => setRussianTitle(e.target.value)}
            />
          </div>

          {/* Текст приглашения на русском */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4b5563'
            }}>
              {'Текст приглашения'}
            </label>
            <textarea
              style={{
                ...fixedStyles.textArea,
                width: '100%'
              }}
              placeholder={ "Текст приглашения на русском языке"}
              value={russianInvitation}
              onChange={(e) => setRussianInvitation(e.target.value)}
              rows={6}
            />
          </div>
        </div>
      )}

      {/* Ошибки при валидации */}
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          color: '#b91c1c',
          width: '100%'
        }}>
          {error}
        </div>
      )}

      {/* Кнопки «Сайтты құру/Обновить» и «Артқа» */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
        <button
          style={{
            ...fixedStyles.mainButton,
            ...(loading || (needRussianTranslation && (!russianTitle.trim() || !russianInvitation.trim())) ? fixedStyles.disabledButton : {})
          }}
          onClick={handleSaveOrUpdateSite}
          disabled={loading || (needRussianTranslation && (!russianTitle.trim() || !russianInvitation.trim()))}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiLoader style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              ...
            </span>
          ) : isUpdateMode
              ? t('steps.step3.step5_button_update') || 'Обновить сайт'
              : t('steps.step3.step5_button_create') || 'Создать сайт'}
        </button>
        {onBack && (
          <button
            style={fixedStyles.secondaryButton}
            onClick={onBack}
          >
              {t('steps.step3.backButton') || 'Назад'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Step5;
import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { styles } from '../utils/constants';
import { categories } from '../utils/constants';
import { translations } from '../locales/translations';

// Реализация функции addKazakhEnding
const addKazakhEnding = (rawName) => {
  if (!rawName) return '';

  let name = rawName.trim();

  // Если уже есть окончание - не меняем
  const existingEndings = ['ның', 'нің', 'дың', 'дің', 'тың', 'тің'];
  for (const ending of existingEndings) {
    if (name.endsWith(ending)) {
      return name;
    }
  }

  // Гласные (включили 'у' сюда для упрощения)
  const vowels = ['а','ә','о','ө','у','ү','ы','і','е','и','э'];
  // Звонкие согласные
  const voiced = ['б','в','г','ғ','д','ж','з','й','л','м','н','ң','р'];
  // Глухие согласные
  const voiceless = ['к','қ','п','с','т','ф','х','һ','ц','ч','ш','щ'];

  // Гармония гласных (передний/задний)
  const backVowels = ['а','о','ұ','ы','у']; // задние
  const frontVowels = ['ә','ө','ү','і','е','и','э']; // передние

  // Находим последнюю встретившуюся гласную, чтобы определить isBack
  let isBack = false;
  for (let i = name.length - 1; i >= 0; i--) {
    const c = name[i].toLowerCase();
    if (backVowels.includes(c)) {
      isBack = true;
      break;
    } else if (frontVowels.includes(c)) {
      isBack = false;
      break;
    }
  }
  // Если вообще гласных нет, пусть будет задний вариант:
  if (!/[аеәіеиоуөүұыэ]/i.test(name)) {
    isBack = true;
  }

  // Для некоторых слов (напр., мереке) явно указываем, что требуется передний вариант
  if (name.toLowerCase() === 'мереке') {
    isBack = false;
  }

  // Смотрим на последний символ
  const lastChar = name[name.length - 1].toLowerCase();
  let suffix = '';

  if (vowels.includes(lastChar)) {
    // Если заканчивается на гласную => ның/нің
    suffix = isBack ? 'ның' : 'нің';
  } else if (voiced.includes(lastChar)) {
    // Звонкие согласные => дың/дің (для 'н' - ның/нің)
    if (lastChar === 'н') {
      suffix = isBack ? 'ның' : 'нің';
    } else {
      suffix = isBack ? 'дың' : 'дің';
    }
  } else if (voiceless.includes(lastChar)) {
    // Глухие => тың/тің
    suffix = isBack ? 'тың' : 'тің';
  } else {
    // Если попались какие-нибудь редкие буквы, ставим по умолчанию "дың/дің"
    suffix = isBack ? 'дың' : 'дің';
  }

  return name + suffix;
};

// Реализация функции getConnector
const getConnector = (name) => {
  if (!name) return 'бен'; // по умолчанию

  // Гласные и звонкие согласные (после которых нужно "мен")
  const needsMen = ['а','ә','о','ө','у','ү','ы','і','е','и','э',
                     'б','в','г','ғ','д','ж','з','й','л','м','н','ң','р'];

  // Проверяем последнюю букву имени
  const lastChar = name.trim().slice(-1).toLowerCase();

  // Если имя заканчивается на гласную или звонкую согласную - используем "мен"
  // После глухих согласных - "пен", во всех остальных случаях - "бен"
  return needsMen.includes(lastChar) ? 'мен' : 'пен';
};

const fixedStyles = {
  ...styles,
  textArea: {
    ...styles.textArea,
    resize: 'vertical'
  }
};

/**
 * Компонент четвертого шага: Создание текста приглашения
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onComplete - Функция для завершения шага
 * @param {Function} props.onBack - Функция для возврата к предыдущему шагу
 * @param {Object} props.formData - Существующие данные формы
 * @param {Object} props.categoryData - Данные выбранной категории
 */
const Step4 = ({ onComplete, onBack, formData, categoryData }) => {
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

  // Основной контент (казахский)
  const [invitationText, setInvitationText] = useState('');
  const [hostText, setHostText] = useState('');
  const [error, setError] = useState(null);

  // Генерация дефолтного текста при загрузке
  useEffect(() => {
    if (categoryData && categoryData.content_body && formData?.nameFields) {
      let text = categoryData.content_body;

      // Проверяем, сколько имен в форме
      const hasName1 = Boolean(formData.nameFields.name && formData.nameFields.name.trim());
      const hasName2 = Boolean(formData.nameFields.name2 && formData.nameFields.name2.trim());

      // Создаем копию объекта nameFields
      const processedNames = {...formData.nameFields};

      // Особая обработка для категории "Мерей той"
      if (categoryData.route === "merey" && hasName1) {
        // Добавляем окончание "дың/дің/тың/тің" к имени
        const nameWithEnding = addKazakhEnding(processedNames.name || '');

        // Получаем возраст из второго поля (если указано)
        const age = processedNames.name2 || '';

        // Формируем текст для мерей тоя: "Сіз(дер)ді [имя+окончание] [возраст] жас мерей тойына..."
        text = `Сіз(дер)ді ${nameWithEnding} ${age} жас мерей тойына арналған салтанатты ақ дастарханымыздың қадірлі қонағы болуға шақырамыз.`;
      }
      // Обычная обработка для других категорий
      else if (hasName1 && hasName2) {
        if (processedNames.name2) {
          processedNames.name2 = addKazakhEnding(processedNames.name2);
        }

        Object.entries(processedNames).forEach(([key, value]) => {
          const val = value || '';
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
        });

        if (processedNames.name) {
          const correctConnector = getConnector(processedNames.name);
          text = text
            .replace(' бен ', ` ${correctConnector} `)
            .replace(' пен ', ` ${correctConnector} `)
            .replace('бен қызымыз', `${correctConnector} қызымыз`)
            .replace('пен қызымыз', `${correctConnector} қызымыз`)
            .replace('бен ұлымыз', `${correctConnector} ұлымыз`)
            .replace('пен ұлымыз', `${correctConnector} ұлымыз`);
        }
      }
      else if (hasName1) {
        // Для других категорий с одним именем
        processedNames.name = addKazakhEnding(processedNames.name || '');

        Object.entries(processedNames).forEach(([key, value]) => {
          const val = value || '';
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
        });
      }
      else {
        Object.entries(processedNames).forEach(([key, value]) => {
          const val = value || '';
          text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
        });
      }

      setInvitationText(text);
    }
  }, [categoryData, formData.nameFields]);

  // Форматируем дату и время для блока информации
  const formatEventDateTime = () => {
    if (!formData.eventDateOnly) return null;
    try {
      // Создаем объект даты
      const dateParts = formData.eventDateOnly.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // месяцы в JS начинаются с 0
      const day = parseInt(dateParts[2]);

      // Казахские названия месяцев
      const kazMonthNames = [
        'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
        'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
      ];

      // Форматируем дату в казахском стиле
      const formattedDate = `${day} ${kazMonthNames[month]} ${year} ж.`;

      // Добавляем время, если оно есть
      if (formData.eventTimeOnly) {
        return `${formattedDate}, ${formData.eventTimeOnly}`;
      }

      return formattedDate;
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  };

  const handleNext = () => {
    if (!invitationText.trim() || !hostText.trim()) {
      setError(t('steps.step4.validationError'));
      return;
    }

    // Передаем данные в следующий шаг
    const updatedFormData = {
      ...formData,
      invitationText,
      hostText
    };

    // Проверяем, что onComplete существует
    if (onComplete) {
      onComplete(updatedFormData);
    }
  };

  return (
    <div style={fixedStyles.stepContainer}>
      <h1 style={fixedStyles.heading}>{t('steps.step4.title')}</h1>

      {/* Блок с информацией об ивенте */}
      <div style={{
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #e0f2fe',
        width: '100%'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0284c7', marginTop: 0, marginBottom: '12px' }}>
          {t('steps.step4.eventInfo.title')}
        </h3>
        <div style={{ fontSize: '14px', color: '#334155' }}>
          <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', marginRight: '8px', minWidth: '100px' }}>{t('steps.step4.eventInfo.event')}:</span>
            <span>{formData.title || '-'}</span>
          </p>
          <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', marginRight: '8px', minWidth: '100px' }}>{t('steps.step4.eventInfo.address')}:</span>
            <span>{formData.address ? `${formData.address}, ${formData.city}` : '-'}</span>
          </p>
          <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', marginRight: '8px', minWidth: '100px' }}>{t('steps.step4.eventInfo.dateTime')}:</span>
            <span>{formatEventDateTime() || '-'}</span>
          </p>
        </div>
      </div>

      {/* Основной контент на казахском языке */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4b5563'
        }}>
          <FiMessageSquare style={{ marginRight: '8px' }} />
          {t('steps.step4.invitationText.label')}
        </label>
        <textarea
          style={fixedStyles.textArea}
          placeholder={t('steps.step4.invitationText.placeholder')}
          value={invitationText}
          onChange={(e) => setInvitationText(e.target.value)}
          rows={4}
        />
      </div>

      {/* Поле для «Той иелері» (казахский) */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#4b5563'
        }}>
          <FiUsers style={{ marginRight: '8px' }} />
          {t('steps.step4.hostText.label')}
        </label>
        <textarea
          style={fixedStyles.textArea}
          placeholder={t('steps.step4.hostText.placeholder')}
          value={hostText}
          onChange={(e) => setHostText(e.target.value)}
          rows={3}
        />
      </div>

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

      {/* Кнопки «Келесі» и «Артқа» */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
        <button
          style={{
            ...fixedStyles.mainButton,
            ...(!invitationText.trim() || !hostText.trim() ? fixedStyles.disabledButton : {})
          }}
          onClick={handleNext}
          disabled={!invitationText.trim() || !hostText.trim()}
        >
          {t('steps.step2.nextButton') || t('steps.step3.nextButton')}
        </button>
        {onBack && (
          <button
            style={fixedStyles.secondaryButton}
            onClick={onBack}
          >
          {t('steps.step2.backButton') || t('steps.step3.backButton')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Step4;
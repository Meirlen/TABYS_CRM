// src/utils/translationUtils.js

/**
 * Вспомогательная функция для получения вложенных переводов по ключу
 *
 * @param {Object} translations - Объект переводов
 * @param {string} key - Ключ в формате "parent.child.grandchild"
 * @param {string} defaultValue - Значение по умолчанию, если перевод не найден
 * @returns {string} Перевод или defaultValue
 */
export function getNestedTranslation(translations, key, defaultValue = '') {
  try {
    if (!translations || !key) return defaultValue;

    const keys = key.split('.');
    let result = translations;

    for (const k of keys) {
      if (result === undefined || result === null || result[k] === undefined) {
        return defaultValue;
      }
      result = result[k];
    }

    return typeof result === 'string' ? result : defaultValue;
  } catch (e) {
    console.error(`Error getting translation for key: ${key}`, e);
    return defaultValue;
  }
}

/**
 * Создает функцию перевода для конкретного языка
 *
 * @param {Object} translations - Объект переводов для конкретного языка
 * @returns {Function} Функция перевода
 */
export function createTranslator(translations) {
  return (key, defaultValue = key) => getNestedTranslation(translations, key, defaultValue);
}

/**
 * Получает предпочтительный язык пользователя
 *
 * @returns {string} Код языка ('kz', 'ru' или 'en')
 */
export function getUserLanguage() {
  // Клиентская сторона
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('language');
    if (savedLang && ['kz', 'ru', 'en'].includes(savedLang)) {
      return savedLang;
    }
  }

  // По умолчанию
  return 'kz';
}
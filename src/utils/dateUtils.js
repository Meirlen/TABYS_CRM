// utils/dateUtils.js

/**
 * Форматирует дату в соответствии с выбранным языком
 * @param {string} dateString - Строка даты в формате ISO
 * @param {string} lang - Язык (kz или ru)
 * @returns {string} - Отформатированная дата
 */
export function formatDate(dateString, lang = 'kz') {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Месяцы на казахском
  const monthsKz = [
    'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
    'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
  ];

  // Месяцы на русском
  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (lang === 'kz') {
    return `${day} ${monthsKz[month]} ${year}`;
  } else {
    return `${day} ${monthsRu[month]} ${year}`;
  }
}

/**
 * Проверяет, истек ли срок дедлайна
 * @param {string} deadline - Строка даты дедлайна в формате ISO
 * @returns {boolean} - true если дедлайн истек, иначе false
 */
export function isDeadlinePassed(deadline) {
  if (!deadline) return false;

  const deadlineDate = new Date(deadline);
  const today = new Date();

  // Сбрасываем время для корректного сравнения дат
  deadlineDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return today > deadlineDate;
}
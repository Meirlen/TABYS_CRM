import React from 'react';
import { useRouter } from 'next/router';

/**
 * Компонент верхней панели с кнопкой назад
 * @param {Object} props - Свойства компонента
 * @param {string} [props.title] - Заголовок, отображаемый в панели (необязательный)
 * @param {Function} [props.onBack] - Опциональная функция обратного вызова при нажатии кнопки "Назад"
 */
const HeaderBack = ({ title, onBack }) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 w-full" style={{
      width: '100%',
      left: 0,
      right: 0,
    }}>
      <div className="px-4 py-3 flex items-center">
        <button
          onClick={handleBackClick}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Назад"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {title && <h1 className="text-lg font-bold text-gray-800 ml-4">{title}</h1>}
      </div>
    </div>
  );
};

export default HeaderBack;
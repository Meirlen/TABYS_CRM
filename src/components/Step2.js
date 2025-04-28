import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiInfo } from 'react-icons/fi';
import { styles } from '../utils/constants';
import { useRouter } from 'next/router';
import { translations } from '../locales/translations';

// Function to generate time options starting from 12:00
function generateTimeOptions() {
  const times = [];

  // Start from 12 hours
  for (let h = 12; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }

  // Add hours from 0 to 12
  for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }

  return times;
}

const timeOptions = generateTimeOptions();

// Kazakh month names
const kazMonths = [
  'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
  'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
];

// Day names in Kazakh
const kazDays = ['Дү', 'Се', 'Сә', 'Бе', 'Жұ', 'Се', 'Же'];

/**
 * Step 2 Component: Date and time selection with simplified calendar UI
 */
const Step2 = ({ onNext, onBack, formData }) => {
  const router = useRouter();
  const { lang } = router.query;
  const currentLang = Array.isArray(lang) ? lang[0] : lang || 'kz';

  // Function to get translations
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

  // Shorthand for translation
  const t = getTranslation;

  // Get current date
  const today = new Date();

  // Initialize date from form or use tomorrow as default
  const initialDate = formData?.eventDateOnly
    ? new Date(formData.eventDateOnly)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // State for selected date and month display
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Store selected time
  const [eventTime, setEventTime] = useState(formData?.eventTimeOnly || '');

  // Display string for the selected date
  const [dateDisplay, setDateDisplay] = useState('');

  // Update date display when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDate();
      const month = kazMonths[selectedDate.getMonth()];
      setDateDisplay(`${day} ${month}`);
    }
  }, [selectedDate]);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay() || 7; // Adjust Sunday (0) to be 7

    const days = [];

    // Add empty cells for days before the 1st of the month
    for (let i = 1; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      const isSelected =
        selectedDate &&
        dayDate.getDate() === selectedDate.getDate() &&
        dayDate.getMonth() === selectedDate.getMonth() &&
        dayDate.getFullYear() === selectedDate.getFullYear();

      const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push({
        day: i,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isPast,
        date: new Date(currentYear, currentMonth, i)
      });
    }

    return days;
  };

  // Go to previous month
  const goToPrevMonth = () => {
    if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      return; // Don't go before current month
    }

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Go to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Select a day from calendar
  const selectDay = (day) => {
    if (day.isPast) return; // Don't select past days

    setSelectedDate(day.date);
    setCalendarOpen(false);
  };

  // Handle proceeding to next step
  const handleNext = () => {
    if (!selectedDate || !eventTime) return;

    // Format date as YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const datePart = `${year}-${month}-${day}`;

    // Combine with time: "2025-03-25T14:00"
    const combinedDateTime = `${datePart}T${eventTime}`;

    onNext({
      eventDate: combinedDateTime,
      eventDateOnly: datePart,
      eventTimeOnly: eventTime,
      siteType: 'video',
    });
  };

  // Form is valid if date and time are selected
  const isFormValid = !!selectedDate && !!eventTime;

  // Calendar markup
  const calendarDays = generateCalendarDays();

  return (
    <div style={styles.stepContainer}>
      <h1 style={styles.heading}>{t('steps.step2.title')}</h1>

      {/* Date Picker with Calendar */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563',
          }}
        >
          {t('steps.step2.eventDate')}
        </label>

        <div style={{ position: 'relative' }}>
          {/* Date input field (non-editable) */}
          <div
            onClick={() => setCalendarOpen(!calendarOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              position: 'relative',
            }}
          >
            <FiCalendar style={{ marginRight: '8px', color: '#6b7280' }} />
            <span>{dateDisplay || t('steps.step2.selectDatePlaceholder')}</span>

            <div style={{ position: 'absolute', right: '12px', color: '#6b7280' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Calendar dropdown */}
          {calendarOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 10,
              marginTop: '4px',
            }}>
              {/* Calendar header with month navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <button
                  onClick={goToPrevMonth}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: currentMonth === today.getMonth() && currentYear === today.getFullYear()
                      ? '#d1d5db' : '#6b7280',
                    pointerEvents: currentMonth === today.getMonth() && currentYear === today.getFullYear()
                      ? 'none' : 'auto',
                  }}
                  disabled={currentMonth === today.getMonth() && currentYear === today.getFullYear()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {/* Only display month, hide year as requested */}
                  {kazMonths[currentMonth]}
                </div>

                <button
                  onClick={goToNextMonth}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: '#6b7280',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Day names */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280',
              }}>
                {kazDays.map((day, index) => (
                  <div key={index}>{day}</div>
                ))}
              </div>

              {/* Calendar days */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                padding: '8px',
              }}>
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => day.isCurrentMonth && !day.isPast ? selectDay(day) : null}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: day.isCurrentMonth && !day.isPast ? 'pointer' : 'default',
                      borderRadius: '50%',
                      backgroundColor: day.isSelected ? '#3b82f6' : day.isToday ? '#f3f4f6' : 'transparent',
                      color: day.isSelected ? 'white' : day.isPast ? '#d1d5db' : day.isToday ? '#111827' : '#4b5563',
                      fontWeight: day.isToday || day.isSelected ? '600' : '400',
                      position: 'relative',
                      fontSize: '13px',
                    }}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time selection with dropdown */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <label
          htmlFor="event-time"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563',
          }}
        >
          {t('steps.step2.eventTime')}
        </label>
        <div style={{ position: 'relative' }}>
          {/* Clock icon on the left */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '12px',
              color: '#6b7280',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <FiClock />
          </div>

          <select
            id="event-time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            style={styles.selectStyle || {
              width: '100%',
              fontSize: 14,
              padding: '10px 12px',
              paddingLeft: '36px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              outline: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="">{t('steps.step2.selectTimePlaceholder')}</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>

          {/* Dropdown arrow on the right */}
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              pointerEvents: 'none',
              color: '#6b7280',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          width: '100%',
          border: '1px solid #e0f2fe',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            color: '#0284c7',
            fontWeight: '500',
          }}
        >
          <FiInfo style={{ marginRight: '8px' }} />
          <span>{t('steps.step2.important')}</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
          {t('steps.step2.importantText')}
        </p>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        <button
          style={{
            ...styles.mainButton,
            ...(isFormValid ? {} : styles.disabledButton),
          }}
          onClick={handleNext}
          disabled={!isFormValid}
        >
          {t('steps.step2.nextButton')}
        </button>

        {onBack && (
          <button
            style={styles.secondaryButton}
            onClick={onBack}
          >
            {t('steps.step2.backButton')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Step2;
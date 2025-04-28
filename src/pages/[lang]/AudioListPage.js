import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiPlay, FiPause, FiMusic } from 'react-icons/fi';
import axios from 'axios';

import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный

// Типизация для аудио
const AudioItem = {
  id: Number,
  audio_name: String,
  audio_url: String,
  category_name: String
};

export default function AudioListPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id, category_name, type, tariff: tariffParam } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  useEffect(() => {
    // Обновляем язык при клиентской навигации (если меняются query-параметры)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
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

  // Функция для получения переводов по вложенным ключам (аналог useSimpleTranslation)
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

  const [audioList, setAudioList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // Ref для аудио элемента
  const audioRef = useRef(null);

  const [sending, setSending] = useState(false);

  // Загружаем список аудио при монтировании компонента
  useEffect(() => {
    const fetchAudioList = async () => {
      if (!category_name) return; // Предотвращаем запрос без параметра категории

      try {
        setLoading(true);
        // Используем полный URL для API
        const baseUrl = 'https://tyrasoft.kz';
        // Запрос к API с параметром категории, если он есть
        console.log('Fetching audio with category:', category_name);
        const endpoint = category_name
          ? `${baseUrl}/audio_list?category=${category_name}`
          : `${baseUrl}/audio_list`;

        const response = await axios.get(endpoint, {
          headers: {
            'Accept': 'application/json',
            // Здесь можно добавить другие необходимые заголовки
            // 'Authorization': 'Bearer YOUR_TOKEN'
          }
        });
        // Логируем полученные данные для отладки
        console.log('API response:', response.data);

        // Обрабатываем разные форматы ответа
        if (Array.isArray(response.data)) {
          // Если ответ - массив
          setAudioList(response.data);
        } else if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.items)) {
            // Если ответ - объект с полем items: [...]
            setAudioList(response.data.items);
          } else if (response.data.data && Array.isArray(response.data.data.audio)) {
            // Если ответ имеет вложенную структуру { data: { audio: [...] } }
            setAudioList(response.data.data.audio);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Если ответ имеет структуру { data: [...] }
            setAudioList(response.data.data);
          } else {
            // Если ответ - объект, но нет ожидаемых полей
            console.error('API response does not contain an array:', response.data);
            setAudioList([]);
          }
        } else {
          // Если данные приходят в неожиданном формате
          console.error('Unexpected API response format:', response.data);
          setAudioList([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching audio list:', err);
        setError('Аудио файлдарын жүктеу кезінде қате орын алды');
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && category_name) {
      fetchAudioList();
    }
  }, [category_name]);

  // Функция для воспроизведения/паузы аудио
  const togglePlay = (audioId, audioUrl) => {
    if (audioRef.current) {
      if (currentlyPlaying === audioId) {
        // Если текущий трек уже играет - ставим на паузу
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          setCurrentlyPlaying(null);
        } else {
          audioRef.current.play();
        }
      } else {
        // Если выбран новый трек
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentlyPlaying(audioId);
      }
    }
  };

  // Обработчик завершения воспроизведения
  const handleAudioEnd = () => {
    setCurrentlyPlaying(null);
  };

  // Обработчик выбора аудио
  const handleSelectAudio = async (audioId, audioUrl) => {
    if (!site_id) {
      setError('site_id параметрі табылмады');
      return;
    }

    // Устанавливаем статус отправки
    setSending(true);

    try {
      // Используем полный URL для API
      const baseUrl = 'https://tyrasoft.kz';

      // Отправляем аудио ссылку на сервер с помощью PUT запроса
      await axios.put(`${baseUrl}/sites/${site_id}/audio`, {
        audio_link: audioUrl
      });

      // После успешной отправки, перенаправляем на следующую страницу
      if(tariffParam === 'standart'){
            router.push(`/${currentLang}/StyleSelectionPage?site_id=${site_id}&category_name=${category_name}&type=${type}`);
      }
      else{

          router.push(`/${currentLang}/StyleSelectionPage?site_id=${site_id}&category_name=${category_name}&type=${type}`);

//            router.push(`/${currentLang}/audio-selector-page?site_id=${site_id}&category_name=${category_name}&type=${type}`);
      }
    } catch (err) {
      console.error('Сервердегі аудионы жаңарту қатесі:', err);
      setError('Аудио жаңарту кезінде қате шықты. Қайталап көріңіз.');
      setSending(false);
    }
  };

  // Показать модальное окно при клике на кнопку "Басты бетке"
  const handleExitClick = () => {
    setShowExitModal(true);
  };

  // Навигация на главную страницу при подтверждении
  const confirmExit = () => {
    setShowExitModal(false);
    router.push(`/${currentLang}/home`);
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  // Стили страницы с правильными типами
  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      color: '#333',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    content: {
      padding: '20px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '0px',
    },
    header: {
      marginTop: '20px',
      marginBottom: '30px',
      width: '100%',
      maxWidth: '600px',
      textAlign: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '12px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      maxWidth: '450px',
      margin: '0 auto',
    },
    audioListContainer: {
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    audioItem: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      border: '1px solid transparent',
    },
    audioInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: 1,
    },
    audioIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#eff6ff',
      color: '#3b82f6',
    },
    audioDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    audioName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
    },
    audioCategory: {
      fontSize: '14px',
      color: '#6b7280',
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
    },
    playButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#eff6ff',
      color: '#3b82f6',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    selectButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500',
    },
    loader: {
      textAlign: 'center',
      padding: '20px',
      color: '#6b7280',
    },
    error: {
      textAlign: 'center',
      padding: '20px',
      color: '#ef4444',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6b7280',
    },
    homeButton: {
      marginTop: '30px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#6b7280',
      fontSize: '14px',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '16px',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px',
    },
    modalText: {
      color: '#4b5563',
      marginBottom: '24px',
      fontSize: '14px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '12px',
    },
    confirmButton: {
      flex: 1,
      padding: '10px 0',
      backgroundColor: '#2563eb',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontWeight: '500',
    },
    cancelButton: {
      flex: 1,
      padding: '10px 0',
      backgroundColor: '#f3f4f6',
      color: '#4b5563',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>{getTranslation('audioList.title') || 'Аудио Таңдау'}</title>
        <meta name="description" content={getTranslation('audioList.description') || 'Сайтыңыз үшін аудио таңдаңыз'} />
      </Head>

      {/* HeaderBack вместо кнопки назад */}
      <HeaderBack title={getTranslation('audioList.title')} />

      <div style={styles.content}>
        {/* Аудио элемент для воспроизведения */}
        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          style={{ display: 'none' }}
        />

        {/* Заголовок */}
        <div style={styles.header}>
          <h1 style={styles.title}>{getTranslation('audioList.selectAudio')}</h1>

          {error && <p style={{color: '#ef4444', marginTop: '10px'}}>{error}</p>}
        </div>

        {/* Список аудио */}
        <div style={styles.audioListContainer}>
          {loading ? (
            <div style={styles.loader}>{getTranslation('audioList.loading')}</div>
          ) : error ? (
            <div style={styles.error}>{error}</div>
          ) : audioList.length === 0 ? (
            <div style={styles.emptyState}>
              <FiMusic size={48} style={{ margin: '0 auto 16px', opacity: 0.3, display: 'block' }} />
              <p>{getTranslation('audioList.noAudioFound')}</p>
            </div>
          ) : (
            audioList.map((audio) => (
              <div
                key={audio.id}
                style={styles.audioItem}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={styles.audioInfo}>
                  <div style={styles.audioIcon}>
                    <FiMusic size={22} />
                  </div>
                  <div style={styles.audioDetails}>
                    <span style={styles.audioName}>{audio.audio_name}</span>
                    <span style={styles.audioCategory}>{audio.category_name}</span>
                  </div>
                </div>
                <div style={styles.actionButtons}>
                  <button
                    style={styles.playButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(audio.id, audio.audio_url);
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {currentlyPlaying === audio.id && audioRef.current && !audioRef.current.paused ? (
                      <FiPause size={18} />
                    ) : (
                      <FiPlay size={18} />
                    )}
                  </button>
                  <button
                    style={{
                      ...styles.selectButton,
                      opacity: sending ? 0.7 : 1,
                      cursor: sending ? 'not-allowed' : 'pointer'
                    }}
                    disabled={sending}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAudio(audio.id, audio.audio_url);
                    }}
                    onMouseOver={(e) => {
                      if (!sending) {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    {sending ? getTranslation('audioList.sending') : getTranslation('audioList.select')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Кнопка возврата на главную */}
        <button
          style={styles.homeButton}
          onClick={handleExitClick}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <FiChevronLeft style={{ marginRight: '8px' }} />
          {getTranslation('audioList.returnToHome')}
        </button>

        {/* Модальное окно подтверждения выхода */}
        {showExitModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>{getTranslation('audioList.modal.attention')}</h3>
              <p style={styles.modalText}>
                {getTranslation('audioList.modal.confirmExit')}
              </p>
              <div style={styles.buttonContainer}>
                <button
                  onClick={confirmExit}
                  style={styles.confirmButton}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  {getTranslation('audioList.modal.yes')}
                </button>
                <button
                  onClick={cancelExit}
                  style={styles.cancelButton}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  {getTranslation('audioList.modal.no')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
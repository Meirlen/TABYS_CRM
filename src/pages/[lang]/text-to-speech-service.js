import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiVolume2, FiDownload, FiAlertCircle, FiCheck, FiUser, FiUserCheck, FiLoader, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';

// Import the TextToSpeechService
// Note: You'll need to adapt this import to your file structure
const textToSpeechService = {
  convertTextToSpeech: async (params) => {
    // Implement your text-to-speech service logic here
    // For now, we'll assume it returns a response object with status and file properties
    const response = await fetch('https://tyrasoft.kz/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return response.json();
  },
  downloadAudioFile: (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const TextToSpeechPage = () => {
  const router = useRouter();
  const { site_id, category_name, type, lang } = router.query;
  const [translations, setTranslations] = useState({});

  // Simple translation function
  const t = (key) => {
    try {
      const keys = key.split('.');
      let result = translations;

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

  // Load translations
  useEffect(() => {
    if (lang) {
      // Import translations based on language
      import('../../locales/translations').then(({ translations }) => {
        const currentLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
        setTranslations(translations[currentLang] || translations['kz']);
      });
    }
  }, [lang]);

  // Form states
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Даулет');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sendingToServer, setSendingToServer] = useState(false);
  const [fetchingSiteData, setFetchingSiteData] = useState(false);

  // Audio player reference
  const audioRef = useRef(null);

  // Fetch site data if site_id is available
  useEffect(() => {
    const fetchSiteData = async () => {
      if (!site_id || typeof window === 'undefined') return;

      setFetchingSiteData(true);
      try {
        const response = await axios.get(`https://tyrasoft.kz/sites?site_id=${site_id}`);
        if (response.data && response.data.invitation_text) {
          // Clean the text to keep only alphanumeric characters, commas, periods, spaces and Kazakh/Russian characters
          const cleanedText = response.data.invitation_text.replace(/[^\p{L}\p{N}\s,.]/gu, '');
          setText(cleanedText);
        }
      } catch (err) {
        console.error('Сайт деректерін алу қатесі:', err);
        setError(t('tts.errorLoadingData'));
      } finally {
        setFetchingSiteData(false);
      }
    };

    fetchSiteData();
  }, [site_id]);

  // Auto-play audio after loading
  useEffect(() => {
    if (success && audioUrl && audioRef.current) {
      // Small delay to ensure audio is loaded
      const playTimer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error('Автовоспроизведение не удалось:', err);
          });
        }
      }, 300);

      return () => clearTimeout(playTimer);
    }
  }, [success, audioUrl]);

  // Function to convert text to speech
  const convertTextToSpeech = async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${lang}/login`);
      return;
    }

    if (!text.trim()) {
      setError(t('tts.errorEmptyText'));
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setSuccess(false);

    try {
      // Use the service to send the request
      const response = await textToSpeechService.convertTextToSpeech({
        text: text,
        voice: voice,
        // Default parameters for the rest
      });

      // Process the response
      if (response.status === 1 && response.file) {
        setAudioUrl(response.file);
        setSuccess(true);

        // Play audio if element is available
        if (audioRef.current) {
          audioRef.current.src = response.file;
          audioRef.current.load();
        }
      } else {
        setError(response.error || 'Бірнәрсе дұрыс болмады. Қайталап көріңіз.');
      }
    } catch (err) {
      console.error('API сұранысының қатесі:', err);
      setError('недостаточно средств на счету');
    } finally {
      setLoading(false);
    }
  };

  // Function to download audio file
  const downloadAudio = () => {
    if (audioUrl) {
      textToSpeechService.downloadAudioFile(audioUrl, `text-to-speech-${Date.now()}.mp3`);
    }
  };

  // Function to send audio to server and proceed to next step
  const handleNext = async () => {
    if (!site_id || !audioUrl) {
      setError(t('tts.errorNoSiteId'));
      return;
    }

    setSendingToServer(true);
    try {
      // Use tyrasoft.kz as the base URL for the request
      const baseUrl = 'https://tyrasoft.kz';

      // Send audio link to server using PUT request
      await axios.put(`${baseUrl}/sites/${site_id}/audio_speaker`, {
        audio_link: audioUrl
      });

      // After successful submission, redirect to send_whatsapp page
      router.push(`/${lang}/StyleSelectionPage?site_id=${site_id}&category_name=${category_name}&type=${type}`);
    } catch (err) {
      console.error('Сервердегі аудионы жаңарту қатесі:', err);
      setError(t('tts.errorAudioUpdate'));
      setSendingToServer(false);
    }
  };

  // Function to go back to previous page
  const handleBack = () => {
    router.back();
  };

  // Styles for the component
  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      color: '#333',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '10px 16px',
      borderRadius: '24px',
      backgroundColor: '#f0f0f0',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: '650px',
      marginTop: '60px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #f1f1f1',
    },
    title: {
      fontSize: '22px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
    },
    content: {
      padding: '24px',
    },
    voiceSelection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '24px',
    },
    voiceCard: {
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
    },
    voiceIconWrapper: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
    },
    voiceInfo: {
      flex: 1,
    },
    voiceTitle: {
      fontSize: '15px',
      fontWeight: '600',
      marginBottom: '2px',
    },
    voiceSubtitle: {
      fontSize: '13px',
      color: '#6b7280',
    },
    checkIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textareaLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#4b5563',
      marginBottom: '8px',
      display: 'block',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
      marginBottom: '16px',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s ease',
      outline: 'none',
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      border: '1px solid #fee2e2',
    },
    errorIcon: {
      flexShrink: 0,
      marginRight: '12px',
      marginTop: '2px',
      color: '#ef4444',
    },
    errorText: {
      fontSize: '14px',
    },
    convertButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      fontSize: '15px',
      transition: 'background-color 0.2s ease',
    },
    femaleButton: {
      backgroundColor: '#db2777',
    },
    audioResult: {
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #e0f2fe',
      padding: '16px',
      marginBottom: '16px',
    },
    successHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
    },
    successIcon: {
      marginRight: '8px',
      color: '#0284c7',
    },
    successText: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#0284c7',
    },
    audioPlayer: {
      width: '100%',
      marginBottom: '12px',
      height: '40px',
    },
    downloadButton: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
    },
    continueButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      fontSize: '15px',
      transition: 'background-color 0.2s ease',
    },
    loaderWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
    },
    spinnerAnimation: {
      animation: 'spin 1s linear infinite',
    },
    loaderText: {
      marginTop: '16px',
      fontSize: '14px',
      color: '#6b7280',
    },
  };

  // Styles for modal
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '400px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    title: {
      fontSize: '20px',
      marginBottom: '16px',
      color: '#333',
    },
    message: {
      fontSize: '16px',
      marginBottom: '24px',
      color: '#555',
    },
    closeButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      {/* Back button */}
      {/* Можете добавить кнопку назад, если требуется */}

      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{t('tts.title')}</h1>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {fetchingSiteData ? (
            <div style={styles.loaderWrapper}>
              <FiLoader size={30} style={{ ...styles.spinnerAnimation, color: '#2563eb' }} />
              <div style={styles.loaderText}>{t('tts.loadingData')}</div>
            </div>
          ) : (
            <>
              {/* Voice selection */}
              <div style={styles.voiceSelection}>
                {/* Male voice */}
                <div
                  style={{
                    ...styles.voiceCard,
                    borderColor: voice === 'Даулет' ? '#bfdbfe' : '#e5e7eb',
                    backgroundColor: voice === 'Даулет' ? '#eff6ff' : 'white',
                  }}
                  onClick={() => setVoice('Даулет')}
                >
                  <div style={{
                    ...styles.voiceIconWrapper,
                    backgroundColor: voice === 'Даулет' ? '#3b82f6' : '#f3f4f6',
                    color: voice === 'Даулет' ? 'white' : '#6b7280',
                  }}>
                    <FiUser size={20} />
                  </div>
                  <div style={styles.voiceInfo}>
                    <div style={styles.voiceTitle}>{t('tts.male')}</div>
                    <div style={styles.voiceSubtitle}>Даулет</div>
                  </div>
                  {voice === 'Даулет' && (
                    <div style={{
                      ...styles.checkIcon,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                    }}>
                      <FiCheck size={14} />
                    </div>
                  )}
                </div>

                {/* Female voice */}
                <div
                  style={{
                    ...styles.voiceCard,
                    borderColor: voice === 'Айгуль' ? '#fbcfe8' : '#e5e7eb',
                    backgroundColor: voice === 'Айгуль' ? '#fce7f3' : 'white',
                  }}
                  onClick={() => setVoice('Айгуль')}
                >
                  <div style={{
                    ...styles.voiceIconWrapper,
                    backgroundColor: voice === 'Айгуль' ? '#db2777' : '#f3f4f6',
                    color: voice === 'Айгуль' ? 'white' : '#6b7280',
                  }}>
                    <FiUserCheck size={20} />
                  </div>
                  <div style={styles.voiceInfo}>
                    <div style={styles.voiceTitle}>{t('tts.female')}</div>
                    <div style={styles.voiceSubtitle}>Айгуль</div>
                  </div>
                  {voice === 'Айгуль' && (
                    <div style={{
                      ...styles.checkIcon,
                      backgroundColor: '#db2777',
                      color: 'white',
                    }}>
                      <FiCheck size={14} />
                    </div>
                  )}
                </div>
              </div>

              {/* Text input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.textareaLabel}>
                  {t('tts.textInput')}
                </label>
                <textarea
                  style={{
                    ...styles.textarea,
                    borderColor: error && !text.trim() ? '#ef4444' : '#d1d5db',
                  }}
                  placeholder={t('tts.textPlaceholder')}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                />
              </div>

              {/* Error message or insufficient funds modal */}
              {error && error.includes('недостаточно средств') ? (
                <div style={modalStyles.overlay}>
                  <div style={modalStyles.modal}>
                    <h2 style={modalStyles.title}>{t('tts.insufficientFunds')}</h2>
                    <p style={modalStyles.message}>
                      {t('tts.insufficientFundsMessage')}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <a
                        href="https://wa.me/77074256724"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: '#25D366',
                          color: 'white',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: '500',
                          boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {"WhatsApp"}
                      </a>
                      <button
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          padding: '10px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                        onClick={() => setError(null)}
                      >
                        {t('tts.close')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                error && (
                  <div style={styles.errorAlert}>
                    <div style={styles.errorIcon}>
                      <FiAlertCircle size={16} />
                    </div>
                    <div style={styles.errorText}>{error}</div>
                  </div>
                )
              )}

              {/* Convert button */}
              <button
                style={{
                  ...styles.convertButton,
                  ...(voice === 'Айгуль' && styles.femaleButton),
                  opacity: loading ? 0.7 : 1,
                }}
                onClick={convertTextToSpeech}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader size={18} style={{ ...styles.spinnerAnimation, marginRight: '8px' }} />
                    {t('tts.converting')}
                  </>
                ) : (
                  <>
                    <FiVolume2 size={18} style={{ marginRight: '8px' }} />
                    {t('tts.convert')}
                  </>
                )}
              </button>

              {/* Audio result */}
              {success && audioUrl && (
                <div style={styles.audioResult}>
                  <div style={styles.successHeader}>
                    <div style={styles.successIcon}>
                      <FiCheck size={18} />
                    </div>
                    <div style={styles.successText}>
                      {t('tts.success')}
                    </div>
                  </div>

                  <audio ref={audioRef} controls style={styles.audioPlayer}>
                    <source src={audioUrl} type="audio/mpeg" />
                    {t('tts.browserNotSupport')}
                  </audio>

                  <button style={styles.downloadButton} onClick={downloadAudio}>
                    <FiDownload size={16} style={{ marginRight: '8px' }} />
                    {t('tts.download')}
                  </button>
                </div>
              )}

              {/* Continue button */}
              {site_id && success && (
                <button
                  style={{
                    ...styles.continueButton,
                    opacity: sendingToServer ? 0.7 : 1,
                  }}
                  onClick={handleNext}
                  disabled={sendingToServer}
                >
                  {sendingToServer ? (
                    <>
                      <FiLoader size={18} style={{ ...styles.spinnerAnimation, marginRight: '8px' }} />
                      {t('tts.sending')}
                    </>
                  ) : (
                    <>
                      {t('tts.continue')}
                      <FiArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
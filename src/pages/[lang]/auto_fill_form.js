import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../components/HeaderBack'; // Adjust the path as needed
import { translations } from '../../locales/translations'; // Adjust the path as needed

export default function AutoFillForm({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, template_id, design_type } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния процесса
  const [jobStatus, setJobStatus] = useState(null);
  const [jobResult, setJobResult] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  // Состояния для экспорта PDF
  const [exportJobId, setExportJobId] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [exportCheckInterval, setExportCheckInterval] = useState(null);
  const [processingStep, setProcessingStep] = useState('autofill'); // 'autofill', 'export'

  useEffect(() => {
    // Update language when client navigation changes (if query parameters change)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Use existing translations
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Save selected language to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  // Function to get translations from nested keys (similar to t from useSimpleTranslation)
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

  // Fetch template data when component mounts or template_id changes
  useEffect(() => {
    if (template_id) {
      fetchTemplate(template_id);
    }
  }, [template_id]);

  // Effect to adjust textarea heights when form data changes
  useEffect(() => {
    if (template && !loading && template.dataset_fields) {
      // Set timeout to ensure DOM is updated
      setTimeout(() => {
        template.dataset_fields.forEach(field => {
          const textarea = document.getElementById(field.field_name);
          if (textarea) {
            adjustTextareaHeight(textarea);
          }
        });
      }, 0);
    }
  }, [formData, template, loading]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      if (exportCheckInterval) {
        clearInterval(exportCheckInterval);
      }
    };
  }, [statusCheckInterval, exportCheckInterval]);

  const fetchTemplate = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://tyrasoft.kz/api/v1/canva/templates/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const data = await response.json();

      // Sort dataset_fields by id in ascending order (smaller IDs first)
      if (data.dataset_fields && Array.isArray(data.dataset_fields)) {
        data.dataset_fields.sort((a, b) => a.id - b.id);
      }

      setTemplate(data);

      // Initialize form data with hint_text_kz values (if available)
      const initialFormData = {};
      data.dataset_fields.forEach(field => {
        initialFormData[field.field_name] = field.hint_text_kz || '';
      });
      setFormData(initialFormData);

      // Set timeout to adjust textarea heights after the form is rendered
      setTimeout(() => {
        data.dataset_fields.forEach(field => {
          const textarea = document.getElementById(field.field_name);
          if (textarea) {
            adjustTextareaHeight(textarea);
          }
        });
      }, 100);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Function to adjust textarea height based on content
  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(42, textarea.scrollHeight) + 'px';
    }
  };

  const handleBackToHome = () => {
    router.push(`/${currentLang}/home`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProcessingStep('autofill');

    try {
      // Prepare data for API request
      const requestData = {
        brand_template_id: template.canva_id,
        data: {},
        title: template.template_name, // Используем название шаблона из бэка
        preview: "true"
      };

      // Format form data as required by API
      Object.keys(formData).forEach(key => {
        requestData.data[key] = {
          text: formData[key],
          type: "text"
        };
      });

      const response = await fetch('https://tyrasoft.kz/api/v1/canva/create-autofill/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit form: ${response.status}`);
      }

      const result = await response.json();
      const jobId = result.canva_response.job.id;

      setJobStatus('in_progress');

      // Start checking status
      startStatusChecking(jobId);

    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
      console.error('Error submitting form:', err);
    }
  };

  const startStatusChecking = (jobId) => {
    // Clear any existing interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }

    // Set up a new interval to check status every 10 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://tyrasoft.kz/api/v1/canva/autofill-status/${jobId}`);

        if (!response.ok) {
          throw new Error(`Failed to check status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
          // Job completed successfully
          setJobStatus('success');
          setJobResult(result);
          clearInterval(interval);
          setStatusCheckInterval(null);

          // Start export PDF process
          if (result.design_id) {
            startExportProcess(result.design_id);
          } else {
            setError('Design ID не найден в ответе');
            setIsSubmitting(false);
          }
        } else if (result.status === 'error') {
          // Job failed
          setJobStatus('error');
          setError(result.message || 'Произошла ошибка');
          clearInterval(interval);
          setStatusCheckInterval(null);
          setIsSubmitting(false);
        }
        // If still in progress, continue checking
      } catch (err) {
        console.error('Error checking job status:', err);
        setError(err.message);
        clearInterval(interval);
        setStatusCheckInterval(null);
        setIsSubmitting(false);
      }
    }, 10000); // Check every 10 seconds

    setStatusCheckInterval(interval);
  };

  // Function to start PDF export process
  const startExportProcess = async (designId) => {
    setProcessingStep('export');

    try {
      // Используем design_type из URL параметров, если он доступен
      const designType = design_type || 'pdf'; // По умолчанию pdf если не указано

      const exportData = {
        design_id: designId,
        design_type: designType,
        template_id: template_id,
        format: {
          type: designType === 'pdf' ? 'pdf' : designType, // Используем тип в соответствии с design_type
          export_quality: "regular",
          size: "letter",
          pages: ["1"]
        }
      };

      const response = await fetch('https://tyrasoft.kz/api/v1/canva/create-export/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create export: ${response.status}`);
      }

      const result = await response.json();

      if (result.job && result.job.id) {
        setExportJobId(result.job.id);
        setExportStatus('in_progress');
        startExportStatusChecking(result.job.id);
      } else {
        throw new Error('ID задания экспорта не найдено');
      }
    } catch (err) {
      console.error('Error creating export:', err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Function to check export status
  const startExportStatusChecking = (jobId) => {
    // Clear any existing interval
    if (exportCheckInterval) {
      clearInterval(exportCheckInterval);
    }

    // Set up a new interval to check status every 10 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://tyrasoft.kz/api/v1/canva/export-status/${jobId}`);

        if (!response.ok) {
          throw new Error(`Failed to check export status: ${response.status}`);
        }

        const result = await response.json();

        if (result.job && result.job.status === 'success') {
          // Export completed successfully
          setExportStatus('success');
          setExportResult(result.job);
          clearInterval(interval);
          setExportCheckInterval(null);
          setIsSubmitting(false);

          // Если это видео, автоматически перенаправляем на страницу просмотра
          if (template && template.template_type === 'mp4' && result.job.urls && result.job.urls.length > 0) {
            router.push({
              pathname: `/${currentLang}/view-video`,
              query: {
                video_url: result.job.urls[0],
                thumbnail: jobResult?.thumbnail || '',
                title: template.template_name || ''
              }
            });
          }
        } else if (result.job && result.job.status === 'error') {
          // Export failed
          setExportStatus('error');
          setError(result.message || 'Ошибка при экспорте PDF');
          clearInterval(interval);
          setExportCheckInterval(null);
          setIsSubmitting(false);
        }
        // If still in progress, continue checking
      } catch (err) {
        console.error('Error checking export status:', err);
        setError(err.message);
        clearInterval(interval);
        setExportCheckInterval(null);
        setIsSubmitting(false);
      }
    }, 10000); // Check every 10 seconds

    setExportCheckInterval(interval);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
        <HeaderBack
          title={getTranslation('autoFill.title') || 'Форма автозаполнения'}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">{getTranslation('loading') || 'Загрузка...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
        <HeaderBack
          title={getTranslation('autoFill.title') || 'Форма автозаполнения'}
          onBack={handleBackToHome}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              <p>{getTranslation('error') || 'Ошибка'}: {error}</p>
            </div>
            <button
              onClick={() => template_id && fetchTemplate(template_id)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {getTranslation('retry') || 'Повторить'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render processing state (either autofill or export)
  if (isSubmitting && (jobStatus === 'in_progress' || exportStatus === 'in_progress')) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
        <HeaderBack
          title={getTranslation('autoFill.processing') || 'Обработка'}
          onBack={handleBackToHome}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-semibold mb-2">
              {processingStep === 'autofill'
                ? (getTranslation('autoFill.creatingDesign') || 'Создание дизайна...')
                : (getTranslation('autoFill.creatingPDF') || 'Подготовка PDF-файла...')}
            </h2>
            <p className="text-gray-600 mb-8">
              {processingStep === 'autofill'
                ? (getTranslation('autoFill.pleaseWait') || 'Пожалуйста, подождите, пока мы обрабатываем ваш дизайн. Это может занять некоторое время.')
                : (getTranslation('autoFill.preparingDownload') || 'Пожалуйста, подождите, пока мы подготавливаем файл для скачивания. Это может занять некоторое время.')}
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                {getTranslation('autoFill.doNotClose') || 'Пожалуйста, не закрывайте эту страницу. Мы перенаправим вас, когда все будет готово.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render success state for PDF export
  if (exportStatus === 'success' && exportResult && exportResult.urls && exportResult.urls.length > 0) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
        <HeaderBack
          title={getTranslation('autoFill.completed') || 'Готово'}
          onBack={handleBackToHome}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {getTranslation('autoFill.fileReady') || 'Ваш файл готов!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {getTranslation('autoFill.fileReadyDesc') || 'Ваш PDF-файл успешно создан и готов к скачиванию.'}
            </p>

            {jobResult && jobResult.thumbnail && (
              <div className="mb-6">
                <img
                  src={jobResult.thumbnail}
                  alt="Миниатюра дизайна"
                  className="rounded-lg shadow-md mx-auto max-w-full h-auto"
                />
              </div>
            )}

            <div className="space-y-4">
                {template && template.template_type === 'mp4' ? (
                  <button
                    onClick={() => router.push({
                      pathname: `/${currentLang}/view-video`,
                      query: {
                        video_url: exportResult.urls[0],
                        thumbnail: jobResult?.thumbnail || '',
                        title: template.template_name || ''
                      }
                    })}
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {getTranslation('autoFill.viewVideo') || 'Просмотреть видео'}
                  </button>
                ) : (
                  <a
                    href={exportResult.urls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {getTranslation('autoFill.downloadFile') || 'Скачать файл'}
                  </a>
                )}

                <button
                  onClick={handleBackToHome}
                  className="block w-full bg-white hover:bg-gray-50 text-blue-500 border border-blue-500 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {getTranslation('autoFill.goToHome') || 'Вернуться на главный экран'}
                </button>
              </div>
          </div>
        </div>
      </div>
    );
  }

  // Render success state for Canva design (in case PDF export fails)
  if (jobStatus === 'success' && jobResult && !exportStatus) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
        <HeaderBack
          title={getTranslation('autoFill.completed') || 'Дизайн готов'}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {getTranslation('autoFill.designReady') || 'Ваш дизайн готов!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {getTranslation('autoFill.designReadyDesc') || 'Ваш дизайн был успешно создан. Вы можете просмотреть или отредактировать его в Canva.'}
            </p>

            {jobResult.thumbnail && (
              <div className="mb-6">
                <img
                  src={jobResult.thumbnail}
                  alt="Миниатюра дизайна"
                  className="rounded-lg shadow-md mx-auto max-w-full h-auto"
                />
              </div>
            )}

            <div className="space-y-4">
              <a
                href={jobResult.view_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {getTranslation('autoFill.viewDesign') || 'Просмотреть дизайн'}
              </a>
              <a
                href={jobResult.edit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white hover:bg-gray-50 text-blue-500 border border-blue-500 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {getTranslation('autoFill.editDesign') || 'Редактировать в Canva'}
              </a>
              <button
                onClick={handleBackToHome}
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {getTranslation('goToHome') || 'Вернуться на главный экран'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render form (default state)
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('autoFill.title') || 'Форма автозаполнения'} | Your Site Name</title>
        <meta name="description" content={getTranslation('autoFill.description') || 'Заполните детали шаблона'} />
      </Head>

      <HeaderBack
        title={getTranslation('autoFill.title') || 'Форма автозаполнения'}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Template info */}
        {template && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{template.template_name}</h2>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-blue-800 text-sm">
                {getTranslation('autoFill.instruction') || 'Заполните поля ниже, чтобы настроить свой шаблон. Все поля обязательны.'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Dynamic fields based on template (already sorted by ID in ascending order) */}
              {template.dataset_fields.map((field) => (
                <div key={field.id} className="mb-4">
                  <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.field_name_kz || field.field_name} *
                  </label>
                  <textarea
                    id={field.field_name}
                    value={formData[field.field_name] || ''}
                    onChange={(e) => {
                      handleInputChange(field.field_name, e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    onFocus={(e) => adjustTextareaHeight(e.target)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black resize-none overflow-hidden min-h-[42px]"
                    placeholder={getTranslation('autoFill.enterValue') || 'Введите'}
                    rows={1}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-500 ${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-600'
                } text-white font-medium py-3 px-6 rounded-lg transition-colors mt-6`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    {getTranslation('autoFill.processing') || 'Обработка...'}
                  </span>
                ) : (
                  getTranslation('autoFill.startButton') || 'Создать дизайн'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Use getServerSideProps to get the lang parameter on the server
export async function getServerSideProps(context) {
  // Get the lang parameter from URL
  const { lang } = context.params;

  // Verify it's a valid language
  const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';

  // Get translations for this language
  const langTranslations = translations[validLang] || translations['kz'];

  // Return data to the component
  return {
    props: {
      lang: validLang,
      translations: langTranslations
    }
  };
}
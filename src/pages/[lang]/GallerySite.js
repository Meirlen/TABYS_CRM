import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect } from 'react';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import HeaderBack from '../../components/HeaderBack';
import { translations } from '../../locales/translations'; // Убедитесь, что путь корректный

export default function GallerySite({ lang: serverLang, translations: serverTranslations }) {
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

  // Состояние для выбора пользователя
  const [userChoice, setUserChoice] = useState(null);

  // Состояние для загрузки фото
  const [imageSrc, setImageSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [croppedImageDataUrl, setCroppedImageDataUrl] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  // Состояние для модального окна подтверждения выхода
  const [showExitModal, setShowExitModal] = useState(false);

  // Перейти к следующему шагу
  const goToNextStep = () => {
    router.push(`/${currentLang}/AudioListPage?site_id=${site_id}&category_name=${category_name}&type=${type}&tariff=${tariffParam}`);
  };

  // Обработчик выбора файла
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Общая функция обработки файла
  const handleFile = (file) => {
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError(getTranslation('gallerySite.errorOnlyImages') || 'Тек сурет файлдарын таңдауға болады');
      return;
    }

    // Проверка размера файла (максимум 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      setError(getTranslation('gallerySite.errorFileSize') || 'Файл өлшемі 5 МБ-дан аспауы тиіс');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Чтение файла и подготовка для кадрирования
    const reader = new FileReader();
    reader.onload = (upload) => {
      if (typeof upload.target?.result === 'string') {
        setImageSrc(upload.target.result);
        setIsCropping(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Отменить выбор файла
  const handleCancelFile = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setPreviewUrl(null);
    setCroppedImageDataUrl(null);
    setIsCropping(false);
    setPhotoTitle('');
    if (document.getElementById('fileInput')) {
      document.getElementById('fileInput').value = '';
    }
  };

  // Обработчик завершения кадрирования
  const onCropComplete = useCallback(
    (_croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Функция для получения кадрированного изображения
  const getCroppedImg = async (
    imageSrc,
    pixelCrop
  ) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error(getTranslation('gallerySite.errorCanvasContext') || 'Canvas контексті табылмады');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  // Суретті жүктеу уәделік функциясы (promise)
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });

  // Преобразовать base64 в File
  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Завершить кадрирование и сразу отправить на сервер
  const finishCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImageDataUrl(croppedImage);
      setPreviewUrl(croppedImage);

      // Обновляем файл для загрузки и сразу загружаем
      const fileName = selectedFile?.name || 'cropped-image.jpg';
      fetch(croppedImage)
        .then(res => res.blob())
        .then(blob => {
          const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
          setSelectedFile(croppedFile);

          // Сразу загружаем файл после кадрирования
          uploadPhoto(croppedImage, croppedFile);
        });

      setIsCropping(false);
    } catch (error) {
      console.error('Ошибка при кадрировании:', error);
      setError(getTranslation('gallerySite.errorCropping') || 'Кадрлау кезінде қате пайда болды');
    }
  };

  // Функция для загрузки фото
  const uploadPhoto = async (croppedImageUrl, file) => {
    if (!site_id) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Создаем FormData
      const formData = new FormData();
      formData.append('site_id', site_id);
      formData.append('photo', file);

      if (photoTitle.trim()) {
        formData.append('photo_title', photoTitle.trim());
      }

      // Отправляем запрос на сервер
      const baseUrl = 'https://tyrasoft.kz/api/v2/story_kid';
      const response = await axios.post(
        `${baseUrl}/sites/gallery/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Добавляем новое фото в список
      setGalleryItems(prev => [response.data, ...prev]);

      // Сбрасываем форму
      handleCancelFile();

      // Показываем сообщение об успехе
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Фотосуретті жүктеу қатесі:', err);
      setError(getTranslation('gallerySite.errorUploading') || 'Фотосуретті жүктеу кезінде қате шықты. Қайталап көріңіз.');
    } finally {
      setUploading(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{getTranslation('gallerySite.title') || 'Галерея'}</title>
        <meta name="description" content={getTranslation('gallerySite.description') || 'Добавление фотографий в галерею'} />
      </Head>

      {/* HeaderBack вместо кнопки назад */}
      <HeaderBack title={getTranslation('gallerySite.title')} />

      <div className="p-4 flex flex-col items-center justify-center">
        {/* Заголовок */}
        <div className="w-full max-w-md mb-6 mt-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {getTranslation('gallerySite.addPhotoGallery')}
          </h1>
        </div>

        {/* Основной контейнер */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-8">
          {userChoice === 'yes' ? (
            // Если пользователь выбрал "Да", показываем упрощенный интерфейс загрузки
            <div>
              {/* Файловый input */}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Режим кадрирования */}
              {isCropping && imageSrc ? (
                <>
                  <div className="relative w-full h-64 bg-gray-100 mb-4 rounded-xl overflow-hidden">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={finishCrop}
                      disabled={uploading}
                      className={`py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center
                        ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? getTranslation('gallerySite.uploading') : getTranslation('gallerySite.upload')}
                    </button>

                    <button
                      onClick={handleCancelFile}
                      disabled={uploading}
                      className={`py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center
                        ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <FiX className="mr-2" /> {getTranslation('gallerySite.cancel')}
                    </button>
                  </div>
                </>
              ) : (
                // Область для выбора файла с дополнительным оформлением
                <div className="text-center p-6 mb-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 mb-4">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 mb-4">
                        {getTranslation('gallerySite.addYourPhotos')}
                      </p>
                      <button
                        onClick={() => document.getElementById('fileInput')?.click()}
                        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <FiPlus className="mr-2" /> {getTranslation('gallerySite.selectPhoto')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Показываем загрузку */}
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-700">{getTranslation('gallerySite.uploading')}</span>
                </div>
              )}

              {/* Сообщения об ошибках и успехе */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                  {error}
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4">
                  {getTranslation('gallerySite.uploadSuccess')}
                </div>
              )}

              {/* Галерея загруженных фото */}
              {galleryItems.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-3">{getTranslation('gallerySite.uploadedPhotos')}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="rounded-lg overflow-hidden shadow bg-white">
                        <img
                          src={item.photo_url}
                          alt={item.photo_title || getTranslation('gallerySite.galleryImage')}
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Кнопка продолжить */}
                  <button
                    onClick={goToNextStep}
                    disabled={uploading}
                    className="w-full py-3 mt-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                  >
                    {getTranslation('gallerySite.continue')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Первоначальный выбор: Да или Нет
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setUserChoice('yes')}
                className="py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <FiCheck className="mr-2" /> {getTranslation('gallerySite.yesAddGallery')}
              </button>

              <button
                onClick={goToNextStep}
                className="py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FiX className="mr-2" /> {getTranslation('gallerySite.noSkipStep')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения выхода */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{getTranslation('gallerySite.modal.attention')}</h3>
            <p className="text-gray-600 mb-6">
              {getTranslation('gallerySite.modal.confirmExit')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmExit}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {getTranslation('gallerySite.modal.yes')}
              </button>
              <button
                onClick={cancelExit}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {getTranslation('gallerySite.modal.no')}
              </button>
            </div>
          </div>
        </div>
      )}
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
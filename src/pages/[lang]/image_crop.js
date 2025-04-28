import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import HeaderBack from "../../components/HeaderBack";
import { translations } from '../../locales/translations';

export default function ImageCropPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, site_id, category_name, tariff } = router.query;

  // Use language from server props or client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or imported file
  const [t, setT] = useState(serverTranslations || {});

  useEffect(() => {
    // Update language when client navigation changes query parameters
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

  // Function to get translations by nested keys
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

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [processedImg, setProcessedImg] = useState(null);
  const [processedBlob, setProcessedBlob] = useState(null);
  const [croppedImageDataUrl, setCroppedImageDataUrl] = useState(null);

  // Process step
  const [step, setStep] = useState('upload'); // 'upload' | 'options' | 'result'

  // File selection handler
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = (upload) => {
        if (typeof upload.target?.result === 'string') {
          setImageSrc(upload.target.result);
          setProcessedImg(null);
          setProcessedBlob(null);
          setStep('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Choose another photo
  const handleChooseAnotherPhoto = () => {
    document.getElementById('fileInput')?.click();
  };

  // Drag and drop functions
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = (upload) => {
        if (typeof upload.target?.result === 'string') {
          setImageSrc(upload.target.result);
          setProcessedImg(null);
          setProcessedBlob(null);
          setStep('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Called when cropping is complete
  const onCropComplete = useCallback(
    (_croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Convert base64 to File
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

  // Get cropped image base64 string using Canvas
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not found');
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

  // Image loading promise function
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });

  // Save cropped image and move to options
  const saveAndShowOptions = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);

      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImageDataUrl(cropped);

      const file = dataURLtoFile(cropped, 'cropped_image.jpg');

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('site_id', site_id);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      await axios.post(
        'https://tyrasoft.kz/api/v2/story_kid/toitend/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Move to options step
      setStep('options');

    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  }, [imageSrc, croppedAreaPixels, site_id]);

  // Remove background via PhotoRoom API
  const removeBackground = async () => {
    if (!croppedImageDataUrl) return;

    try {
      setIsRemovingBg(true);

      // Start the actual background removal
      const croppedFile = dataURLtoFile(croppedImageDataUrl, 'cropped_image.jpg');

      // Create FormData object
      const formData = new FormData();
      formData.append('image_file', croppedFile);
      formData.append('bg_color', 'white'); // White background

      // Call PhotoRoom API
      const response = await axios.post(
        'https://sdk.photoroom.com/v1/segment',
        formData,
        {
          headers: {
            'Accept': 'image/jpeg',
            'Content-Type': 'multipart/form-data',
            'x-api-key': 'c3b55839b9017607e679ffde99f64e22f4a698db'
          },
          responseType: 'arraybuffer'
        }
      );

      // Process response - get image with white background
      const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
      setProcessedBlob(imageBlob); // Save blob for later upload

      // Convert blob to data URL for display
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProcessedImg(reader.result);
          // Move to result step
          setStep('result');
        }
      };

      reader.readAsDataURL(imageBlob);

    } catch (error) {
      console.error('Background removal error:', error);
      alert('An error occurred during background removal.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Save result with removed background
  const saveProcessedImage = async () => {
    if (!processedBlob) return;

    try {
      setIsUploading(true);

      // Create file from blob with processed image
      const file = new File([processedBlob], 'processed_image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('site_id', site_id);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      await axios.post(
        'https://tyrasoft.kz/api/v2/story_kid/toitend/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Navigate to next screen after saving
      router.push(`/${currentLang}/GallerySite?site_id=${site_id}&category_name=${category_name}&type=photo`);

    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset processing and return to options
  const resetProcessing = () => {
    setProcessedImg(null);
    setProcessedBlob(null);
    setStep('options');
  };

  // Option handlers
  const handleSaveWithoutChanges = () => {
    router.push(`/${currentLang}/GallerySite?site_id=${site_id}&category_name=${category_name}&type=photo&tariff=${tariff}`);
  };

  const handleReplaceBackground = () => {
    router.push(`/${currentLang}/replace_bg?site_id=${site_id}&category_name=${category_name}&tariff=${tariff}`);
  };

  // Show modal when "Return to Home" button is clicked
  const handleExitClick = () => {
    setShowExitModal(true);
  };

  // If "Yes" is clicked in modal, clear data and go to home page
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
        <title>{getTranslation('imageCrop.title')}</title>
        <meta name="description" content={getTranslation('imageCrop.photoImprovesSite')} />
      </Head>

      {/* HeaderBack component */}
      <HeaderBack title={getTranslation('imageCrop.title')} />

      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">{getTranslation('imageCrop.editPhoto')}</h1>
          <p className="text-gray-600 mb-6 text-center text-sm">
            {getTranslation('imageCrop.photoImprovesSite')}
          </p>

          {!imageSrc ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 mb-4 text-center cursor-pointer transition-all
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-1">{getTranslation('imageCrop.clickToUpload')}</p>
                <p className="text-gray-500 text-sm">{getTranslation('imageCrop.dragAndDrop')}</p>
              </div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          ) : step === 'upload' ? (
            // STEP 1: Cropping and saving
            <>
              <div className="relative w-full h-80 bg-gray-100 mb-6 rounded-xl overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={2 / 2.2}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="zoomSlider" className="block text-sm text-gray-600 mb-1">{getTranslation('imageCrop.zoom')}</label>
                <input
                  id="zoomSlider"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={saveAndShowOptions}
                  disabled={isUploading}
                  className={`py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center ${
                    isUploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {getTranslation('imageCrop.save')}
                </button>

                <button
                  onClick={handleChooseAnotherPhoto}
                  className="py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {getTranslation('imageCrop.chooseAnotherPhoto')}
                </button>
              </div>
            </>
          ) : step === 'options' ? (
            // STEP 2: Photo options
            <>
              <div className="relative w-full h-80 bg-gray-100 mb-6 rounded-xl overflow-hidden">
                <img
                  src={croppedImageDataUrl || ''}
                  alt="Cropped photo"
                  className="w-full h-full object-contain"
                />
              </div>


              <div className="grid grid-cols-1 gap-3 mb-4">
                <button
                  onClick={handleSaveWithoutChanges}
                  className="py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {getTranslation('imageCrop.saveWithoutChanges')}
                </button>

                <button
                  onClick={removeBackground}
                  disabled={isRemovingBg}
                  className={`py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center ${
                    isRemovingBg ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isRemovingBg ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10.5a8.5 8.5 0 1117 0 8.5 8.5 0 01-17 0zM5 10.5a5.5 5.5 0 1011 0 5.5 5.5 0 00-11 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10.5h8" />
                    </svg>
                  )}
                  {getTranslation('imageCrop.removeBackground')}
                </button>


              </div>
            </>
          ) : (
            // STEP 3: Processing result with buttons
            <>
              <div className="relative w-full h-80 bg-white mb-6 rounded-xl overflow-hidden">
                <img
                  src={processedImg || ''}
                  alt="Processed photo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{getTranslation('imageCrop.backgroundProcessed')}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={saveProcessedImage}
                  disabled={isUploading}
                  className={`py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center ${
                    isUploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {getTranslation('imageCrop.save')}
                </button>

                <button
                  onClick={resetProcessing}
                  className="py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {getTranslation('imageCrop.redo')}
                </button>
              </div>
            </>
          )}

          <button
            onClick={handleExitClick}
            className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors flex items-center justify-center mt-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {getTranslation('imageCrop.returnToHome')}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{getTranslation('imageCrop.modal.attention')}</h3>
            <p className="text-gray-600 mb-6">
              {getTranslation('imageCrop.modal.confirmExit')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmExit}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {getTranslation('imageCrop.modal.yes')}
              </button>
              <button
                onClick={cancelExit}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {getTranslation('imageCrop.modal.no')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Use getServerSideProps to get the lang parameter from the server
export async function getServerSideProps(context) {
  // Get lang parameter from URL
  const { lang } = context.params;

  // Check if language is valid
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
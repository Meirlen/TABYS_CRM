// components/VideoModal.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function VideoModal({ template, onClose }) {
  const router = useRouter();

  // Close on escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!template) return null;

  // Handle create/edit button click
  const handleCreateClick = () => {
    // Закрываем модальное окно
    onClose();

    // Перенаправляем на страницу заполнения формы
    router.push({
      pathname: `/kz/auto_fill_form`,
      query: {
        template_id: template.id,
        design_type: template.template_type || 'mp4'
      }
    });
  };

  // Handle click outside the modal content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Extract YouTube video ID from the URL
  const getYouTubeId = (url) => {
    if (!url) return null;

    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|shorts\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube embed URL from video ID
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(template.thumbnail);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-lg">{template.template_name || 'Видео шаблон'}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative bg-black flex-grow flex items-center justify-center">
          {/* YouTube player */}
          <div className="w-full h-full aspect-[9/16]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Не удалось загрузить видео
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleCreateClick}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors font-medium"
          >
            Жасап көру
          </button>
        </div>
      </div>
    </div>
  );
}
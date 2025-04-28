// components/TemplateCard.js
import { useRouter } from 'next/router';

export default function TemplateCard({ template, onWatchClick, index }) {
  const router = useRouter();
  const { lang } = router.query;

  // Функция для получения изображения-миниатюры шаблона
  const getThumbnailImage = () => {
    // Проверка на YouTube ссылку и генерация URL миниатюры
    if (template.thumbnail && template.thumbnail.includes('youtube.com')) {
      const videoId = getYouTubeId(template.thumbnail);
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/placeholder-thumb.jpg';
    }

    // Миниатюра по умолчанию
    return '/placeholder-thumb.jpg';
  };

  // Извлечение YouTube ID из URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|shorts\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Обработка клика по кнопке "Выбрать"
  const handleUseClick = () => {
    // Важно: используем правильное свойство id
    if (!template || !template.id) {
      console.error('Template ID is missing!', template);
      return;
    }

    const currentLang = lang || 'kz';
    const designType = template.template_type || 'mp4';

    // Выводим в консоль для отладки
    console.log(`Navigating with template ID: ${template.id}`);

    // Используем router.push с правильно структурированным объектом query
    router.push({
      pathname: `/${currentLang}/auto_fill_form`,
      query: {
        template_id: template.id,
        design_type: designType
      }
    });
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Превью изображение с иконкой Play */}
      <div
        className="relative aspect-[9/16] bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onWatchClick(template)}
      >
        <img
          src={getThumbnailImage()}
          alt={template.template_name || 'Video template'}
          className="absolute inset-0 w-full h-full object-cover"
          loading={index < 4 ? 'eager' : 'lazy'}
        />

        {/* Иконка Play поверх изображения */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Информация о шаблоне */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate mb-2">
          {template.template_name || `Template ${index + 1}`}
        </h3>

        {/* Только кнопка "Выбрать" */}
        <button
          onClick={handleUseClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors text-sm font-medium"
        >
          Жасап көру
        </button>
      </div>
    </div>
  );
}
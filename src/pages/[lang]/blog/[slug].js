import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, ArrowUp, Eye, Tag, Calendar } from 'react-feather';

// Импорт вашего API
import { blogApi } from '../../../Blog/blogApi';
import Breadcrumbs from '../../../Blog/Breadcrumbs';

// Адрес, где лежат статические файлы (ваш домен)
const API_BASE_URL = 'https://tyrasoft.kz';
const SITE_URL = 'https://shaqyru24.kz';

// Названия месяцев для казахского языка
const kazakhMonths = [
  'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
  'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
];

export default function PublicPost({
  post,            // данные о статье
  errorMessage,    // сообщение об ошибке
  currentLang,     // текущий язык (kz, ru, en и т.д.)
  translations     // объект переводов
}) {
  const router = useRouter();

  // Функция для переводов
  const t = (key) => {
    if (!translations) return key;
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

  // Форматируем дату
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (currentLang === 'kz') {
      const day = date.getDate();
      const month = kazakhMonths[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } else {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const locale = currentLang === 'en' ? 'en-US' : 'ru-RU';
      return date.toLocaleDateString(locale, options);
    }
  };

  // Функция для получения локализованных метаданных
  const getLocalizedData = (textType) => {
    // Если есть пост, возвращаем его заголовок/описание
    if (post) {
      if (textType === 'title') return post.title;
      if (textType === 'description') return post.description || '';
      if (textType === 'keywords') return post.keywords || '';
    }

    // Если поста нет, возвращаем дефолтные значения по языку
    const defaults = {
      kz: {
        title: 'Блог мақаласы | Shaqyru24',
        description: 'Қазақ тойлары, салт-дәстүрлер және шақыру үлгілері туралы мақалалар',
        notFound: 'Парақша табылмады'
      },
      ru: {
        title: 'Статья блога | Shaqyru24',
        description: 'Статьи о казахских торжествах, традициях и примерах приглашений',
        notFound: 'Страница не найдена'
      },
      en: {
        title: 'Blog article | Shaqyru24',
        description: 'Articles about Kazakh celebrations, traditions and invitation templates',
        notFound: 'Page not found'
      }
    };

    const lang = currentLang in defaults ? currentLang : 'kz';

    if (textType === 'notFoundTitle') {
      return `${defaults[lang].notFound} | Shaqyru24`;
    }

    return defaults[lang][textType] || '';
  };

  // Получаем прямую ссылку на изображение
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // Извлекаем ID видео из YouTube
  const extractYoutubeVideoId = (url) => {
    if (!url) return null;

    const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
    const shortRegex = /youtu\.be\/([^?&]+)/;
    const embedRegex = /youtube\.com\/embed\/([^?&]+)/;

    const watchMatch = url.match(watchRegex);
    if (watchMatch) return watchMatch[1];

    const shortMatch = url.match(shortRegex);
    if (shortMatch) return shortMatch[1];

    const embedMatch = url.match(embedRegex);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  // Сформируем canonical URL
  const canonicalUrl = `${SITE_URL}/${currentLang}/blog/${post?.slug || ''}`;

  // Альтернативные языковые версии
  const langAlternates = post ? [
    { hrefLang: 'kz', href: `${SITE_URL}/kz/blog/${post.slug}` },
    { hrefLang: 'ru', href: `${SITE_URL}/ru/blog/${post.slug}` },
    { hrefLang: 'en', href: `${SITE_URL}/en/blog/${post.slug}` },
    { hrefLang: 'x-default', href: `${SITE_URL}/kz/blog/${post.slug}` }
  ] : [];

  // Получаем изображение для Open Graph
  const ogImage = post?.image_path
    ? getImageUrl(post.image_path)
    : `${SITE_URL}/images/blog-og-image.jpg`;

  // Если на сервере возникла ошибка при загрузке статьи
  if (errorMessage) {
    return (
      <div className="bg-white text-black min-h-screen">
        <Head>
          <title>{getLocalizedData('notFoundTitle')}</title>
          <meta name="description" content={getLocalizedData('description')} />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={`${SITE_URL}/${currentLang}/blog`} />
          <meta property="og:title" content={getLocalizedData('notFoundTitle')} />
          <meta property="og:description" content={getLocalizedData('description')} />
          <meta property="og:url" content={`${SITE_URL}/${currentLang}/blog`} />
          <meta property="og:type" content="website" />
        </Head>
        <div className="container mx-auto py-8 md:py-12 px-4">
          <Breadcrumbs
            items={[
              { label: t('blog.title') || 'Блог', path: `/${currentLang}/blog` },
              { label: t('post.pageNotFound') || '404' }
            ]}
          />
          <div className="bg-red-100 p-6 rounded-lg text-red-700 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">404</h1>
            <p className="mb-4">{errorMessage}</p>
            <Link
              href={`/${currentLang}/blog`}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
              aria-label={t('post.backToList')}
            >
              {t('post.backToList')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Если статьи нет (на всякий случай)
  if (!post) {
    return (
      <div className="bg-white text-black min-h-screen">
        <Head>
          <title>{getLocalizedData('notFoundTitle')}</title>
          <meta name="description" content={getLocalizedData('description')} />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={`${SITE_URL}/${currentLang}/blog`} />
        </Head>
        <div className="container mx-auto py-8 md:py-12 px-4">
          <Breadcrumbs
            items={[
              { label: t('blog.title') || 'Блог', path: `/${currentLang}/blog` },
              { label: t('post.pageNotFound') || '404' }
            ]}
          />
          <div className="text-center text-black py-12">
            <h1 className="text-2xl font-bold mb-4">404</h1>
            <p>{t('post.notFound') || 'Статья не найдена...'}</p>
            <Link
              href={`/${currentLang}/blog`}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              {t('post.backToList')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // YouTube видео (ID)
  const youtubeVideoId = extractYoutubeVideoId(post.youtube_url);

  // Подготовка таксономии (тегов)
  const tags = post.keywords ? post.keywords.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  // JSON-LD для статьи (BlogPosting)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    name: post.title,
    description: post.description || '',
    image: post.image_path ? [getImageUrl(post.image_path)] : [],
    datePublished: new Date(post.created_at).toISOString(),
    dateModified: new Date(post.updated_at || post.created_at).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    author: {
      '@type': 'Organization',
      name: 'Shaqyru24 Team',
      url: `${SITE_URL}/${currentLang}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Shaqyru24',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 112,
        height: 112
      }
    },
    inLanguage: currentLang === 'en' ? 'en-US' : (currentLang === 'ru' ? 'ru-RU' : 'kk-KZ'),
    keywords: tags.join(', '),
    wordCount: post.content ? post.content.split(' ').length : 0,
    articleBody: post.content ? post.content.replace(/<[^>]*>/g, ' ').trim() : ''
  };

  // Дополнительная разметка для BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: `${SITE_URL}/${currentLang}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('blog.title') || 'Блог',
        item: `${SITE_URL}/${currentLang}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl
      }
    ]
  };

  // Если есть видео, добавляем VideoObject к разметке
  const videoSchema = youtubeVideoId ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: post.title,
    description: post.description || '',
    thumbnailUrl: post.image_path ? getImageUrl(post.image_path) : '',
    uploadDate: new Date(post.created_at).toISOString(),
    embedUrl: `https://www.youtube.com/embed/${youtubeVideoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`
  } : null;

  // Оценка времени чтения (примерно 200 слов в минуту)
  const readingTime = () => {
    if (!post.content) return 2; // По умолчанию
    const text = post.content.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const estimatedReadingTime = readingTime();

  return (
    <div className="bg-white text-black min-h-screen">
      <Head>
        {/* Основные метатеги */}
        <title>{`${post.title} – Shaqyru24`}</title>
        <meta name="description" content={post.description || getLocalizedData('description')} />
        <meta name="keywords" content={post.keywords || ''} />

        {/* SEO метатеги */}
        <meta name="author" content="Shaqyru24 Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Альтернативные языковые версии */}
        {langAlternates.map(({ hrefLang, href }) => (
          <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
        ))}

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description || getLocalizedData('description')} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Shaqyru24" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={currentLang === 'en' ? 'en_US' : (currentLang === 'ru' ? 'ru_RU' : 'kk_KZ')} />

        {/* Метатеги для статьи */}
        <meta property="article:published_time" content={new Date(post.created_at).toISOString()} />
        {post.updated_at && <meta property="article:modified_time" content={new Date(post.updated_at).toISOString()} />}
        {tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description || getLocalizedData('description')} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:label1" content="Время чтения" />
        <meta name="twitter:data1" content={`${estimatedReadingTime} мин.`} />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {videoSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
          />
        )}
      </Head>

      <div className="container mx-auto py-8 md:py-12 px-4 max-w-4xl">
        {/* Хлебные крошки */}
        <Breadcrumbs
          items={[
            { label: t('blog.title') || 'Блог', path: `/${currentLang}/blog` },
            { label: post.title }
          ]}
        />

        <article itemScope itemType="https://schema.org/BlogPosting">
          {/* Скрытые микроданные */}
          <meta itemProp="headline" content={post.title} />
          <meta itemProp="description" content={post.description || ''} />
          <meta itemProp="author" content="Shaqyru24" />
          <meta itemProp="datePublished" content={new Date(post.created_at).toISOString()} />
          {post.updated_at && <meta itemProp="dateModified" content={new Date(post.updated_at).toISOString()} />}
          <link itemProp="mainEntityOfPage" href={canonicalUrl} />

          {/* Заголовок статьи */}
          <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight text-black" itemProp="headline">
            {post.title}
          </h1>

          {/* Мета: дата, время чтения, просмотры */}
          <div className="text-black mb-8 flex flex-wrap items-center text-sm">
            <span className="flex items-center mr-4 mb-2">
              <Calendar size={16} className="mr-1" aria-hidden="true" />
              <time dateTime={new Date(post.created_at).toISOString()} itemProp="datePublished">
                {formatDate(post.created_at)}
              </time>
            </span>

            <span className="flex items-center mr-4 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{estimatedReadingTime} мин. </span>
            </span>

            <span className="flex items-center mb-2">
              <Eye size={16} className="mr-1" aria-hidden="true" />
              <span itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
                <meta itemProp="interactionType" content="https://schema.org/ViewAction" />
                <meta itemProp="userInteractionCount" content={post.view_count || 0} />
                {post.view_count || 0}
              </span>
            </span>
          </div>

          {/* Короткое описание/подзаголовок */}
          {post.description && (
            <div className="bg-gray-50 p-4 rounded-lg mb-8 text-black italic border-l-4 border-blue-500" itemProp="description">
              {post.description}
            </div>
          )}

          {/* Главное изображение, если есть */}
          {post.image_path && (
            <figure className="mb-8" itemProp="image" itemScope itemType="https://schema.org/ImageObject">
              <img
                src={getImageUrl(post.image_path)}
                alt={post.title}
                className="w-full rounded-lg shadow-lg mx-auto"
                width="800"
                height="500"
                loading="eager"
                itemProp="url contentUrl"
              />
              <meta itemProp="width" content="800" />
              <meta itemProp="height" content="500" />
              {post.description && <figcaption className="sr-only" itemProp="caption">{post.description}</figcaption>}
            </figure>
          )}

          {/* Youtube video (iframe) */}
          {youtubeVideoId && (
            <div className="mb-8">
              <div className="relative pt-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?playsinline=1&rel=0&modestbranding=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={post.title}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Основной контент статьи (HTML) с улучшенными стилями */}
          <div
            className="prose max-w-none prose-headings:text-black prose-headings:font-semibold
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
              prose-p:text-black prose-li:text-black prose-li:my-1
              prose-h2:text-2xl prose-h3:text-xl prose-hr:my-6
              prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
              prose-ul:pl-5 prose-ol:pl-5
              prose-blockquote:italic prose-blockquote:text-black prose-blockquote:bg-gray-50 prose-blockquote:p-2 prose-blockquote:rounded
              prose-pre:overflow-x-auto prose-pre:p-4 prose-pre:bg-gray-100 prose-pre:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
            itemProp="articleBody"
          />

          {/* Ключевые слова/теги */}
          {tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-start">
                <Tag size={18} className="text-black mr-2 mt-1" aria-hidden="true" />
                <div className="flex flex-wrap" role="list" aria-label={t('post.tagsTitle') || 'Теги'}>
                  <h2 className="sr-only">{t('post.tagsTitle') || 'Теги'}</h2>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-black rounded-full px-3 py-1 text-sm mr-2 mb-2"
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Промо-блок */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-black mb-3">
                  {currentLang === 'kz'
                    ? 'Жақында сіздің де тойыңыз болады ма?'
                    : currentLang === 'en'
                    ? 'Do you have an upcoming celebration?'
                    : 'Скоро у вас праздник?'}
                </h3>
                <p className="text-black mb-4">
                  {currentLang === 'kz'
                    ? 'Қонақтарыңызды ең заманауи шақырумен шақырғыңыз келеді ме? Тек 5 минутта әзірлеңіз!'
                    : currentLang === 'en'
                    ? 'Invite your guests with the most modern invitation in just 5 minutes!'
                    : 'Хотите пригласить гостей современным приглашением? Создайте за 5 минут!'}
                </p>
                <Link
                  href={`/${currentLang}/home`}
                  className="inline-block px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  {currentLang === 'kz'
                    ? 'Басты бетке өту'
                    : currentLang === 'en'
                    ? 'Go to Home Page'
                    : 'Перейти на главную'}
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Навигация в конце статьи */}
        <div className="mt-8 pt-6 border-t flex flex-wrap justify-between items-center">
          <Link
            href={`/${currentLang}/blog`}
            className="text-blue-600 hover:text-blue-800 flex items-center group mb-4 md:mb-0"
            aria-label={t('post.backToList')}
          >
            <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            <span>{t('post.backToList')}</span>
          </Link>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-black hover:text-gray-800 flex items-center group"
            aria-label={t('post.toTop')}
          >
            <span>{t('post.toTop')}</span>
            <ArrowUp size={18} className="ml-1 group-hover:-translate-y-1 transition-transform" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Серверный рендер (SSR)
export async function getServerSideProps(context) {
  try {
    const { lang, slug } = context.params || {};
    const currentLang = lang || 'kz';

    // Настройка кеширования для статьи
    if (context.res) {
      // Кешируем страницу на 1 час, с возможностью обновления в фоне при запросах в течение суток
      context.res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    }

    // Импорт переводов
    const { translations } = await import('../../../locales/translations');
    const activeTranslations = translations[currentLang] || translations['kz'];

    // Делаем запрос к вашему API для конкретного поста (увеличивая просмотры и т.д.)
    const post = await blogApi.getPublicPost(slug, currentLang);

    // Если пост не найден, возвращаем ошибку (или 404)
    if (!post) {
      return {
        props: {
          post: null,
          errorMessage: 'Страница не найдена',
          currentLang,
          translations: activeTranslations
        }
      };
    }

    // Возвращаем данные в компонент
    return {
      props: {
        post,
        errorMessage: '',
        currentLang,
        translations: activeTranslations
      }
    };
  } catch (error) {
    console.error('Ошибка в getServerSideProps:', error);
    return {
      props: {
        post: null,
        errorMessage: 'Не удалось загрузить статью',
        currentLang: 'kz',
        translations: {}
      }
    };
  }
}
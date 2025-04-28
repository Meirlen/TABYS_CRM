// /src/pages/[lang]/home.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
//import Footer from '@/components/FooterLightKz';
import EntoMainMereyToy from './header';


const BASE_URL = "https://tyrasoft.kz/";

// Обновленный компонент разделителя
const Divider = () => (
  <div className="flex justify-center my-2 py-2">
    <img
      src="/icons/ic_circle_uzor.png"
      alt="Казахский орнамент"
      className="w-20 h-auto"
      style={{
        animation: 'spin 40s linear infinite',
        opacity: 0.8
      }}
    />
  </div>
);

// Обычный разделитель
const SimpleDivider = () => (
  <div className="flex justify-center my-1 py-1">
    <img
      src="/divider_uzor.png"
      alt="Декоративный узор"
      className="w-40 h-auto opacity-60"
    />
  </div>
);

// Глобальные стили добавим в файл global.css или в _app.js
// Вместо прямого внедрения стилей в DOM

export default function InviteLight({ siteData, isPublic }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!siteData);

  // Если данные не получены через SSR, загружаем их на клиенте
  useEffect(() => {
    // Если у нас нет данных с SSR, загружаем их на клиенте
    if (!siteData && router.isReady) {
      const { site_id } = router.query;
      if (site_id) {
        fetchSiteState(site_id);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [router.isReady, router.query, siteData]);

  const fetchSiteState = async (siteId) => {
    try {
      const response = await fetch(`${BASE_URL}sites?site_id=${siteId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching site state:", error);
      // Default to public if there's an error
    } finally {
      setLoading(false);
    }
  };

  // Определяем метаданные страницы
  const metaData = {
    title: siteData?.title || "Онлайн приглашение",
    description: siteData?.invitation_text || "Приглашаем вас на наше мероприятие",
    image_url: siteData?.photo_link
      ? siteData.photo_link
      : siteData?.id
        ? `${BASE_URL}uploads/compressed_toitrend_${siteData.id}.jpg`
        : `${BASE_URL}uploads/invite_hero_59.jpeg`
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Загрузка...</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/80 p-5 rounded-lg shadow-md flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Жүктелуде...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <meta httpEquiv="Content-Language" content="ru-RU" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metaData.description} />
        <meta name="keywords" content="shaqyru, онлайн приглашение, шақыру, той, сүндет той" />
        <meta name="author" content="Shaqyru24 Team" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#141524" />

        {/* Open Graph (для соцсетей) */}
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:image" content={metaData.image_url} />
        <meta property="og:url" content={metaData.image_url} />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.description} />
        <meta name="twitter:image" content={metaData.image_url} />

        <title>{metaData.title}</title>

        {/* Добавим стили для анимации spin здесь */}
        <style jsx global>{`
          body, html, #__next {
            margin: 0;
            padding: 0;
            background: linear-gradient(to bottom, rgba(252,246,231,1) 0%, rgba(254,250,240,1) 100%);
            background-attachment: fixed;
            min-height: 100vh;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Head>

      <div className="relative min-h-screen">


        {/*  {isPublic ? <Footer /> : <AgentFooter />} */}

        {/* Фиксированный блок аудиоплеера в правом нижнем углу */}
        <div
          className="fixed bottom-0 right-0 m-4"
          style={{ width: '300px', zIndex: 1000 }}
        >
           {/*  <AudioPlayerBlock theme="gold" /> */}
        </div>
      </div>
    </>
  );
}

// Server-side rendering для получения данных с сервера
export async function getServerSideProps(context) {
  const { site_id } = context.query;

  // Если нет site_id, возвращаем пустые props
  if (!site_id) {
    return {
      props: {
        isPublic: true,
        siteData: null
      }
    };
  }

  try {
    // Запрос данных сайта
    const siteResponse = await fetch(`${BASE_URL}sites/${site_id}`);

    // Запрос состояния сайта (публичный или нет)
    const stateResponse = await fetch(`${BASE_URL}sites?site_id=${siteId}`);

    if (!siteResponse.ok || !stateResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const siteData = await siteResponse.json();
    const stateData = await stateResponse.json();

    return {
      props: {
        siteData,
        isPublic: stateData.is_public
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    // В случае ошибки возвращаем данные по умолчанию
    return {
      props: {
        siteData: null,
        isPublic: true
      }
    };
  }
}
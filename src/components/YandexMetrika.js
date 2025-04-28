import { useEffect } from 'react';
import { useRouter } from 'next/router';

const YandexMetrika = () => {
  const router = useRouter();

  // Инициализация Метрики при первой загрузке
  useEffect(() => {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.ym(100775769, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true
    });

    // noscript элемент для браузеров без JavaScript
    const noscript = document.createElement('noscript');
    const div = document.createElement('div');
    const img = document.createElement('img');

    img.src = 'https://mc.yandex.ru/watch/100775769';
    img.style.position = 'absolute';
    img.style.left = '-9999px';
    img.alt = '';

    div.appendChild(img);
    noscript.appendChild(div);
    document.body.appendChild(noscript);

    return () => {
      if (document.body.contains(noscript)) {
        document.body.removeChild(noscript);
      }
    };
  }, []);

  // Отслеживание изменения маршрута в Next.js
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.ym !== 'undefined') {
        window.ym(100775769, 'hit', url);
      }
    };

    // When the component is mounted, register the route change events
    router.events.on('routeChangeComplete', handleRouteChange);

    // If the component is unmounted, unregister the event listener
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return null; // Компонент не рендерит никакой UI
};

export default YandexMetrika;
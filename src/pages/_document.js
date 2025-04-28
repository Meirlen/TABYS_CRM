import { Html, Head, Main, NextScript } from 'next/document';

export default function MyDocument() {
  return (
    <Html lang="kk">
      <Head>
        {/* МЕТА-ТЕГИ */}
        <meta charSet="UTF-8" />
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="kk-KZ" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Барлық той түріне арналған онлайн шақыруларды өзіңіз жасай аласыз. Қыз ұзату, үйлену той, сүндет той, мерейтой және т.б."
        />
        <meta
          name="keywords"
          content="shaqyru, онлайн шақыру,шақыру жасау, қыз ұзату, той, сүндет той, уйлену той, бесік той, мерей той, туған күн..."
        />
        <meta name="author" content="Shaqyru24 Team" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#141524" />

        {/* Open Graph */}
        <meta property="og:title" content="Тойға арналған шақыру жасау" />
        <meta
          property="og:description"
          content="Барлық той түріне арналған онлайн шақыруларды өзіңіз жасай аласыз. Қыз ұзату, үйлену той, сүндет той және т.б."
        />
        <meta property="og:image" content="https://tyrasoft.kz/uploads/invite_hero_59.jpeg" />
        <meta property="og:url" content="https://shaqyru24.kz" />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Тойға арналған  шақыру жасау | Shaqyru24.kz" />
        <meta
          name="twitter:description"
          content="Барлық той түріне арналған онлайн шақыруларды өзіңіз жасай аласыз."
        />
        <meta name="twitter:image" content="https://shaqyru24.kz/twitter-image.png" />

        {/* Canonical */}
        <link rel="canonical" href="https://shaqyru24.kz" />

        {/* Favicons */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Google Fonts (пример) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />

        {/* -- Google tag (gtag.js) -- */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-16975357099"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-16975357099');
            `,
          }}
        />

        {/* Yandex Verification (если нужно) */}
        <meta name="yandex-verification" content="e962c8d29c54939b" />

        {/* Яндекс Метрика (ВАШ КОД) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){
                      (m[i].a=m[i].a||[]).push(arguments)
                  };
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                      if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t), a=e.getElementsByTagName(t)[0],
                  k.async=1, k.src=r, a.parentNode.insertBefore(k,a)
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(100775769, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true
              });
            `,
          }}
        />

        {/* Title (глобальный по умолчанию) */}
        <title>Тойға шақыру жасау | shaqyru24.kz</title>

        {/* Встроенные стили (пример) */}
        <style>{`
          body {
            background-color: #141524;
          }
        `}</style>
      </Head>

      <body>
        <Main />
        <NextScript />

        {/* noscript для Я.Метрики */}
        <noscript>
          <div>
       <img
  src="https://mc.yandex.ru/watch/100775769"
  style={{ position: 'absolute', left: '-9999px' }}
  alt=""
/>
          </div>
        </noscript>
      </body>
    </Html>
  );
}

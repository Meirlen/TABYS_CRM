import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage({ translations }) {
  return (
    <>
      <Head>
        <title>Біз туралы | Shaqyru24</title>
        <meta name="description" content="Shaqyru24 — бұл заманауи цифрлық шақыруларды жасауға арналған инновациялық платформа." />
      </Head>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Бет тақырыбы */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Біз туралы
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 text-gray-600 text-lg max-w-3xl mx-auto">
              Shaqyru24 — бұл заманауи цифрлық шақыруларды жасауға арналған инновациялық платформа. Біз жасанды интеллект технологияларын қолданып, стильді, қолжетімді және жылдам шақырулар ұсынамыз.
            </p>
          </div>

          {/* Миссия */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Біздің миссиямыз
              </h2>
              <p className="text-gray-600">
                Біз дәстүрлі шақыру жасауды жеңілдетіп, жаңа деңгейге көтереміз. Сапалы шақыруларды қолжетімді бағамен жасау арқылы бұл процесті барша үшін түсінікті әрі ыңғайлы етеміз.
              </p>
            </div>
          </div>

          {/* Артықшылықтар */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Неліктен Shaqyru24?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Үнемді
                </h3>
                <p className="text-gray-600">
                  Шақырулар 2900 теңгеден бастап. Дәстүрлі баспа шақыруларымен салыстырғанда үнемдеңіз.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Жылдам және ыңғайлы
                </h3>
                <p className="text-gray-600">
                  Шақыруды 5 минут ішінде жасаңыз — тікелей телефоннан, қосымша бағдарламаларды жүктемей-ақ.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Жасанды интеллект технологиялары
                </h3>
                <p className="text-gray-600">
                  Фотосуреттерді өңдеу және кәсіби дауыс жазбаларын жасау үшін алдыңғы қатарлы ИИ қолданылады.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Ыңғайлы басқару
                </h3>
                <p className="text-gray-600">
                  Қонақтардың келу санын және олардың жауаптарын автоматты түрде бақылаңыз.
                </p>
              </div>
            </div>
          </div>

          {/* Қалай жұмыс істейді */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Қалай жұмыс істейді
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
                  1
                </div>
                <p className="text-gray-700">
                  Шаблонды таңдаңыз
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
                  2
                </div>
                <p className="text-gray-700">
                  Фотосурет пен мәтінді жүктеңіз
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
                  3
                </div>
                <p className="text-gray-700">
                  ИИ көмегімен өңдеңіз
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
                  4
                </div>
                <p className="text-gray-700">
                  Қонақтарға WhatsApp арқылы жіберіңіз
                </p>
              </div>
            </div>
          </div>

          {/* Технологиялар */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Біздің технологиялар
              </h2>
              <p className="text-gray-600 mb-4">
                Біз жасанды интеллекттің алдыңғы қатарлы технологияларын қолданамыз:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Фотосуреттерді өңдеу және фонды ауыстыру
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Кәсіби дауыстық озвучка
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Қонақтармен сөйлесуді автоматтандыру
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-3 text-gray-600">
                    Интерактивті элементтер мен анимациялар
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Байланыс */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Байланыс
              </h2>
              <p className="text-gray-600 mb-6">
                Егер сұрағыңыз немесе ұсынысыңыз болса, бізбен хабарласыңыз:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Email */}
                <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-700 mb-2">
                    Email:
                  </div>
                  <a href="mailto:info@shaqyru24.kz" className="text-blue-600 hover:underline">
                    info@shaqyru24.kz
                  </a>
                </div>

                {/* Телефон */}
                <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-700 mb-2">
                    Телефон:
                  </div>
                  <a href="tel:+77765444666" className="text-blue-600 hover:underline">
                    +7 776 544 4666
                  </a>
                </div>

                {/* WhatsApp */}
                <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-700 mb-2">
                    WhatsApp:
                  </div>
                  <a
                    href="https://wa.me/77765444666"
                    className="text-green-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +7 776 544 4666
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Server-side props to get translations if needed
export async function getServerSideProps(context) {
  // Get language from context or use default
  const { lang } = context.params || { lang: 'kz' };

  // Import translations (adjust the import based on your project structure)
  const { translations } = await import('../../locales/translations');

  return {
    props: {
      translations: translations[lang] || translations['kz']
    }
  };
}
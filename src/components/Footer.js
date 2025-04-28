import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { translations } from '../locales/translations'; // Adjust path as needed

const Footer = () => {
  const router = useRouter();
  const { lang = 'kz' } = router.query;
  const currentYear = new Date().getFullYear();

  // Function to get translations based on nested keys
  const t = (key) => {
    try {
      if (!translations || !translations[lang]) {
        return key;
      }

      const keys = key.split('.');
      let result = translations[lang];

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

  return (
    <>
      <footer className="bg-[#252531] text-white py-12 px-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Логотип и название */}
            <div className="flex flex-col items-start">
              {/* Используем текстовый логотип */}
              <div className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-[#3875F6] to-[#00B074] text-transparent bg-clip-text">SHAQYRU</span>
                <span className="text-[#3875F6]">24</span>
              </div>
              <p className="mt-4 text-gray-300">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Байланыс */}
            <div>
              <h4 className="font-bold mb-4 text-[#3875F6]">{t('footer.sections.contact.title')}</h4>
              <ul className="list-none">
                <li className="mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#00B074]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a
                    href="https://wa.me/77765444666"
                    className="hover:text-[#3875F6] transition-colors duration-300"
                  >
                    {t('footer.sections.contact.phone')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Навигация - используем Next.js Link */}
            <div>
              <h4 className="font-bold mb-4 text-[#3875F6]">{t('footer.sections.navigation.title')}</h4>
              <ul className="list-none">
                <li className="mb-2">
                  <Link href={`/${lang}/home`} legacyBehavior>
                    <a className="hover:text-[#3875F6] transition-colors duration-300">
                      {t('footer.sections.navigation.links.home')}
                    </a>
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href={`/${lang}/about`} legacyBehavior>
                    <a className="hover:text-[#3875F6] transition-colors duration-300">
                      {t('footer.sections.navigation.links.about')}
                    </a>
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href={`/${lang}/TransactionHistoryPage`} legacyBehavior>
                    <a className="hover:text-[#3875F6] transition-colors duration-300">
                      {t('footer.sections.navigation.links.transactions')}
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Әлеуметтік желілер */}
            <div>
              <h4 className="font-bold mb-4 text-[#3875F6]">{t('footer.sections.social.title')}</h4>
              <ul className="flex">
                <li className="mr-4">
                  <a
                    href="https://wa.me/77711474766"
                    className="hover:scale-110 transition-transform duration-300 inline-block"
                    aria-label={t('footer.sections.social.whatsapp')}
                  >
                    <div className="h-10 w-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-[#3875F6] transition-colors">
                      <img
                        src="/icons/whatsapp.png"
                        alt={t('footer.sections.social.whatsapp')}
                        className="h-6 w-6"
                      />
                    </div>
                  </a>
                </li>
                <li className="mr-4">
                  <a
                    href="https://www.instagram.com/shaqyru24/"
                    className="hover:scale-110 transition-transform duration-300 inline-block"
                    aria-label={t('footer.sections.social.instagram')}
                  >
                    <div className="h-10 w-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-[#3875F6] transition-colors">
                      <img
                        src="/icons/instagram.png"
                        alt={t('footer.sections.social.instagram')}
                        className="h-6 w-6"
                      />
                    </div>
                  </a>
                </li>
                <li className="mr-4">
                  <a
                    href="#"
                    className="hover:scale-110 transition-transform duration-300 inline-block"
                    aria-label={t('footer.sections.social.tiktok')}
                  >
                    <div className="h-10 w-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-[#3875F6] transition-colors">
                      <img
                        src="/icons/tiktok.png"
                        alt={t('footer.sections.social.tiktok')}
                        className="h-6 w-6"
                      />
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Копирайт */}
          <div className="mt-8 text-center border-t border-gray-700 pt-6">
            <p className="text-gray-400">
              &copy; {currentYear} Shaqyru24. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
      {/* Узор внизу - с градиентными цветами */}
      <div className="w-full h-3 bg-gradient-to-r from-[#3875F6] to-[#00B074]"></div>
    </>
  );
};

export default Footer;
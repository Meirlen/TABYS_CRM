import "../styles/globals.css";
import Navigation from "../components/Navigation";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Import YandexMetrika dynamically with no SSR to ensure it only runs on client
const YandexMetrika = dynamic(() => import("../components/YandexMetrika"), { ssr: false });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const path = router.asPath;

  const showNavigation =
    path.startsWith("/kz/home") ||
    path.startsWith("/kz/my_sites") ||
    path.startsWith("/kz/about") ||
    path.startsWith("/kz/PackageCalculator") ||
    path.startsWith("/kz/blog") ||
    path.startsWith("/ru/home") ||
    path.startsWith("/ru/my_sites") ||
    path.startsWith("/ru/about") ||
    path.startsWith("/ru/PackageCalculator") ||
    path.startsWith("/ru/blog") ||
    path.startsWith("/en/home") ||
    path.startsWith("/en/my_sites") ||
    path.startsWith("/en/about") ||
    path.startsWith("/en/PackageCalculator") ||
    path.startsWith("/en/blog") ||
    path.startsWith("/home") ||
    path.startsWith("/my_sites") ||
    path.startsWith("/about") ||
    path.startsWith("/PackageCalculator") ||
    path.startsWith("/blog");

  return (
    <>
      {/* Add Yandex Metrika component */}
      <YandexMetrika />

      {showNavigation && <Navigation />}
      <Component {...pageProps} />
    </>
  );
}
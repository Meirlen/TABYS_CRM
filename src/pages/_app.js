import "../styles/globals.css";
import Navigation from "../components/Navigation";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";


export default function App({ Component, pageProps }) {
  const router = useRouter();
  const path = router.asPath;

  const showNavigation =
    path.startsWith("/kz/home")
  return (
    <>
      {/* Add Yandex Metrika component */}

      {showNavigation && <Navigation />}
      <Component {...pageProps} />
    </>
  );
}
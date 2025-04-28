import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const defaultLanguage = localStorage.getItem('language') || 'kz';

    if (router.pathname === '/') {
      router.push(`/${defaultLanguage}`);
    }
  }, [router]);

  return null;
}

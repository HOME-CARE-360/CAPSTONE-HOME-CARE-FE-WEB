'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider as Provider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`@/locales/${language}/${namespace}.json`);
    })
  )
  .init({
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <Provider i18n={i18n}>{children}</Provider>;
}

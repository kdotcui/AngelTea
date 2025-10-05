import {getRequestConfig} from 'next-intl/server';
import {defaultLocale, locales} from './routing';

export default getRequestConfig(async ({locale}) => {
  const localeToUse = locales.includes(locale as typeof locales[number])
    ? locale
    : defaultLocale;

  if (process.env.NODE_ENV === 'development') {
    console.log('[i18n] request config locale', locale, '->', localeToUse);
  }

  const messages = await import(`../messages/${localeToUse}.json`).then(
    (module) => module.default
  );

  return {
    locale: localeToUse,
    messages,
  };
});

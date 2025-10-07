import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookies, fallback to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  
  // Validate locale
  const allowedLocales = ['en', 'zh', 'es'];
  const validLocale = allowedLocales.includes(locale) ? locale : 'en';

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});

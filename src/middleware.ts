
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // Don't localize API routes or static assets
  localePrefix: 'as-needed' // Only add locale prefix if necessary (not the default locale)
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to `/` when visiting `/en` for the default locale
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};

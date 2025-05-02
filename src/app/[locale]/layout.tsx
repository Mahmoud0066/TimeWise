
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import '../globals.css'; // Adjust path relative to [locale] directory
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/shared/theme-provider';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: 'TimeWise Attendance', // Consider localizing this if needed via generateMetadata
  description: 'Daily attendance logging for workers.',
};

export default async function RootLayout({
  children,
  params: {locale} // Get locale from params
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${geistSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

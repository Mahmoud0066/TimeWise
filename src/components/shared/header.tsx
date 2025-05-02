
"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Use next/navigation for App Router
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth'; // No .tsx needed
import { LogOut, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher'; // Import LanguageSwitcher
import { useTranslations, useLocale } from 'next-intl';

export function AppHeader() {
  const t = useTranslations('AppHeader');
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname to maintain it during locale change
  const locale = useLocale();

  const handleLogout = () => {
    logout();
    // Redirect to login page in the current locale
    router.push(`/${locale}/`);
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-2 sm:gap-4">
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32 bg-primary/50" />
                    <Skeleton className="h-8 w-20 bg-secondary/80" />
                    <Skeleton className="h-8 w-8 bg-secondary/80 rounded-md" /> {/* Skeleton for ThemeToggle */}
                    <Skeleton className="h-8 w-24 bg-secondary/80 rounded-md" /> {/* Skeleton for LanguageSwitcher */}
                </div>
            ) : user ? (
              <>
                 <span className="text-sm hidden sm:inline">
                    {t('welcome', { name: user.name || user.email.split('@')[0], role: user.role })}
                 </span>
                 <span className="text-sm sm:hidden">
                     {t('welcomeShort', { name: user.name ? user.name.split(' ')[0] : user.email.split('@')[0] })}
                 </span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  <LogOut className="ltr:mr-0 rtl:ml-0 sm:ltr:mr-2 sm:rtl:ml-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </Button>
                <LanguageSwitcher />
                <ThemeToggle />
              </>
            ) : (
                 // Show ThemeToggle and LanguageSwitcher even when logged out
                 <>
                    <LanguageSwitcher />
                    <ThemeToggle />
                 </>
            )}
        </div>
      </div>
    </header>
  );
}

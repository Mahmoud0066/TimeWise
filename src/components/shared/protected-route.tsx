
"use client";

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth.tsx';
import type { UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale, useTranslations } from 'next-intl';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const t = useTranslations('ProtectedRoute');
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale(); // Get current locale

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const loginPath = `/${locale}/`; // Login path with locale
    const adminPath = `/${locale}/admin/dashboard`;
    const workerPath = `/${locale}/worker/dashboard`;

    if (user === null) {
      router.replace(loginPath);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      if (user.role === 'admin') {
        router.replace(adminPath);
      } else {
        router.replace(workerPath);
      }
      return;
    }

  }, [user, isLoading, allowedRoles, router, locale]); // Add locale to dependencies

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-secondary">
        <Skeleton className="h-10 w-48 mb-4 bg-muted" />
        <Skeleton className="h-8 w-64 bg-muted" />
         <p className="text-muted-foreground mt-2">{t('loading')}</p>
      </div>
    );
  }

  if (user && allowedRoles.includes(user.role)) {
      return <>{children}</>;
  }

  return null;
}

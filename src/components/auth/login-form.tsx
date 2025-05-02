
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import type { UserRole, Worker } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Loader2 } from 'lucide-react'; // Import Loader
import { useLocale } from 'next-intl';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Can be any length now, but must be present
});

// Hardcoded admin credentials
const ADMIN_EMAIL = 'fares@mail.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME = 'Fares Admin';

export function LoginForm() {
  const t = useTranslations('LoginForm');
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading: isAuthHookLoading } = useAuth(); // Renamed to avoid conflict
  const [workers, , isWorkersLoading] = useLocalStorage<Worker[]>('workers', []); // Load workers
  const locale = useLocale(); // Get current locale

  // Determine overall loading state
  const isLoading = isAuthHookLoading || isWorkersLoading;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Prevent login attempt if data is still loading
    if (isLoading) {
        toast({
            title: t('pleaseWait'),
            description: t('loadingData'),
            variant: 'default'
        });
        return;
    }

    let userRole: UserRole | null = null;
    let userName: string | null = null;
    let userEmail: string | null = null;

    // Check Admin credentials first
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      userRole = 'admin';
      userName = ADMIN_NAME;
      userEmail = ADMIN_EMAIL;
    } else {
      // If not admin, check against workers from localStorage
      if (Array.isArray(workers)) {
         const worker = workers.find(w => w.email === values.email);
          if (worker && worker.password === values.password) {
              userRole = 'worker';
              userName = worker.name;
              userEmail = worker.email;
          }
      } else {
          console.error("Workers data is not available or not an array.");
          toast({
            title: t('loginFailedTitle'),
            description: t('verifyError'),
            variant: 'destructive',
          });
          return;
      }
    }

    if (userRole && userName && userEmail) {
      // Pass name to the login function
      login(userEmail, userRole, userName);
      toast({
        title: t('loginSuccessTitle'),
        description: t('loginSuccessDescription', { name: userName }),
      });
      // Redirect based on role, including locale
      router.push(`/${locale}${userRole === 'admin' ? '/admin/dashboard' : '/worker/dashboard'}`);
    } else {
      toast({
        title: t('loginFailedTitle'),
        description: t('loginFailedDescription'),
        variant: 'destructive',
      });
      form.resetField('password'); // Clear password field on failure
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto mt-10 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
        <CardDescription className="text-center">{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('emailPlaceholder')} {...field} type="email" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('passwordPlaceholder')} {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                  {t('loadingButton')}
                </>
              ) : (
                t('loginButton')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


"use client";

import React, { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuth } from '@/hooks/use-auth.tsx'; // Updated import path
import type { AttendanceRecord } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ar, enUS } from 'date-fns/locale'; // Import locales
import { useLocale } from 'next-intl';

export function WorkerAttendanceHistory() {
  const t = useTranslations('WorkerAttendanceHistory');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;

  const { user, isLoading: isAuthLoading } = useAuth();
  const [attendanceRecords, , isRecordsLoading] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);

  const isLoading = isAuthLoading || isRecordsLoading;

  const userRecords = useMemo(() => {
    if (isLoading || !user || !Array.isArray(attendanceRecords)) {
        return [];
    }
    return attendanceRecords
      .filter(record => record.workerEmail === user.email)
      .sort((a, b) => {
          try {
              return parseISO(b.checkInTime).getTime() - parseISO(a.checkInTime).getTime();
          } catch (e) {
              console.error("Error parsing date for sorting", e);
              return 0;
          }
      });
  }, [attendanceRecords, user, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!user) {
      return <p className="text-muted-foreground">{t('userNotFound')}</p>;
  }

   if (!Array.isArray(attendanceRecords)) {
       return <p className="text-destructive">{t('loadingError')}</p>;
   }


  if (userRecords.length === 0) {
    return <p className="text-muted-foreground">{t('noRecords')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dateColumn')}</TableHead>
            <TableHead>{t('checkInTimeColumn')}</TableHead>
            <TableHead>{t('statusColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{format(parseISO(record.checkInTime), 'PPP', { locale: dateLocale })}</TableCell>
              <TableCell>{format(parseISO(record.checkInTime), 'p', { locale: dateLocale })}</TableCell>
               <TableCell>
                 <Badge variant={record.paid ? 'default' : 'secondary'} className={record.paid ? 'bg-accent text-accent-foreground' : ''}>
                  {record.paid ? t('paid') : t('pending')}
                 </Badge>
               </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

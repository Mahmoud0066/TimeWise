
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx'; // Updated import path
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AttendanceRecord } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Loader2 } from 'lucide-react'; // Icon for Check In and Loading
import { useTranslations } from 'next-intl';
import { ar, enUS } from 'date-fns/locale'; // Import locales
import { useLocale } from 'next-intl';

export function CheckInButton() {
  const t = useTranslations('CheckInButton');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;

  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords, isRecordsLoading] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null);

  const isLoading = isAuthLoading || isRecordsLoading;

  const todayDate = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!isLoading && user && attendanceRecords) {
      const todaysRecord = attendanceRecords.find(
        record => record.workerEmail === user.email && record.date === todayDate
      );
      setIsCheckedInToday(!!todaysRecord);
      if (todaysRecord) {
          setCheckedInTime(format(parseISO(todaysRecord.checkInTime), 'p', { locale: dateLocale }));
      } else {
          setCheckedInTime(null);
      }
    } else if (!isLoading && (!user || !attendanceRecords)) {
        setIsCheckedInToday(false);
        setCheckedInTime(null);
    }
  }, [attendanceRecords, user, todayDate, isLoading, dateLocale]); // Add dateLocale dependency

  const handleCheckIn = useCallback(() => {
    if (isLoading || !user || user.role !== 'worker') {
      toast({ title: t('errorGeneric'), description: t('errorCannotCheckIn'), variant: 'destructive' });
      return;
    }

    if (attendanceRecords?.find(record => record.workerEmail === user.email && record.date === todayDate)) {
       toast({ title: t('alreadyCheckedInTitle'), description: t('alreadyCheckedInDescription') });
       return;
    }


    const now = new Date();
    const checkInTimeISO = now.toISOString();
    const recordId = `${user.email}_${todayDate}_${now.getTime()}`;

    const workerName = user.name || user.email.split('@')[0];

    const newRecord: AttendanceRecord = {
      id: recordId,
      workerEmail: user.email,
      workerName: workerName,
      date: todayDate,
      checkInTime: checkInTimeISO,
      paid: false,
    };

    setAttendanceRecords(prevRecords => {
      const currentRecords = Array.isArray(prevRecords) ? prevRecords : [];
      if (currentRecords.some(r => r.workerEmail === user.email && r.date === todayDate)) {
          console.warn("Attempted to check in again after initial check.");
          return currentRecords;
      }
      return [...currentRecords, newRecord];
    });

    const formattedTime = format(now, 'p', { locale: dateLocale });
    setIsCheckedInToday(true);
    setCheckedInTime(formattedTime);

    toast({
      title: t('successTitle'),
      description: t('successDescription', { time: formattedTime }),
    });

  }, [user, isLoading, attendanceRecords, setAttendanceRecords, todayDate, toast, t, dateLocale]); // Add t and dateLocale dependency


  if (isLoading) {
    return <Button disabled className="w-full md:w-auto"><Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" /> {t('loading')}</Button>;
  }

  return (
    <Button
      onClick={handleCheckIn}
      disabled={isCheckedInToday}
      className={`w-full md:w-auto ${isCheckedInToday ? 'bg-accent text-accent-foreground hover:bg-accent/90 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
      aria-live="polite"
    >
      <CheckCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
      {isCheckedInToday ? t('checkedInToday', { time: checkedInTime }) : t('checkInNow')}
    </Button>
  );
}

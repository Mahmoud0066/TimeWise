
"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AttendanceRecord, Worker } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Check, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { ar, enUS } from 'date-fns/locale'; // Import locales
import { useLocale } from 'next-intl';

export function AttendanceRecords() {
  const t = useTranslations('AttendanceRecords');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;

  const [attendanceRecords, setAttendanceRecords, isRecordsLoading] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);
  const [workers, , isWorkersLoading] = useLocalStorage<Worker[]>('workers', []); // Fetch workers for filtering
  const { toast } = useToast();
  const [filterWorkerEmail, setFilterWorkerEmail] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterPaidStatus, setFilterPaidStatus] = useState<string>('all'); // 'all', 'paid', 'pending'

  const isLoading = isRecordsLoading || isWorkersLoading;

   const togglePaidStatus = useCallback((recordId: string) => {
    setAttendanceRecords(prevRecords => {
        const currentRecords = Array.isArray(prevRecords) ? prevRecords : [];
        const targetRecord = currentRecords.find(r => r.id === recordId);
        if (!targetRecord) return currentRecords;

        const updatedRecords = currentRecords.map(record =>
            record.id === recordId ? { ...record, paid: !record.paid } : record
        );

        toast({
            title: t('statusUpdatedTitle'),
            description: t(!targetRecord.paid ? 'statusMarkedPaid' : 'statusMarkedPending'),
        });
        return updatedRecords;
    });
   }, [setAttendanceRecords, toast, t]);


   const deleteRecord = useCallback((recordId: string) => {
      setAttendanceRecords(prevRecords => {
          const currentRecords = Array.isArray(prevRecords) ? prevRecords : [];
          const updatedRecords = currentRecords.filter(record => record.id !== recordId);
          if (updatedRecords.length < currentRecords.length) {
              toast({ title: t('recordDeletedTitle'), description: t('recordDeletedDescription') });
          }
          return updatedRecords;
      });
   }, [setAttendanceRecords, toast, t]);


  const filteredRecords = useMemo(() => {
    if (isLoading || !Array.isArray(attendanceRecords) || !Array.isArray(workers)) {
        return [];
    }

    return attendanceRecords
      .map(record => ({
          ...record,
          workerName: record.workerName || workers.find(w => w.email === record.workerEmail)?.name || record.workerEmail.split('@')[0]
      }))
      .filter(record => {
        const workerMatch = filterWorkerEmail === 'all' || record.workerEmail === filterWorkerEmail;
        const dateMatch = !filterDate || record.date === filterDate;
        const paidMatch = filterPaidStatus === 'all' || (filterPaidStatus === 'paid' && record.paid) || (filterPaidStatus === 'pending' && !record.paid);
        return workerMatch && dateMatch && paidMatch;
      })
      .sort((a, b) => {
          try {
              return parseISO(b.checkInTime).getTime() - parseISO(a.checkInTime).getTime();
          } catch (e) {
              console.error("Error parsing date for sorting", e);
              return 0;
          }
      });
  }, [attendanceRecords, workers, filterWorkerEmail, filterDate, filterPaidStatus, isLoading]);

  if (isLoading) {
     return (
         <div className="space-y-4">
             <Skeleton className="h-10 w-1/3" />
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-card shadow-sm">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
             </div>
             <Skeleton className="h-40 w-full" />
         </div>
     );
   }

  if (!Array.isArray(attendanceRecords) || !Array.isArray(workers)) {
      return <p className="text-destructive">{t('loadingError')}</p>;
  }


  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-card shadow-sm">
         <div>
             <label htmlFor="worker-filter" className="block text-sm font-medium mb-1">{t('filterWorkerLabel')}</label>
             <Select value={filterWorkerEmail} onValueChange={setFilterWorkerEmail}>
               <SelectTrigger id="worker-filter">
                 <SelectValue placeholder={t('filterWorkerPlaceholder')} />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">{t('allWorkers')}</SelectItem>
                 {workers.map(worker => (
                   <SelectItem key={worker.id} value={worker.email}>{worker.name} ({worker.email})</SelectItem>
                 ))}
               </SelectContent>
             </Select>
         </div>
         <div>
             <label htmlFor="date-filter" className="block text-sm font-medium mb-1">{t('filterDateLabel')}</label>
             <Input
                id="date-filter"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder={t('filterDatePlaceholder')}
              />
         </div>
          <div>
            <label htmlFor="paid-filter" className="block text-sm font-medium mb-1">{t('filterStatusLabel')}</label>
            <Select value={filterPaidStatus} onValueChange={setFilterPaidStatus}>
              <SelectTrigger id="paid-filter">
                <SelectValue placeholder={t('filterStatusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="paid">{t('paidStatus')}</SelectItem>
                <SelectItem value="pending">{t('pendingStatus')}</SelectItem>
              </SelectContent>
            </Select>
         </div>
       </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('workerColumn')}</TableHead>
              <TableHead>{t('dateColumn')}</TableHead>
              <TableHead>{t('checkInTimeColumn')}</TableHead>
              <TableHead>{t('statusColumn')}</TableHead>
              <TableHead className="text-right">{t('actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
              <TableRow key={record.id} className={record.paid ? 'opacity-70' : ''}>
                <TableCell>{record.workerName || 'N/A'}</TableCell>
                <TableCell>{format(parseISO(record.checkInTime), 'PPP', { locale: dateLocale })}</TableCell>
                <TableCell>{format(parseISO(record.checkInTime), 'p', { locale: dateLocale })}</TableCell>
                <TableCell>
                  <Badge variant={record.paid ? 'default' : 'secondary'} className={record.paid ? 'bg-accent text-accent-foreground' : ''}>
                    {record.paid ? t('paidStatus') : t('pendingStatus')}
                  </Badge>
                </TableCell>
                 <TableCell className="text-right space-x-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePaidStatus(record.id)}
                        className={record.paid ? 'text-muted-foreground hover:text-foreground' : 'text-accent hover:text-accent/90'}
                        aria-label={record.paid ? t('markAsPending') : t('markAsPaid')}
                    >
                      {record.paid ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>

                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label={t('deleteRecord')}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                           <AlertDialogDescription>
                             {t('confirmDeleteDescription')}
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                           <AlertDialogAction onClick={() => deleteRecord(record.id)} className="bg-destructive hover:bg-destructive/90">
                             {t('delete')}
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                 </TableCell>
              </TableRow>
            )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">{t('noRecords')}</TableCell>
                 </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

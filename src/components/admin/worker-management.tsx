
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Worker } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

// Schema for adding worker (password is now fixed)
const workerAddSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

// Schema for editing worker (password is optional)
const workerEditSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
});

type WorkerAddFormData = z.infer<typeof workerAddSchema>;
type WorkerEditFormData = z.infer<typeof workerEditSchema>;

// Start with an empty array, admin should add workers.
const initialWorkers: Worker[] = [];


export function WorkerManagement() {
  const t = useTranslations('WorkerManagement');
  const [workers, setWorkers, isLoading] = useLocalStorage<Worker[]>('workers', initialWorkers);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form hook for adding worker
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors }
  } = useForm<WorkerAddFormData>({
    resolver: zodResolver(workerAddSchema),
    defaultValues: { email: '', name: '' },
  });

  // Form hook for editing worker
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    setValue: setEditValue,
    formState: { errors: editErrors }
  } = useForm<WorkerEditFormData>({
    resolver: zodResolver(workerEditSchema),
    defaultValues: { email: '', name: '', password: '' },
  });


  const onAddWorker = (data: WorkerAddFormData) => {
     if (isLoading || !Array.isArray(workers)) {
        toast({ title: t('errorGeneric'), description: t('errorCannotAdd'), variant: 'destructive' });
        return;
     }

    if (workers.some(w => w.email === data.email)) {
      toast({ title: t('errorGeneric'), description: t('errorEmailExists'), variant: 'destructive' });
      return;
    }
    // Explicitly set the fixed password '123456' for the new worker object
    const newWorker: Worker = {
        ...data,
        id: data.email, // Use email as ID
        password: '123456' // Fixed default password
    };
    setWorkers(prev => [...(Array.isArray(prev) ? prev : []), newWorker]);
    toast({ title: t('successWorkerAdded', {name: data.name}) }); // Updated success message
    resetAddForm();
    setIsAddDialogOpen(false);
  };

  const onEditWorker = (data: WorkerEditFormData) => {
     if (isLoading || !Array.isArray(workers) || !editingWorker) {
        toast({ title: t('errorGeneric'), description: t('errorCannotEdit'), variant: 'destructive' });
        return;
     }

    if (data.email !== editingWorker.email && workers.some(w => w.id !== editingWorker.id && w.email === data.email)) {
       toast({ title: t('errorGeneric'), description: t('errorEditEmailExists'), variant: 'destructive' });
       return;
    }


    setWorkers(prev => {
        const currentWorkers = Array.isArray(prev) ? prev : [];
        return currentWorkers.map(w => {
            if (w.id === editingWorker.id) {
                const updatedWorker = {
                    ...w,
                    name: data.name,
                    email: data.email,
                    id: data.email, // Update ID if email changes
                    // Only update password if a new one was provided *and* is valid
                    password: data.password && data.password.length >= 6 ? data.password : w.password,
                };
                return updatedWorker;
            }
            return w;
        });
    });
    toast({ title: t('successWorkerUpdated') });
    setEditingWorker(null);
    resetEditForm();
    setIsEditDialogOpen(false);
  };

  const deleteWorker = (workerId: string) => {
    if (isLoading || !Array.isArray(workers)) {
        toast({ title: t('errorGeneric'), description: t('errorCannotDelete'), variant: 'destructive' });
        return;
    }
    setWorkers(prev => (Array.isArray(prev) ? prev : []).filter(w => w.id !== workerId));
    toast({ title: t('successWorkerDeleted') });
  };

  const openEditDialog = (worker: Worker) => {
    setEditingWorker(worker);
    setEditValue('email', worker.email);
    setEditValue('name', worker.name || '');
    setEditValue('password', ''); // Clear password field for edit dialog
    setIsEditDialogOpen(true);
  };

   if (isLoading) {
     return (
         <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-28" />
             </div>
             <Skeleton className="h-40 w-full" />
         </div>
     );
   }

   if (!Array.isArray(workers)) {
       return <p className="text-destructive">{t('errorLoading')}</p>;
   }


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
           <DialogTrigger asChild>
             <Button>
               <PlusCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" /> {t('addWorkerButton')}
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>{t('addDialogTitle')}</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleAddSubmit(onAddWorker)} className="space-y-4">
                 <Controller
                   name="name"
                   control={addControl}
                   render={({ field }) => (
                     <div>
                       <Label htmlFor="add-name" className="block text-sm font-medium mb-1">{t('nameLabel')}</Label>
                       <Input id="add-name" placeholder={t('namePlaceholder')} {...field} />
                       {addErrors.name && <p className="text-destructive text-sm mt-1">{addErrors.name.message}</p>}
                     </div>
                   )}
                 />
                 <Controller
                   name="email"
                   control={addControl}
                   render={({ field }) => (
                     <div>
                        <Label htmlFor="add-email" className="block text-sm font-medium mb-1">{t('emailLabel')}</Label>
                       <Input id="add-email" placeholder={t('emailPlaceholder')} type="email" {...field} />
                        {addErrors.email && <p className="text-destructive text-sm mt-1">{addErrors.email.message}</p>}
                     </div>
                   )}
                 />
                 {/* Static text confirming the default password */}
                 <p className="text-sm text-muted-foreground">{t('defaultPasswordInfo')}</p>
                 <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">{t('cancel')}</Button>
                    </DialogClose>
                   <Button type="submit">{t('addSubmit')}</Button>
                 </DialogFooter>
             </form>
           </DialogContent>
         </Dialog>
      </div>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editDialogTitle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(onEditWorker)} className="space-y-4">
            <Controller
              name="name"
              control={editControl}
              render={({ field }) => (
                <div>
                  <Label htmlFor="edit-name" className="block text-sm font-medium mb-1">{t('nameLabel')}</Label>
                  <Input id="edit-name" placeholder={t('namePlaceholder')} {...field} />
                   {editErrors.name && <p className="text-destructive text-sm mt-1">{editErrors.name.message}</p>}
                </div>
              )}
            />
            <Controller
              name="email"
              control={editControl}
              render={({ field }) => (
                <div>
                  <Label htmlFor="edit-email" className="block text-sm font-medium mb-1">{t('emailLabel')}</Label>
                  <Input id="edit-email" placeholder={t('emailPlaceholder')} type="email" {...field} />
                  {editErrors.email && <p className="text-destructive text-sm mt-1">{editErrors.email.message}</p>}
                </div>
              )}
            />
             <Controller
               name="password"
               control={editControl}
               render={({ field }) => (
                 <div>
                   <Label htmlFor="edit-password" className="block text-sm font-medium mb-1">{t('newPasswordLabel')}</Label>
                   <Input id="edit-password" type="password" placeholder={t('newPasswordPlaceholder')} {...field} />
                   {editErrors.password && <p className="text-destructive text-sm mt-1">{editErrors.password.message}</p>}
                 </div>
               )}
             />
             <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={() => setEditingWorker(null)}>{t('cancel')}</Button>
                </DialogClose>
               <Button type="submit">{t('saveSubmit')}</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('nameColumn')}</TableHead>
              <TableHead>{t('emailColumn')}</TableHead>
              <TableHead className="text-right">{t('actionsColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.length > 0 ? workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell>{worker.name || 'N/A'}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell className="text-right space-x-1"> {/* Reduced spacing */}
                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(worker)} aria-label={t('editWorkerAction')}>
                     <Edit className="h-4 w-4" />
                   </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" aria-label={t('deleteWorkerAction')}>
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
                          <AlertDialogAction onClick={() => deleteWorker(worker.id)} className="bg-destructive hover:bg-destructive/90">
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
                 <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">{t('noWorkers')}</TableCell>
                 </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

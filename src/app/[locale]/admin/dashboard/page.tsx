
import { ProtectedRoute } from '@/components/shared/protected-route';
import { AppHeader } from '@/components/shared/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WorkerManagement } from '@/components/admin/worker-management';
import { AttendanceRecords } from '@/components/admin/attendance-records';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';

export default function AdminDashboardPage() {
  const t = useTranslations('AdminDashboardPage');

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen flex flex-col bg-secondary">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
           <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('title')}</h2>

           <Tabs defaultValue="attendance" className="w-full">
             <TabsList className="grid w-full grid-cols-2 mb-6">
               <TabsTrigger value="attendance">{t('attendanceTab')}</TabsTrigger>
               <TabsTrigger value="workers">{t('workersTab')}</TabsTrigger>
             </TabsList>
             <TabsContent value="attendance">
                 <Card className="shadow-md rounded-lg">
                   <CardHeader>
                     <CardTitle className="text-xl md:text-2xl">{t('attendanceCardTitle')}</CardTitle>
                     <CardDescription>{t('attendanceCardDescription')}</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <AttendanceRecords />
                   </CardContent>
                 </Card>
             </TabsContent>
             <TabsContent value="workers">
                 <Card className="shadow-md rounded-lg">
                   <CardHeader>
                     <CardTitle className="text-xl md:text-2xl">{t('workersCardTitle')}</CardTitle>
                      <CardDescription>{t('workersCardDescription')}</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <WorkerManagement />
                   </CardContent>
                 </Card>
             </TabsContent>
           </Tabs>

        </main>
      </div>
    </ProtectedRoute>
  );
}

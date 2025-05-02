
import { ProtectedRoute } from '@/components/shared/protected-route';
import { AppHeader } from '@/components/shared/header';
import { CheckInButton } from '@/components/worker/check-in-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WorkerAttendanceHistory } from '@/components/worker/worker-attendance-history';
import { useTranslations } from 'next-intl';

export default function WorkerDashboardPage() {
  const t = useTranslations('WorkerDashboardPage');

  return (
    <ProtectedRoute allowedRoles={['worker']}>
      <div className="min-h-screen flex flex-col bg-secondary">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Card className="mb-8 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">{t('checkInCardTitle')}</CardTitle>
              <CardDescription>{t('checkInCardDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckInButton />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg">
             <CardHeader>
                <CardTitle className="text-xl md:text-2xl">{t('historyCardTitle')}</CardTitle>
                 <CardDescription>{t('historyCardDescription')}</CardDescription>
             </CardHeader>
             <CardContent>
                 <WorkerAttendanceHistory />
             </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

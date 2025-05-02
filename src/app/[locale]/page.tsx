
import { LoginForm } from '@/components/auth/login-form';
import { AppHeader } from '@/components/shared/header'; // Import AppHeader

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary"> {/* Use flex-col */}
      <AppHeader /> {/* Add header here */}
      <main className="flex flex-grow flex-col items-center justify-center p-4"> {/* Use flex-grow */}
        <LoginForm />
      </main>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Church } from 'lucide-react';
import { LoginForm } from './LoginForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { signIn } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
    onSuccess?.();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Church className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Church Accounting System</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleLogin} />
        </CardContent>
      </Card>
    </div>
  );
}

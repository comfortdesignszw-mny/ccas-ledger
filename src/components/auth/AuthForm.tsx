import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Church } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
    onSuccess?.();
  };

  const handleSignup = async (email: string, password: string, fullName: string) => {
    await signUp(email, password, fullName);
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
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <LoginForm 
              onSubmit={handleLogin} 
              onSwitchToSignup={() => setIsLogin(false)} 
            />
          ) : (
            <SignupForm 
              onSubmit={handleSignup} 
              onSwitchToLogin={() => setIsLogin(true)} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

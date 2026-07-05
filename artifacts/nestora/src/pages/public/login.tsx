import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, LoginInput } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast.success("Welcome back!");
        setLocation(res.user.role === 'owner' ? '/admin' : '/shop');
      },
      onError: (err: any) => {
        toast.error(err?.data?.error || "Failed to login");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="rounded-full bg-primary/10 p-3 mb-4 cursor-pointer hover:bg-primary/20 transition-colors">
            <Store className="h-8 w-8 text-primary" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your Nestora account</p>
        </div>
        
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}

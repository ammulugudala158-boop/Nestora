import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, RegisterInput } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store, UserCircle, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['customer', 'owner']),
});

export default function Register() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'customer'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token, res.user);
        toast.success("Account created successfully!");
        setLocation(res.user.role === 'owner' ? '/admin' : '/shop');
      },
      onError: (err: any) => {
        toast.error(err?.data?.error || "Failed to register");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="rounded-full bg-primary/10 p-3 mb-4 cursor-pointer hover:bg-primary/20 transition-colors">
            <Store className="h-8 w-8 text-primary" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">Join Nestora</h1>
          <p className="text-muted-foreground mt-2">Create an account to get started</p>
        </div>
        
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${selectedRole === 'customer' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50 bg-background'}`}
                  onClick={() => setValue('role', 'customer')}
                >
                  <UserCircle className={`h-8 w-8 ${selectedRole === 'customer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-semibold text-sm ${selectedRole === 'customer' ? 'text-foreground' : 'text-muted-foreground'}`}>I'm a Customer</span>
                </div>
                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${selectedRole === 'owner' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50 bg-background'}`}
                  onClick={() => setValue('role', 'owner')}
                >
                  <Briefcase className={`h-8 w-8 ${selectedRole === 'owner' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-semibold text-sm ${selectedRole === 'owner' ? 'text-foreground' : 'text-muted-foreground'}`}>I'm a Business</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base mt-2" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

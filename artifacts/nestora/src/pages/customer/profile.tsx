import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Award, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">My Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                <p className="text-lg font-bold">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Account Role</p>
                <p className="text-lg font-bold capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" /> Loyalty Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
              <span className="text-5xl font-serif font-bold text-primary">{user.loyaltyPoints}</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Points Available</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

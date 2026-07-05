import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Store, Tags, Users, Gift, Settings, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isOwner, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isOwner)) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, isOwner, setLocation]);

  if (isLoading || (!isAuthenticated && !isOwner)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/offers', label: 'Offers & Deals', icon: Gift },
    { href: '/admin/tickets', label: 'Support Tickets', icon: Ticket },
    { href: '/admin/business', label: 'Business Profile', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40 font-sans">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-sidebar sm:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6 gap-3">
          <Store className="h-6 w-6 text-sidebar-primary" />
          <span className="font-serif font-bold text-xl text-sidebar-primary">Nestora Admin</span>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-semibold" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => logout()}>
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 sm:pl-64">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}



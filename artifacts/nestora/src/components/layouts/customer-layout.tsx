import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, User, LogOut, Store, Gift, Heart, Ticket } from 'lucide-react';
import { Button } from '../ui/button';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isCustomer, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { itemCount } = useCart();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isCustomer)) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, isCustomer, setLocation]);

  if (isLoading || (!isAuthenticated && !isCustomer)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isActive = (path: string) => location.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/shop" className="flex items-center space-x-2 mr-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-serif font-bold text-xl text-primary">Nestora</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/shop" className={`transition-colors hover:text-foreground ${isActive('/shop') && location === '/shop' ? 'text-foreground' : 'text-muted-foreground'}`}>Shop</Link>
              <Link href="/offers" className={`transition-colors hover:text-foreground flex items-center gap-1.5 ${isActive('/offers') ? 'text-foreground' : 'text-muted-foreground'}`}>
                <Gift className="h-4 w-4" /> Offers
              </Link>
              <Link href="/favorites" className={`transition-colors hover:text-foreground flex items-center gap-1.5 ${isActive('/favorites') ? 'text-foreground' : 'text-muted-foreground'}`}>
                <Heart className="h-4 w-4" /> Saved
              </Link>
              <Link href="/orders" className={`transition-colors hover:text-foreground ${isActive('/orders') ? 'text-foreground' : 'text-muted-foreground'}`}>Orders</Link>
              <Link href="/tickets" className={`transition-colors hover:text-foreground flex items-center gap-1.5 ${isActive('/tickets') ? 'text-foreground' : 'text-muted-foreground'}`}>
                <Ticket className="h-4 w-4" /> Support
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-muted/50">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-muted/50">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="hover:bg-destructive/10">
              <LogOut className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0 border-border/40 mt-auto bg-muted/20">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row max-w-screen-2xl mx-auto px-4 md:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Built on <span className="font-serif font-bold text-foreground">Nestora</span>
          </p>
        </div>
      </footer>
    </div>
  );
}



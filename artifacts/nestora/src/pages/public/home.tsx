import { Link } from 'wouter';
import { ArrowRight, Store, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between max-w-screen-xl">
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          <span className="font-serif font-bold text-2xl text-primary">Nestora</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline flex items-center px-4">Log in</Link>
          <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">Get Started</Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 md:py-32 max-w-screen-xl text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            The command center for <span className="text-primary italic">ambitious</span> small businesses.
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your digital presence, serve customers beautifully, and run every aspect of your operation from one powerful dashboard.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              Customer Portal
            </Link>
          </div>
        </section>
        
        <section className="bg-muted/50 py-24 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-screen-xl">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4 bg-background p-8 rounded-2xl border border-border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-foreground">Deep Analytics</h3>
                <p className="text-muted-foreground">Know exactly how your business is performing with real-time revenue and product tracking.</p>
              </div>
              <div className="space-y-4 bg-background p-8 rounded-2xl border border-border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-foreground">Customer Loyalty</h3>
                <p className="text-muted-foreground">Keep your best customers coming back with built-in rewards, points, and targeted offers.</p>
              </div>
              <div className="space-y-4 bg-background p-8 rounded-2xl border border-border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-foreground">Premium Storefront</h3>
                <p className="text-muted-foreground">Give your customers a warm, modern e-commerce experience that builds trust and drives sales.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

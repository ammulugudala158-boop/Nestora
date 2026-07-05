import { useListOffers } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Clock, Percent } from 'lucide-react';
import { toast } from 'sonner';

export default function Offers() {
  const { data: offers = [], isLoading } = useListOffers();

  const activeOffers = offers.filter(o => o.isActive);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Coupon code copied!");
  };

  if (isLoading) {
    return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading offers...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Current Offers</h1>
        <p className="text-lg text-muted-foreground mt-2">Special deals and discounts just for you.</p>
      </div>

      {activeOffers.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/50 rounded-2xl bg-card">
          <Gift className="h-12 w-12 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-lg">No active offers at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffers.map((offer) => (
            <Card key={offer.id} className="border-border/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Percent className="h-24 w-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="capitalize font-bold tracking-widest text-[10px]">{offer.type}</Badge>
                  <div className="font-serif font-bold text-3xl text-primary">{offer.discountPercent}% OFF</div>
                </div>
                <h3 className="font-bold text-xl mb-2">{offer.title}</h3>
                {offer.description && (
                  <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
                )}
                
                {offer.code && (
                  <div className="mt-4 flex items-center justify-between bg-muted/40 border border-border/50 rounded-lg p-3">
                    <span className="font-mono font-bold tracking-wider">{offer.code}</span>
                    <button 
                      onClick={() => copyToClipboard(offer.code!)}
                      className="text-xs font-semibold text-primary flex items-center hover:underline"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </button>
                  </div>
                )}
                
                {offer.validTo && (
                  <div className="mt-4 flex items-center text-xs text-muted-foreground font-medium">
                    <Clock className="h-3 w-3 mr-1" /> Valid until {new Date(offer.validTo).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

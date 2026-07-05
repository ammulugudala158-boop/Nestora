import { useCart } from '@/context/cart-context';
import { useCreateOrder } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Link, useLocation } from 'wouter';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    const orderItems = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    createOrder.mutate({ data: { items: orderItems } }, {
      onSuccess: (order) => {
        clearCart();
        toast.success("Order placed successfully!");
        setLocation(`/orders/${order.id}`);
      },
      onError: (err: any) => {
        toast.error(err?.data?.error || "Failed to place order");
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
        <div className="h-32 w-32 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 border border-primary/10">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-serif font-bold text-foreground">Your cart is empty</h2>
          <p className="text-lg text-muted-foreground">Discover our collections and find something you love.</p>
        </div>
        <Link href="/shop" className="inline-flex h-12 mt-4 items-center justify-center rounded-xl bg-primary px-10 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:-translate-y-0.5">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-10">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            {items.map((item, index) => (
              <div key={item.product.id} className={`flex gap-6 p-6 ${index !== items.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="h-32 w-32 shrink-0 rounded-xl border border-border/40 bg-muted/20 overflow-hidden relative">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-serif italic">No image</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        <Link href={`/shop/${item.product.id}`}>{item.product.name}</Link>
                      </h3>
                      {item.product.categoryName && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1.5">{item.product.categoryName}</p>
                      )}
                    </div>
                    <p className="font-bold text-xl">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border-2 border-input rounded-lg bg-background">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-muted/50" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none hover:bg-muted/50" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive font-medium hover:text-destructive hover:bg-destructive/10 px-3" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:sticky lg:top-24">
          <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-8 space-y-6">
            <h3 className="font-serif text-2xl font-bold border-b border-border/50 pb-5">Order Summary</h3>
            <div className="space-y-4 text-base">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">Free</span>
              </div>
            </div>
            <div className="border-t border-border/50 pt-6 flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="font-serif text-4xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-right">Including all taxes</p>
            </div>
            <div className="pt-4">
              <Button 
                className="w-full h-14 text-lg font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5" 
                onClick={handleCheckout} 
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Proceed to Checkout"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" /> Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useGetProduct, getGetProductQueryKey } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || '0', 10);
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading product...</div>;
  if (!product) return <div className="py-24 text-center text-lg text-muted-foreground">Product not found.</div>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link href="/shop" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
      </Link>

      <div className="bg-card rounded-3xl p-6 md:p-10 shadow-sm border border-border/50">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <div className="aspect-[4/5] bg-muted/20 rounded-2xl overflow-hidden border border-border/40 relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif text-xl italic">No image available</div>
            )}
            {product.stock === 0 && (
               <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                 <Badge variant="destructive" className="text-xl py-2 px-6 shadow-lg">Out of Stock</Badge>
               </div>
            )}
          </div>

          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              {product.categoryName && (
                <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">{product.categoryName}</span>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight tracking-tight">{product.name}</h1>
              <div className="flex items-end gap-4 pt-2">
                <span className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-2xl text-muted-foreground line-through mb-1">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed">
              <p>{product.description || "No description available."}</p>
            </div>

            {product.stock > 0 && (
              <div className="space-y-6 pt-8 border-t border-border/50 mt-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex items-center border-2 border-input rounded-xl bg-background overflow-hidden h-14 w-full sm:w-auto">
                    <Button variant="ghost" size="icon" className="h-full w-14 rounded-none hover:bg-muted/50" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-full w-14 rounded-none hover:bg-muted/50" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="lg" className="h-14 flex-1 text-lg gap-3 rounded-xl shadow-md" onClick={handleAddToCart}>
                    <ShoppingCart className="h-6 w-6" /> Add to Cart
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {product.stock} items available in stock
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useListFavorites, useRemoveFavorite } from '@workspace/api-client-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { Link } from 'wouter';
import { Heart, HeartOff, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function Favorites() {
  const { data: favorites = [], isLoading, refetch } = useListFavorites();
  const { addToCart } = useCart();
  const removeFavorite = useRemoveFavorite();

  if (isLoading) {
    return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading favorites...</div>;
  }

  const handleRemove = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeFavorite.mutate({ productId }, {
      onSuccess: () => {
        toast.success("Removed from favorites");
        refetch();
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Saved Items</h1>
        <p className="text-muted-foreground mt-2 text-lg">Products you love and want to keep an eye on.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border/50 rounded-2xl bg-card">
          <Heart className="h-12 w-12 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-lg">Your wishlist is empty. Start adding items you like!</p>
          <Link href="/shop" className="mt-4">
            <Button>Explore Shop</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`} className="block h-full">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 border-border/40 group flex flex-col bg-card">
                <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden border-b border-border/40">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif italic text-lg">No image</div>
                  )}
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-background"
                    onClick={(e) => handleRemove(e, product.id)}
                  >
                    <HeartOff className="h-4 w-4" />
                  </Button>
                  {product.stock === 0 && (
                    <Badge variant="destructive" className="absolute top-3 left-3 shadow-sm">Out of Stock</Badge>
                  )}
                </div>
                <CardHeader className="p-5 pb-2 flex-none">
                  <CardTitle className="text-lg leading-tight font-serif text-foreground group-hover:text-primary transition-colors line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2 flex-grow">
                  <div className="font-bold text-foreground text-xl">{formatPrice(product.price)}</div>
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto">
                  <Button 
                    className="w-full h-10 font-semibold" 
                    variant={product.stock === 0 ? "secondary" : "default"}
                    disabled={product.stock === 0}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    {product.stock === 0 ? "Out of Stock" : <><ShoppingCart className="h-4 w-4 mr-2"/> Add to Cart</>}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

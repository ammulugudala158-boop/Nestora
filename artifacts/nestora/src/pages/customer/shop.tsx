import { useListProducts, Product } from '@workspace/api-client-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export default function Shop() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const { data: products = [], isLoading } = useListProducts({ search: debouncedSearch || undefined });
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">Featured Collection</h1>
          <p className="text-muted-foreground mt-2 text-lg">Discover our hand-picked selection of premium goods.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 h-12 bg-background border-border/50 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[400px] bg-muted/30 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card">
          <p className="text-muted-foreground text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`} className="block h-full">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/40 group flex flex-col bg-card">
                <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden border-b border-border/40">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif italic text-lg">No image</div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <Badge variant="warning" className="absolute top-3 right-3 shadow-sm">Only {product.stock} left</Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge variant="destructive" className="absolute top-3 right-3 shadow-sm">Out of Stock</Badge>
                  )}
                </div>
                <CardHeader className="p-5 pb-2 flex-none">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl leading-tight font-serif text-foreground group-hover:text-primary transition-colors">{product.name}</CardTitle>
                  </div>
                  {product.categoryName && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">{product.categoryName}</p>
                  )}
                </CardHeader>
                <CardContent className="p-5 pt-2 flex-grow">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto">
                  <Button 
                    className="w-full h-11 text-base font-semibold" 
                    variant={product.stock === 0 ? "secondary" : "default"}
                    disabled={product.stock === 0}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
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

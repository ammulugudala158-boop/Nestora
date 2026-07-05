import { useListProducts, useDeleteProduct } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { Link } from 'wouter';
import { Plus, Edit, Trash2, Search, PackageSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const { data: products = [], isLoading, refetch } = useListProducts({ search: debouncedSearch || undefined });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast.success("Product deleted");
          refetch();
        },
        onError: () => toast.error("Failed to delete product")
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store's inventory and catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 font-bold shadow-sm">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading products...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <PackageSearch className="h-10 w-10 mb-3 opacity-20" />
                      <p>No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <div className="h-12 w-12 rounded bg-muted/20 border border-border/50 overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Img</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <p>{product.name}</p>
                      {product.categoryName && <p className="text-xs font-normal text-muted-foreground uppercase">{product.categoryName}</p>}
                    </TableCell>
                    <TableCell className="font-bold">{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : product.stock <= 5 ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id, product.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

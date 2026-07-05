import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useUpdateProduct, useGetProduct, getGetProductQueryKey } from '@workspace/api-client-react';
import { useParams, useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  originalPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, "Stock must be positive").int(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function AdminProductForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const isNew = !params.id || params.id === "new";
  const productId = parseInt(params.id || '0', 10);

  const { data: product, isLoading: isQueryLoading } = useGetProduct(productId, { 
    query: { enabled: !isNew && !!productId, queryKey: getGetProductQueryKey(productId) } 
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
    }
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (product && !isNew && initializedForId.current !== product.id) {
      initializedForId.current = product.id;
      reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
      });
    }
  }, [product, isNew, reset]);

  const onSubmit = (data: FormData) => {
    // Clean up optional fields
    const payload = {
      ...data,
      originalPrice: data.originalPrice || undefined,
      imageUrl: data.imageUrl || undefined,
    };

    if (isNew) {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success("Product created");
          setLocation('/admin/products');
        },
        onError: () => toast.error("Failed to create product")
      });
    } else {
      updateProduct.mutate({ id: productId, data: payload }, {
        onSuccess: () => {
          toast.success("Product updated");
          setLocation('/admin/products');
        },
        onError: () => toast.error("Failed to update product")
      });
    }
  };

  if (!isNew && isQueryLoading) return <div className="py-24 text-center">Loading...</div>;

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {isNew ? 'Add Product' : 'Edit Product'}
          </h1>
          <p className="text-muted-foreground mt-1">Fill in the details below to save your product.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-serif">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register('name')} placeholder="e.g. Handcrafted Ceramic Mug" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} rows={4} placeholder="Describe the product details..." />
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-serif">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input id="price" type="number" step="0.01" {...register('price')} />
                  {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input id="originalPrice" type="number" step="0.01" {...register('originalPrice')} placeholder="Optional compare-at price" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-serif">Inventory & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input id="stock" type="number" {...register('stock')} />
                  {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
                  {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 border-t border-border/50 pt-6">
            <Link href="/admin/products">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isPending} className="gap-2 font-bold shadow-md">
              <Save className="h-4 w-4" /> {isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

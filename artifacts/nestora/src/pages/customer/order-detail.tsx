import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeft, Package, MapPin, CreditCard, Clock } from 'lucide-react';

export default function OrderDetail() {
  const params = useParams();
  const id = parseInt(params.id || '0', 10);
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) } });

  if (isLoading) return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading order details...</div>;
  if (!order) return <div className="py-24 text-center text-lg text-muted-foreground">Order not found.</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      case 'shipped': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Order #{order.id}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={getStatusColor(order.status) as any} className="text-sm px-4 py-1 uppercase tracking-widest font-bold">
          {order.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-6">
                    <div className="h-20 w-20 rounded-lg border border-border/40 bg-muted/20 overflow-hidden shrink-0">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-serif italic">No image</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div className="flex justify-between">
                        <Link href={`/shop/${item.productId}`} className="font-bold text-foreground hover:text-primary transition-colors">{item.productName}</Link>
                        <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">Free</span>
                </div>
              </div>
              <div className="border-t border-border/50 pt-4 flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="font-serif text-3xl font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Shipping Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-bold mb-1">{order.customerName}</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {order.address || "No address provided"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

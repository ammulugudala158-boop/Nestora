import { useListOrders } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { Link } from 'wouter';
import { Package, ChevronRight } from 'lucide-react';

export default function Orders() {
  const { data: orders = [], isLoading } = useListOrders();

  if (isLoading) {
    return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
        <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2 border border-primary/10">
          <Package className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">No orders yet</h2>
          <p className="text-muted-foreground text-lg">When you place an order, it will appear here.</p>
        </div>
        <Link href="/shop" className="inline-flex h-11 mt-4 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90">
          Start Shopping
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      case 'shipped': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="block">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30 group">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg">Order #{order.id}</span>
                          <Badge variant={getStatusColor(order.status) as any} className="uppercase text-[10px] tracking-wider font-bold">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-bold text-2xl text-foreground">{formatPrice(order.total)}</p>
                        <p className="text-sm text-muted-foreground font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg pr-4 border border-border/40 shrink-0">
                          <div className="h-12 w-12 rounded bg-background border border-border/50 overflow-hidden shrink-0">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Img</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold truncate w-32">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-muted/50 text-sm font-medium border border-border/40 shrink-0">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:border-l border-border/50 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 justify-center">
                    <span className="flex items-center text-sm font-bold text-primary group-hover:underline">
                      View Details <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useListOrders, useUpdateOrderStatus, OrderStatusUpdateStatus } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice, formatDate } from '@/lib/utils';
import { Search, Package, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const { data: orders = [], isLoading, refetch } = useListOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (id: number, status: OrderStatusUpdateStatus) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success(`Order #${id} marked as ${status}`);
        refetch();
      },
      onError: () => toast.error("Failed to update status")
    });
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(search) || 
    order.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      case 'shipped': return 'default';
      case 'processing': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and fulfill customer orders.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or customer..." 
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
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading orders...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-10 w-10 mb-3 opacity-20" />
                      <p>No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-foreground">#{order.id}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell className="font-bold font-serif text-primary">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any} className="uppercase text-[10px] tracking-wider">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'pending' && (
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleStatusChange(order.id, 'processing')}>
                            <Clock className="h-3 w-3 mr-1" /> Process
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleStatusChange(order.id, 'shipped')}>
                            <Truck className="h-3 w-3 mr-1" /> Ship
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button variant="outline" size="sm" className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange(order.id, 'delivered')}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Deliver
                          </Button>
                        )}
                        {['pending', 'processing'].includes(order.status) && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleStatusChange(order.id, 'cancelled')} title="Cancel Order">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
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

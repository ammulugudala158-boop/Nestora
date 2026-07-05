import { useGetAnalyticsSummary, useGetTopProducts, useGetRevenueChart } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { IndianRupee, ShoppingCart, Users, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetAnalyticsSummary();
  const { data: topProducts = [], isLoading: isTopProductsLoading } = useGetTopProducts();
  const { data: revenueData = [], isLoading: isRevenueLoading } = useGetRevenueChart();

  if (isSummaryLoading || isTopProductsLoading || isRevenueLoading) {
    return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{formatPrice(summary?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{summary?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary?.pendingOrders || 0} pending processing</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{summary?.totalCustomers || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{summary?.totalProducts || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-4 mb-4">
            <CardTitle className="font-serif text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                      formatter={(value: number) => [formatPrice(value), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data to display chart</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-4 mb-4">
            <CardTitle className="font-serif text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.length > 0 ? topProducts.map((product) => (
                <div key={product.productId} className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-muted/20 border border-border/50 overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Img</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                  </div>
                  <div className="font-bold text-sm">
                    {formatPrice(product.revenue)}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">No product data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

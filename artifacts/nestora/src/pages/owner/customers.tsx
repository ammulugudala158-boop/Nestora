import { useListCustomers } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice, formatDate } from '@/lib/utils';
import { Search, Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { data: customers = [], isLoading } = useListCustomers();

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">View your customer base and their loyalty status.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
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
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Loyalty Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading customers...</TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-10 w-10 mb-3 opacity-20" />
                      <p>No customers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(customer.createdAt)}</TableCell>
                    <TableCell className="font-medium">{customer.totalOrders}</TableCell>
                    <TableCell className="font-bold font-serif text-primary">{formatPrice(customer.totalSpent)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Award className="h-4 w-4" /> {customer.loyaltyPoints}
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

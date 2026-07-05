import { useListOffers, useCreateOffer, useDeleteOffer, OfferInputType } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Gift, Percent } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminOffers() {
  const { data: offers = [], isLoading, refetch } = useListOffers();
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'festival' as OfferInputType,
    discountPercent: 10,
    code: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    createOffer.mutate({ data: formData }, {
      onSuccess: () => {
        toast.success("Offer created successfully");
        setOpen(false);
        setFormData({ title: '', description: '', type: 'festival', discountPercent: 10, code: '' });
        refetch();
      },
      onError: () => toast.error("Failed to create offer")
    });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Delete offer "${title}"?`)) {
      deleteOffer.mutate({ id }, {
        onSuccess: () => {
          toast.success("Offer deleted");
          refetch();
        },
        onError: () => toast.error("Failed to delete offer")
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Offers & Deals</h1>
          <p className="text-muted-foreground mt-1">Manage discounts, festival sales, and coupons.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold shadow-sm">
              <Plus className="h-4 w-4" /> Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Offer Title</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Offer Type</Label>
                <select 
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as OfferInputType})}
                >
                  <option value="festival">Festival Sale</option>
                  <option value="flash">Flash Sale</option>
                  <option value="coupon">Coupon Code</option>
                  <option value="loyalty">Loyalty Reward</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Percentage (%)</Label>
                <Input id="discount" type="number" min="1" max="100" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})} required />
              </div>
              {formData.type === 'coupon' && (
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input id="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={createOffer.isPending}>
                {createOffer.isPending ? "Saving..." : "Save Offer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Offer Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading offers...</TableCell>
                </TableRow>
              ) : offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Gift className="h-10 w-10 mb-3 opacity-20" />
                      <p>No active offers</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <p className="font-bold text-foreground">{offer.title}</p>
                      {offer.code && <p className="text-xs font-mono bg-muted inline-block px-1 rounded mt-1 border border-border">Code: {offer.code}</p>}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm font-medium text-muted-foreground">{offer.type}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <Percent className="h-4 w-4 mr-1" /> {offer.discountPercent}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {offer.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(offer.id, offer.title)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

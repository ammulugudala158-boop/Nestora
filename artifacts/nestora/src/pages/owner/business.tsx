import { useGetBusiness, useUpdateBusiness, getGetBusinessQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Store, Save } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, "Business name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  workingHours: z.string().optional(),
  gstNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminBusiness() {
  const { data: business, isLoading } = useGetBusiness({ query: { queryKey: getGetBusinessQueryKey() } });
  const updateBusiness = useUpdateBusiness();
  const initRef = useRef(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (business && !initRef.current) {
      initRef.current = true;
      reset({
        name: business.name,
        tagline: business.tagline || '',
        description: business.description || '',
        address: business.address || '',
        city: business.city || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        workingHours: business.workingHours || '',
        gstNumber: business.gstNumber || '',
      });
    }
  }, [business, reset]);

  const onSubmit = (data: FormData) => {
    updateBusiness.mutate({ data }, {
      onSuccess: () => {
        toast.success("Business profile updated successfully");
      },
      onError: () => toast.error("Failed to update profile")
    });
  };

  if (isLoading) return <div className="py-24 text-center">Loading profile...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Business Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your public storefront identity and contact info.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-serif">Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input id="name" {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" {...register('tagline')} placeholder="Short catchphrase" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">About Us</Label>
              <Textarea id="description" {...register('description')} rows={4} placeholder="Your brand story..." />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-serif">Contact & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Public Email</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Support Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" {...register('website')} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea id="address" {...register('address')} rows={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
            <CardTitle className="text-lg font-serif">Operations & Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input id="workingHours" {...register('workingHours')} placeholder="e.g. Mon-Fri 9AM - 6PM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input id="gstNumber" {...register('gstNumber')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={updateBusiness.isPending} className="h-12 px-8 text-base font-bold shadow-md">
            <Save className="mr-2 h-5 w-5" /> {updateBusiness.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

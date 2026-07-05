import { useListTickets, useCreateTicket } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import { Link } from 'wouter';
import { MessageSquare, Plus, Ticket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Tickets() {
  const { data: tickets = [], isLoading, refetch } = useListTickets();
  const createTicket = useCreateTicket();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;
    
    createTicket.mutate({ data: formData }, {
      onSuccess: () => {
        toast.success("Support ticket created");
        setOpen(false);
        setFormData({ subject: '', message: '' });
        refetch();
      },
      onError: () => toast.error("Failed to create ticket")
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed': return 'secondary';
      case 'in_progress': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-2">Get help with your orders or account.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold shadow-sm">
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="E.g. Issue with my recent order" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required placeholder="Please describe your issue in detail..." />
              </div>
              <Button type="submit" className="w-full" disabled={createTicket.isPending}>
                {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
          <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-2 border border-primary/10">
            <Ticket className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-foreground">No support tickets</h2>
            <p className="text-muted-foreground text-lg">You haven't submitted any support requests yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30 group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{ticket.subject}</h3>
                        <Badge variant={getStatusColor(ticket.status) as any} className="uppercase text-[10px] tracking-wider font-bold">
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>Ticket #{ticket.id}</span>
                        <span>•</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </p>
                    </div>
                    <div className="flex items-center text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md font-medium text-sm border border-border/40">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {ticket.replies?.length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

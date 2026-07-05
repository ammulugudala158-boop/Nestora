import { useListTickets, useReplyToTicket } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Ticket as TicketIcon, Search, Building, User, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { Ticket } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetTicketQueryKey } from '@workspace/api-client-react';

export default function AdminTickets() {
  const [search, setSearch] = useState("");
  const { data: tickets = [], isLoading, refetch } = useListTickets();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  const replyMutation = useReplyToTicket();
  const queryClient = useQueryClient();

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.customerName.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toString().includes(search)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed': return 'secondary';
      case 'in_progress': return 'warning';
      default: return 'destructive';
    }
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    replyMutation.mutate({ id: selectedTicket.id, data: { message: replyMessage } }, {
      onSuccess: () => {
        toast.success("Reply sent");
        setReplyMessage('');
        queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(selectedTicket.id) });
        refetch();
        setSelectedTicket(null);
      },
      onError: () => toast.error("Failed to send reply")
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to customer inquiries.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tickets..." 
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
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading tickets...</TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <TicketIcon className="h-10 w-10 mb-3 opacity-20" />
                      <p>No tickets found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-bold text-foreground">#{ticket.id}</TableCell>
                    <TableCell className="font-medium">{ticket.customerName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(ticket.status) as any} className="uppercase text-[10px] tracking-wider">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                        <MessageSquare className="h-4 w-4 mr-2" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
          {selectedTicket && (
            <>
              <DialogHeader className="p-6 border-b border-border/50 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-serif mb-1">{selectedTicket.subject}</DialogTitle>
                    <p className="text-sm text-muted-foreground">From: {selectedTicket.customerName} • {formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  <Badge variant={getStatusColor(selectedTicket.status) as any} className="uppercase text-[10px] tracking-wider">
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10">
                {/* Original Message */}
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                  <Card className="flex-1 border-border/50 shadow-sm bg-background">
                    <CardHeader className="p-3 pb-2 border-b border-border/40">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">{selectedTicket.customerName}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 text-sm">
                      <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((reply) => (
                  <div key={reply.id} className={`flex gap-4 ${reply.authorRole === 'owner' ? 'flex-row-reverse' : ''}`}>
                    <div className="mt-1 shrink-0">
                      {reply.authorRole === 'owner' ? (
                        <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground border border-secondary/30">
                          <Building className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <Card className={`flex-1 border-border/50 shadow-sm ${reply.authorRole === 'owner' ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                      <CardHeader className={`p-3 pb-2 border-b ${reply.authorRole === 'owner' ? 'border-primary/10' : 'border-border/40'}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">{reply.authorName}</span>
                          <span className="text-muted-foreground">{formatDate(reply.createdAt)}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 text-sm">
                        <p className="whitespace-pre-wrap">{reply.message}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div className="p-6 border-t border-border/50 shrink-0 bg-background">
                  <form onSubmit={handleReply} className="space-y-4">
                    <Textarea 
                      placeholder="Type your response to the customer..." 
                      rows={3}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Replying as Nestora Admin</p>
                      <Button type="submit" disabled={!replyMessage.trim() || replyMutation.isPending} className="gap-2">
                        <Send className="h-4 w-4" /> {replyMutation.isPending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

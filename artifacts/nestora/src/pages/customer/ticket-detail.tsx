import { useGetTicket, getGetTicketQueryKey, useReplyToTicket } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, User, Building, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function TicketDetail() {
  const params = useParams();
  const id = parseInt(params.id || '0', 10);
  const { data: ticket, isLoading } = useGetTicket(id, { query: { enabled: !!id, queryKey: getGetTicketQueryKey(id) } });
  const replyMutation = useReplyToTicket();
  const queryClient = useQueryClient();
  
  const [replyMessage, setReplyMessage] = useState('');

  if (isLoading) return <div className="py-24 text-center text-lg text-muted-foreground font-serif animate-pulse">Loading ticket...</div>;
  if (!ticket) return <div className="py-24 text-center text-lg text-muted-foreground">Ticket not found.</div>;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    replyMutation.mutate({ id, data: { message: replyMessage } }, {
      onSuccess: () => {
        toast.success("Reply sent");
        setReplyMessage('');
        queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(id) });
      },
      onError: () => toast.error("Failed to send reply")
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

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/tickets" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-serif font-bold text-foreground">{ticket.subject}</h1>
            <Badge variant={getStatusColor(ticket.status) as any} className="uppercase text-[10px] tracking-wider font-bold">
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Ticket #{ticket.id} • Opened on {formatDate(ticket.createdAt)}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Original Message */}
        <div className="flex gap-4">
          <div className="mt-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
          </div>
          <Card className="flex-1 border-border/50 shadow-sm">
            <CardHeader className="p-4 pb-2 bg-muted/10 border-b border-border/40">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold">You</span>
                <span className="text-muted-foreground">{formatDate(ticket.createdAt)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
            </CardContent>
          </Card>
        </div>

        {/* Replies */}
        {ticket.replies?.map((reply) => (
          <div key={reply.id} className={`flex gap-4 ${reply.authorRole === 'owner' ? 'flex-row-reverse' : ''}`}>
            <div className="mt-1 shrink-0">
              {reply.authorRole === 'owner' ? (
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground border border-secondary/30">
                  <Building className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
            <Card className={`flex-1 border-border/50 shadow-sm ${reply.authorRole === 'owner' ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardHeader className={`p-4 pb-2 border-b ${reply.authorRole === 'owner' ? 'border-primary/10 bg-primary/5' : 'bg-muted/10 border-border/40'}`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{reply.authorName} {reply.authorRole === 'owner' && <span className="text-xs font-normal text-muted-foreground ml-2">(Support Team)</span>}</span>
                  <span className="text-muted-foreground">{formatDate(reply.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap leading-relaxed">{reply.message}</p>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Reply Form */}
        {!isClosed && (
          <div className="flex gap-4 pt-4 border-t border-border/50 mt-8">
            <div className="mt-1 hidden sm:block">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
            </div>
            <Card className="flex-1 border-border/50 shadow-sm">
              <CardContent className="p-4">
                <form onSubmit={handleReply} className="space-y-4">
                  <Textarea 
                    placeholder="Type your reply here..." 
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="bg-muted/10"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!replyMessage.trim() || replyMutation.isPending} className="gap-2">
                      <Send className="h-4 w-4" /> {replyMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
        
        {isClosed && (
          <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl border border-border/40 mt-8">
            This ticket has been marked as {ticket.status.replace('_', ' ')}. You cannot reply to it anymore.
          </div>
        )}
      </div>
    </div>
  );
}

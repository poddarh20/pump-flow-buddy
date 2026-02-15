import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface PartyDue {
  id: string;
  name: string;
  outstanding: number;
}

interface AllPartiesDuesProps {
  parties: PartyDue[];
  onSelectParty: (id: string) => void;
  selectedPartyId: string | null;
}

function openWhatsAppReminder(partyName: string, amount: number) {
  const message = `Dear ${partyName}, this is a gentle reminder regarding your pending dues of ₹${amount.toLocaleString('en-IN')}. Kindly arrange the payment at your earliest convenience. Thank you.`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

export default function AllPartiesDues({ parties, onSelectParty, selectedPartyId }: AllPartiesDuesProps) {
  const totalDues = parties.reduce((s, p) => s + p.outstanding, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">All Parties – Outstanding Dues</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-bold text-destructive">₹{totalDues.toLocaleString('en-IN')}</span>
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {parties.map(p => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedPartyId === p.id ? 'bg-muted' : ''}`}
              onClick={() => onSelectParty(p.id)}
            >
              <span className="font-medium text-foreground">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${p.outstanding > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  ₹{p.outstanding.toLocaleString('en-IN')}
                </span>
                {p.outstanding > 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    title="Send WhatsApp reminder"
                    onClick={e => {
                      e.stopPropagation();
                      openWhatsAppReminder(p.name, p.outstanding);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {parties.length === 0 && (
            <p className="p-4 text-center text-muted-foreground text-sm">No credit parties added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

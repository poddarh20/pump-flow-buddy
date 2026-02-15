import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Trash2 } from 'lucide-react';

interface Transaction {
  id?: string;
  date: string;
  amount: number;
  payment_received: number;
  notes: string;
}

interface PartyTransactionsProps {
  partyName: string;
  transactions: Transaction[];
  onAdd: (tx: { date: string; amount: number; payment_received: number; notes: string }) => void;
  onDelete: (id: string) => void;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export default function PartyTransactions({ partyName, transactions, onAdd, onDelete }: PartyTransactionsProps) {
  const [txDate, setTxDate] = useState(getToday());
  const [txAmount, setTxAmount] = useState('');
  const [txPayment, setTxPayment] = useState('');
  const [txNotes, setTxNotes] = useState('');

  const handleAdd = () => {
    if (!txAmount && !txPayment) return;
    onAdd({
      date: txDate,
      amount: Number(txAmount) || 0,
      payment_received: Number(txPayment) || 0,
      notes: txNotes,
    });
    setTxAmount('');
    setTxPayment('');
    setTxNotes('');
  };

  const totalCredit = transactions.reduce((s, t) => s + t.amount, 0);
  const totalReceived = transactions.reduce((s, t) => s + t.payment_received, 0);
  const outstanding = totalCredit - totalReceived;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{partyName} – Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add entry form */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Date</label>
            <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="font-mono bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Credit Amount ₹</label>
            <Input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Balance Rcvd ₹</label>
            <Input type="number" value={txPayment} onChange={e => setTxPayment(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <Input value={txNotes} onChange={e => setTxNotes(e.target.value)} className="bg-secondary border-border" placeholder="Optional" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} size="sm" className="gap-1 w-full">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Credit ₹</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Balance Rcvd ₹</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Notes</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-mono text-foreground">{tx.date}</td>
                  <td className="p-3 text-right font-mono text-destructive">{tx.amount > 0 ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-3 text-right font-mono text-green-600">{tx.payment_received > 0 ? `₹${tx.payment_received.toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-3 text-muted-foreground text-xs">{tx.notes}</td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" onClick={() => tx.id && onDelete(tx.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No transactions this financial year</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Credit</p>
            <p className="text-xl font-bold font-mono text-destructive">₹{totalCredit.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Received</p>
            <p className="text-xl font-bold font-mono text-green-600">₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
          <div className={`rounded-lg border p-4 text-center ${outstanding > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}`}>
            <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
            <p className={`text-xl font-bold font-mono ${outstanding > 0 ? 'text-destructive' : 'text-green-600'}`}>₹{outstanding.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Trash2 } from 'lucide-react';

interface CreditParty { id: string; name: string; }
interface Transaction { id?: string; party_id: string; party_name: string; amount: number; payment_received: number; notes: string; }

interface CreditLedgerProps {
  date: string;
}

export default function CreditLedger({ date }: CreditLedgerProps) {
  const [parties, setParties] = useState<CreditParty[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newPartyName, setNewPartyName] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPayment, setTxPayment] = useState('');
  const [txNotes, setTxNotes] = useState('');

  useEffect(() => { loadParties(); }, []);
  useEffect(() => { loadDayTransactions(); }, [date, parties]);

  const loadParties = async () => {
    const { data } = await supabase.from('credit_parties').select('*').order('name');
    if (data) setParties(data);
  };

  const loadDayTransactions = async () => {
    if (!parties.length) return;
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('date', date)
      .order('created_at');
    if (data) {
      setTransactions(data.map(d => ({
        id: d.id,
        party_id: d.party_id,
        party_name: parties.find(p => p.id === d.party_id)?.name || 'Unknown',
        amount: Number(d.amount),
        payment_received: Number(d.payment_received),
        notes: d.notes || '',
      })));
    }
  };

  const addParty = async () => {
    if (!newPartyName.trim()) return;
    const { data } = await supabase.from('credit_parties').insert({ name: newPartyName.trim() }).select().single();
    if (data) {
      setParties(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPartyName('');
    }
  };

  const addTransaction = async () => {
    if (!selectedPartyId || (!txAmount && !txPayment)) return;
    const { data } = await supabase.from('credit_transactions').insert({
      party_id: selectedPartyId,
      date,
      fuel_type: 'CREDIT',
      quantity: 0,
      amount: Number(txAmount) || 0,
      payment_received: Number(txPayment) || 0,
      notes: txNotes,
    }).select().single();
    if (data) {
      await loadDayTransactions();
      setTxAmount('');
      setTxPayment('');
      setTxNotes('');
    }
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('credit_transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalCredit = transactions.reduce((s, t) => s + t.amount, 0);
  const totalReceived = transactions.reduce((s, t) => s + t.payment_received, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Credit Ledger</h2>
        <p className="text-sm text-muted-foreground mt-1">Daily credit entries for {date}</p>
      </div>

      {/* Add party */}
      <div className="flex gap-2 max-w-md">
        <Input
          value={newPartyName}
          onChange={e => setNewPartyName(e.target.value)}
          placeholder="New party name"
          className="bg-secondary border-border"
          onKeyDown={e => e.key === 'Enter' && addParty()}
        />
        <Button onClick={addParty} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Add Party
        </Button>
      </div>

      {/* Add transaction form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Credit Entry for {date}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Party</label>
              <select
                value={selectedPartyId}
                onChange={e => setSelectedPartyId(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm"
              >
                <option value="">Select party</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Credit Amount ₹</label>
              <Input type="number" step="0.01" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Balance Rcvd ₹</label>
              <Input type="number" step="0.01" value={txPayment} onChange={e => setTxPayment(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <Input value={txNotes} onChange={e => setTxNotes(e.target.value)} className="bg-secondary border-border" placeholder="Optional" />
            </div>
            <div className="flex items-end">
              <Button onClick={addTransaction} size="sm" className="gap-1 w-full">
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day's transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Entries on {date}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 text-muted-foreground font-medium">Party</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Credit ₹</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Balance Rcvd ₹</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Notes</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-foreground">{tx.party_name}</td>
                    <td className="p-3 text-right font-mono text-destructive">{tx.amount > 0 ? `₹${tx.amount.toFixed(2)}` : '-'}</td>
                    <td className="p-3 text-right font-mono text-green-600">{tx.payment_received > 0 ? `₹${tx.payment_received.toFixed(2)}` : '-'}</td>
                    <td className="p-3 text-muted-foreground text-xs">{tx.notes}</td>
                    <td className="p-3">
                      <Button size="icon" variant="ghost" onClick={() => tx.id && deleteTransaction(tx.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No credit entries for this date</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Day summary */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Day's Total Credit</p>
          <p className="text-xl font-bold font-mono text-destructive">₹{totalCredit.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Day's Balance Rcvd</p>
          <p className="text-xl font-bold font-mono text-green-600">₹{totalReceived.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

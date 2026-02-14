import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2 } from 'lucide-react';
import { fuelTypes, type FuelType } from '@/lib/petrolPumpData';

interface CreditParty {
  id: string;
  name: string;
}

interface CreditTransaction {
  id?: string;
  party_id: string;
  date: string;
  fuel_type: string;
  quantity: number;
  amount: number;
  payment_received: number;
  notes: string;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export default function CreditLedger() {
  const [parties, setParties] = useState<CreditParty[]>([]);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [newPartyName, setNewPartyName] = useState('');
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // New transaction form
  const [txDate, setTxDate] = useState(getToday());
  const [txFuel, setTxFuel] = useState<string>('HSD');
  const [txQty, setTxQty] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPayment, setTxPayment] = useState('');
  const [txNotes, setTxNotes] = useState('');

  useEffect(() => { loadParties(); }, []);

  useEffect(() => {
    if (selectedParty) loadTransactions(selectedParty, selectedMonth);
  }, [selectedParty, selectedMonth]);

  const loadParties = async () => {
    const { data } = await supabase.from('credit_parties').select('*').order('name');
    if (data) setParties(data);
  };

  const loadTransactions = async (partyId: string, month: string) => {
    const [year, mon] = month.split('-');
    const startDate = `${year}-${mon}-01`;
    const endDate = `${year}-${mon}-${new Date(Number(year), Number(mon), 0).getDate()}`;

    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('party_id', partyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    if (data) setTransactions(data.map(d => ({ ...d, quantity: Number(d.quantity), amount: Number(d.amount), payment_received: Number(d.payment_received), notes: d.notes || '' })));
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
    if (!selectedParty || !txQty) return;
    const tx = {
      party_id: selectedParty,
      date: txDate,
      fuel_type: txFuel,
      quantity: Number(txQty),
      amount: Number(txAmount) || 0,
      payment_received: Number(txPayment) || 0,
      notes: txNotes,
    };
    const { data } = await supabase.from('credit_transactions').insert(tx).select().single();
    if (data) {
      setTransactions(prev => [...prev, { ...data, quantity: Number(data.quantity), amount: Number(data.amount), payment_received: Number(data.payment_received), notes: data.notes || '' }].sort((a, b) => a.date.localeCompare(b.date)));
      setTxQty(''); setTxAmount(''); setTxPayment(''); setTxNotes('');
    }
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('credit_transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalCredit = transactions.reduce((s, t) => s + t.amount, 0);
  const totalPayment = transactions.reduce((s, t) => s + t.payment_received, 0);
  const balance = totalCredit - totalPayment;

  // Generate month options
  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Credit Party Ledger</h2>
        <p className="text-sm text-muted-foreground mt-1">Track credit sales and payments per party</p>
      </div>

      {/* Add party */}
      <div className="flex gap-2 max-w-md">
        <Input
          value={newPartyName}
          onChange={e => setNewPartyName(e.target.value)}
          placeholder="New party name (e.g. JBA, OSS...)"
          className="bg-secondary border-border"
          onKeyDown={e => e.key === 'Enter' && addParty()}
        />
        <Button onClick={addParty} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Party selector + Month */}
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[200px]">
          <label className="text-sm text-muted-foreground mb-1 block">Select Party</label>
          <Select value={selectedParty || ''} onValueChange={setSelectedParty}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Choose party" />
            </SelectTrigger>
            <SelectContent>
              {parties.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <label className="text-sm text-muted-foreground mb-1 block">Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(m => (
                <SelectItem key={m} value={m}>
                  {new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedParty && (
        <>
          {/* Add transaction form */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-3">Add Transaction</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="font-mono bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fuel</label>
                <Select value={txFuel} onValueChange={setTxFuel}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Qty (L)</label>
                <Input type="number" value={txQty} onChange={e => setTxQty(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount ₹</label>
                <Input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Payment ₹</label>
                <Input type="number" value={txPayment} onChange={e => setTxPayment(e.target.value)} className="font-mono bg-secondary border-border" placeholder="0" />
              </div>
              <div className="flex items-end">
                <Button onClick={addTransaction} size="sm" className="gap-1 w-full">
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Fuel</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Qty (L)</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Credit ₹</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Payment ₹</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Notes</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-foreground">{tx.date}</td>
                    <td className="p-3 text-foreground">{tx.fuel_type}</td>
                    <td className="p-3 text-right font-mono text-foreground">{tx.quantity}</td>
                    <td className="p-3 text-right font-mono text-destructive">₹{tx.amount}</td>
                    <td className="p-3 text-right font-mono text-success">₹{tx.payment_received}</td>
                    <td className="p-3 text-right text-muted-foreground text-xs">{tx.notes}</td>
                    <td className="p-3">
                      <Button size="icon" variant="ghost" onClick={() => tx.id && deleteTransaction(tx.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No transactions this month</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Monthly summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Credit</p>
              <p className="text-xl font-bold font-mono text-destructive">₹{totalCredit.toFixed(0)}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
              <p className="text-xl font-bold font-mono text-success">₹{totalPayment.toFixed(0)}</p>
            </div>
            <div className={`rounded-lg border p-4 text-center ${balance > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-success/30 bg-success/5'}`}>
              <p className="text-xs text-muted-foreground mb-1">Balance Due</p>
              <p className={`text-xl font-bold font-mono ${balance > 0 ? 'text-destructive' : 'text-success'}`}>₹{balance.toFixed(0)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

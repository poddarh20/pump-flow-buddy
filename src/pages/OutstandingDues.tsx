import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentFinancialYear, getFinancialYearRange, getFinancialYearOptions, formatFinancialYear } from '@/lib/financialYear';
import AllPartiesDues from '@/components/credit-ledger/AllPartiesDues';
import PartyTransactions from '@/components/credit-ledger/PartyTransactions';

interface CreditParty { id: string; name: string; }
interface Transaction { id?: string; date: string; amount: number; payment_received: number; notes: string; }
interface PartyDue { id: string; name: string; outstanding: number; }

export default function OutstandingDues() {
  const [parties, setParties] = useState<CreditParty[]>([]);
  const [partyDues, setPartyDues] = useState<PartyDue[]>([]);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fy, setFy] = useState(getCurrentFinancialYear);
  const fyOptions = getFinancialYearOptions();

  useEffect(() => { loadParties(); }, []);
  useEffect(() => { if (parties.length) loadAllDues(); }, [parties, fy]);
  useEffect(() => { if (selectedParty) loadTransactions(selectedParty); }, [selectedParty, fy]);

  const loadParties = async () => {
    const { data } = await supabase.from('credit_parties').select('*').order('name');
    if (data) setParties(data);
  };

  const loadAllDues = async () => {
    const { start, end } = getFinancialYearRange(fy);
    const { data } = await supabase
      .from('credit_transactions')
      .select('party_id, amount, payment_received')
      .gte('date', start)
      .lte('date', end);

    const dueMap: Record<string, number> = {};
    parties.forEach(p => { dueMap[p.id] = 0; });
    if (data) {
      data.forEach(t => {
        dueMap[t.party_id] = (dueMap[t.party_id] || 0) + Number(t.amount) - Number(t.payment_received);
      });
    }
    setPartyDues(parties.map(p => ({ id: p.id, name: p.name, outstanding: dueMap[p.id] || 0 })));
  };

  const loadTransactions = async (partyId: string) => {
    const { start, end } = getFinancialYearRange(fy);
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('party_id', partyId)
      .gte('date', start)
      .lte('date', end)
      .order('date');
    if (data) setTransactions(data.map(d => ({ id: d.id, date: d.date, amount: Number(d.amount), payment_received: Number(d.payment_received), notes: d.notes || '' })));
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('credit_transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    loadAllDues();
  };

  const addTransaction = async (tx: { date: string; amount: number; payment_received: number; notes: string }) => {
    if (!selectedParty) return;
    const { data } = await supabase.from('credit_transactions').insert({
      party_id: selectedParty,
      date: tx.date,
      fuel_type: 'CREDIT',
      quantity: 0,
      amount: tx.amount,
      payment_received: tx.payment_received,
      notes: tx.notes,
    }).select().single();
    if (data) {
      setTransactions(prev => [...prev, { id: data.id, date: data.date, amount: Number(data.amount), payment_received: Number(data.payment_received), notes: data.notes || '' }].sort((a, b) => a.date.localeCompare(b.date)));
      loadAllDues();
    }
  };

  const selectedPartyName = parties.find(p => p.id === selectedParty)?.name || '';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Outstanding Dues</h2>
          <p className="text-sm text-muted-foreground mt-1">Overall receivables and payment history per party</p>
        </div>
        <div className="min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">Financial Year</label>
          <Select value={fy} onValueChange={setFy}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fyOptions.map(f => (
                <SelectItem key={f} value={f}>{formatFinancialYear(f)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AllPartiesDues parties={partyDues} onSelectParty={setSelectedParty} selectedPartyId={selectedParty} />
        </div>
        <div className="lg:col-span-2">
          {selectedParty ? (
            <PartyTransactions
              partyName={selectedPartyName}
              transactions={transactions}
              onAdd={addTransaction}
              onDelete={deleteTransaction}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-border rounded-lg">
              Select a party from the list to view transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

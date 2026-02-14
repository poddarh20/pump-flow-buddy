import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';

type StoreReturn = ReturnType<typeof usePetrolPumpStore>;

export default function Ledger({ store }: { store: StoreReturn }) {
  const { ledger, addLedgerParty, updateLedgerBalance } = store;
  const [newParty, setNewParty] = useState('');
  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, string>>({});

  const handleAddParty = () => {
    if (newParty.trim()) {
      addLedgerParty(newParty.trim());
      setNewParty('');
    }
  };

  const handleAdjust = (party: string) => {
    const amt = Number(adjustAmounts[party]);
    if (amt) {
      updateLedgerBalance(party, amt);
      setAdjustAmounts(prev => ({ ...prev, [party]: '' }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Credit Ledger</h2>
        <p className="text-sm text-muted-foreground mt-1">Track credit party balances</p>
      </div>

      {/* Add party */}
      <div className="flex gap-2 max-w-md">
        <Input
          value={newParty}
          onChange={e => setNewParty(e.target.value)}
          placeholder="New party name"
          className="bg-secondary border-border"
          onKeyDown={e => e.key === 'Enter' && handleAddParty()}
        />
        <Button onClick={handleAddParty} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Ledger table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-4 text-muted-foreground font-medium">Party</th>
              <th className="text-right p-4 text-muted-foreground font-medium">Balance</th>
              <th className="text-right p-4 text-muted-foreground font-medium">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(entry => (
              <tr key={entry.party} className="border-b border-border last:border-0">
                <td className="p-4 text-foreground font-medium">{entry.party}</td>
                <td className={`p-4 text-right font-mono font-bold ${entry.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ₹{entry.balance.toFixed(0)}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Input
                      type="number"
                      value={adjustAmounts[entry.party] || ''}
                      onChange={e => setAdjustAmounts(prev => ({ ...prev, [entry.party]: e.target.value }))}
                      className="w-28 font-mono bg-secondary border-border text-right"
                      placeholder="±amount"
                      onKeyDown={e => e.key === 'Enter' && handleAdjust(entry.party)}
                    />
                    <Button size="sm" variant="secondary" onClick={() => handleAdjust(entry.party)}>
                      Apply
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

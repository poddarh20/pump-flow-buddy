import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DayRecord {
  id: string;
  date: string;
  price_ms: number;
  price_hsd: number;
  price_xtra_green: number;
  price_cng: number;
  bank_deposit: number;
  credit_party_total: number;
  daily_expense: number;
}

export default function MonthlyView() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [records, setRecords] = useState<DayRecord[]>([]);

  useEffect(() => {
    loadMonthData(selectedMonth);
  }, [selectedMonth]);

  const loadMonthData = async (month: string) => {
    const [year, mon] = month.split('-');
    const startDate = `${year}-${mon}-01`;
    const endDate = `${year}-${mon}-${new Date(Number(year), Number(mon), 0).getDate()}`;

    const { data } = await supabase
      .from('daily_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    if (data) setRecords(data.map(d => ({
      ...d,
      price_ms: Number(d.price_ms),
      price_hsd: Number(d.price_hsd),
      price_xtra_green: Number(d.price_xtra_green),
      price_cng: Number(d.price_cng),
      bank_deposit: Number(d.bank_deposit),
      credit_party_total: Number(d.credit_party_total),
      daily_expense: Number(d.daily_expense),
    })));
  };

  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const totalBank = records.reduce((s, r) => s + r.bank_deposit, 0);
  const totalCredit = records.reduce((s, r) => s + r.credit_party_total, 0);
  const totalExpense = records.reduce((s, r) => s + r.daily_expense, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monthly View</h2>
          <p className="text-sm text-muted-foreground mt-1">View saved daily records month-wise</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px] bg-secondary border-border">
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

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
              <th className="text-right p-3 text-muted-foreground font-medium">Bank ₹</th>
              <th className="text-right p-3 text-muted-foreground font-medium">Credit ₹</th>
              <th className="text-right p-3 text-muted-foreground font-medium">Expense ₹</th>
              <th className="text-right p-3 text-muted-foreground font-medium">Total Out ₹</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => {
              const totalOut = r.bank_deposit + r.credit_party_total + r.daily_expense;
              return (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-mono text-foreground">{r.date}</td>
                  <td className="p-3 text-right font-mono text-foreground">₹{r.bank_deposit}</td>
                  <td className="p-3 text-right font-mono text-foreground">₹{r.credit_party_total}</td>
                  <td className="p-3 text-right font-mono text-foreground">₹{r.daily_expense}</td>
                  <td className="p-3 text-right font-mono font-bold text-foreground">₹{totalOut}</td>
                </tr>
              );
            })}
            {records.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No records for this month. Save daily data first.</td></tr>
            )}
          </tbody>
          {records.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-secondary/30">
                <td className="p-3 font-semibold text-foreground">Total</td>
                <td className="p-3 text-right font-mono font-bold text-foreground">₹{totalBank}</td>
                <td className="p-3 text-right font-mono font-bold text-foreground">₹{totalCredit}</td>
                <td className="p-3 text-right font-mono font-bold text-foreground">₹{totalExpense}</td>
                <td className="p-3 text-right font-mono font-bold text-primary">₹{totalBank + totalCredit + totalExpense}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

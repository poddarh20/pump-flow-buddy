import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import Dashboard from './Dashboard';
import MeterReadings from './MeterReadings';
import FuelPrices from './FuelPrices';
import DailyReport from './DailyReport';
import CreditLedger from './CreditLedger';
import OutstandingDues from './OutstandingDues';
import MonthlyView from './MonthlyView';
import { toast } from 'sonner';

const Index = () => {
  const store = usePetrolPumpStore();

  const handleSave = async () => {
    await store.saveDay();
    toast.success('Daily data saved!');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
          <span className="text-sm text-muted-foreground">Shivala Petro Mart</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Date:</span>
            <Input
              type="date"
              value={store.date}
              onChange={e => store.setDate(e.target.value)}
              className="w-40 font-mono bg-secondary border-border text-sm"
            />
            <Button onClick={handleSave} size="sm" disabled={store.saving} className="gap-1">
              <Save className="w-4 h-4" />
              {store.saving ? 'Saving...' : 'Save Day'}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Dashboard store={store} />} />
            <Route path="readings" element={<MeterReadings store={store} />} />
            <Route path="prices" element={<FuelPrices store={store} />} />
            <Route path="report" element={<DailyReport store={store} />} />
            <Route path="credit-ledger" element={<CreditLedger date={store.date} onCreditChange={store.refreshCreditTotal} />} />
            <Route path="outstanding-dues" element={<OutstandingDues />} />
            <Route path="monthly" element={<MonthlyView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Index;

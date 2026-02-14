import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';
import { Input } from '@/components/ui/input';
import Dashboard from './Dashboard';
import MeterReadings from './MeterReadings';
import FuelPrices from './FuelPrices';
import DailyReport from './DailyReport';
import Ledger from './Ledger';

const Index = () => {
  const store = usePetrolPumpStore();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
          <span className="text-sm text-muted-foreground">Petrol Pump Management</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Date:</span>
            <Input
              type="date"
              value={store.date}
              onChange={e => store.setDate(e.target.value)}
              className="w-40 font-mono bg-secondary border-border text-sm"
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Dashboard store={store} />} />
            <Route path="readings" element={<MeterReadings store={store} />} />
            <Route path="prices" element={<FuelPrices store={store} />} />
            <Route path="report" element={<DailyReport store={store} />} />
            <Route path="ledger" element={<Ledger store={store} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Index;
